# GSAP Scroll Animations Skill

> Implementacion de animaciones scroll-driven con GSAP + ScrollTrigger + SplitText.
> Para landing pages, hero sections y experiencias narrativas con scroll.

## Modelo Recomendado
- **Implementacion:** Claude Code o Cursor
- **Planificacion previa:** Usar skill `animation-planner` primero

## System Prompt - GSAP Expert

```
You are a senior front-end developer and GSAP expert specializing in scroll-driven animations.

Core expertise:
- GSAP 3 with ScrollTrigger plugin for scroll-scrubbed animations.
- SplitText for character/word/line-level text animations.
- Timeline orchestration with multiple triggers and pins.

Implementation principles:
- Always use `scrub: true` when the effect must follow scroll progress.
- Use `pin: true` sparingly — only when content needs to stay fixed during animation.
- Prefer `timeline.to()` chaining over individual tweens for coordinated sequences.
- Always add `will-change` hints for GPU-accelerated properties (transform, opacity).
- Test with `markers: true` during development, remove for production.
- Use `matchMedia` for responsive animation breakpoints.

Performance rules:
- Only animate transform and opacity (never width, height, top, left).
- Use `force3D: true` for GPU acceleration.
- Batch DOM reads before writes.
- Target 60fps — test on mid-range mobile.
- Use `ScrollTrigger.refresh()` after layout changes.

Accessibility:
- Always include `prefers-reduced-motion` media query fallback.
- Provide static fallback for users with motion sensitivity.
- Ensure content is readable without animations.

Code style:
- Comment every ScrollTrigger config (start, end, scrub, pin).
- Use CSS custom properties for animation values when possible.
- Organize animations by section in separate functions.
```

## Prompt Templates

### 1. Hero Scroll Animation

```
Implement a scroll-driven hero section for [BRAND].

Animation plan:
[PASTE ANIMATION PLAN SPEC FROM animation-planner]

Requirements:
- Use GSAP 3 + ScrollTrigger with scrub: true.
- The hero should occupy 300vh (3x viewport for scroll room).
- Pin the hero container during the animation.
- Use SplitText for the headline (character-by-character reveal).
- Add floating gradient orbs that parallax at different speeds.
- Background color transitions from [COLOR_1] to [COLOR_2] during scroll.

Technical:
- React component with useEffect for GSAP initialization.
- useRef for all animated elements.
- Cleanup function to kill ScrollTrigger instances on unmount.
- Responsive: disable complex animations below 768px.
- Include prefers-reduced-motion fallback.

Provide complete code with comments.
```

### 2. Horizontal Text Scroll

```
Implement a horizontal scroll-driven text animation using GSAP + ScrollTrigger + SplitText.

Layout:
- A single horizontal container with a very long sentence.
- The sentence is broken into styled spans (words can have different colors/weights).
- Inline SVG shapes embedded between words like punctuation.
- Continuous horizontal flow, NOT full-screen slides.

Animation:
- Vertical scroll drives horizontal text movement (right to left).
- ScrollTrigger with scrub: true tied to scroll progress.
- SplitText reveals characters as they come into viewport.
- Each character fades from gray to white/black as it enters.

Code:
- Complete HTML, CSS, and JavaScript.
- GSAP 3 + ScrollTrigger + SplitText.
- Comments explaining ScrollTrigger config and SplitText usage.
```

### 3. Feature Cards Stagger

```
Implement a staggered card reveal animation for a features/services section.

Layout:
- 3-column grid of feature cards (responsive: 1 col mobile, 2 tablet, 3 desktop).
- Each card has: icon, title, description, subtle border.

Animation:
- Cards start invisible (opacity: 0, y: 60px).
- As section scrolls into view, cards stagger in one by one.
- Stagger delay: 0.15s between cards.
- Each card also has a subtle scale (0.95 → 1.0).
- On hover: card lifts (y: -8px) with shadow increase.
- Easing: power3.out for entrance, power2.out for hover.

Use ScrollTrigger with:
- start: "top 80%"
- end: "top 20%"
- toggleActions: "play none none reverse"
```

### 4. Stats Counter Animation

```
Implement animated number counters that trigger on scroll.

Elements:
- Row of 3-4 stat cards: "50+ Proyectos", "10x Mas Rapido", "$2M+ ROI".
- Numbers count from 0 to target value.

Animation:
- Use ScrollTrigger to detect when stats section enters viewport.
- Animate numbers using GSAP with snap for integer values.
- Duration: 2 seconds per counter.
- Easing: power1.out (linear feel for counting).
- Stagger: 0.3s between counters.
- Only play once (once: true).

Include: suffix handling (+, x, $, M).
```

## Patron React + GSAP

```tsx
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

export function AnimatedSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // SplitText for character animation
      const split = new SplitText(titleRef.current!, { type: 'chars' });

      // Timeline tied to scroll
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',   // when top of section hits 80% of viewport
          end: 'top 20%',     // when top of section hits 20% of viewport
          scrub: 1,           // smooth scrubbing with 1s delay
          markers: false,     // true for debugging
        }
      });

      tl.from(split.chars, {
        opacity: 0,
        y: 30,
        stagger: 0.03,
        ease: 'power3.out',
      });

    }, sectionRef); // scope for cleanup

    // Cleanup on unmount
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef}>
      <h2 ref={titleRef}>Your animated headline here</h2>
    </section>
  );
}
```

## Dependencias

```bash
npm install gsap @gsap/react
# SplitText requiere GSAP Club membership o alternativa gratuita
```

## Costo
- GSAP core: Gratis (MIT license)
- ScrollTrigger: Gratis
- SplitText: Requiere GSAP Club ($99/yr) o usar alternativa gratuita (splitting.js)
- Tiempo de implementacion: 2-4 horas por seccion con plan previo

## Archivos Generados
```
src/
  components/sections/
    HeroScroll.tsx          # Hero con scroll-driven animation
    HorizontalText.tsx      # Texto horizontal con scroll
    FeaturesStagger.tsx     # Cards con stagger reveal
    StatsCounter.tsx        # Numeros animados
  hooks/
    useScrollAnimation.ts   # Hook reutilizable para GSAP + ScrollTrigger
  lib/
    gsap-setup.ts           # Registro de plugins y configuracion global
```
