module.exports = {
  name: 'sorteio',
  aliases: ['sortear', 'sortearmembro'],
  category: 'brincadeiras',
  description: 'Sorteia um membro aleatorio do grupo.',
  async run(ctx) {
    const { sock, jid, isGroup, reply } = ctx;
    if (!isGroup) return reply('🎲 So funciona em *grupos*.');
    const meta = await sock.groupMetadata(jid);
    const participantes = meta.participants.map((p) => p.id);
    const escolhido = participantes[Math.floor(Math.random() * participantes.length)];
    await sock.sendMessage(
      jid,
      {
        text: `🎲 *Sorteio do grupo!*\n\nO escolhido foi: @${escolhido.split('@')[0]} 🎉`,
        mentions: [escolhido],
      },
      { quoted: ctx.msg },
    );
  },
};
