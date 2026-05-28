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
  if (!msg.message) return;
  // Ignora mensagens enviadas pelo proprio bot, mas deixa o usuario interagir
  // a partir do mesmo telefone se quiser (msg.key.fromMe + status broadcast).
  if (msg.key?.remoteJid === 'status@broadcast') return;
  if (msg.key.fromMe) return;

  const text = (getMessageContent(msg) || '').trim();
  logger.debug(`Msg de ${msg.key.remoteJid}: ${text.slice(0, 80)}`);

  if (!text.startsWith(config.prefix)) return;

  const withoutPrefix = text.slice(config.prefix.length).trim();
  if (!withoutPrefix) return;

  const [rawName, ...args] = withoutPrefix.split(/\s+/);
  const command = resolveCommand(registry, rawName);
  if (!command) {
    logger.info(`Comando desconhecido: ${rawName}`);
    return;
  }

  // react() pode falhar silenciosamente em algumas versoes/grupos. Embrulha
  // em try/catch e timeout para nao travar o resto do comando.
  const safeReact = async (emoji) => {
    try {
      await Promise.race([
        sock.sendMessage(msg.key.remoteJid, {
          react: { text: emoji, key: msg.key },
        }),
        new Promise((resolve) => setTimeout(resolve, 3000)),
      ]);
    } catch (err) {
      logger.debug({ err: err.message }, 'react() falhou (ignorado)');
    }
  };

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
    react: safeReact,
  };

  try {
    logger.info(`Comando: ${command.name} | de ${ctx.sender}`);
    await command.run(ctx);
  } catch (err) {
    // Loga o stack inteiro para facilitar debug
    logger.error(
      `Erro no comando ${command.name}: ${err.message}\n${err.stack}`,
    );
    try {
      await ctx.reply(
        `❌ Ocorreu um erro ao executar *${command.name}*.\n\`${err.message}\``,
      );
    } catch (e) {
      logger.error(`Falha ao enviar mensagem de erro: ${e.message}`);
    }
  }
}

module.exports = { handleMessage };
