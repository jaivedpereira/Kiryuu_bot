const config = require('../config');
const logger = require('../lib/logger');
const { resolveCommand } = require('./commandLoader');
const {
  getMessageContent,
  getMessageType,
  getQuotedMessage,
  isGroup,
  getSenderJid,
  getMentioned,
} = require('../lib/messages');

/**
 * Processa cada mensagem recebida pelo bot.
 */
async function handleMessage({ sock, msg, registry }) {
  if (!msg.message || msg.key.fromMe) return;

  const text = (getMessageContent(msg) || '').trim();
  if (!text.startsWith(config.prefix)) return;

  const withoutPrefix = text.slice(config.prefix.length).trim();
  if (!withoutPrefix) return;

  const [rawName, ...args] = withoutPrefix.split(/\s+/);
  const command = resolveCommand(registry, rawName);
  if (!command) return;

  const ctx = {
    sock,
    msg,
    args,
    text: args.join(' '),
    jid: msg.key.remoteJid,
    sender: getSenderJid(msg),
    isGroup: isGroup(msg),
    mentioned: getMentioned(msg),
    quoted: getQuotedMessage(msg),
    messageType: getMessageType(msg),
    prefix: config.prefix,
    registry,
    reply: (content) => {
      const payload = typeof content === 'string' ? { text: content } : content;
      return sock.sendMessage(msg.key.remoteJid, payload, { quoted: msg });
    },
    react: (emoji) =>
      sock.sendMessage(msg.key.remoteJid, {
        react: { text: emoji, key: msg.key },
      }),
  };

  try {
    logger.info(`Comando: ${command.name} | de ${ctx.sender}`);
    await command.run(ctx);
  } catch (err) {
    logger.error({ err }, `Erro no comando ${command.name}`);
    await ctx.reply(`Ocorreu um erro ao executar *${command.name}*. Tente novamente.`);
  }
}

module.exports = { handleMessage };
