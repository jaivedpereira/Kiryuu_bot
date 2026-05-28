const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const webpmux = require('node-webpmux');
const config = require('../config');

/**
 * Converte uma imagem (jpg/png/webp) em sticker WebP estatico.
 * Usa ffmpeg pois ele esta disponivel tanto em desktop quanto Termux,
 * evitando libs nativas pesadas como sharp.
 */
function imageToWebp(buffer) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(config.tmpFolder)) {
      fs.mkdirSync(config.tmpFolder, { recursive: true });
    }
    const id = Date.now() + '-' + Math.random().toString(36).slice(2, 8);
    const inputPath = path.join(config.tmpFolder, `imgin-${id}`);
    const outputPath = path.join(config.tmpFolder, `imgout-${id}.webp`);
    fs.writeFileSync(inputPath, buffer);

    const args = [
      '-y',
      '-i', inputPath,
      '-vf',
      "scale='min(512,iw)':min'(512,ih)':force_original_aspect_ratio=decrease,pad=512:512:-1:-1:color=white@0.0",
      '-vcodec', 'libwebp',
      '-lossless', '1',
      '-q:v', '60',
      '-preset', 'default',
      '-an',
      outputPath,
    ];
    const ff = spawn('ffmpeg', args);
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
      } catch (e) {
        reject(e);
      }
    });
  });
}

/**
 * Converte um video/gif em sticker animado WebP usando ffmpeg.
 * Requer ffmpeg disponivel no PATH.
 */
function videoToWebp(buffer) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(config.tmpFolder)) {
      fs.mkdirSync(config.tmpFolder, { recursive: true });
    }
    const id = Date.now() + '-' + Math.random().toString(36).slice(2, 8);
    const inputPath = path.join(config.tmpFolder, `in-${id}.mp4`);
    const outputPath = path.join(config.tmpFolder, `out-${id}.webp`);
    fs.writeFileSync(inputPath, buffer);

    const args = [
      '-y',
      '-i', inputPath,
      '-vcodec', 'libwebp',
      '-vf',
      "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15,pad=320:320:-1:-1:color=white@0.0,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p]paletteuse",
      '-loop', '0',
      '-ss', '00:00:00.0',
      '-t', '00:00:08.0',
      '-preset', 'default',
      '-an',
      '-vsync', '0',
      outputPath,
    ];
    const ff = spawn('ffmpeg', args);
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
      } catch (e) {
        reject(e);
      }
    });
  });
}

/**
 * Adiciona metadados (pacote/autor) ao WebP.
 */
async function addStickerMetadata(webpBuffer, packname, author) {
  const img = new webpmux.Image();
  await img.load(webpBuffer);

  const json = {
    'sticker-pack-id': 'com.kiryuu.bot',
    'sticker-pack-name': packname || config.stickerPack,
    'sticker-pack-publisher': author || config.stickerAuthor,
    emojis: ['😀'],
  };

  const exifAttr = Buffer.from([
    0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00,
    0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x16, 0x00, 0x00, 0x00,
  ]);
  const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf-8');
  const exif = Buffer.concat([exifAttr, jsonBuffer]);
  exif.writeUIntLE(jsonBuffer.length, 14, 4);

  img.exif = exif;
  return img.save(null);
}

async function createSticker(buffer, isAnimated, packname, author) {
  const webp = isAnimated ? await videoToWebp(buffer) : await imageToWebp(buffer);
  return addStickerMetadata(webp, packname, author);
}

module.exports = { createSticker, imageToWebp, videoToWebp, addStickerMetadata };
