#!/usr/bin/env node
/**
 * describe-image.cjs — Describe imágenes usando Ollama + modelo de visión local
 * Usage: node describe-image.cjs <ruta-imagen> [prompt-opcional]
 * 
 * Requiere: Ollama corriendo con modelo de visión (llava, bakllava, etc.)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { createHash } = require('crypto');

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'localhost';
const OLLAMA_PORT = process.env.OLLAMA_PORT || 11434;
const DEFAULT_MODEL = 'llava';
const DEFAULT_PROMPT = 'Describe esta imagen en detalle. Incluye: elementos visuales, colores dominantes, diseño, texto visible, y cualquier altro detalle relevante.';

function base64Encode(filePath) {
  const buffer = fs.readFileSync(filePath);
  return buffer.toString('base64');
}

function ollamaRequest(model, prompt, base64Image) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model,
      prompt,
      images: [base64Image],
      stream: false
    });

    const options = {
      hostname: OLLAMA_HOST,
      port: OLLAMA_PORT,
      path: '/api/generate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve(response);
        } catch (e) {
          reject(new Error('Failed to parse Ollama response: ' + body));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function checkOllamaHealth() {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: OLLAMA_HOST,
      port: OLLAMA_PORT,
      path: '/api/tags',
      method: 'GET'
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const models = JSON.parse(body).models || [];
          const visionModels = models.filter(m => 
            m.name.includes('llava') || 
            m.name.includes('bakllava') ||
            m.name.includes('llama3') && m.name.includes('vision')
          );
          resolve(visionModels);
        } catch (e) {
          resolve([]);
        }
      });
    });
    req.on('error', () => resolve([]));
    req.end();
  });
}

async function main() {
  const [,, imagePath, ...promptParts] = process.argv;
  
  if (!imagePath) {
    console.error('Usage: node describe-image.cjs <ruta-imagen> [prompt-opcional]');
    console.error('Example: node describe-image.cjs screenshot.png');
    console.error('Example: node describe-image.cjs screenshot.png "Focus on UI elements"');
    process.exit(1);
  }

  const resolvedPath = path.resolve(imagePath);
  
  if (!fs.existsSync(resolvedPath)) {
    console.error(`Error: File not found: ${resolvedPath}`);
    process.exit(1);
  }

  const ext = path.extname(resolvedPath).toLowerCase();
  if (!['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext)) {
    console.error(`Error: Unsupported format: ${ext}. Use: PNG, JPG, GIF, WebP`);
    process.exit(1);
  }

  console.error(`Checking Ollama status...`);
  const visionModels = await checkOllamaHealth();
  
  if (visionModels.length === 0) {
    console.error('Error: No vision model found in Ollama.');
    console.error('Install one with: ollama pull llava');
    process.exit(1);
  }

  const model = visionModels[0].name;
  console.error(`Using model: ${model}`);

  const prompt = promptParts.length > 0 ? promptParts.join(' ') : DEFAULT_PROMPT;
  const base64Image = base64Encode(resolvedPath);
  
  console.error(`Analyzing image...`);

  try {
    const response = await ollamaRequest(model, prompt, base64Image);
    
    if (response.error) {
      console.error('Ollama error:', response.error);
      process.exit(1);
    }

    console.log(response.response);
    
    if (response.done && response.eval_count) {
      console.error(`\n[Stats: ${response.eval_count} tokens, ${response.eval_duration ? Math.round(response.eval_duration / 1e9) + 's' : '?'}]`);
    }
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();
