---
name: multimedia-analysis
description: >
  Habilidad nativa para analizar videos locales, extraer frames visuales, transcribir
  audio y procesar enlaces de YouTube.
  TRIGGER: "analiza este video", "crea un resumen de este mp4", "haz un articulo de 
  este video de youtube", "procesa [ruta-al-video]".
version: "1.0.0"
metadata:
  author: pro-trinity
  emoji: "🎥"
  language: es
  always: false
  invocation:
    userInvocable: true
    disableModelInvocation: false
  tags: ["video", "youtube", "multimedia", "analisis", "vision"]
---

# Análisis Multimedia y de Video (Nativo)

Este sub-sistema permite a la Inteligencia Artificial analizar y procesar archivos de video físicos (locales) o en línea (YouTube), utilizando capacidades modales nativas sin depender exclusivamente de FFmpeg (a menos que se pre-procesen clips específicos).

## 1. Análisis de Videos Locales (Archivos MP4, MOV)

Para analizar un archivo guardado en tu computadora, **simplemente dale la ruta absoluta del archivo** y pídele a la IA que lo vea usando su herramienta de `view_file`.

**Ejemplo de Prompt:**
> "Usa tu herramienta view_file para ver C:\Users\TuUsuario\Desktop\video_promocional.mp4 y hazme un guión basado en lo que dicen y se ve en pantalla."

### ¿Qué puede extraer la IA nativamente?
- **Audio/Transcripción:** Entendimiento semántico del video.
- **Fotogramas/Acciones:** Entender lo que sucede visualmente paso a paso.
- **Tiempos (Timestamps):** "En el minuto 1:23 el presentador apunta a la cámara".

## 2. Análisis de Videos de YouTube

Dado que descargar directamente de YouTube usando comandos Bash suele requerir dependencias de terceros como `yt-dlp`, el flujo preferido es usar el **browser-automation skill**.

**Flujo:**
1. La IA navegará a la URL de YouTube usando el Chrome Debugger (si está encendido el navegador).
2. Extraerá el DOM / Transcript (los subtítulos autogenerados del video).
3. Hará el scrapping del título, descripción y comentarios.

**Ejemplo de Prompt:**
> "Abre este enlace de youtube: https://www.youtube.com/watch?v=XXXX y usando el browser-automation extrae el transcript para hacerme 5 tweets sobre el contenido."

## 3. Generación de Contenido Multimedia (Text-to-Image / UI)

Para complementar la estrategia, si requieres generar *placeholders*, imágenes para la web, o assets gráficos demostrativos para un video/artículo:
La IA cuenta con la herramienta **generate_image**.

**Ejemplo de Prompt:**
> "Usando generate_image, créame un mockup fotorrealista estilo cinemático (16:9) sobre un inversionista mirando gráficas, para ponerlo en la miniatura de mi video."

---
*No requieres instalar dependencias Python pesadas para que la IA entienda tus videos. La arquitectura multimodal de este sistema ya procesa binarios directamente a través de sus tools standard.*
