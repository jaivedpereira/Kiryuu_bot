const { porcentagem } = require('../../lib/random');

function criarComando(nome, aliases, titulo, emoji) {
  return {
    name: nome,
    aliases,
    category: 'brincadeiras',
    description: `Mede o quanto alguem e ${titulo.toLowerCase()}.`,
    async run(ctx) {
      const alvo = ctx.mentioned[0] || ctx.sender;
      const pct = porcentagem();
      const barra =
        '█'.repeat(Math.round(pct / 10)) + '░'.repeat(10 - Math.round(pct / 10));
      const texto =
        `${emoji} *Medidor de ${titulo}*\n\n` +
        `@${alvo.split('@')[0]} é *${pct}%* ${titulo.toLowerCase()}!\n` +
        `[${barra}]`;
      await ctx.sock.sendMessage(
        ctx.jid,
        { text: texto, mentions: [alvo] },
        { quoted: ctx.msg },
      );
    },
  };
}

module.exports = criarComando;
