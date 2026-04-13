---
name: scroll-choreography
description: >
  Timeline maestro de coreografía de scroll para la landing Casto.
  Define qué se anima, cuándo aparece, y en qué orden durante el scroll del usuario.
  TRIGGER: al planificar animaciones de scroll, crear nuevas secciones, o cuando
  el usuario pida "coreografía", "timeline de scroll", o "secuencia de animaciones".
version: "1.0.0"
metadata:
  author: casto
  emoji: "🎭"
  language: es
  always: false
  invocation:
    userInvocable: true
    disableModelInvocation: false
  tags: ["scroll", "animation", "gsap", "choreography", "timeline", "landing"]
---

# Scroll Choreography — El Recorrido del Usuario

Esta skill define el **timeline maestro** de la experiencia de scroll en la
landing de Casto. Cada sección tiene una coreografía precisa que guía la
atención del usuario hacia la conversión.

## Filosofía

> "El scroll no es navegación, es narración."

Cada pixel de scroll cuenta una historia: **Curiosidad → Visualización → Datos →
Confianza → Acción**

## Timeline Maestro (Scroll Position)

### Acto 1: Captura (0% - 15% scroll)

```
┌─────────────────────────────────────────────┐
│  HERO SECTION                               │
│                                             │
│  • Nav fade-in (delay 0.3s)                 │
│  • Greeting text slide-up (delay 0.5s)      │
│  • H1 scale-in from 0.95 (delay 0.8s)      │
│  • Search bar slide-up (delay 1.0s)         │
│  • Chips stagger fade-in (delay 1.2s)       │
│  • Dock spring-up from bottom (delay 1.0s)  │
│  • Vignette glow pulse (continuous)         │
│                                             │
│  TRIGGER: on-load (no scroll needed)        │
└─────────────────────────────────────────────┘
```

### Acto 2: Transformación (15% - 50% scroll)

```
┌─────────────────────────────────────────────┐
│  FLIPPER OPPORTUNITY                        │
│                                             │
│  Entrada:                                   │
│  • "Oportunidad Activa" badge fade-in       │
│  • H2 slide-up con stagger por palabra      │
│  • Location text fade-in                    │
│                                             │
│  Slider (scroll-driven):                    │
│  • Container scale from 0.95 → 1.0          │
│  • "Estado Actual" label appears            │
│  • Slider line animates to center           │
│  • "Visión Trinity" label appears           │
│  • Instructional text fades in on hover     │
│                                             │
│  TRIGGER: element enters viewport (top 80%) │
└─────────────────────────────────────────────┘
```

### Acto 3: Convicción (50% - 75% scroll)

```
┌─────────────────────────────────────────────┐
│  MÉTRICAS PANEL (Right side)                │
│                                             │
│  • Panel glass-panel scale-in (0.6s)        │
│  • TrendingUp icon rotate-in               │
│  • "Cálculo de Plusvalía" slide-up          │
│  • KPI Grid cells stagger (0.2s each):     │
│    1. ROI → counter animation 0→24.8%      │
│    2. Timeline → fade-in                    │
│    3. Costo → fade-in                       │
│    4. Valor Final → glow border pulse       │
│  • Verificación badge slide-right           │
│                                             │
│  TRIGGER: metrics panel enters viewport     │
└─────────────────────────────────────────────┘
```

### Acto 4: Acción (75% - 100% scroll)

```
┌─────────────────────────────────────────────┐
│  CTAs + FOOTER                              │
│                                             │
│  • Primary CTA scale-in + glow pulse        │
│  • Secondary CTA fade-in (0.3s delay)       │
│  • "Price index: Live" counter start        │
│  • Footer meta text fade-in                 │
│                                             │
│  TRIGGER: CTAs enter viewport               │
└─────────────────────────────────────────────┘
```

## Reglas de Implementación GSAP

### ScrollTrigger Standard

```typescript
gsap.fromTo(
    element,
    { opacity: 0, y: 30 }, // from
    {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out", // SIEMPRE power3.out para entradas
        scrollTrigger: {
            trigger: element,
            start: "top 80%", // Empieza cuando el top del elemento
            // llega al 80% del viewport
            toggleActions: "play none none none", // Solo play, no reverse
        },
    },
);
```

### Stagger Pattern

```typescript
// Para grupos de elementos (KPI cards, chips, etc.)
gsap.fromTo(container.children, { opacity: 0, y: 20 }, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    stagger: 0.15, // 150ms entre cada elemento
    ease: "power3.out",
    scrollTrigger: {
        trigger: container,
        start: "top 80%",
    },
});
```

### Counter Animation (para números como ROI)

```typescript
gsap.fromTo(counterElement, { textContent: 0 }, {
    textContent: 24.8,
    duration: 1.5,
    ease: "power2.out",
    snap: { textContent: 0.1 }, // Redondear a 1 decimal
    scrollTrigger: {
        trigger: counterElement,
        start: "top 80%",
    },
});
```

## Reglas Críticas

1. **No animar todo.** Si todo se mueve, nada destaca. Máximo 3 animaciones
   visibles simultáneamente.
2. **Respetar la jerarquía.** Lo más importante se anima primero y más lento. Lo
   secundario después y más rápido.
3. **Nunca bloquear el scroll.** Las animaciones son decorativas, no bloquean la
   interacción. Usa `toggleActions: "play none none none"`.
4. **Mobile first.** En móvil, reducir stagger a 0.1s y duraciones a 0.5s. Menos
   animaciones = mejor rendimiento.
5. **El slider de antes/después es INTERACTIVO, no scroll-driven.** El usuario
   lo controla con el mouse/touch. No vincular al scroll.

## Testing de Choreography

Para verificar el flujo:

1. Abrir DevTools → Performance
2. Scroll de arriba a abajo en 10 segundos
3. Verificar: no hay drops debajo de 30fps
4. Verificar: las animaciones se disparan en el orden correcto
5. Verificar: en `prefers-reduced-motion: reduce` no hay animaciones
