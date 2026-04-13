# Animation Pipeline Architecture

> Arquitectura completa para crear landing pages con animaciones de clase mundial.
> Basada en la filosofia: PLANIFICAR primero, IMPLEMENTAR despues.

## Pipeline Visual

```
                    FASE 1: CREATIVIDAD                    FASE 2: IMPLEMENTACION
                    ─────────────────                    ──────────────────────

 ┌──────────────┐   ┌─────────────────┐   ┌────────────────────────────────────┐
 │              │   │                 │   │                                    │
 │  Brief de    │──▶│  Animation      │──▶│  Animation Plan Spec (JSON/MD)    │
 │  Marca       │   │  Planner        │   │                                    │
 │              │   │  (Gemini 3 Pro) │   │  ┌────────────┐  ┌──────────────┐ │
 │ - Copy       │   │                 │   │  │ Scroll     │  │ UI Component │ │
 │ - Colores    │   │ System prompt:  │   │  │ Sections   │  │ Interactions │ │
 │ - Emocion    │   │ "world-class    │   │  └─────┬──────┘  └──────┬───────┘ │
 │ - Referencia │   │  designer"      │   │        │                │         │
 └──────────────┘   └─────────────────┘   └────────┼────────────────┼─────────┘
                                                   │                │
                                          ┌────────▼──────┐  ┌─────▼──────────┐
                                          │               │  │                │
                                          │  GSAP Agent   │  │  Motion.dev   │
                                          │               │  │  Agent        │
                                          │ ScrollTrigger │  │               │
                                          │ SplitText     │  │ Variants      │
                                          │ Timeline      │  │ AnimatePresence│
                                          │ Pin           │  │ useRef        │
                                          │               │  │ Gestures      │
                                          └───────┬───────┘  └──────┬────────┘
                                                  │                 │
                                          ┌───────▼─────────────────▼────────┐
                                          │                                  │
                                          │  QA Agent                        │
                                          │  - Performance (60fps check)     │
                                          │  - Accessibility (reduced-motion)│
                                          │  - Responsive (mobile test)      │
                                          │  - Cross-browser                 │
                                          └──────────────┬───────────────────┘
                                                         │
                                          ┌──────────────▼───────────────────┐
                                          │  PRODUCTION READY                │
                                          │  Landing page con animaciones    │
                                          │  Lighthouse 90+                  │
                                          │  SEO optimizado                  │
                                          └──────────────────────────────────┘
```

## Skills Involucradas

| Skill | Rol | Input | Output |
|-------|-----|-------|--------|
| `animation-planner` | Director creativo | Brief de marca + copy | Animation Plan Spec |
| `gsap-scroll-animations` | Dev scroll | Plan Spec (scroll sections) | React components con GSAP |
| `motion-dev-interactions` | Dev UI | Plan Spec (interactions) | React components con motion.dev |
| `content-generation` | Copywriter | Brief de marca | Copy optimizado para SEO |
| `ai-image-generation` | Visual assets | Brand colors + concept | Hero images, icons, OG image |

## Flujo Completo para Landing Page

### Paso 1: Copywriter Agent
```
Input:  Brief de marca (nombre, servicios, target, diferenciadores)
Output: Copy para cada seccion (hero, servicios, portfolio, pricing, CTA)
Skill:  content-generation
```

### Paso 2: Animation Planner Agent
```
Input:  Copy + colores + emocion deseada
Output: Animation Plan Spec con:
        - Concepto creativo central ("epicenter")
        - Plan por seccion (scroll ranges, elementos, easing)
        - Interacciones de componentes (hover, click, demos)
Skill:  animation-planner
Model:  Gemini 3 Pro (Google AI Studio)
```

### Paso 3A: GSAP Implementation (paralelo)
```
Input:  Animation Plan Spec (scroll sections)
Output: HeroScroll.tsx, FeaturesStagger.tsx, StatsCounter.tsx
Skill:  gsap-scroll-animations
Model:  Claude Code
```

### Paso 3B: Motion.dev Implementation (paralelo)
```
Input:  Animation Plan Spec (UI interactions)
Output: ProductDemo.tsx, FloatingMenu.tsx, AnimatedCard.tsx
Skill:  motion-dev-interactions
Model:  Claude Code + MCP motion.dev
```

### Paso 3C: Visual Assets (paralelo)
```
Input:  Brand colors + concept keywords
Output: Hero background, service icons, OG image
Skill:  ai-image-generation
Model:  Gemini Pro Image / FLUX
```

### Paso 4: Assembly
```
- Integrar todos los componentes en App.tsx
- Conectar GSAP scroll timeline global
- Verificar transiciones entre secciones
- Agregar SEO meta tags + JSON-LD
```

### Paso 5: QA
```
- Lighthouse audit (target 90+)
- Test prefers-reduced-motion
- Test responsive (320px → 1920px)
- Test cross-browser (Chrome, Safari, Firefox)
- Verificar 60fps en scroll animations
```

## Regla de Oro

```
NUNCA pedir codigo de animacion directamente.

SIEMPRE seguir este orden:
1. Describe QUE quieres que sienta el usuario.
2. Deja que el planner DISEÑE la interaccion.
3. Revisa y aprueba el PLAN.
4. Solo entonces, pide la IMPLEMENTACION.

La magia esta en la planificacion, no en el codigo.
```

## Aplicacion a Creastilo AI Xperience

### Secciones y Skills Asignadas

| Seccion | Skill Principal | Animacion |
|---------|----------------|-----------|
| **Navbar** | motion-dev | Glassmorphism on scroll, menu mobile |
| **Hero** | gsap-scroll + motion-dev | Scroll-driven reveal + demo auto-play |
| **Services** | gsap-scroll | Stagger cards, icon animations |
| **Asistente Demo** | motion-dev | Chat demo auto-play con cursor simulado |
| **Portfolio** | gsap-scroll | Horizontal scroll gallery |
| **Pricing** | motion-dev | Card flip/expand on select |
| **Testimonials** | motion-dev | Carousel con drag gesture |
| **Contact** | motion-dev | Form micro-interactions |
| **Footer** | gsap-scroll | Parallax background reveal |

### Hero Concept: "Neural Pulse"

El hero de creastilo-ai-xperience debe comunicar **IA + velocidad + precision**:

```
Scroll 0%:   Pantalla oscura (#0A0E1A). Un punto de luz azul pulsa en el centro.
Scroll 10%:  El punto se expande en un orbe con glow cyan. Lineas de "neural network" irradian.
Scroll 25%:  El titulo se revela char-by-char: "Un solo asistente IA para TODO tu negocio"
Scroll 40%:  Las lineas neurales se conectan a iconos flotantes (WhatsApp, pagos, inventario, etc.)
Scroll 55%:  Los iconos se organizan en un grid circular alrededor del orbe central.
Scroll 70%:  El orbe se transforma en la interfaz del Asistente Inmediato (chat mockup).
Scroll 85%:  El chat mockup empieza su demo auto-play (motion.dev toma el control).
Scroll 100%: Transicion suave a la seccion de servicios.
```

Este concepto:
- **Epicenter:** El orbe de IA que se transforma en producto real
- **Emocion:** Magia tecnologica → confianza → "esto lo necesito"
- **Diferenciador vs Leadsales:** Ellos muestran screenshots estaticos. Tu muestras un DEMO VIVO.
