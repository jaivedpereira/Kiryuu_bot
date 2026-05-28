const { downloadBuffer, getMediaType } = require('../../lib/media');
const { createSticker } = require('../../lib/sticker');

module.exports = {
  name: 'snome',
  aliases: ['stickern', 'figcom'],
  category: 'figurinhas',
  description: 'Cria figurinha personalizada com pacote/autor. Uso: !snome Pacote | Autor',
  example: 'snome Memes BR | Kiryuu Bot',
  async run(ctx) {
    const { msg, quoted, reply, react, text, prefix } = ctx;

    if (!text || !text.includes('|')) {
      return reply(
        `Uso correto:\n*${prefix}snome NomePack | Autor*\n` +
          `_(responda a uma imagem ou video)_`,
      );
    }

    const [pack, autor] = text.split('|').map((s) => s.trim());
    if (!pack || !autor) {
      return reply(`Faltou pacote ou autor. Ex: *${prefix}snome Memes BR | Kiryuu*`);
    }

    const direta = msg.message?.imageMessage || msg.message?.videoMessage ? msg.message : null;
    const alvoMessage = direta || quoted;
    const tipo = getMediaType(alvoMessage);

    if (!tipo || (tipo !== 'image' && tipo !== 'video')) {
      return reply('🖼️ Responda uma imagem ou video para usar este comando.');
    }

    await react('🎨');
    try {
      const buffer = await downloadBuffer(
        direta ? msg : { ...msg, message: quoted },
        msg.key,
      );
      const webp = await createSticker(buffer, tipo === 'video', pack, autor);
      await ctx.sock.sendMessage(ctx.jid, { sticker: webp }, { quoted: msg });
      await react('✅');
    } catch (err) {
      await react('❌');
      await reply(`❌ Erro ao gerar figurinha: ${err.message}`);
    }
  },
};
