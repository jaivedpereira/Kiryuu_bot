const yt = require('../../lib/youtube');
const config = require('../../config');

module.exports = {
  name: 'musica',
  aliases: ['music', 'mp3', 'play'],
  category: 'downloads',
  description: 'Baixa uma musica do YouTube. Aceita link ou nome.',
  example: 'musica Engenheiros do Hawaii - Era um Garoto',
  async run(ctx) {
    const { args, text, reply, react } = ctx;
    if (!args[0]) {
      return reply(`Uso: *${ctx.prefix}musica <nome ou link do YouTube>*`);
    }

    await react('🎵');
    try {
      let url = text.trim();
      let info;

      if (/^https?:\/\//i.test(url)) {
        info = await yt.info(url);
      } else {
        const v = await yt.buscar(text);
        if (!v) {
          await react('❌');
          return reply('🔎 Nao achei nenhum resultado para isso.');
        }
        url = v.url;
        info = {
          title: v.title,
          author: v.author?.name,
          durationSec: v.seconds,
          thumb: v.thumbnail,
          url: v.url,
        };
      }

      if (info.durationSec > 600) {
        await react('❌');
        return reply('⏱️ Audio muito longo (max 10 minutos).');
      }

      await reply(
        [
          `🎵 *Baixando musica*`,
          ``,
          `*Titulo:* ${info.title}`,
          `*Canal:* ${info.author || '—'}`,
          `*Duracao:* ${yt.formatarDuracao(info.durationSec)}`,
          ``,
          `_Aguarde alguns segundos..._`,
        ].join('\n'),
      );

      const buffer = await yt.baixar(info.url, 'audio');
      const sizeMB = buffer.length / 1024 / 1024;
      if (sizeMB > config.maxDownloadMB) {
        await react('❌');
        return reply(`📦 Arquivo muito grande (${sizeMB.toFixed(1)}MB).`);
      }

      await ctx.sock.sendMessage(
        ctx.jid,
        {
          audio: buffer,
          mimetype: 'audio/mp4',
          ptt: false,
          fileName: `${info.title}.m4a`,
        },
        { quoted: ctx.msg },
      );
      await react('✅');
    } catch (err) {
      await react('❌');
      await reply(`❌ Falha ao baixar musica: ${err.message}`);
    }
  },
};
