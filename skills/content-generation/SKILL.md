---
name: content-generation
description: Generación automatizada de contenido de marketing con IA usando Claude Code.
  Incluye: copy para anuncios, posts para redes sociales, emails marketing, descripciones
  de productos, videos con Remotion, imágenes con DALL-E/Midjourney, y pipelines de contenido
  multi-canal. Activa cuando el usuario mencione: content generation, ai copywriting,
  marketing copy, ad copy, social media content, email marketing, video generation,
  image generation, texto para anuncios, contenido para redes, generación de contenido.
triggers:
  - content generation
  - ai copywriting
  - marketing copy
  - ad copy
  - social media content
  - email marketing
  - video generation
  - image generation
  - texto para anuncios
  - contenido para redes
  - generación de contenido
  - copy marketing
tools:
  - Read
  - Write
  - Bash
  - Grep
  - Glob
---

# Content Generation con Claude Code

## Flujo de Generación de Contenido

```
Input (brief) → Research → Ideation → Creation → Adaptation → Output
```

## Tipos de Contenido

### 1. Copy para Anuncios

#### Anuncios Facebook/Instagram

```
Genera 5 variants de copy para un anuncio de [PRODUCTO].

Requisitos:
- Público: [AUDIENCIA]
- Objective: [CONVERSIÓN/LEAD/AWARENESS]
- Tono: [TONO]
- Longitud: 125 caracteres (primary text)

Para cada variant:
1. Primary text (hook)
2. Headline
3. Description
4. CTA sugerido

Incluye: emotion triggers, social proof, urgency elements.
```

#### Anuncios Google Ads

```
Crea copy para Google Search Ads:

Keywords: [LISTA]
Landing page: [URL]
Unique value proposition: [UVP]

Genera:
- 5 headlines (30 char max)
- 4 descriptions (90 char max)
- 3 sitelinks con descripciones
- Ad extensions recommendations
```

### 2. Contenido para Redes Sociales

#### LinkedIn

```
Post para LinkedIn sobre [TEMA].

Estructura:
1. Hook (primeros 2 líneas que paren el scroll)
2. Problema o situación reconocible
3. Solución o insight
4. Ejemplo concreto o historia
5. Call to action o pregunta

Largo: 1500-2000 caracteres
Incluye: emojis estratégicos, line breaks, hashtags relevantes.
```

#### Instagram

```
Contenido para Instagram:

Post type: [CAROUSEL/IMAGE/REELS]
Tema: [TEMA]

Para carousel:
- Slide 1: Hook visual + título
- Slides 2-7: Contenido del post
- Slide 8: CTA

Para caption:
- Primera línea: Hook
- Cuerpo: value + story
- CTA: engagement question
- Hashtags: 15-20 relevantes
```

#### Twitter/X

```
Tweet thread sobre [TEMA]:

- Tweet 1: Hook controversial o surprising
- Tweets 2-5: Desarrollo con puntos numerados
- Tweet 6: Summary + CTA

Cada tweet: 280 caracteres max
Thread completo: 6-10 tweets
Incluye: engagement hooks, visuals placeholder
```

### 3. Email Marketing

#### Secuencia de Bienvenida

```
Email 1 de 5 - Secuencia de bienvenida para [PRODUCTO]:

Tipo: Email de bienvenida
Objetivo: Establecer relación + presentar valor

Estructura:
- Subject line (A/B test ready)
- Preheader
- Saludo personalizado
- Hook inicial
- Problema que resuelves
- Tu solución/propuesta
- Testimonio social
- CTA claro
- P.S. (personal touch)

Tono: [TONO]
Largo: 150-200 palabras
```

### 4. Descripciones de Productos

```
Genera descripción para:

Producto: [NOMBRE]
Categoría: [CATEGORÍA]
Features: [LISTA DE FEATURES]
Benefits: [LISTA DE BENEFICIOS]
Audience: [PÚBLICO]

Genera:
- Short description (50 words): para listings
- Long description (150 words): para web
- Bullet points: para feature lists
- SEO keywords: términos a incluir
```

## Integración con Herramientas de Generación

### DALL-E para Imágenes

```javascript
// Generar imagen para anuncio
async function generateAdImage(prompt, options = {}) {
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: prompt,
      size: options.size || '1792x1024',
      quality: options.quality || 'standard',
      n: options.n || 1
    })
  });
  return response.json();
}

// Prompt para imagen de anuncio
const adImagePrompt = `
Professional advertisement image for [PRODUCT/SERVICE].
Style: [MODERN/CLEAN/BOLD]
Mood: [EMOTIONAL/ASPIRATIONAL/TRUSTWORTHY]
Include: [VISUAL ELEMENTS]
Avoid: [EXCLUSIONS]
`;
```

### Remotion para Videos

```javascript
// Configurar video con Remotion
const videoConfig = {
  duration: 30, // seconds
  fps: 30,
  width: 1920,
  height: 1080,
  components: [
    { type: 'Text', content: 'Headline', position: 'center' },
    { type: 'Image', src: 'generated_image.png' },
    { type: 'Video', src: 'background_video.mp4' }
  ]
};
```

## Pipeline de Contenido Multi-canal

```
Brief → Research → Copy → Design → Video → Distribution → Measure
```

### Workflow n8n

```json
{
  "name": "Content Pipeline",
  "nodes": [
    {
      "name": "New Campaign",
      "type": "n8n-nodes-base.webhook"
    },
    {
      "name": "Generate Copy",
      "type": "n8n-nodes-base.openai",
      "parameters": {
        "operation": "chat",
        "prompt": "Genera copy para {{ $json.campaign_type }}"
      }
    },
    {
      "name": "Generate Images",
      "type": "n8n-nodes-base.openai",
      "parameters": {
        "operation": "image",
        "prompt": "Imagen para {{ $json.product }}"
      }
    },
    {
      "name": "Adapt for Platforms",
      "type": "n8n-nodes-base.function",
      "parameters": {
        "functionCode": "return adaptContentForPlatforms($json.content)"
      }
    },
    {
      "name": "Distribute",
      "type": "n8n-nodes-base.httpRequest"
    }
  ]
}
```

## Mejores Prácticas

### A/B Testing

```
Para cada pieza de contenido, generar:
- Version A: Enfoque racional/feature-focused
- Version B: Enfoque emocional/story-focused
- Version C: Enfoque social/proof-focused
```

### Personalización

```
El contenido debe adaptarse según:
- Industry/Nicho
- Company size
- Role del decision maker
- Stage del buyer journey
- Previous interactions
```

## Casos de Uso para Autocobro

### Anuncios para Servicios de Autocobro

```
Genera copy para anuncios de servicios de autocobro.

Audience: [Retailers, Restaurants, Clinics]
Pain point: [Clientes que no pagan, gestión de cobranza]
Solution: [Automatización de cobros, recordatorios, seguimiento]

Output:
- 5 headlines poderosos
- 3 primary texts
- 2 descriptions
- 3 CTA options
```

### Contenido Educativo

```
Genera contenido educativo sobre autocobro:

- 5 blog posts titles
- 3 LinkedIn articles outlines
- 2 email series concepts
- 10 social media tips

Para: Dueños de negocio que necesitan cobrar más