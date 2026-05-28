const { porcentagem } = require('../../lib/random');

function nomeDe(jid) {
  if (!jid) return 'alguem';
  return '@' + jid.split('@')[0];
}

module.exports = {
  name: 'casal',
  aliases: ['shipp', 'ship'],
  category: 'brincadeiras',
  description: 'Sorteia um casal aleatorio do grupo (ou usa duas mencoes).',
  async run(ctx) {
    const { sock, jid, isGroup, mentioned, reply } = ctx;
    if (!isGroup) return reply('💔 Esse comando so funciona em *grupos*.');

    let a, b;
    if (mentioned.length >= 2) {
      [a, b] = mentioned;
    } else {
      const meta = await sock.groupMetadata(jid);
      const participantes = meta.participants.map((p) => p.id);
      if (participantes.length < 2) return reply('Preciso de pelo menos 2 pessoas no grupo.');
      a = participantes[Math.floor(Math.random() * participantes.length)];
      do {
        b = participantes[Math.floor(Math.random() * participantes.length)];
      } while (b === a);
    }

    const pct = porcentagem();
    const coracoes = '❤️'.repeat(Math.max(1, Math.round(pct / 20)));
    const texto =
      `💘 *Shippando casal...*\n\n` +
      `${nomeDe(a)} 💕 ${nomeDe(b)}\n\n` +
      `Compatibilidade: *${pct}%* ${coracoes}\n` +
      (pct >= 80
        ? '_Casamento ja!_ 💍'
        : pct >= 50
          ? '_Tem chance de rolar!_ 😏'
          : pct >= 20
            ? '_Melhor ficar so na amizade._ 🤝'
            : '_Nem com reza brava..._ 💀');

    await sock.sendMessage(
      jid,
      { text: texto, mentions: [a, b] },
      { quoted: ctx.msg },
    );
  },
};
