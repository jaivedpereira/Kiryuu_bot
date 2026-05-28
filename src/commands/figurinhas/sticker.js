const { downloadBuffer, getMediaType } = require('../../lib/media');
const { createSticker } = require('../../lib/sticker');
const config = require('../../config');

module.exports = {
  name: 'sticker',
  aliases: ['s', 'fig', 'figurinha'],
  category: 'figurinhas',
  description: 'Cria uma figurinha a partir de imagem ou video (responda a midia).',
  example: 'sticker (respondendo a uma imagem ou video)',
  async run(ctx) {
    const { msg, quoted, reply, react } = ctx;

    // Aceita midia direta ou em mensagem citada
    const direta = msg.message?.imageMessage || msg.message?.videoMessage ? msg.message : null;
    const alvoMessage = direta || quoted;
    const tipo = getMediaType(alvoMessage);

    if (!tipo || (tipo !== 'image' && tipo !== 'video')) {
      return reply(
        `🖼️ Envie ou responda uma *imagem* ou *video* com:\n*${ctx.prefix}sticker*`,
      );
    }

    await react('🎨');
    try {
      const buffer = await downloadBuffer(
        direta ? msg : { ...msg, message: quoted },
        msg.key,
      );

      const isAnimado = tipo === 'video';

      // Limita videos a 10s para evitar travar o WhatsApp
      if (isAnimado) {
        const dur = alvoMessage.videoMessage?.seconds || 0;
        if (dur > 10) {
          await react('❌');
          return reply('⏱️ O video deve ter no maximo *10 segundos*.');
        }
      }

      const webp = await createSticker(
        buffer,
        isAnimado,
        config.stickerPack,
        config.stickerAuthor,
      );

      await ctx.sock.sendMessage(
        ctx.jid,
        { sticker: webp },
        { quoted: msg },
      );
      await react('✅');
    } catch (err) {
      await react('❌');
      await reply(`❌ Falha ao criar figurinha: ${err.message}`);
    }
  },
};
