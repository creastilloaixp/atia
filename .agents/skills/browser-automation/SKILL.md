---
name: browser-automation
description: >
  Chrome DevTools Protocol controller para web scraping, analisis de contenido,
  extraccion de transcripts de YouTube, screenshots y automatizacion de browser.
  TRIGGER: cuando el usuario pida "analiza este video", "extrae el transcript",
  "dame los puntos clave de [URL]", "lee esta pagina", "screenshot de [URL]",
  "navega a", "scrape", o cualquier tarea que requiera interactuar con un navegador.
version: "1.0.0"
metadata:
  author: pro-trinity
  emoji: "\U0001F310"
  language: es
  always: false
  requires:
    chrome: "Chrome corriendo con --remote-debugging-port=9222"
  invocation:
    userInvocable: true
    disableModelInvocation: false
  tags: ["browser", "scraping", "youtube", "transcript", "cdp", "screenshot", "automation"]
---

# Browser Automation — Chrome CDP Controller

Herramienta de automatizacion de navegador usando Chrome DevTools Protocol.
Zero dependencies (WebSocket custom, sin puppeteer ni playwright).

## Prerequisito

Chrome debe estar corriendo con debugging remoto:

```bash
# Windows
start chrome --remote-debugging-port=9222

# Mac
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222

# Linux
google-chrome --remote-debugging-port=9222
```

## Comandos disponibles

```bash
# Ver tabs abiertos
node scripts/browser.cjs list

# Navegar a URL (espera 5s para carga)
node scripts/browser.cjs navigate "https://example.com"

# Extraer texto limpio de la pagina (sin scripts/styles, max 50K chars)
node scripts/browser.cjs content

# Extraer HTML completo (max 100K chars)
node scripts/browser.cjs html

# Obtener titulo de la pagina
node scripts/browser.cjs title

# Tomar screenshot (guarda PNG en temp)
node scripts/browser.cjs screenshot

# Click en un elemento por CSS selector
node scripts/browser.cjs click "button.submit"

# Evaluar JavaScript arbitrario en la pagina
node scripts/browser.cjs evaluate "document.querySelectorAll('h2').length"
```

Todos los comandos aceptan un `[tabIndex]` opcional como ultimo argumento (default: 0).

## Flujo: Analisis de Video YouTube

Este es el caso de uso principal. Para extraer y analizar un video de YouTube:

### Paso 1 — Navegar al video
```bash
node scripts/browser.cjs navigate "https://www.youtube.com/watch?v=VIDEO_ID"
```

### Paso 2 — Obtener titulo y descripcion
```bash
node scripts/browser.cjs title
node scripts/browser.cjs content
```

### Paso 3 — Abrir transcript (click en boton "Show transcript")
```bash
node scripts/browser.cjs click "button[aria-label='Show transcript']"
```
Si el boton no aparece, intentar primero expandir la descripcion:
```bash
node scripts/browser.cjs click "#expand"
```

### Paso 4 — Extraer segmentos del transcript
```bash
node scripts/browser.cjs evaluate "(function() {
  let segs = document.querySelectorAll('ytd-transcript-segment-renderer');
  if (segs.length > 0) {
    let out = '';
    segs.forEach(s => out += s.innerText.trim() + '\n');
    return 'FOUND ' + segs.length + ' segments:\n' + out.substring(0, 50000);
  }
  return 'No transcript segments found';
})()"
```

### Paso 5 — Analizar contenido
Con el transcript extraido, generar:
- Puntos clave (bullet points)
- Resumen ejecutivo
- Ideas accionables
- Timestamps de momentos importantes

## Flujo: Scraping de pagina web

### Extraer contenido estructurado
```bash
node scripts/browser.cjs navigate "https://target-site.com"
# Esperar que cargue, luego:
node scripts/browser.cjs content
```

### Extraer datos especificos con evaluate
```bash
node scripts/browser.cjs evaluate "(function() {
  const items = document.querySelectorAll('.product-card');
  return JSON.stringify(Array.from(items).map(el => ({
    title: el.querySelector('h3')?.textContent,
    price: el.querySelector('.price')?.textContent
  })));
})()"
```

## Flujo: QA Visual (Screenshots)

```bash
node scripts/browser.cjs navigate "http://localhost:5173"
node scripts/browser.cjs screenshot
# El screenshot se guarda en %TEMP%/screenshot-[timestamp].png
# Luego usar Read tool para verlo y analizarlo
```

## Configuracion

Variables de entorno opcionales:
- `CDP_HOST` — Host del Chrome (default: localhost)
- `CDP_PORT` — Puerto CDP (default: 9222)

## Notas importantes

1. **navigate** tiene un wait hardcoded de 5s — para paginas lentas, usar `sleep` adicional antes de content/evaluate
2. **content** limpia scripts, styles, iframes y colapsa whitespace
3. **evaluate** puede ejecutar cualquier JS — usar IIFE para retornos complejos
4. **screenshot** guarda en directorio temporal del OS
5. El selector de transcript de YouTube puede cambiar — si falla, usar `evaluate` para inspeccionar el DOM y encontrar el selector actual
