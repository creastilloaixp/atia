---
name: social-media-automation
description: Automatiza la creación y publicación de contenido en redes sociales con programación cron
version: 1.0.0
trigger: "publicar contenido, automatizar redes sociales, schedule social media, publicar con cron, content automation"
---

# Social Media Automation

Automatiza la creación y publicación de contenido en múltiples redes sociales usando IA y cron jobs.

## Estructura del Proyecto

```
social-media-automation/
├── content/              # Contenido generado
│   ├── pending/         # Pendiente de publicar
│   ├── published/       # Ya publicado
│   └── templates/       # Plantillas de contenido
├── scripts/             # Scripts de automatización
│   ├── generate.js      # Generador de contenido
│   ├── publish.js       # Publicador a redes
│   └── scheduler.js     # Programador cron
├── config.json          # Configuración de cuentas
└── .env                 # API keys (NO versionar)
```

## Flujo de Trabajo

### 1. Generación de Contenido
Usa las tools de IA disponibles para crear contenido:
- `image-gen` - Generar imágenes con IA
- `elevenlabs-audio` - Crear audio/voiceovers
- `video-generator-remotion` - Crear videos
- `content-generation` - Generar texto/copy

### 2. Configuración de Redes Sociales

Edita `config.json` con tus cuentas:
```json
{
  "twitter": {
    "enabled": true,
    "api_key": "process.env.TWITTER_API_KEY",
    "api_secret": "process.env.TWITTER_API_SECRET",
    "access_token": "process.env.TWITTER_ACCESS_TOKEN",
    "access_secret": "process.env.TWITTER_ACCESS_SECRET"
  },
  "linkedin": {
    "enabled": true,
    "client_id": "process.env.LINKEDIN_CLIENT_ID",
    "client_secret": "process.env.LINKEDIN_SECRET"
  },
  "instagram": {
    "enabled": false
  }
}
```

### 3. Programación con Cron

Edita `scheduler.js` para configurar horarios:
```javascript
const schedule = {
  twitter: [
    { time: "09:00", days: [1,2,3,4,5] },  // Lun-Vie 9am
    { time: "18:00", days: [1,2,3,4,5] }   // Lun-Vie 6pm
  ],
  linkedin: [
    { time: "10:00", days: [2,4] }         // Mar,Jue 10am
  ]
};
```

## Comandos

### Generar Contenido (con IA)
```bash
cd social-media-automation
node scripts/generate.js --topic autocobro --count 1
node scripts/generate.js --topic ai --count 1
```

### Publicar Manualmente
```bash
node scripts/publish.js --platform twitter
node scripts/publish.js --platform linkedin
node scripts/publish.js --all
```

### Scheduler Automático (Windows)

#### Opción 1: Setup Automático
```bash
# Ejecutar como Administrador
scripts\setup-scheduler.bat
```

#### Opción 2: Manual
1. Abre Task Scheduler (`Win + R` → `taskschd.msc`)
2. Crea las tareas programadas:

| Tarea | Horario | Script |
|-------|---------|--------|
| SocialMedia-Twitter-AM | Lun-Vie 9:00 | task-twitter.bat |
| SocialMedia-Twitter-PM | Lun-Vie 18:00 | task-twitter.bat |
| SocialMedia-LinkedIn | Mar,Jue 10:00 | task-linkedin.bat |

### Verificar Tareas
```bash
schtasks /query /tn "SocialMedia-*"
```

## Plataformas Soportadas

| Plataforma | Status | Notas |
|------------|--------|-------|
| Twitter/X | ✅ | API v2 |
| LinkedIn | ✅ | OAuth 2.0 |
| Instagram | 🔄 | Requiere Facebook Graph API |
| YouTube | 🔄 | Para shorts/videos |

## Variables de Entorno Requeridas

```env
# Twitter
TWITTER_API_KEY=
TWITTER_API_SECRET=
TWITTER_ACCESS_TOKEN=
TWITTER_ACCESS_SECRET=

# LinkedIn
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
LINKEDIN_ACCESS_TOKEN=

# OpenAI (para generación de texto)
OPENAI_API_KEY=

# Replicate (para imágenes)
REPLICATE_API_TOKEN=

# Anthropic (alternativo para imágenes)
ANTHROPIC_API_KEY=
```

## Métricas y Tracking

Guarda el output en `content/published/`:
- `posts.json` - Registro de posts publicados
- `metrics.json` - Engagement, views, etc.

## Ejemplo: Post Automático para Autocobro

```bash
# 1. Generar imagen promotional
node scripts/generate.js --type image --topic "autocobro tijuana" --output content/pending/

# 2. Generar caption
# Usar content-generation skill para crear copy

# 3. Publicar
node scripts/publish.js --platform twitter --content content/pending/image.jpg

# 4. Verificar publicación
node scripts/publish.js --verify
```

## Tips

1. **No spammes** - Espacio mínimo de 2 horas entre posts
2. **Mezcla contenido** - Imágenes, videos, threads, quotes
3. **Trackea metrics** - Ajusta según engagement
4. **Usa hashtags** - Investigación previa de mejores hashtags
5. **Contenido evergreen** - Guarda templates reutilizables