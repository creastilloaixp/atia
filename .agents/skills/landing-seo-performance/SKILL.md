---
name: landing-seo-performance
description: >
  SEO técnico y Core Web Vitals para landing pages.
  TRIGGER: al crear/modificar index.html, meta tags, imágenes, o cuando el
  usuario pida "optimizar SEO", "mejorar performance", o "revisar Core Web Vitals".
version: "1.0.0"
metadata:
  author: casto
  emoji: "🔍"
  language: es
  always: false
  invocation:
    userInvocable: true
    disableModelInvocation: false
  tags: ["seo", "performance", "cwv", "meta", "og", "lighthouse"]
---

# Landing SEO & Performance — Core Web Vitals

Reglas técnicas para que la landing de Casto cargue rápido, indexe bien y se vea
perfecto al compartir en redes sociales.

## Meta Tags Obligatorios (index.html)

```html
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- SEO Primario -->
    <title>Casto Search — Inteligencia Inmobiliaria para Inversores</title>
    <meta
        name="description"
        content="Plataforma de análisis predictivo para flipping inmobiliario. Visualiza el potencial, calcula el ROI y toma decisiones con datos."
    />

    <!-- Open Graph (Facebook, LinkedIn, WhatsApp) -->
    <meta property="og:title" content="Casto Search — Flip con Inteligencia" />
    <meta
        property="og:description"
        content="Análisis predictivo de propiedades con IA. ROI proyectado, timeline de reforma y valuación automatizada."
    />
    <meta property="og:image" content="/og-image.png" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://castosearch.com" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta
        name="twitter:title"
        content="Casto Search — Inteligencia Inmobiliaria"
    />
    <meta
        name="twitter:description"
        content="Visualiza el flip antes de invertir."
    />
    <meta name="twitter:image" content="/og-image.png" />

    <!-- Preconnect para fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
</head>
```

## Core Web Vitals — Targets

| Métrica                             | Target  | Cómo cumplir                                                  |
| ----------------------------------- | ------- | ------------------------------------------------------------- |
| **LCP** (Largest Contentful Paint)  | < 2.5s  | Preload de font Montserrat + lazy load de imágenes below-fold |
| **FID** (First Input Delay)         | < 100ms | No bloquear main thread con GSAP pesado en load               |
| **CLS** (Cumulative Layout Shift)   | < 0.1   | Definir `aspect-ratio` en contenedores de imagen              |
| **INP** (Interaction to Next Paint) | < 200ms | Event handlers ligeros, no re-renders innecesarios            |

## Optimización de Imágenes

### Reglas

1. **Formato**: Usar WebP para todas las imágenes. PNG solo como fallback.
2. **Lazy Loading**: Imágenes below-fold con `loading="lazy"`.
3. **Dimensions explícitas**: Siempre `width` y `height` en `<img>` tags.
4. **Aspect Ratio**: Contenedores con `aspect-video` o `aspect-square`.

### Implementación

```tsx
// ✅ Correcto
<img 
  src="/assets/flipper-before.webp" 
  alt="Propiedad antes de renovación en Zona Norte"
  loading="lazy"
  width={1280}
  height={720}
  className="aspect-video object-cover"
/>

// ❌ Incorrecto
<img src="/assets/flipper-before.png" alt="before" />
```

## Font Loading Strategy

```html
<!-- Preload la variante más usada -->
<link
    rel="preload"
    href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;500;700&display=swap"
    as="style"
/>
<link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;500;700&display=swap"
/>
```

Solo cargar los pesos que usamos: **300** (light), **500** (medium), **700**
(bold).

## Estructura Semántica

```html
<body>
  <nav>          <!-- Navegación principal -->
  <main>
    <section>    <!-- Hero / Search -->
    <section>    <!-- Flipper Opportunity -->
    <section>    <!-- Property Results -->
  </main>
  <footer>       <!-- Dock / Footer info -->
</body>
```

1. Un solo `<h1>` por página (el headline del hero).
2. Cada sección tiene su propio `<h2>`.
3. IDs únicos en todos los elementos interactivos.

## Checklist Pre-Deploy

```
□  Meta title < 60 caracteres
□  Meta description < 155 caracteres
□  OG image existe y es 1200×630px
□  Fonts preloaded
□  Imágenes en WebP con lazy loading
□  Un solo <h1> en la página
□  Todas las imágenes tienen alt text descriptivo
□  No hay layout shifts (CLS < 0.1)
□  GSAP animations no bloquean first paint
```
