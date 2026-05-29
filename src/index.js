const path = require('path');
const fs = require('fs');
// Carrega o .env ANTES de qualquer config que leia process.env
require('./lib/env');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  Browsers,
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pino = require('pino');

const config = require('./config');
const logger = require('./lib/logger');
const { loadCommands } = require('./handlers/commandLoader');
const { handleMessage } = require('./handlers/messageHandler');

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Controle de estado entre tentativas de conexao
let pairingSolicitado = false;
let tentativas = 0;
const MAX_TENTATIVAS = 5;

// Remove a pasta de sessao (auth) quando ela esta corrompida/invalida.
function limparAuth() {
  try {
    fs.rmSync(config.authFolder, { recursive: true, force: true });
    logger.warn(`Pasta ${config.authFolder}/ removida para gerar uma nova sessao.`);
  } catch (err) {
    logger.error(`Nao consegui remover ${config.authFolder}/: ${err.message}`);
  }
}

async function start() {
  // Garante que pastas existem
  for (const dir of [config.authFolder, config.tmpFolder]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  // Carrega comandos
  const registry = loadCommands(path.join(__dirname, 'commands'));

  // Estado da sessao do WhatsApp
  const { state, saveCreds } = await useMultiFileAuthState(config.authFolder);
  const { version } = await fetchLatestBaileysVersion();
  logger.info(`Usando Baileys WA v${version.join('.')}`);

  // Decide o metodo de login: codigo de pareamento (se houver numero) ou QR.
  const usarPairing = config.usePairingCode && !state.creds.registered;
  if (usarPairing && !config.botNumber) {
    logger.error(
      'USE_PAIRING_CODE ativado mas BOT_NUMBER esta vazio. Preencha o numero no .env (ex: 5582987554870).',
    );
  }

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    browser: Browsers.ubuntu('Chrome'),
    logger: pino({ level: 'silent' }),
    syncFullHistory: false,
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: false,
    getMessage: async () => undefined,
  });

  sock.ev.on('creds.update', saveCreds);

  async function solicitarPairing() {
    if (pairingSolicitado) return;
    pairingSolicitado = true;
    try {
      // Pequena espera para garantir que o socket esta pronto para parear.
      await delay(2000);
      const code = await sock.requestPairingCode(config.botNumber);
      const formatado = code?.match(/.{1,4}/g)?.join('-') || code;
      logger.info('==================================================');
      logger.info(`  CODIGO DE PAREAMENTO: ${formatado}`);
      logger.info('==================================================');
      logger.info('No WhatsApp do numero do bot (RAPIDO, o codigo expira):');
      logger.info('  1) Configuracoes > Aparelhos conectados');
      logger.info('  2) Conectar um aparelho');
      logger.info('  3) "Conectar com numero de telefone"');
      logger.info(`  4) Digite o codigo acima (${formatado})`);
    } catch (err) {
      logger.error(`Falha ao gerar codigo de pareamento: ${err.message}`);
      logger.error('Confira o BOT_NUMBER (so digitos, com DDI). Ex: 5582987554870');
    }
  }

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    // O evento 'qr' significa que o socket esta pronto para emitir QR/pareamento.
    // E o momento certo para solicitar o codigo de pareamento.
    if (qr) {
      if (usarPairing && config.botNumber) {
        solicitarPairing();
      } else if (!config.usePairingCode) {
        logger.info('Escaneie o QR code abaixo no WhatsApp do celular:');
        qrcode.generate(qr, { small: true });
      }
    }

    if (connection === 'connecting') {
      logger.info('Conectando ao WhatsApp...');
    }

    if (connection === 'open') {
      tentativas = 0;
      logger.info(`${config.botName} conectado com sucesso!`);
      logger.info(`Numero conectado: ${sock.user?.id || 'desconhecido'}`);
      logger.info(`Mande ${config.prefix}menu no WhatsApp para testar.`);
    }

    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      const reason = lastDisconnect?.error?.message || 'desconhecido';
      logger.warn(`Conexao encerrada (codigo ${code} / ${reason}).`);

      const registrado = state.creds.registered;

      // 515 = restart required: acontece logo apos parear com sucesso. Reconecta.
      if (code === DisconnectReason.restartRequired) {
        logger.info('Reinicio necessario (normal apos parear). Reconectando...');
        pairingSolicitado = false;
        setTimeout(() => start(), 2000);
        return;
      }

      // 401 = deslogado. Se ainda NAO terminou o pareamento, a sessao esta
      // corrompida: limpamos auth/ e tentamos de novo do zero.
      if (code === DisconnectReason.loggedOut) {
        if (!registrado && config.usePairingCode) {
          logger.warn('Pareamento nao concluido / sessao invalida.');
          limparAuth();
          pairingSolicitado = false;
          if (tentativas++ < MAX_TENTATIVAS) {
            logger.info(`Tentando gerar novo codigo... (tentativa ${tentativas}/${MAX_TENTATIVAS})`);
            setTimeout(() => start(), 5000);
          } else {
            logger.error('Muitas tentativas seguidas. PARE o bot (Ctrl+C), confira o BOT_NUMBER no .env, espere uns minutos e rode de novo.');
          }
        } else {
          logger.error('Sessao deslogada. Apague a pasta auth/ e gere um novo codigo/QR.');
        }
        return;
      }

      // Outros erros (ex: 503 stream error): reconecta com limite.
      if (tentativas++ < MAX_TENTATIVAS) {
        pairingSolicitado = false;
        setTimeout(() => start(), 3000);
      } else {
        logger.error('Limite de reconexoes atingido. Pare e rode de novo (npm start).');
      }
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify' && type !== 'append') return;
    for (const msg of messages) {
      try {
        await handleMessage({ sock, msg, registry });
      } catch (err) {
        logger.error(`Erro no handler de mensagens: ${err.message}\n${err.stack}`);
      }
    }
  });
}

start().catch((err) => {
  logger.error(`Falha fatal ao iniciar o bot: ${err.message}\n${err.stack}`);
  process.exit(1);
});
