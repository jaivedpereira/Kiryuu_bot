const yt = require('../../lib/youtube');
const config = require('../../config');

module.exports = {
  name: 'video',
  aliases: ['mp4', 'ytvideo'],
  category: 'downloads',
  description: 'Baixa um video do YouTube. Aceita link ou nome.',
  example: 'video lo-fi hip hop',
  async run(ctx) {
    const { args, text, reply, react } = ctx;
    if (!args[0]) {
      return reply(`Uso: *${ctx.prefix}video <nome ou link do YouTube>*`);
    }
    await react('🎬');
    try {
      let url = text.trim();
      let info;
      if (/^https?:\/\//i.test(url)) {
        info = await yt.info(url);
      } else {
        const v = await yt.buscar(text);
        if (!v) {
          await react('❌');
          return reply('🔎 Nada encontrado.');
        }
        url = v.url;
        info = {
          title: v.title,
          author: v.author?.name,
          durationSec: v.seconds,
          url: v.url,
        };
      }

      if (info.durationSec > 360) {
        await react('❌');
        return reply('⏱️ Video muito longo (max 6 minutos).');
      }

      await reply(
        [
          `🎬 *Baixando video*`,
          ``,
          `*Titulo:* ${info.title}`,
          `*Canal:* ${info.author || '—'}`,
          `*Duracao:* ${yt.formatarDuracao(info.durationSec)}`,
          ``,
          `_Pode demorar um pouco..._`,
        ].join('\n'),
      );

      const buffer = await yt.baixar(info.url, 'video');
      const sizeMB = buffer.length / 1024 / 1024;
      if (sizeMB > config.maxDownloadMB) {
        await react('❌');
        return reply(`📦 Arquivo muito grande (${sizeMB.toFixed(1)}MB).`);
      }

      await ctx.sock.sendMessage(
        ctx.jid,
        {
          video: buffer,
          caption: `🎬 ${info.title}`,
          fileName: `${info.title}.mp4`,
          mimetype: 'video/mp4',
        },
        { quoted: ctx.msg },
      );
      await react('✅');
    } catch (err) {
      await react('❌');
      await reply(`❌ Falha ao baixar video: ${err.message}`);
    }
  },
};
