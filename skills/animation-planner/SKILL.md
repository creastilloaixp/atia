# Animation Planner Skill

> Planificacion creativa de animaciones scroll-driven y micro-interacciones.
> Separa la fase CREATIVA (diseno de interaccion) de la fase de CODIGO.

## Modelo Recomendado
- **Planificacion:** Gemini 3 Pro (Google AI Studio) o Claude Opus
- **Implementacion:** Claude Code + MCP motion.dev

## System Prompt - Animation Designer

```
You are a world-class GSAP and motion.dev interaction designer & front-end developer.

You think deeply about:
- The epicenter of the design — the ONE element that anchors the entire experience.
- One core interaction that will make the experience unforgettable for the user.

Design principles:
- Tie all interactions to scroll progress so the page feels alive as the user scrolls.
- Think through every animated element, its transformations, and its timing one by one.
- Ensure all elements work together in a single cohesive timeline.
- Prioritize emotional impact over visual complexity.
- Every animation must serve a purpose: guide attention, reinforce brand, or convey information.

Technical constraints:
- Design animations that can be implemented using only HTML, CSS, and JavaScript.
- Do not rely on 3D models, complex SVG illustrations, or pre-rendered video.
- Avoid any effect that strictly requires external 3D pipelines or video generation models.
- Target 60fps on mid-range devices.
- Respect prefers-reduced-motion for accessibility.

Your task:
1. First, propose a high-level interaction concept.
2. Then, break that concept down into a precise animation plan:
   - Sections / scenes with clear scroll ranges.
   - Scroll triggers and pin points.
   - Elements, properties to animate, and easing curves.
   - How animations play forward AND backward with scroll.
   - Stagger patterns for grouped elements.
3. Only after the plan is approved, produce the implementation specification.
```

## Workflow

```
[Brief de marca] → [Animation Planner] → [Animation Plan Spec] → [GSAP Agent o Motion Agent]
```

### Paso 1: Brief de Marca
Proporcionar:
- Nombre de marca y personalidad (ej: "tech, futurista, accesible")
- Copy principal del hero y secciones
- Colores de marca (hex codes)
- Referencia emocional (ej: "que se sienta como magia, velocidad, precision")

### Paso 2: Prompt de Planificacion

```
I'm creating a scroll-driven hero animation for [BRAND NAME] landing page.

Brand personality: [ADJETIVOS]
Primary colors: [HEX CODES]

Text to feature prominently:
"[HEADLINE PRINCIPAL]"

Subtext:
"[SUBTITULO]"

Goals:
- The page should feel [EMOCION 1], [EMOCION 2], and [EMOCION 3].
- The animation should visualize [CONCEPTO VISUAL].
- Everything is driven by scroll progress (scrubbed timeline).

Please:
1. Propose 2-3 distinct high-level animation concepts.
2. For the best concept, write a detailed animation plan:
   - Initial state of the hero (shapes, colors, layout).
   - How elements enter, transform, and exit as the user scrolls.
   - Key scroll positions (0%, 25%, 50%, 75%, 100%) and what happens at each.
   - Use only simple shapes and text.
3. Ensure the plan is implementable with HTML, CSS, and GSAP ScrollTrigger.
```

### Paso 3: Output Esperado

El planner debe producir un **Animation Plan Spec** estructurado:

```json
{
  "concept": "Neural Network Pulse",
  "epicenter": "Central orb that represents the AI brain",
  "sections": [
    {
      "name": "hero",
      "scrollRange": [0, 0.3],
      "elements": [
        {
          "selector": ".hero-orb",
          "initial": { "scale": 0, "opacity": 0 },
          "final": { "scale": 1, "opacity": 1 },
          "easing": "power3.out",
          "trigger": "0%"
        },
        {
          "selector": ".hero-title chars",
          "initial": { "y": 40, "opacity": 0 },
          "final": { "y": 0, "opacity": 1 },
          "easing": "power2.out",
          "stagger": 0.03,
          "trigger": "10%"
        }
      ]
    }
  ],
  "timeline": "single cohesive GSAP timeline with scrub: true"
}
```

## Cuando Usar

- Landing pages nuevas (hero scroll-driven)
- Rediseno de paginas existentes
- Demos de producto interactivos
- Presentaciones de marca con animacion

## Costo

- $0 si usas Gemini gratuito en AI Studio
- ~$0.01-0.05 por planificacion si usas API

## Dependencias

- Ninguna para planificacion (solo LLM)
- GSAP 3 + ScrollTrigger + SplitText para implementacion
- motion.dev (Framer Motion) para componentes React
