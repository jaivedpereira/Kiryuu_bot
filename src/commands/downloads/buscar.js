const yt = require('../../lib/youtube');

module.exports = {
  name: 'buscar',
  aliases: ['ytsearch', 'pesquisar'],
  category: 'downloads',
  description: 'Busca videos no YouTube e mostra os resultados.',
  example: 'buscar musica relaxante',
  async run(ctx) {
    const { text, reply, react, prefix } = ctx;
    if (!text) return reply(`Uso: *${prefix}buscar <termo>*`);
    await react('🔎');
    try {
      const yts = require('yt-search');
      const r = await yts(text);
      const videos = (r.videos || []).slice(0, 5);
      if (!videos.length) {
        await react('❌');
        return reply('🔎 Nada encontrado.');
      }
      const linhas = [`🔎 *Resultados para:* _${text}_`, ''];
      videos.forEach((v, i) => {
        linhas.push(
          `*${i + 1}.* ${v.title}\n   👤 ${v.author?.name || '—'} | ⏱ ${v.timestamp} | 👁 ${v.views}\n   🔗 ${v.url}`,
        );
        linhas.push('');
      });
      linhas.push(`_Use *${prefix}musica <link>* ou *${prefix}video <link>* para baixar._`);
      await reply(linhas.join('\n'));
      await react('✅');
    } catch (err) {
      await react('❌');
      await reply(`❌ Erro na busca: ${err.message}`);
    }
  },
};
