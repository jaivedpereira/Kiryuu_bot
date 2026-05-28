const { resolveCommand } = require('../../handlers/commandLoader');

module.exports = {
  name: 'detalhe',
  aliases: ['help2', 'comando'],
  category: 'utilidades',
  description: 'Detalha um comando especifico. Ex: !detalhe sticker',
  async run(ctx) {
    const { args, prefix, registry, reply } = ctx;
    if (!args[0]) {
      return reply(`Uso: *${prefix}detalhe <comando>*\nEx: ${prefix}detalhe sticker`);
    }
    const cmd = resolveCommand(registry, args[0]);
    if (!cmd) return reply(`Comando *${args[0]}* nao encontrado.`);

    const aliases = (cmd.aliases || []).map((a) => `${prefix}${a}`).join(', ') || 'nenhum';
    const linhas = [
      `📖 *Detalhes de ${prefix}${cmd.name}*`,
      ``,
      `*Categoria:* ${cmd.category || 'outros'}`,
      `*Descricao:* ${cmd.description || '—'}`,
      `*Atalhos:* ${aliases}`,
    ];
    if (cmd.usage) linhas.push(`*Uso:* ${prefix}${cmd.usage}`);
    if (cmd.example) linhas.push(`*Exemplo:* ${prefix}${cmd.example}`);
    await reply(linhas.join('\n'));
  },
};
