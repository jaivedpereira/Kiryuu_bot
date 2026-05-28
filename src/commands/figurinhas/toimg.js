const sharp = require('sharp');
const { downloadBuffer } = require('../../lib/media');

module.exports = {
  name: 'toimg',
  aliases: ['paraimg', 'figparaimg'],
  category: 'figurinhas',
  description: 'Converte uma figurinha estatica em imagem PNG.',
  example: 'toimg (respondendo a uma figurinha)',
  async run(ctx) {
    const { msg, quoted, reply, react } = ctx;
    const sticker = quoted?.stickerMessage;
    if (!sticker) {
      return reply('📌 Responda uma figurinha *estatica* com este comando.');
    }
    if (sticker.isAnimated) {
      return reply('⚠️ Figurinhas animadas nao podem virar imagem (use *togif* no futuro).');
    }

    await react('🖼️');
    try {
      const buffer = await downloadBuffer({ ...msg, message: quoted }, msg.key);
      const png = await sharp(buffer).png().toBuffer();
      await ctx.sock.sendMessage(
        ctx.jid,
        { image: png, caption: '🖼️ Aqui esta sua figurinha como imagem!' },
        { quoted: msg },
      );
      await react('✅');
    } catch (err) {
      await react('❌');
      await reply(`❌ Erro ao converter: ${err.message}`);
    }
  },
};
