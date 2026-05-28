const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const logger = require('./logger');

/**
 * Faz download de uma midia recebida (imagem/video) retornando um Buffer.
 * Aceita o objeto da mensagem completa ou apenas o conteudo quoted.
 */
async function downloadBuffer(messageOrQuoted, key) {
  // Quando passamos uma quotedMessage, precisamos montar a estrutura esperada.
  let target = messageOrQuoted;
  if (!target.message && (target.imageMessage || target.videoMessage || target.stickerMessage)) {
    target = {
      key: key || { remoteJid: '', fromMe: false, id: 'quoted' },
      message: messageOrQuoted,
    };
  }
  try {
    return await downloadMediaMessage(target, 'buffer', {});
  } catch (err) {
    logger.error({ err }, 'Falha ao baixar midia');
    throw err;
  }
}

/**
 * Identifica se a mensagem (ou a quoted) contem imagem ou video.
 */
function getMediaType(message) {
  if (!message) return null;
  if (message.imageMessage) return 'image';
  if (message.videoMessage) return 'video';
  if (message.stickerMessage) return 'sticker';
  if (message.documentMessage?.mimetype?.startsWith('image/')) return 'image';
  if (message.documentMessage?.mimetype?.startsWith('video/')) return 'video';
  return null;
}

module.exports = { downloadBuffer, getMediaType };
