const os = require('os');
const config = require('../../config');

function formatUptime(seg) {
  const d = Math.floor(seg / 86400);
  const h = Math.floor((seg % 86400) / 3600);
  const m = Math.floor((seg % 3600) / 60);
  const s = Math.floor(seg % 60);
  return `${d}d ${h}h ${m}m ${s}s`;
}

module.exports = {
  name: 'info',
  aliases: ['bot', 'sobre'],
  category: 'utilidades',
  description: 'Mostra informacoes sobre o bot.',
  async run(ctx) {
    const memMB = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
    const texto = [
      `🤖 *${config.botName}*`,
      ``,
      `*Versao:* 1.0.0`,
      `*Linguagem:* Node.js (${process.version})`,
      `*Plataforma:* ${os.platform()} ${os.arch()}`,
      `*Uptime:* ${formatUptime(process.uptime())}`,
      `*Memoria:* ${memMB} MB`,
      `*Prefixo:* ${config.prefix}`,
      ``,
      `Feito em PT-BR. Use *${config.prefix}menu* para ver os comandos.`,
    ].join('\n');
    await ctx.reply(texto);
  },
};
