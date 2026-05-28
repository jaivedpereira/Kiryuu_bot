const { inteiro } = require('../../lib/random');

module.exports = {
  name: 'roleta',
  aliases: ['russa'],
  category: 'brincadeiras',
  description: 'Roleta russa (so brincadeira). Sorteia 1 entre 6 camaras.',
  async run(ctx) {
    const tiro = inteiro(1, 6);
    if (tiro === 1) {
      await ctx.reply(
        '🔫💥 *BANG!*\n\nA roleta disparou! Voce perdeu (no jogo, viu? rs).',
      );
    } else {
      await ctx.reply(`🔫 *Click!*\n\nVoce sobreviveu a essa rodada! (camara ${tiro})`);
    }
  },
};
