# Coreografía S-Tier: Landing Page Flipping Inmobiliario (Antigravity)

## 1. Hero Section (Carga Inicial - "El Alivio")

**Objetivo:** Transmitir que el peso del problema (la deuda/la casa en ruinas)
desaparece.

- **Texto Principal (Headline):** Usar `Motion`. El texto ("Compramos tu casa
  hoy mismo") no aparece de golpe. Se divide por palabras. Cada palabra "levita"
  desde abajo (Y: 20px, Opacidad: 0) hacia su posición final con un efecto de
  resorte (`spring`, `damping: 12`).
- **Widget Zadarma (Llamada a la acción):** Usar `Motion`. El contenedor del
  número de teléfono flota muy sutilmente en el eje Y (animación en bucle). El
  botón "Llámenme" tiene **magnetismo**: cuando el cursor del usuario se acerca
  a menos de 50px, el botón se inclina ligeramente hacia el cursor, invitando al
  clic.

## 2. Sección "Problemas que molemos" (Scroll - "El Caos al Orden")

**Objetivo:** El usuario hace scroll y ve sus problemas (Embargo, Intestado,
Ruinas).

- **Animación (GSAP ScrollTrigger):** A medida que el usuario hace scroll hacia
  abajo, las tarjetas de los problemas entran flotando desde diferentes ángulos
  (unas desde la izquierda, otras desde la derecha), como si estuvieran flotando
  en el espacio (Antigravity).
- **Anclaje:** Al llegar al centro de la pantalla, la gravedad "se activa" y
  todas las tarjetas se alinean perfectamente en un grid sólido, demostrando que
  nosotros ponemos orden al caos.

## 3. Sección "Antes y Después" (Scroll Interactivo - "El Efecto WOW")

**Objetivo:** El clímax de la página. Demostrar resultados reales sin hacer
clic.

- **Animación (GSAP ScrollTrigger + Pin):** Usaremos el efecto "Image Reveal"
  basado en scroll.
- La sección ocupa toda la pantalla y se fija (`pin: true`).
- En pantalla está la foto de la casa en ruinas (ANTES).
- A medida que el usuario sigue haciendo scroll hacia abajo (haciendo
  _scrubbing_), la imagen del DESPUÉS se va revelando desde el centro hacia
  afuera (usando `clip-path` o máscara CSS), como si el scroll estuviera
  limpiando y remodelando la casa en tiempo real.
- Una vez que la imagen del DESPUÉS se revela al 100%, el pin se suelta y el
  usuario puede seguir bajando hacia el Footer.

## 4. Botón Flotante de WhatsApp (Kommo)

- **Animación (Motion):** En lugar del clásico botón estático, el botón de
  WhatsApp respira (escala de 1 a 1.05 suavemente). Cuando el usuario hace
  hover, el icono da un pequeño salto antigravedad antes de abrir la URL.
