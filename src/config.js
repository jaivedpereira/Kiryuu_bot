/**
 * Configuracoes globais do Kiryuu
 */

// Remove tudo que nao for numero (espacos, +, parenteses, tracos)
function soNumeros(v) {
  return (v || '').replace(/[^0-9]/g, '');
}

module.exports = {
  botName: process.env.BOT_NAME || 'Kiryuu',
  prefix: process.env.BOT_PREFIX || '!',
  owner: process.env.BOT_OWNER || '',
  // Numero do WhatsApp do bot, com codigo do pais, somente digitos.
  // Ex: 5582987554870. Usado para login por codigo de pareamento.
  botNumber: soNumeros(process.env.BOT_NUMBER),
  // Se true, usa codigo de pareamento (digitar codigo no WhatsApp) em vez de QR.
  // Ativado automaticamente quando BOT_NUMBER esta preenchido, ou via USE_PAIRING_CODE=true
  usePairingCode:
    process.env.USE_PAIRING_CODE === 'true' || !!soNumeros(process.env.BOT_NUMBER),
  // Diretorio onde a sessao do WhatsApp e salva
  authFolder: 'auth',
  // Diretorio temporario para arquivos de midia
  tmpFolder: 'tmp',
  // Pacote e autor padrao das figurinhas
  stickerPack: 'Kiryuu Bot',
  stickerAuthor: 'by Kiryuu',
  // Limite de tamanho para downloads (em MB)
  maxDownloadMB: 64,
};
