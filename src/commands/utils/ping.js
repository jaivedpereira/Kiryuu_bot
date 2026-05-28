module.exports = {
  name: 'ping',
  aliases: ['pong'],
  category: 'utilidades',
  description: 'Verifica se o bot esta online e mede a latencia.',
  async run(ctx) {
    const inicio = Date.now();
    await ctx.react('🏓');
    const ms = Date.now() - inicio;
    await ctx.reply(`🏓 *Pong!*\nLatencia: *${ms}ms*\nEstou online e funcionando! 💚`);
  },
};
