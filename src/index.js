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

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    browser: Browsers.macOS('Kiryuu'),
    logger: pino({ level: 'silent' }),
    syncFullHistory: false,
    markOnlineOnConnect: false,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      logger.info('Escaneie o QR code abaixo no WhatsApp do celular:');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'open') {
      logger.info(`${config.botName} conectado com sucesso!`);
    }

    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = code !== DisconnectReason.loggedOut;
      logger.warn(`Conexao encerrada (codigo ${code}). Reconectar: ${shouldReconnect}`);
      if (shouldReconnect) start();
      else logger.error('Sessao deslogada. Apague a pasta auth/ e escaneie o QR de novo.');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const msg of messages) {
      try {
        await handleMessage({ sock, msg, registry });
      } catch (err) {
        logger.error({ err }, 'Erro no handler de mensagens');
      }
    }
  });
}

start().catch((err) => {
  logger.error({ err }, 'Falha fatal ao iniciar o bot');
  process.exit(1);
});
