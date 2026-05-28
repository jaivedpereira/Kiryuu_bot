const { escolher } = require('../../lib/random');

module.exports = {
  name: 'moeda',
  aliases: ['flip', 'caracoroa'],
  category: 'brincadeiras',
  description: 'Joga cara ou coroa.',
  async run(ctx) {
    const r = escolher(['Cara', 'Coroa']);
    const emoji = r === 'Cara' ? '🪙' : '🥇';
    await ctx.reply(`${emoji} A moeda caiu em *${r}*!`);
  },
};
