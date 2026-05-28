const { inteiro } = require('../../lib/random');

module.exports = {
  name: 'dado',
  aliases: ['dice', 'rolar'],
  category: 'brincadeiras',
  description: 'Rola um dado de N lados (padrao 6). Ex: !dado 20',
  async run(ctx) {
    const lados = parseInt(ctx.args[0], 10) || 6;
    if (lados < 2 || lados > 1000) {
      return ctx.reply('🎲 Use um numero entre *2* e *1000*.');
    }
    const valor = inteiro(1, lados);
    const emojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    const e = lados === 6 ? emojis[valor - 1] : '🎲';
    await ctx.reply(`🎲 Rolando d${lados}...\n\nResultado: ${e} *${valor}*`);
  },
};
