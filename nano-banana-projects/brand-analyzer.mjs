#!/usr/bin/env node
/**
 * brand-analyzer.mjs — Step 1: Analyze a website and extract brand identity
 *
 * Usage: node nano-banana-projects/brand-analyzer.mjs <website_url> [output_dir]
 *
 * Process:
 * 1. Fetches the target website HTML
 * 2. Sends to Gemini for brand analysis (colors, typography, industry, tone)
 * 3. Generates a brand-card.html for visual approval
 * 4. Outputs brand.json for use in subsequent steps
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GEMINI_API_KEY = process.env.GEMINI_API_KEY_ALT || 'AIzaSyDJoQpkF6oYCaoFFSWMBIRa1HmwX1MPFh8';

const colors = {
  reset: '\x1b[0m', bright: '\x1b[1m', green: '\x1b[32m',
  yellow: '\x1b[33m', blue: '\x1b[34m', red: '\x1b[31m', cyan: '\x1b[36m'
};
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  step: (msg) => console.log(`\n${colors.bright}${colors.cyan}→${colors.reset} ${colors.bright}${msg}${colors.reset}`)
};

// ===== Fetch website HTML =====
async function fetchWebsite(url) {
  log.step('Fetching website...');

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    const html = await response.text();
    // Trim to manageable size for Gemini
    const trimmed = html.substring(0, 30000);
    log.success(`Fetched ${trimmed.length} characters from ${url}`);
    return trimmed;
  } catch (error) {
    log.error(`Failed to fetch ${url}: ${error.message}`);
    throw error;
  }
}

// ===== Analyze brand with Gemini =====
async function analyzeBrand(html, url) {
  log.step('Analyzing brand with Gemini...');

  const prompt = `
You are a premium brand analyst. Analyze the following website HTML and extract a complete brand identity profile.

WEBSITE URL: ${url}
HTML CONTENT:
${html}

Return a JSON object with exactly these fields:

{
  "companyName": "The company/brand name",
  "industry": "e.g. Restaurant, Insurance, E-commerce, etc.",
  "tagline": "Their existing or suggested tagline",
  "description": "2-3 sentence company description",
  "colors": {
    "primary": "#hex - main brand color",
    "secondary": "#hex - secondary color",
    "accent": "#hex - accent/highlight color",
    "background": "#hex - suggested dark background",
    "text": "#hex - main text color",
    "textLight": "#hex - lighter text"
  },
  "typography": {
    "headingFont": "Suggested Google Font for headings",
    "bodyFont": "Suggested Google Font for body",
    "style": "Modern/Classic/Elegant/Bold/Playful"
  },
  "tone": "Professional/Luxury/Friendly/Bold/Warm",
  "heroHeadline": "A cinematic hero headline for the website",
  "heroSubheadline": "Supporting subheadline",
  "themeDirection": "Brief description of the visual theme direction",
  "keyProducts": ["product/service 1", "product/service 2", "product/service 3"],
  "targetAudience": "Description of the target audience",
  "suggestedHeroScenes": [
    {
      "title": "Scene concept title",
      "prompt": "Detailed image generation prompt for a cinematic hero scene that represents this brand. Include camera angles, lighting, mood, colors. Make it ultra-premium and cinematic.",
      "animationHint": "How this scene should be animated (camera movement, element motion)"
    },
    {
      "title": "Scene concept title 2",
      "prompt": "Another detailed prompt...",
      "animationHint": "Animation description..."
    },
    {
      "title": "Scene concept title 3",
      "prompt": "Another detailed prompt...",
      "animationHint": "Animation description..."
    }
  ],
  "address": "Physical address if found",
  "hours": "Operating hours if found",
  "contactInfo": "Phone, email if found"
}

Be thorough and creative. The brand colors should feel premium and cinematic.
The hero scene prompts should be highly detailed for AI image generation (Nano Banana / Flux style).
`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json'
        }
      })
    }
  );

  const result = await response.json();

  // Gemini may return multiple parts (thinking + response)
  const parts = result.candidates?.[0]?.content?.parts || [];
  let text = '';
  for (const part of parts) {
    if (part.text) text += part.text;
  }

  if (!text) {
    log.error('Empty response from Gemini');
    log.info('Full response: ' + JSON.stringify(result).substring(0, 500));
    throw new Error('Empty response from Gemini');
  }

  // Try direct JSON parse first (responseMimeType should return clean JSON)
  let jsonMatch;
  try {
    const parsed = JSON.parse(text);
    return parsed; // Early return if clean JSON
  } catch {
    // Fall back to regex extraction
    jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      log.error('Response text (first 500 chars): ' + text.substring(0, 500));
      throw new Error('Could not extract JSON from Gemini response');
    }
  }

  const brand = JSON.parse(jsonMatch[1] || jsonMatch[0]);
  log.success('Brand analysis complete');
  return brand;
}

// ===== Generate brand card HTML =====
function generateBrandCard(brand) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Brand Card — ${brand.companyName}</title>
<link href="https://fonts.googleapis.com/css2?family=${brand.typography.headingFont.replace(/ /g, '+')}:wght@400;700&family=${brand.typography.bodyFont.replace(/ /g, '+')}:wght@300;400;600&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: '${brand.typography.bodyFont}', sans-serif;
    background: #0a0a0a;
    color: #f0f0f0;
    min-height: 100vh;
    padding: 40px;
  }
  .card {
    max-width: 900px;
    margin: 0 auto;
    background: linear-gradient(135deg, #111 0%, #1a1a2e 100%);
    border-radius: 24px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.08);
    box-shadow: 0 25px 80px rgba(0,0,0,0.5);
  }
  .hero {
    background: linear-gradient(135deg, ${brand.colors.primary}, ${brand.colors.secondary});
    padding: 60px 40px;
    text-align: center;
  }
  .hero h1 {
    font-family: '${brand.typography.headingFont}', serif;
    font-size: 42px;
    font-weight: 700;
    margin-bottom: 8px;
  }
  .hero .industry {
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 3px;
    opacity: 0.8;
  }
  .content { padding: 40px; }
  .section { margin-bottom: 32px; }
  .section h2 {
    font-family: '${brand.typography.headingFont}', serif;
    font-size: 18px;
    color: ${brand.colors.accent};
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }
  .palette {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
  .swatch {
    width: 80px;
    text-align: center;
  }
  .swatch-color {
    width: 80px;
    height: 80px;
    border-radius: 12px;
    border: 2px solid rgba(255,255,255,0.1);
    margin-bottom: 6px;
  }
  .swatch-label {
    font-size: 11px;
    opacity: 0.7;
  }
  .swatch-hex {
    font-size: 12px;
    font-family: monospace;
    color: ${brand.colors.accent};
  }
  .typography-demo h3 {
    font-family: '${brand.typography.headingFont}', serif;
    font-size: 28px;
    margin-bottom: 8px;
  }
  .typography-demo p {
    font-family: '${brand.typography.bodyFont}', sans-serif;
    font-size: 16px;
    opacity: 0.8;
    line-height: 1.6;
  }
  .hero-text {
    background: rgba(0,0,0,0.3);
    border-radius: 16px;
    padding: 24px;
    margin-top: 12px;
  }
  .hero-text h3 {
    font-family: '${brand.typography.headingFont}', serif;
    font-size: 24px;
    margin-bottom: 8px;
    color: ${brand.colors.accent};
  }
  .hero-text p { opacity: 0.8; line-height: 1.5; }
  .scene-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 12px;
  }
  .scene-card h4 {
    color: ${brand.colors.accent};
    margin-bottom: 8px;
  }
  .scene-card p { font-size: 14px; opacity: 0.7; line-height: 1.5; }
  .scene-card .animation-hint {
    margin-top: 8px;
    font-style: italic;
    color: ${brand.colors.secondary};
    font-size: 13px;
  }
  .meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  .meta-item label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1px;
    opacity: 0.5;
    display: block;
    margin-bottom: 4px;
  }
  .meta-item span {
    font-size: 15px;
  }
  .approve-btn {
    display: block;
    width: 100%;
    padding: 16px;
    background: linear-gradient(135deg, ${brand.colors.primary}, ${brand.colors.accent});
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-top: 20px;
  }
</style>
</head>
<body>
<div class="card">
  <div class="hero">
    <div class="industry">${brand.industry}</div>
    <h1>${brand.companyName}</h1>
    <p style="margin-top:8px;opacity:0.9">${brand.tagline}</p>
  </div>
  <div class="content">
    <div class="section">
      <h2>Color Palette</h2>
      <div class="palette">
        ${Object.entries(brand.colors).map(([name, hex]) => `
        <div class="swatch">
          <div class="swatch-color" style="background:${hex}"></div>
          <div class="swatch-label">${name}</div>
          <div class="swatch-hex">${hex}</div>
        </div>`).join('')}
      </div>
    </div>

    <div class="section">
      <h2>Typography</h2>
      <div class="typography-demo">
        <h3>${brand.typography.headingFont} — ${brand.typography.style}</h3>
        <p>${brand.description}</p>
      </div>
    </div>

    <div class="section">
      <h2>Hero Direction</h2>
      <div class="hero-text">
        <h3>${brand.heroHeadline}</h3>
        <p>${brand.heroSubheadline}</p>
        <p style="margin-top:12px;font-size:13px;opacity:0.5">Theme: ${brand.themeDirection}</p>
      </div>
    </div>

    <div class="section">
      <h2>Suggested Hero Scenes</h2>
      ${(brand.suggestedHeroScenes || []).map((scene, i) => `
      <div class="scene-card">
        <h4>${i + 1}. ${scene.title}</h4>
        <p>${scene.prompt}</p>
        <p class="animation-hint">🎬 ${scene.animationHint}</p>
      </div>`).join('')}
    </div>

    <div class="section">
      <h2>Brand Details</h2>
      <div class="meta-grid">
        <div class="meta-item"><label>Tone</label><span>${brand.tone}</span></div>
        <div class="meta-item"><label>Target Audience</label><span>${brand.targetAudience}</span></div>
        <div class="meta-item"><label>Key Products</label><span>${(brand.keyProducts || []).join(', ')}</span></div>
        <div class="meta-item"><label>Address</label><span>${brand.address || 'N/A'}</span></div>
        <div class="meta-item"><label>Hours</label><span>${brand.hours || 'N/A'}</span></div>
        <div class="meta-item"><label>Contact</label><span>${brand.contactInfo || 'N/A'}</span></div>
      </div>
    </div>

    <button class="approve-btn" onclick="alert('Brand approved! Proceeding to Step 2: Scene Generation')">
      ✓ Approve Brand &amp; Continue to Scene Generation
    </button>
  </div>
</div>
</body>
</html>`;
}

// ===== Main =====
async function main() {
  const [,, websiteUrl, outputDir] = process.argv;

  if (!websiteUrl) {
    console.log(`
${colors.bright}Brand Analyzer — Step 1 of Cinematic Sites${colors.reset}

Usage:
  node nano-banana-projects/brand-analyzer.mjs <website_url> [output_dir]

Examples:
  node nano-banana-projects/brand-analyzer.mjs "https://example.com"
  node nano-banana-projects/brand-analyzer.mjs "https://example.com" "./output"
    `);
    process.exit(1);
  }

  const outDir = outputDir || path.join(__dirname, 'output');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  try {
    log.info('🎨 Step 1: Brand Analysis\n');

    const html = await fetchWebsite(websiteUrl);
    const brand = await analyzeBrand(html, websiteUrl);

    // Save brand.json
    const brandPath = path.join(outDir, 'brand.json');
    fs.writeFileSync(brandPath, JSON.stringify(brand, null, 2));
    log.success(`Brand data saved: ${brandPath}`);

    // Save brand-card.html
    const cardPath = path.join(outDir, 'brand-card.html');
    fs.writeFileSync(cardPath, generateBrandCard(brand));
    log.success(`Brand card saved: ${cardPath}`);

    console.log(`\n${colors.bright}${colors.green}✨ Brand Analysis Complete!${colors.reset}`);
    console.log(`  Company: ${colors.cyan}${brand.companyName}${colors.reset}`);
    console.log(`  Industry: ${colors.cyan}${brand.industry}${colors.reset}`);
    console.log(`  Palette: ${Object.values(brand.colors).slice(0, 3).join(', ')}`);
    console.log(`  Scenes: ${brand.suggestedHeroScenes?.length || 0} concepts generated`);
    console.log(`\n  Open ${colors.cyan}${cardPath}${colors.reset} to review the brand card.`);
    console.log(`  Then run: ${colors.cyan}node nano-banana-projects/generate-scene.mjs "${outDir}/brand.json"${colors.reset}`);

  } catch (error) {
    log.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();
