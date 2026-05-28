const { escolher } = require('../../lib/random');

module.exports = {
  name: 'ppt',
  aliases: ['jokenpo', 'jankenpo'],
  category: 'brincadeiras',
  description: 'Pedra, papel ou tesoura. Uso: !ppt pedra|papel|tesoura',
  async run(ctx) {
    const { args, reply, prefix } = ctx;
    const opcoes = ['pedra', 'papel', 'tesoura'];
    const usuario = (args[0] || '').toLowerCase();
    if (!opcoes.includes(usuario)) {
      return reply(`Escolha uma opcao:\n*${prefix}ppt pedra*, *papel* ou *tesoura*.`);
    }
    const bot = escolher(opcoes);
    let resultado;
    if (usuario === bot) resultado = '🤝 Empatamos!';
    else if (
      (usuario === 'pedra' && bot === 'tesoura') ||
      (usuario === 'papel' && bot === 'pedra') ||
      (usuario === 'tesoura' && bot === 'papel')
    ) {
      resultado = '🎉 Voce ganhou!';
    } else {
      resultado = '😈 Eu ganhei!';
    }
    const emoji = { pedra: '🪨', papel: '📄', tesoura: '✂️' };
    await reply(
      `🎮 *Pedra, Papel, Tesoura*\n\n` +
        `Voce: ${emoji[usuario]} ${usuario}\n` +
        `Eu: ${emoji[bot]} ${bot}\n\n` +
        resultado,
    );
  },
};
