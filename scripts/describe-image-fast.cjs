#!/usr/bin/env node
/**
 * describe-image-fast.cjs — Versión rápida usando Ollama
 * Reduce imagen y usa prompt conciso para velocidad
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'localhost';
const OLLAMA_PORT = process.env.OLLAMA_PORT || 11434;

async function resizeImage(src) {
  const buffer = await sharp(src)
    .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 70 })
    .toBuffer();
  return buffer.toString('base64');
}

function ollamaRequest(model, prompt, base64Image) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model,
      prompt,
      images: [base64Image],
      stream: false,
      options: { temperature: 0.3, num_predict: 200 }
    });

    const req = http.request({
      hostname: OLLAMA_HOST,
      port: OLLAMA_PORT,
      path: '/api/generate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch (e) { reject(e); }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function resizeImage(src, dst, maxSize = 512) {
  try {
    execSync(`magick "${src}" -resize ${maxSize}x${maxSize}> -quality 70 "${dst}"`, { stdio: 'ignore' });
    return true;
  } catch {
    try {
      execSync(`convert "${src}" -resize ${maxSize}x${maxSize}> -quality 70 "${dst}"`, { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }
}

async function main() {
  const [,, imagePath, ...promptParts] = process.argv;
  
  if (!imagePath) {
    console.error('Usage: node describe-image-fast.cjs <ruta-imagen> [prompt]');
    process.exit(1);
  }

  const resolvedPath = path.resolve(imagePath);
  if (!fs.existsSync(resolvedPath)) {
    console.error('File not found:', resolvedPath);
    process.exit(1);
  }

  let base64Image;
  try {
    base64Image = await resizeImage(resolvedPath);
  } catch (err) {
    console.error('Error resizing image:', err.message);
    process.exit(1);
  }

  const prompt = promptParts.join(' ') || 'Describe: colors, layout, main elements, any text.';

  try {
    const start = Date.now();
    const response = await ollamaRequest('llava', prompt, base64Image);
    const elapsed = Math.round((Date.now() - start) / 1000);
    
    console.log(response.response);
    console.error(`\n[Generated in ${elapsed}s]`);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();
