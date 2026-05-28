const path = require('path');
const fs = require('fs');
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

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    // Ubuntu/Chrome e mais aceito pelo WhatsApp atual que macOS
    browser: Browsers.ubuntu('Chrome'),
    logger: pino({ level: 'silent' }),
    syncFullHistory: false,
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: false,
    // Garante que mensagens nao sejam re-enviadas como reuploadRequired
    getMessage: async () => undefined,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      logger.info('Escaneie o QR code abaixo no WhatsApp do celular:');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'connecting') {
      logger.info('Conectando ao WhatsApp...');
    }

    if (connection === 'open') {
      logger.info(`${config.botName} conectado com sucesso!`);
      logger.info(`Mande *${config.prefix}menu* no WhatsApp para testar.`);
    }

    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      const reason = lastDisconnect?.error?.message || 'desconhecido';
      const shouldReconnect = code !== DisconnectReason.loggedOut;
      logger.warn(`Conexao encerrada (codigo ${code} / ${reason}). Reconectar: ${shouldReconnect}`);
      if (shouldReconnect) {
        setTimeout(() => start(), 3000);
      } else {
        logger.error('Sessao deslogada. Apague a pasta auth/ e escaneie o QR de novo.');
      }
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    // Aceita tanto 'notify' (msg nova) quanto 'append' (msg que entrou no historico
    // recente mas ainda merece resposta). Algumas versoes mandam append em vez
    // de notify para mensagens proprias do dispositivo principal.
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
