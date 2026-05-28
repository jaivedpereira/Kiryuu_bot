const { escolher } = require('../../lib/random');

const FRASES = [
  'A vida nao espera a gente entender. — Clarice Lispector',
  'O segredo do sucesso e a constancia no proposito. — Benjamin Disraeli',
  'Quem nao arrisca, nao petisca. — Sabedoria popular',
  'Cair faz parte; levantar e obrigatorio. — Anonimo',
  'O Brasil nao e para amadores. — Tom Jobim',
  'Tudo que e bom dura pouco, ate o momento ruim. — Anonimo',
  'A pressa e inimiga da perfeicao. — Proverbio',
  'A felicidade aparece para aqueles que choram. — Conto popular',
];

module.exports = {
  name: 'frase',
  aliases: ['frasedodia', 'reflexao'],
  category: 'brincadeiras',
  description: 'Manda uma frase motivacional aleatoria.',
  async run(ctx) {
    await ctx.reply(`💭 ${escolher(FRASES)}`);
  },
};
