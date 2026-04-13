---
name: voice-workflow
description: Integración de voz a texto con Wispr Flow para workflows de IA. Incluye:
  configuración de API, transcripción en tiempo real, integración con Claude Code,
  automatización de comandos de voz, casos de uso (notas, código, documentación),
  y mejores prácticas de Speech-to-Text.
  Activa en: voice to text, wispr flow, speech recognition, voice commands,
  transcripción, audio input, voice automation, dictate code, voice notes,
  speech to text API.
triggers:
  - voice to text
  - wispr flow
  - speech recognition
  - voice commands
  - transcripción
  - audio input
  - voice automation
  - dictate code
  - speech to text API
tools:
  - Read
  - Write
  - Bash
  - Grep
  - Glob
  - WebFetch
---

# Workflows de Voz a Texto con Wispr Flow

## Introducción

Wispr Flow es una herramienta de conversión de voz a texto (Speech-to-Text) que permite dictar contenido y obtener transcripción de alta calidad. Es particularmente útil para:
- Generar código mediante voz
- Crear documentación rápidamente
- Tomar notas en reuniones
- Escribir emails y mensajes

## Configuración de API

### Obtener API Key

1. Visitar [wisprflow.ai](https://ref.wisprflow.ai/nateherk)
2. Registrarse y obtener API key
3. Configurar en variables de entorno

### Variables de Entorno

```bash
# .env
WISPR_FLOW_API_KEY=tu_api_key_aqui
```

## Uso Básico con curl

### Transcripción Simple

```bash
curl -X POST "https://api.wisprflow.ai/v1/transcribe" \
  -H "Authorization: Bearer $WISPR_FLOW_API_KEY" \
  -H "Content-Type: audio/wav" \
  --data-binary @"audio.wav"
```

### Respuesta

```json
{
  "text": "Tu texto transcrito aquí",
  "confidence": 0.95,
  "language": "es",
  "duration": 5.2
}
```

## Integración con Claude Code

### Script de Transcripción + AI

```bash
#!/bin/bash
# transcribe-and-process.sh

AUDIO_FILE=$1
TEMP_FILE="/tmp/transcription.txt"

# 1. Transcribir audio
curl -s -X POST "https://api.wisprflow.ai/v1/transcribe" \
  -H "Authorization: Bearer $WISPR_FLOW_API_KEY" \
  -H "Content-Type: audio/wav" \
  --data-binary "@$AUDIO_FILE" > "$TEMP_FILE"

# 2. Procesar con Claude Code
claude -p "$(cat $TEMP_FILE)"

# 3. Limpiar
rm "$TEMP_FILE"
```

### Uso

```bash
./transcribe-and-process.sh recording.wav
```

## Patrones de Uso

### Patrón 1: Dictar Código

```
Usuario dicta: "Crea una función que calcule el factorial de un número"

Claude Code interpreta y genera:

function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}
```

### Patrón 2: Documentación

```
Usuario dicta: "Escribe la documentación de la API de usuarios"

Claude genera docstring completo para el endpoint /api/users
```

### Patrón 3: Notas + Organización

```
Usuario dicta: "Reunión con el equipo sobre el proyecto X"

Claude:
- Crea nota en estructura de proyecto
- Extrae action items
- Crea ticket si es necesario
```

## Workflow de Automatización

### Estructura Recomendada

```
voice-input/
├── record.sh          # Grabar audio
├── transcribe.py      # Transcribir
├── process.sh         # Procesar con IA
└── output/            # Resultados
```

### Script de Grabación (Linux)

```bash
#!/bin/bash
# record.sh

DURATION=${1:-30}  # default 30 segundos
OUTPUT="voice_$(date +%Y%m%d_%H%M%S).wav"

# Grabar con ffmpeg
ffmpeg -f alsa -i default -t $DURATION -ar 16000 -ac 1 "$OUTPUT"

echo "Grabado: $OUTPUT"
python3 transcribe.py "$OUTPUT"
```

### Script de Transcripción (Python)

```python
#!/usr/bin/env python3
# transcribe.py

import os
import requests
import sys

API_KEY = os.getenv("WISPR_FLOW_API_KEY")
AUDIO_FILE = sys.argv[1]

def transcribe(file_path):
    with open(file_path, "rb") as f:
        response = requests.post(
            "https://api.wisprflow.ai/v1/transcribe",
            headers={"Authorization": f"Bearer {API_KEY}"},
            files={"file": f}
        )
    
    data = response.json()
    print(f"Texto: {data.get('text')}")
    return data.get("text")

if __name__ == "__main__":
    transcribe(AUDIO_FILE)
```

## Casos de Uso Comunes

### 1. Code Review Verbal

```bash
# Grabar feedback de código
./record.sh 60

# Salida: Transcripción del review que se puede pegar en PR
```

### 2. Commit Messages

```bash
# Dictar mensaje de commit
./record.sh 10

# Claude lo mejora y hace git commit
```

### 3. Documentación de Bugs

```bash
# Describir bug oralmente
./record.sh 30

# Claude genera ticket con descripción, steps to reproduce
```

### 4. Emails

```bash
# Dictar email
./record.sh 45

# Claude formatea correctamente
```

## Mejores Prractices

### 1. Audio Quality

| Factor | Recomendación |
|--------|----------------|
| Sample rate | 16kHz mínimo |
| Canales | Mono |
| Formato | WAV o MP3 |
| Ambiente | Silencioso |

### 2. Habla Clara

- Pausas naturales entre oraciones
- Nombra términos técnicos explícitamente
- Usa puntuación verbal ("punto", "coma")

### 3. Procesamiento

- Revisa transcripción antes de usar
- Corrige errores de una palabra
- Entrena el modelo con tu voz (si está disponible)

## Alternativas

| Herramienta | Ventaja | Link |
|-------------|---------|------|
| **Wispr Flow** | Rápido, preciso en inglés | wisprflow.ai |
| **Whisper (OpenAI)** | Offline, multiidioma | openai.com/whisper |
| **Deepgram** | Enterprise grade | deepgram.com |
| **AssemblyAI** | Features avanzados | assemblyai.com |

## Scripts de Ejemplo

### Automation Completa

```bash
#!/bin/bash
# voice-to-code.sh - Dictar y obtener código

echo "🎤 Grabando (presiona Ctrl+C para terminar)..."
arecord -f cd -t wav -d 60 /tmp/voice.wav

echo "📝 Transcribiendo..."
TEXT=$(curl -s -X POST "https://api.wisprflow.ai/v1/transcribe" \
  -H "Authorization: Bearer $WISPR_FLOW_API_KEY" \
  -H "Content-Type: audio/wav" \
  --data-binary "@/tmp/voice.wav" | jq -r '.text')

echo "🤖 Procesando con Claude Code..."
echo "$TEXT" | claude -p "Genera código basado en esta descripción:"

rm /tmp/voice.wav
```

## Notas

- Link de referencia del video: https://ref.wisprflow.ai/nateherk
- Ideal para aumentar productividad en tareas de escritura
- Combina bien con Agent Teams para workflows completos

---

**Referencia**: Para uso offline, considera Whisper de OpenAI localmente.