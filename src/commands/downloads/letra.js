const axios = require('axios');

module.exports = {
  name: 'letra',
  aliases: ['lyrics', 'letramusica'],
  category: 'downloads',
  description: 'Busca a letra de uma musica. Uso: !letra Artista - Musica',
  example: 'letra Legiao Urbana - Tempo Perdido',
  async run(ctx) {
    const { text, reply, react, prefix } = ctx;
    if (!text || !text.includes('-')) {
      return reply(
        `Uso: *${prefix}letra Artista - Musica*\nEx: ${prefix}letra Cazuza - Brasil`,
      );
    }
    const [artista, musica] = text.split('-').map((s) => s.trim());
    if (!artista || !musica) {
      return reply('Faltou artista ou musica.');
    }
    await react('📜');
    try {
      const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(artista)}/${encodeURIComponent(musica)}`;
      const { data } = await axios.get(url, { timeout: 15000 });
      const letra = (data?.lyrics || '').trim();
      if (!letra) {
        await react('❌');
        return reply('📜 Letra nao encontrada para essa musica.');
      }
      await reply(
        [
          `📜 *${musica}* — _${artista}_`,
          ``,
          letra.length > 3500 ? letra.slice(0, 3500) + '\n\n_(letra truncada)_' : letra,
        ].join('\n'),
      );
      await react('✅');
    } catch (err) {
      await react('❌');
      await reply('❌ Nao consegui achar essa letra agora.');
    }
  },
};
