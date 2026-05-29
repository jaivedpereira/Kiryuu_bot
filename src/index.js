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

let pairingSolicitado = false;

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
    // Nao imprime QR automaticamente; cuidamos disso manualmente abaixo.
    printQRInTerminal: false,
    browser: Browsers.ubuntu('Chrome'),
    logger: pino({ level: 'silent' }),
    syncFullHistory: false,
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: false,
    getMessage: async () => undefined,
  });

  sock.ev.on('creds.update', saveCreds);

  // ---- Login por CODIGO DE PAREAMENTO ----
  // Precisa ser solicitado logo apos criar o socket, quando ainda nao registrado.
  if (usarPairing && config.botNumber && !pairingSolicitado) {
    pairingSolicitado = true;
    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(config.botNumber);
        const formatado = code?.match(/.{1,4}/g)?.join('-') || code;
        logger.info('==================================================');
        logger.info(`  CODIGO DE PAREAMENTO: ${formatado}`);
        logger.info('==================================================');
        logger.info('No WhatsApp do numero do bot:');
        logger.info('  1) Configuracoes > Aparelhos conectados');
        logger.info('  2) Conectar um aparelho');
        logger.info('  3) "Conectar com numero de telefone"');
        logger.info(`  4) Digite o codigo acima (${formatado})`);
      } catch (err) {
        logger.error(`Falha ao gerar codigo de pareamento: ${err.message}`);
        logger.error('Verifique se BOT_NUMBER esta correto (so digitos, com DDI). Ex: 5582987554870');
      }
    }, 3000);
  }

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    // Mostra QR apenas se NAO estiver usando pareamento
    if (qr && !config.usePairingCode) {
      logger.info('Escaneie o QR code abaixo no WhatsApp do celular:');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'connecting') {
      logger.info('Conectando ao WhatsApp...');
    }

    if (connection === 'open') {
      logger.info(`${config.botName} conectado com sucesso!`);
      logger.info(`Numero conectado: ${sock.user?.id || 'desconhecido'}`);
      logger.info(`Mande ${config.prefix}menu no WhatsApp para testar.`);
    }

    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      const reason = lastDisconnect?.error?.message || 'desconhecido';
      const shouldReconnect = code !== DisconnectReason.loggedOut;
      logger.warn(`Conexao encerrada (codigo ${code} / ${reason}). Reconectar: ${shouldReconnect}`);
      if (shouldReconnect) {
        setTimeout(() => start(), 3000);
      } else {
        logger.error('Sessao deslogada. Apague a pasta auth/ e gere um novo codigo/QR.');
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
