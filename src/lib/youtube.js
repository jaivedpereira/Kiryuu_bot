const ytdl = require('@distube/ytdl-core');
const yts = require('yt-search');

/**
 * Pesquisa um termo no YouTube e retorna o primeiro resultado relevante.
 */
async function buscar(termo) {
  const r = await yts(termo);
  return r.videos?.[0] || null;
}

/**
 * Faz download em buffer de audio (mp3/m4a) ou video (mp4) de uma URL do YouTube.
 * tipo: 'audio' | 'video'
 */
function baixar(url, tipo = 'audio') {
  return new Promise((resolve, reject) => {
    const stream = ytdl(url, {
      filter: tipo === 'audio' ? 'audioonly' : 'audioandvideo',
      quality: tipo === 'audio' ? 'highestaudio' : 'highest',
      highWaterMark: 1 << 25,
    });
    const chunks = [];
    stream.on('data', (c) => chunks.push(c));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

async function info(url) {
  const meta = await ytdl.getInfo(url);
  return {
    title: meta.videoDetails.title,
    author: meta.videoDetails.author?.name,
    durationSec: parseInt(meta.videoDetails.lengthSeconds, 10),
    thumb: meta.videoDetails.thumbnails?.slice(-1)[0]?.url,
    url: meta.videoDetails.video_url,
  };
}

function formatarDuracao(seg) {
  const h = Math.floor(seg / 3600);
  const m = Math.floor((seg % 3600) / 60);
  const s = seg % 60;
  return h > 0
    ? `${h}h ${m}m ${s}s`
    : `${m}m ${s}s`;
}

module.exports = { buscar, baixar, info, formatarDuracao };
