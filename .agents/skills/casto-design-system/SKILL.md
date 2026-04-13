---
name: casto-design-system
description: >
  Sistema de diseño visual para Casto Landing. Define tokens, paleta de colores,
  glassmorphism, tipografía y estándares de UI oscura premium.
  TRIGGER: al crear o revisar cualquier componente UI, cuando el usuario pida
  "revisar diseño", "aplicar estética", o al escribir CSS/clases de Tailwind.
version: "1.0.0"
metadata:
  author: casto
  emoji: "🎨"
  language: es
  always: true
  invocation:
    userInvocable: true
    disableModelInvocation: false
  tags: ["design", "ui", "css", "tailwind", "glassmorphism", "dark-theme"]
---

# Casto Design System — Single Source of Truth

Todo componente visual de CastoProject DEBE seguir estos estándares sin
excepción.

## Paleta de Colores

| Token         | Hex                          | Uso                                          |
| ------------- | ---------------------------- | -------------------------------------------- |
| `tb-dark`     | `#050505`                    | Fondo base del sitio. SIEMPRE.               |
| `tb-blue`     | `#002F6C`                    | Acentos institucionales, headers de sección  |
| `tb-light`    | `#F8FAFC`                    | Texto principal sobre fondo oscuro           |
| `tb-accent`   | `#38BDF8`                    | CTAs, badges, indicadores activos, glows     |
| `emerald-500` | `#10B981`                    | Indicadores positivos (ROI, "Live", success) |
| `white/40-60` | `rgba(255,255,255,0.4-0.6)`  | Texto secundario y descripciones             |
| `white/5-10`  | `rgba(255,255,255,0.05-0.1)` | Bordes sutiles y fondos de cards             |

### Reglas de Color

1. **NUNCA** usar fondos blancos o claros. Todo es oscuro.
2. **NUNCA** usar colores planos saturados (rojo puro, azul puro). Siempre con
   opacidad.
3. Los bordes son SIEMPRE `border-white/5` o `border-white/10`. Nunca solid
   colors.
4. Los glows usan `tb-accent` con opacidad: `rgba(56, 189, 248, 0.15)`.

## Tipografía

| Nivel           | Font       | Peso                | Tamaño                 | Tracking                    |
| --------------- | ---------- | ------------------- | ---------------------- | --------------------------- |
| Display (h1)    | Montserrat | `font-light` (300)  | `text-5xl md:text-6xl` | `tracking-tight`            |
| Heading (h2)    | Montserrat | `font-light` (300)  | `text-4xl md:text-5xl` | normal                      |
| Subheading (h3) | Montserrat | `font-medium` (500) | `text-2xl`             | `tracking-tight`            |
| Body            | Montserrat | `font-light` (300)  | `text-lg`              | normal                      |
| Label/Badge     | Montserrat | `font-bold` (700)   | `text-[10px]-text-xs`  | `tracking-widest uppercase` |

### Reglas de Tipografía

1. Los títulos principales son SIEMPRE `font-light`. La ligereza = lujo.
2. Los badges y labels son SIEMPRE `uppercase tracking-widest text-[10px]`.
3. Para énfasis dentro de títulos, usar `text-gradient` o `italic font-medium`.
4. **NUNCA** usar `font-bold` en títulos grandes. Solo en labels/badges.

## Glassmorphism

### `.glass-panel`

```css
background: rgba(255, 255, 255, 0.03);
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.1);
box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.8);
```

### `.glass-input`

```css
background: rgba(255, 255, 255, 0.05);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.1);
```

### Reglas de Glassmorphism

1. Paneles principales usan `.glass-panel`.
2. Los inputs SIEMPRE usan `.glass-input` con transición suave al focus.
3. El `backdrop-filter` es OBLIGATORIO. Sin él, el panel se ve opaco y barato.
4. Los border-radius para paneles son generosos: `rounded-2xl` mínimo,
   `rounded-3xl` preferido.

## Microinteracciones

| Clase            | Efecto                                         | Uso                     |
| ---------------- | ---------------------------------------------- | ----------------------- |
| `.btn-press`     | `translateY(-1px)` hover, `scale(0.98)` active | Todos los botones       |
| `.card-hover`    | `translateY(-4px)` + shadow amplificado        | Cards de propiedad      |
| `.glow-accent`   | `box-shadow` con `tb-accent` al hover          | CTAs principales        |
| `.text-gradient` | Gradiente `tb-accent → indigo → pink`          | Palabras clave en h1/h2 |

### Reglas de Animación

1. **Todas** las transiciones usan `cubic-bezier(0.16, 1, 0.3, 1)` (spring
   feel).
2. Duraciones: hover = `0.15s-0.3s`, apariciones = `0.4s-0.8s`.
3. Scroll animations vía GSAP ScrollTrigger, NO CSS-only.
4. Respetar `prefers-reduced-motion` siempre.

## Composición de Layout

1. **Contenido centrado**: `max-w-7xl mx-auto px-6 md:px-12`.
2. **Secciones**: `py-24` de padding vertical entre secciones.
3. **Vignette global**: Siempre activo con
   `shadow-[inset_0_0_150px_rgba(56,189,248,0.1)]`.
4. **Z-index**: Vignette = 50, Dock = 50, Nav = 40, Content = 10.

## Checklist para Nuevos Componentes

```
□  Fondo oscuro (#050505 o rgba dark)
□  Bordes sutiles (white/5 o white/10)
□  backdrop-filter: blur() aplicado
□  border-radius generoso (2xl+)
□  Tipografía light para títulos
□  uppercase tracking-widest para labels
□  Hover state con transición spring
□  Sin colores planos saturados
□  prefers-reduced-motion respetado
```
