const fs = require('fs');
const path = require('path');

/**
 * Carregador minimalista de .env (sem dependencias externas).
 * Le o arquivo .env da raiz do projeto e popula process.env,
 * sem sobrescrever variaveis ja definidas no ambiente.
 */
function loadEnv() {
  // raiz do projeto = dois niveis acima de src/lib/
  const envPath = path.join(__dirname, '..', '..', '.env');
  if (!fs.existsSync(envPath)) return;

  const conteudo = fs.readFileSync(envPath, 'utf-8');
  for (const linhaRaw of conteudo.split(/\r?\n/)) {
    const linha = linhaRaw.trim();
    // Ignora comentarios e linhas vazias
    if (!linha || linha.startsWith('#')) continue;

    const idx = linha.indexOf('=');
    if (idx === -1) continue;

    const chave = linha.slice(0, idx).trim();
    let valor = linha.slice(idx + 1).trim();

    // Remove aspas envolventes, se houver
    if (
      (valor.startsWith('"') && valor.endsWith('"')) ||
      (valor.startsWith("'") && valor.endsWith("'"))
    ) {
      valor = valor.slice(1, -1);
    }

    if (chave && process.env[chave] === undefined) {
      process.env[chave] = valor;
    }
  }
}

loadEnv();

module.exports = { loadEnv };
