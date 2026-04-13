---
name: browser-controller
description: >
  Controla Google Chrome via Chrome DevTools Protocol (CDP) usando `scripts/browser.cjs`.
  TRIGGER: cuando necesites navegar una URL, leer contenido de una página web,
  hacer click en elementos, tomar screenshots, o extraer datos de sitios que
  no tienen API. También cuando WebFetch falle o devuelva contenido incompleto.
version: "1.0.0"
metadata:
  author: pro-trinity
  emoji: "🌐"
  language: es
  always: false
  requires:
    packages: ["chrome-remote-interface"]
    runtime: "Chrome con --remote-debugging-port=9222"
  invocation:
    userInvocable: true
    disableModelInvocation: false
  tags: ["browser", "cdp", "scraping", "automation", "chrome", "devtools"]
---

# Browser Controller — CDP Automation Skill

Esta skill permite controlar Google Chrome de forma autónoma via Chrome DevTools
Protocol. Es el fallback cuando `WebFetch` falla o cuando necesitas interacción
real con una página (login, clicks, scroll).

## Prerequisito

Chrome debe estar corriendo en modo debug:

```bash
# Windows
"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222

# macOS
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222

# Linux
google-chrome --remote-debugging-port=9222
```

Si Chrome ya está abierto, ciérralo completamente primero y luego ábrelo con el flag.

## Comandos disponibles

### Listar tabs abiertas
```bash
node scripts/browser.cjs list
```
Retorna: índice, título y URL de cada tab.

### Navegar a URL
```bash
node scripts/browser.cjs navigate "https://example.com" [tabIndex]
```
Navega la tab indicada (default: 0) a la URL. Espera a que cargue completamente.

### Leer contenido de página (texto limpio)
```bash
node scripts/browser.cjs content [tabIndex]
```
Extrae texto visible de la página (sin scripts, styles, iframes). Max 50K chars.
Ideal para analizar contenido de artículos, videos (descripción), docs.

### Leer HTML
```bash
node scripts/browser.cjs html [tabIndex]
```
Retorna el HTML raw de la página. Max 100K chars.

### Obtener título
```bash
node scripts/browser.cjs title [tabIndex]
```

### Tomar screenshot
```bash
node scripts/browser.cjs screenshot [tabIndex]
```
Guarda PNG en directorio temporal. Retorna JSON con path del archivo.
Úsalo con la tool Read para ver el screenshot.

### Click en elemento
```bash
node scripts/browser.cjs click "button.submit" [tabIndex]
```
Acepta cualquier selector CSS válido. Retorna tag + texto del elemento clickeado.

### Evaluar JavaScript
```bash
node scripts/browser.cjs evaluate "document.querySelectorAll('a').length" [tabIndex]
```
Ejecuta JS arbitrario en el contexto de la página. Retorna el resultado.

## Patrones de uso comunes

### Analizar un video de YouTube
```bash
node scripts/browser.cjs navigate "https://youtube.com/watch?v=VIDEO_ID"
node scripts/browser.cjs content
# → Obtiene título, descripción, comentarios visibles
```

### Verificar deployment en Vercel
```bash
node scripts/browser.cjs navigate "https://tu-app.vercel.app"
node scripts/browser.cjs screenshot
# → Captura visual del estado actual
```

### Leer portal SAT
```bash
node scripts/browser.cjs navigate "https://efos.sat.gob.mx"
node scripts/browser.cjs content
# → Extrae datos de la lista EFOS
```

### Extraer datos de tabla
```bash
node scripts/browser.cjs evaluate "JSON.stringify([...document.querySelectorAll('table tr')].map(r => [...r.cells].map(c => c.textContent)))"
```

## Variables de entorno

| Variable | Default | Descripción |
|---|---|---|
| `CDP_HOST` | `localhost` | Host donde corre Chrome |
| `CDP_PORT` | `9222` | Puerto de debugging de Chrome |

## Seguridad

- **Solo local.** CDP solo se conecta a localhost:9222, no a Chrome remoto.
- **No guardes credenciales.** Si un flujo requiere login, pide las credenciales
  al usuario en el momento, no las persistas.
- **Rate limit manual.** Espera al menos 1s entre navegaciones para no abusar.
- **No ejecutes JS arbitrario** de fuentes no confiables en evaluate.

## Integración con Hive

| Agente | Uso CDP |
|---|---|
| MARKET-ORACLE | `navigate` + `content` → scrape precios CBOT/Yahoo |
| FISCAL | `navigate` + `click` + `content` → portal SAT |
| MEMORY-WEAVER | `content` → extraer docs de URLs |
| SECURITY-PERIMETER | `evaluate` → verificar CSP headers en producción |
| QUEEN-BEE | `list` + `navigate` → orquestar tabs |
