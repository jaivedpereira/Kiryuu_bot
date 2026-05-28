/**
 * Configuracoes globais do Kiryuu
 */
module.exports = {
  botName: process.env.BOT_NAME || 'Kiryuu',
  prefix: process.env.BOT_PREFIX || '!',
  owner: process.env.BOT_OWNER || '',
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
