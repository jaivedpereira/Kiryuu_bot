const fs = require('fs');
const path = require('path');
const logger = require('../lib/logger');

/**
 * Carrega recursivamente todos os comandos da pasta src/commands.
 * Cada comando deve exportar { name, aliases?, category?, description?, run }.
 */
function loadCommands(rootDir) {
  const commands = new Map();
  const aliases = new Map();

  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        try {
          const cmd = require(full);
          if (!cmd?.name || typeof cmd.run !== 'function') {
            logger.warn(`Ignorando ${full}: faltam name/run`);
            continue;
          }
          commands.set(cmd.name.toLowerCase(), cmd);
          (cmd.aliases || []).forEach((a) =>
            aliases.set(a.toLowerCase(), cmd.name.toLowerCase()),
          );
        } catch (err) {
          logger.error({ err }, `Falha ao carregar comando ${full}`);
        }
      }
    }
  }

  walk(rootDir);
  logger.info(`Carregados ${commands.size} comandos (${aliases.size} aliases).`);
  return { commands, aliases };
}

function resolveCommand(registry, name) {
  const key = name.toLowerCase();
  if (registry.commands.has(key)) return registry.commands.get(key);
  const original = registry.aliases.get(key);
  if (original) return registry.commands.get(original);
  return null;
}

module.exports = { loadCommands, resolveCommand };
