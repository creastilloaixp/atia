---
name: atia-client-communications
description: Estándares visuales y de código para generar comunicados, avisos técnicos, notificaciones y HTMLs estáticos para clientes de Atia Inmobiliaria.
---

# Atia Client Communications & Notifications
Esta skill define la línea gráfica y reglas estrictas de HTML/Tailwind para estandarizar la creación de CUALQUIER aviso, página estática, email o comunicado técnico destinado a los clientes o agentes internos de Atia.

### TRIGGER
Aplica automáticamente cuando el usuario solicite:
- "Crea un aviso para el cliente"
- "Haz una página estática para notificar X"
- "Genera un HTML con las métricas"
- "Genera una plantilla de correo"

## 1. El Identificador Central (Atia Premium Dark Theme)
La marca ATIA representa alto rendimiento, tecnología y elitismo inmobiliario (Flipping automatizado). Absolutamente todos los comunicados deben transmitir esto:
- **Tema Base:** Modo oscuro estricto (Fondos en negros absolutos y grises muy oscuros). 
- **Color Principal (Brand):** Atia Naranja `#FF6600`. Úsalo para CTAs, glows sutiles, acentos e iconos clave.
- **Tipografía:** `Space Grotesk` para títulos/encabezados (le da el toque de laboratorio tecnológico/fintech) e `Inter` para los párrafos. Cárgalas siempre vía Google Fonts.

## 2. Reglas de Componentes UI
Al generar un archivo HTML para Atia, debes incorporar estas convenciones en tu Tailwind config vía CDN o clases directas:

- **Contenedores:** Usa `max-w-3xl mx-auto` para centrar. En lugar de estar al borde de la pantalla, el contenido siempre va en una tarjeta (`bg-[#121212] border border-[#262626] rounded-2xl`).
- **Logotipo:** Siempre usar `https://static.tokkobroker.com/tfw_images/9795_Grupo%20Atia/LOGO_2024-02.png`. Como es oscuro por defecto, agrégale `class="brightness-200"` o `filter: invert(1)` para que luzca épico sobre el fondo negro.
- **Micro-Animaciones (Soft-Tech):** Agrega animaciones sutiles (pulse en luces de estado, fade de entrada `anim-fade` que suba desde `translateY(15px)`). 
- **Botones (Calls to Action):** El botón primario SIEMPRE es pill-shaped (`rounded-full`), con fondo `#FF6600` y si es relevante una ligera sombra: `shadow-[0_0_20px_rgba(255,102,0,0.3)]`.

## 3. Plantilla Base Obligatoria
Copia y usa siempre este esqueleto al generar un nuevo requerimiento HTML.

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comunicado Oficial - Atia Inteligencia Inmobiliaria</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: { sans: ['Inter', 'sans-serif'], display: ['Space Grotesk', 'sans-serif'] },
                    colors: {
                        atia: { DEFAULT: '#FF6600', glow: 'rgba(255, 102, 0, 0.4)' },
                        dark: { bg: '#0A0A0A', card: '#121212', border: '#262626' }
                    }
                }
            }
        }
    </script>
    <style>
        body { background-color: #0A0A0A; color: #E5E7EB; }
        .anim-fade { animation: fadeIn 0.8s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
    </style>
</head>
<body class="min-h-screen flex py-16 px-4 items-start justify-center">
    
    <div class="max-w-2xl w-full anim-fade">
        <div class="bg-dark-card border border-dark-border rounded-3xl shadow-2xl overflow-hidden relative">
            <!-- Glow Line -->
            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-atia to-transparent"></div>
            
            <!-- HEADER -->
            <div class="p-8 pb-6 border-b border-dark-border text-center">
                <img src="https://static.tokkobroker.com/tfw_images/9795_Grupo%20Atia/LOGO_2024-02.png" alt="Atia Inmobiliaria" class="h-14 mx-auto brightness-200 mb-6 drop-shadow-lg">
                <div class="inline-flex items-center gap-2 bg-[#FF6600]/10 border border-[#FF6600]/20 px-4 py-1.5 rounded-full mb-4">
                    <span class="w-2 h-2 bg-[#FF6600] rounded-full animate-pulse"></span>
                    <span class="text-[10px] font-bold text-[#FF6600] uppercase tracking-widest">Ejemplo de Tag Categórico</span>
                </div>
                <h1 class="text-3xl font-display font-bold text-white leading-tight">Título Principal del Mensaje</h1>
            </div>

            <!-- CONTENT -->
            <div class="p-8">
                <p class="text-gray-400 text-sm leading-relaxed mb-6">
                    Estimado usuario. Este es el espacio para el cuerpo principal de la notificación. El texto debe mantener un tono corporativo, seguro y tecnológico en todo momento.
                </p>
                <!-- DATA BLOCK (Ejemplo) -->
                <div class="bg-black/50 border border-gray-800 rounded-2xl p-5 mb-8">
                    <h3 class="text-white font-bold text-sm uppercase tracking-wide mb-3">Sub Bloque de Información</h3>
                    <ul class="text-sm text-gray-400 space-y-2">
                        <li class="flex gap-2">👉 <span class="text-white">Punto:</span> Ejemplo de lista.</li>
                    </ul>
                </div>
                <!-- CALL TO ACTION -->
                <div class="text-center pt-4">
                    <a href="#" class="inline-flex items-center justify-center bg-atia text-white font-bold text-sm px-8 py-3 rounded-full hover:bg-orange-600 transition-colors shadow-[0_0_20px_rgba(255,102,0,0.3)]">
                        Acción Requerida
                    </a>
                </div>
            </div>
            
            <!-- FOOTER -->
            <div class="bg-black/80 px-8 py-5 text-center border-t border-dark-border">
                <p class="text-gray-600 text-[10px] font-mono tracking-widest uppercase">
                    Telecomunicaciones y Operaciones ATIA &bull; Confidencial
                </p>
            </div>
        </div>
    </div>
</body>
</html>
```

## Resumen Ejecutivo para IA: 
**A partir de ahora, si haces un HTML estático extra:** NO USES BLANCO. NO USES FONDO CLARO. Solo el contenedor negro (#121212), la fuente naranja (#FF6600) en botones y acentos, el tag redondo, la raya naranja luminosa hasta arriba y la fuente Space Grotesk. Revisa el código base superior.
