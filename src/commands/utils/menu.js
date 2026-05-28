const config = require('../../config');

module.exports = {
  name: 'menu',
  aliases: ['help', 'ajuda', 'comandos'],
  category: 'utilidades',
  description: 'Mostra todos os comandos disponiveis do Kiryuu.',
  async run(ctx) {
    const { registry, prefix, reply } = ctx;
    const grupos = {};

    for (const cmd of registry.commands.values()) {
      const cat = cmd.category || 'outros';
      if (!grupos[cat]) grupos[cat] = [];
      grupos[cat].push(cmd);
    }

    const ordem = ['utilidades', 'figurinhas', 'downloads', 'brincadeiras', 'outros'];
    const linhas = [
      `╔══════════════════════╗`,
      `║   🤖 *${config.botName.toUpperCase()} BOT*   ║`,
      `╚══════════════════════╝`,
      ``,
      `Olá! Eu sou o *${config.botName}*, seu bot brasileiro 🇧🇷`,
      `Use o prefixo *${prefix}* antes de cada comando.`,
      ``,
    ];

    for (const cat of ordem) {
      if (!grupos[cat]) continue;
      linhas.push(`╭─❒ *${cat.toUpperCase()}* ❒`);
      for (const cmd of grupos[cat].sort((a, b) => a.name.localeCompare(b.name))) {
        linhas.push(`│ ✦ ${prefix}${cmd.name}${cmd.description ? ` — ${cmd.description}` : ''}`);
      }
      linhas.push(`╰────────────────`);
      linhas.push(``);
    }

    linhas.push(`_Digite *${prefix}ajuda <comando>* para detalhes._`);

    await reply(linhas.join('\n'));
  },
};
