const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const options = {};
for (let i = 0; i < args.length; i += 2) {
  if (args[i].startsWith('--')) {
    options[args[i].replace('--', '')] = args[i + 1];
  }
}

const topic = options.topic || 'general';
const count = parseInt(options.count) || 1;

const templates = {
  autocobro: [
    { type: 'tips', format: 'image', content: '5 Tips para mejorar tu tasa de cobro' },
    { type: 'testimonial', format: 'quote', content: 'Caso de éxito: Restaurant X recuperó $10,000' },
    { type: 'education', format: 'carousel', content: 'Cómo funciona el autocobro automatizado' }
  ],
  ai: [
    { type: 'news', format: 'image', content: 'Nueva tendencia en IA para negocios' },
    { type: 'tips', format: 'image', content: '3 formas de usar IA en tu negocio' },
    { type: 'question', format: 'text', content: '¿Ya usas IA en tu empresa?' }
  ],
  general: [
    { type: 'motivation', format: 'image', content: 'Consejo del día para emprendedores' },
    { type: 'fact', format: 'image', content: '¿Sabías que...?' },
    { type: 'question', format: 'text', content: '¿Cuál es tu mayor desafío hoy?' }
  ]
};

const templateList = templates[topic] || templates.general;
const outputDir = options.output || path.join(__dirname, '../content/pending');

for (let i = 0; i < count; i++) {
  const item = templateList[i % templateList.length];
  const filename = `${topic}_${Date.now()}_${i}.json`;
  const filepath = path.join(outputDir, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(item, null, 2));
  console.log(`✓ Generated: ${filename}`);
}

console.log(`\n📝 ${count} content items generated in ${outputDir}`);
console.log('Next: Use image generation tools to create visuals, then publish.js to distribute');
