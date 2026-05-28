/**
 * Helpers de aleatoriedade.
 */
function inteiro(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function escolher(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}

function porcentagem() {
  return inteiro(0, 100);
}

module.exports = { inteiro, escolher, porcentagem };
