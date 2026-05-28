const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { downloadBuffer } = require('../../lib/media');
const config = require('../../config');

// Converte WebP -> PNG via ffmpeg para nao depender de libs nativas.
function webpToPng(buffer) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(config.tmpFolder)) {
      fs.mkdirSync(config.tmpFolder, { recursive: true });
    }
    const id = Date.now() + '-' + Math.random().toString(36).slice(2, 8);
    const inputPath = path.join(config.tmpFolder, `sin-${id}.webp`);
    const outputPath = path.join(config.tmpFolder, `sout-${id}.png`);
    fs.writeFileSync(inputPath, buffer);
    const ff = spawn('ffmpeg', ['-y', '-i', inputPath, outputPath]);
    let stderr = '';
    ff.stderr.on('data', (d) => { stderr += d.toString(); });
    ff.on('error', reject);
    ff.on('close', (code) => {
      try { fs.unlinkSync(inputPath); } catch (_) {}
      if (code !== 0) {
        return reject(new Error(`ffmpeg saiu com codigo ${code}: ${stderr.slice(-200)}`));
      }
      try {
        const out = fs.readFileSync(outputPath);
        fs.unlinkSync(outputPath);
        resolve(out);
      } catch (e) { reject(e); }
    });
  });
}

module.exports = {
  name: 'toimg',
  aliases: ['paraimg', 'figparaimg'],
  category: 'figurinhas',
  description: 'Converte uma figurinha estatica em imagem PNG.',
  example: 'toimg (respondendo a uma figurinha)',
  async run(ctx) {
    const { msg, quoted, reply, react } = ctx;
    const sticker = quoted?.stickerMessage;
    if (!sticker) {
      return reply('📌 Responda uma figurinha *estatica* com este comando.');
    }
    if (sticker.isAnimated) {
      return reply('⚠️ Figurinhas animadas nao podem virar imagem (use *togif* no futuro).');
    }

    await react('🖼️');
    try {
      const buffer = await downloadBuffer({ ...msg, message: quoted }, msg.key);
      const png = await webpToPng(buffer);
      await ctx.sock.sendMessage(
        ctx.jid,
        { image: png, caption: '🖼️ Aqui esta sua figurinha como imagem!' },
        { quoted: msg },
      );
      await react('✅');
    } catch (err) {
      await react('❌');
      await reply(`❌ Erro ao converter: ${err.message}`);
    }
  },
};
