const { escolher } = require('../../lib/random');

module.exports = {
  name: 'escolher',
  aliases: ['escolhe', 'pick'],
  category: 'brincadeiras',
  description: 'Escolhe entre varias opcoes separadas por virgula. Ex: !escolher pizza, hamburguer, sushi',
  async run(ctx) {
    const { text, reply, prefix } = ctx;
    if (!text || !text.includes(',')) {
      return reply(`Uso: *${prefix}escolher op1, op2, op3*`);
    }
    const opcoes = text.split(',').map((s) => s.trim()).filter(Boolean);
    if (opcoes.length < 2) return reply('Preciso de pelo menos 2 opcoes.');
    const r = escolher(opcoes);
    await reply(`🎯 Eu escolho: *${r}*`);
  },
};
