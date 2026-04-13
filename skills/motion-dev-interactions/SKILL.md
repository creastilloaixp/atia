# Motion.dev Interactions Skill

> Micro-interacciones y demos de producto con motion.dev (Framer Motion).
> Para componentes React animados, menus, demos auto-play y transiciones UI.

## Modelo Recomendado
- **Implementacion:** Claude Code + MCP motion.dev
- **Planificacion previa:** Usar skill `animation-planner`

## System Prompt - Motion.dev Expert

```
You are a senior React developer and motion.dev (Framer Motion) expert.

Core expertise:
- motion.dev for declarative React animations.
- Variants and transitions for clean state-driven animations.
- AnimatePresence for enter/exit animations.
- Layout animations for smooth DOM reflows.
- Gesture animations (hover, tap, drag).

Implementation principles:
- Use variants over inline animation objects for reusability.
- Use AnimatePresence for any component that mounts/unmounts.
- Use layout prop for smooth position/size transitions.
- Use useRef + getBoundingClientRect() for cursor positioning — NEVER hardcode coordinates.
- Use staggerChildren in parent variants for grouped reveals.
- Prefer spring physics for natural-feeling interactions.

Performance rules:
- Only animate transform and opacity when possible.
- Use willChange="transform" for heavy animations.
- Avoid animating layout properties (width, height) — use scale instead.
- Use lazy motion (<LazyMotion>) for code splitting.

Accessibility:
- Use useReducedMotion() hook to respect user preferences.
- Provide instant state changes as fallback for reduced motion.
- Ensure animated elements are keyboard accessible.

Code patterns:
- Use custom hooks for reusable animation logic.
- Extract animation variants to separate constants.
- Type all animation props with TypeScript.
```

## Prompt Templates

### 1. Floating Action Menu (Radial)

```
Build a circular floating action button (FAB) that expands into a radial menu.

Behavior:
- Initial: Single circular FAB in bottom-right corner.
- On click: FAB scales up, 4-5 smaller buttons fan out in an arc.
- Staggered animation for each option.
- On second click: menu collapses back with reversed animation.
- Hover: scale + subtle shadow on each option.

Technical:
- React component with motion.dev.
- Use variants and transitions for declarative animations.
- Spring physics for snappy, premium feel.
- TypeScript with proper types.
- Complete example with Tailwind styling.
```

### 2. Product Demo Auto-Play (Hero Section)

```
Build a self-playing product demo animation for a landing page hero.

Context:
We have a [PRODUCT TYPE] UI. I want a looping demo that simulates a user.

Scenario:
1. Animated cursor moves to [ELEMENT_1], clicks.
2. [ACTION happens — e.g., text appears, item added].
3. Cursor moves to [ELEMENT_2], clicks.
4. [REACTION — e.g., status changes, animation plays].
5. Brief pause, then loop forever.

Technical requirements:
- motion.dev for all animations and cursor.
- Simulate cursor as animated element (NOT real OS cursor).
- Do NOT hardcode cursor coordinates.
- Use useRef to get bounding boxes of target elements.
- Drive cursor x,y from bounding boxes (stays correct if layout changes).
- Smooth loop with no visible reset.

Deliverables:
- Complete React component with:
  - Product UI mockup.
  - AnimatedCursor component.
  - Looping motion.dev sequence.
- Comments on timeline and cursor positioning.
```

### 3. Card Hover Interactions

```
Build premium card components with rich hover interactions.

Cards:
- Service/feature cards in a grid.
- Each card: icon, title, description, gradient accent line.

Hover behavior:
- Card lifts (y: -8px) with scale(1.02).
- Shadow expands and shifts to brand color glow.
- Gradient accent line expands from 0% to 100% width.
- Icon rotates slightly or pulses.
- Background shifts subtly.

Exit behavior:
- Smooth return to resting state.
- Easing: spring for lift, tween for colors.

Technical:
- motion.div with whileHover variant.
- Separate hover variants for each animated property.
- Tailwind for base styles, motion.dev for animations.
- Responsive: simpler hover on mobile (tap instead).
```

### 4. Page Section Transitions

```
Build smooth section transitions for a single-page landing.

Sections:
[LIST YOUR SECTIONS]

Behavior:
- Each section fades up as it enters viewport.
- Use IntersectionObserver or scroll-based trigger.
- Stagger children within each section.
- Exit: fade down as section leaves viewport (optional).

Variants:
- hidden: { opacity: 0, y: 40 }
- visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.1 } }

Technical:
- useInView hook from motion.dev.
- Wrap each section in motion.section with variants.
- AnimatePresence for route transitions (if multi-page).
```

### 5. Asistente Inmediato Demo (Creastilo Specific)

```
Build a self-playing demo showing "Asistente Inmediato" in action.

The demo shows an AI assistant chat interface where:
1. A simulated user types "Necesito el reporte de ventas de hoy".
2. The AI assistant responds with a formatted sales report card.
3. User types "Envia recordatorio de cobro al cliente #42".
4. Assistant shows "Enviando por WhatsApp..." with progress animation.
5. Success confirmation appears with green checkmark.
6. Loop back to start.

UI elements:
- Chat container with message bubbles (user = right, AI = left).
- Typing indicator animation (3 bouncing dots).
- Message entrance: slide up + fade in.
- Report card: expand from 0 height with content fade in.
- Progress bar animation for "sending" state.
- Success checkmark with draw-on SVG animation.

Technical:
- motion.dev for all animations.
- AnimatePresence for message entrance/exit.
- useRef for scroll-to-bottom behavior.
- Timed sequence with loop.
- Responsive design (looks good on mobile preview too).
```

## MCP Motion.dev Integration

Para agentes de codigo con acceso a MCP:

```json
{
  "mcpServers": {
    "motion-docs": {
      "command": "npx",
      "args": ["-y", "@nicepkg/motion.dev-mcp"]
    }
  }
}
```

### Agent Prompt con MCP

```
You are a coding agent with access to the motion.dev MCP server.

Tools available:
- motion-docs.listResources: lists documentation resources.
- motion-docs.readResource: reads specific docs.

Before writing any motion.dev animation code:
1. Call listResources to find relevant docs.
2. Call readResource for those resources.
3. Implement using documented patterns.

Prefer idiomatic patterns: variants, layout animations, AnimatePresence.
```

## Dependencias

```bash
npm install motion           # motion.dev (Framer Motion)
# Ya instalado en creastilo-ai-xperience via "framer-motion"
# motion.dev es el nuevo nombre/paquete de framer-motion
```

## Costo
- motion.dev: Gratis (MIT)
- Tiempo: 1-3 horas por componente con plan previo
- MCP server: Gratis

## Archivos Generados
```
src/
  components/
    ui/
      AnimatedCursor.tsx       # Cursor simulado para demos
      FloatingMenu.tsx         # FAB radial menu
      AnimatedCard.tsx         # Card con hover premium
      TypewriterText.tsx       # Texto que se "escribe" solo
    sections/
      ProductDemo.tsx          # Demo auto-play del producto
      AsistenteDemo.tsx        # Demo del Asistente Inmediato
  hooks/
    useAnimationSequence.ts    # Hook para secuencias looping
    useReducedMotion.ts        # Respeta preferencias de usuario
  lib/
    animation-variants.ts      # Constantes de variantes reutilizables
```
