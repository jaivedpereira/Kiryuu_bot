const { escolher } = require('../../lib/random');

const PIADAS = [
  'Por que o computador foi ao psicologo?\n_Porque tinha bugs nao resolvidos._',
  'O que o JavaScript disse para o Java?\n_"A gente tem o mesmo nome mas nao se conhece."_',
  'Por que o livro de matematica estava triste?\n_Porque tinha muitos problemas._',
  'O que e um pontinho amarelo no ceu?\n_Um astronauta com hepatite._',
  'Qual e o cumulo da paciencia?\n_Pescar de zipper aberto esperando o peixe morder._',
  'Por que o ovo nao briga com o tomate?\n_Porque ele e mole._',
  'Como se chama o irmao do Bruce Lee que come muito doce?\n_Bruce Sweet._',
  'O que o tomate foi fazer no banco?\n_Tirar extrato._',
  'Por que a abelha vai a igreja?\n_Porque ela tem fé!_ (faz fé... fé... fé...)',
  'O que o pato disse para a pata?\n_"Vem ca, meu raio de sol!"_',
];

module.exports = {
  name: 'piada',
  aliases: ['joke'],
  category: 'brincadeiras',
  description: 'Conta uma piada ruim 😅',
  async run(ctx) {
    await ctx.reply(`😆 *Piada do tio:*\n\n${escolher(PIADAS)}`);
  },
};
