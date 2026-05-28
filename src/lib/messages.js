/**
 * Helpers para extrair conteudo de mensagens do Baileys.
 */

function getMessageContent(msg) {
  if (!msg.message) return null;
  let m = msg.message;

  // Mensagens podem vir embrulhadas em ephemeralMessage / viewOnceMessage
  // (fotos/videos com visualizacao unica e mensagens temporarias).
  if (m.ephemeralMessage) m = m.ephemeralMessage.message;
  if (m.viewOnceMessage) m = m.viewOnceMessage.message;
  if (m.viewOnceMessageV2) m = m.viewOnceMessageV2.message;

  return (
    m.conversation ||
    m.extendedTextMessage?.text ||
    m.imageMessage?.caption ||
    m.videoMessage?.caption ||
    m.documentMessage?.caption ||
    m.buttonsResponseMessage?.selectedButtonId ||
    m.listResponseMessage?.singleSelectReply?.selectedRowId ||
    ''
  );
}

function getInnerMessage(msg) {
  if (!msg.message) return null;
  let m = msg.message;
  if (m.ephemeralMessage) m = m.ephemeralMessage.message;
  if (m.viewOnceMessage) m = m.viewOnceMessage.message;
  if (m.viewOnceMessageV2) m = m.viewOnceMessageV2.message;
  return m;
}

function getQuotedMessage(msg) {
  const m = getInnerMessage(msg);
  if (!m) return null;
  const ctx =
    m.extendedTextMessage?.contextInfo ||
    m.imageMessage?.contextInfo ||
    m.videoMessage?.contextInfo ||
    m.documentMessage?.contextInfo ||
    m.stickerMessage?.contextInfo;
  return ctx?.quotedMessage || null;
}

function getMessageType(msg) {
  const m = getInnerMessage(msg);
  if (!m) return null;
  return Object.keys(m)[0];
}

function isGroup(msg) {
  return msg.key.remoteJid?.endsWith('@g.us') || false;
}

function getSenderJid(msg) {
  if (isGroup(msg)) {
    return msg.key.participant || msg.participant || msg.key.remoteJid;
  }
  return msg.key.remoteJid;
}

function getMentioned(msg) {
  const m = getInnerMessage(msg);
  if (!m) return [];
  const ctx =
    m.extendedTextMessage?.contextInfo ||
    m.imageMessage?.contextInfo ||
    m.videoMessage?.contextInfo;
  return ctx?.mentionedJid || [];
}

module.exports = {
  getMessageContent,
  getQuotedMessage,
  getMessageType,
  isGroup,
  getSenderJid,
  getMentioned,
  getInnerMessage,
};
