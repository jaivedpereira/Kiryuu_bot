/**
 * Helpers para extrair conteudo de mensagens do Baileys.
 */

function getMessageContent(msg) {
  if (!msg.message) return null;
  const m = msg.message;
  return (
    m.conversation ||
    m.extendedTextMessage?.text ||
    m.imageMessage?.caption ||
    m.videoMessage?.caption ||
    m.documentMessage?.caption ||
    ''
  );
}

function getQuotedMessage(msg) {
  const ctx =
    msg.message?.extendedTextMessage?.contextInfo ||
    msg.message?.imageMessage?.contextInfo ||
    msg.message?.videoMessage?.contextInfo;
  return ctx?.quotedMessage || null;
}

function getMessageType(msg) {
  if (!msg.message) return null;
  return Object.keys(msg.message)[0];
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
  const ctx =
    msg.message?.extendedTextMessage?.contextInfo ||
    msg.message?.imageMessage?.contextInfo ||
    msg.message?.videoMessage?.contextInfo;
  return ctx?.mentionedJid || [];
}

module.exports = {
  getMessageContent,
  getQuotedMessage,
  getMessageType,
  isGroup,
  getSenderJid,
  getMentioned,
};
