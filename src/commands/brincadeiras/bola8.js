const { escolher } = require('../../lib/random');

const RESPOSTAS = [
  'Com certeza! ✅',
  'Sim, sem duvida.',
  'Pode apostar!',
  'Tudo indica que sim.',
  'Provavelmente.',
  'Hmm... talvez.',
  'Pergunte de novo mais tarde.',
  'Nao posso prever agora.',
  'Concentre-se e pergunte de novo.',
  'Nao conte com isso.',
  'Minhas fontes dizem que nao.',
  'Muito duvidoso.',
  'Definitivamente nao. ❌',
];

module.exports = {
  name: 'bola8',
  aliases: ['8ball', 'magicball'],
  category: 'brincadeiras',
  description: 'Faz uma pergunta a bola 8 magica. Ex: !bola8 vou ganhar na loteria?',
  async run(ctx) {
    const { text, reply, prefix } = ctx;
    if (!text) return reply(`Uso: *${prefix}bola8 sua pergunta?*`);
    await reply(`🎱 *Bola 8 magica diz:*\n\n_${text}_\n\n➡️ ${escolher(RESPOSTAS)}`);
  },
};
