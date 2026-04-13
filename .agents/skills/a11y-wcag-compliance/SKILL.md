---
name: a11y-wcag-compliance
description: >
  Accesibilidad WCAG 2.2 AA para interfaces React.
  TRIGGER: al crear componentes UI, revisar formularios, manejar navegación
  por teclado, asegurar contraste, o cuando el usuario pida "revisar
  accesibilidad" o "cumplir WCAG".
version: "1.1.0"
metadata:
  author: pro-trinity
  emoji: "♿"
  language: es
  always: false
  requires:
    env: []
  invocation:
    userInvocable: true
    disableModelInvocation: false
  tags: ["accessibility", "wcag", "a11y", "aria", "keyboard", "ui"]
---

# Accessibility & WCAG 2.2 Compliance

Protocolo para que Antigravity produzca interfaces accesibles que cumplan con
WCAG 2.2 nivel AA, estándar requerido para software empresarial premium.

## Cuándo Aplicar

Referencia estas directrices cuando:

- Crees cualquier componente UI interactivo
- Diseñes formularios, tablas o modales
- Implementes navegación y routing
- Revises o refactorices componentes existentes
- El usuario pida "revisar accesibilidad" o "cumplir WCAG"

## Reglas por Prioridad

| Prioridad | Categoría              | Impacto | Prefijo   |
| --------- | ---------------------- | ------- | --------- |
| 1         | Semántica HTML         | CRÍTICO | `sem-`    |
| 2         | Navegación por Teclado | CRÍTICO | `kbd-`    |
| 3         | ARIA y Lectores        | ALTO    | `aria-`   |
| 4         | Visual y Color         | ALTO    | `visual-` |
| 5         | Formularios            | ALTO    | `form-`   |

## 1. Semántica HTML (CRÍTICO)

### `sem-correct-elements`

- **Regla:** SIEMPRE usar el elemento HTML semántico correcto:

```tsx
// ✅ Correcto
<button onClick={handleAction}>Guardar</button>
<a href="/dashboard">Ir al Dashboard</a>
<nav aria-label="Navegación principal">...</nav>

// ❌ Incorrecto
<div onClick={handleAction}>Guardar</div>
<span onClick={() => navigate('/dashboard')}>Ir al Dashboard</span>
<div className="nav">...</div>
```

### `sem-heading-hierarchy`

- **Regla:** Mantener jerarquía de headings estricta sin saltar niveles:

```tsx
// ✅ Correcto
<h1>Dashboard</h1>
  <h2>Clientes</h2>
    <h3>Lista de Clientes</h3>
  <h2>Reportes</h2>

// ❌ Incorrecto (salta de h1 a h3)
<h1>Dashboard</h1>
  <h3>Clientes</h3>
```

### `sem-landmarks`

- **Regla:** Toda página debe tener landmarks semánticos:

```tsx
<header>     {/* Banner */}
<nav>        {/* Navegación */}
<main>       {/* Contenido principal — solo UNO por página */}
<aside>      {/* Contenido complementario */}
<footer>     {/* Información de pie */}
```

### `sem-lists`

- **Regla:** Grupos de items similares DEBEN usar `<ul>`, `<ol>` o `<dl>`:

```tsx
// ✅ Lista de navegación
<ul role="list">
    {menuItems.map((item) => (
        <li key={item.id}>
            <a href={item.href}>{item.label}</a>
        </li>
    ))}
</ul>;
```

## 2. Navegación por Teclado (CRÍTICO)

### `kbd-all-interactive-focusable`

- **Regla:** TODO elemento interactivo DEBE ser alcanzable con Tab:
  - Botones, links, inputs → focusables nativamente
  - Custom widgets → agregar `tabIndex={0}`
  - Elementos decorativos → `tabIndex={-1}` (no en tab order)

### `kbd-focus-management`

- **Regla:** Gestionar el foco en interacciones dinámicas:

```tsx
// Al abrir modal → foco al primer elemento interactivo
useEffect(() => {
    if (isOpen) {
        firstInputRef.current?.focus();
    }
}, [isOpen]);

// Al cerrar modal → foco de vuelta al trigger
const handleClose = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
};
```

### `kbd-focus-trap`

- **Regla:** Los modales y drawers DEBEN atrapar el foco:

```tsx
// Usar una librería como @radix-ui/react-dialog que lo maneja
// O implementar manualmente:
// Tab en último elemento → vuelve al primero
// Shift+Tab en primer elemento → va al último
// Escape → cierra el modal
```

### `kbd-visible-focus`

- **Regla:** NUNCA eliminar el outline de foco sin reemplazo visible:

```css
/* ❌ Prohibido */
*:focus {
    outline: none;
}

/* ✅ Correcto — reemplazar con estilo visible */
*:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
    border-radius: 4px;
}
```

### `kbd-keyboard-shortcuts`

- **Regla:** Shortcuts avanzados deben ser documentados y desactivables:

```tsx
// Patrón para shortcuts
useEffect(() => {
    const handler = (e: KeyboardEvent) => {
        if (e.key === "Escape") closePanel();
        if (e.ctrlKey && e.key === "k") openSearch();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
}, []);
```

## 3. ARIA y Lectores de Pantalla (ALTO)

### `aria-labels`

- **Regla:** Elementos sin texto visible DEBEN tener `aria-label`:

```tsx
// Botón de ícono
<button aria-label="Cerrar panel lateral">
  <XIcon />
</button>

// Link de ícono
<a href="/settings" aria-label="Configuración">
  <GearIcon />
</a>
```

### `aria-live-regions`

- **Regla:** Contenido que cambia dinámicamente DEBE anunciarse:

```tsx
// Notificaciones, toasts, contadores
<div aria-live="polite" aria-atomic="true">
  {notification && <p>{notification.message}</p>}
</div>

// Errores urgentes
<div role="alert">
  Error: No se pudo guardar el documento
</div>
```

### `aria-expanded-controls`

- **Regla:** Elementos colapsables deben comunicar su estado:

```tsx
<button
  aria-expanded={isOpen}
  aria-controls="panel-content"
  onClick={() => setIsOpen(!isOpen)}
>
  Filtros Avanzados
</button>
<div id="panel-content" hidden={!isOpen}>
  {/* contenido */}
</div>
```

### `aria-no-redundancy`

- **Regla:** NO agregar ARIA que repita semántica nativa:

```tsx
// ❌ Redundante
<button role="button">Click</button>
<a role="link" href="/">Home</a>

// ✅ La semántica nativa es suficiente
<button>Click</button>
<a href="/">Home</a>
```

## 4. Visual y Color (ALTO)

### `visual-contrast-ratios`

- **Regla:** Cumplir ratios mínimos WCAG 2.2 AA:
  - Texto normal (< 18px): **4.5:1** mínimo
  - Texto grande (≥ 18px bold o ≥ 24px): **3:1** mínimo
  - Elementos interactivos y bordes: **3:1** mínimo
- **Herramienta:** Verificar con Chrome DevTools → Accessibility panel

### `visual-not-only-color`

- **Regla:** NUNCA comunicar información solo con color:

```tsx
// ❌ Solo color
<span style={{ color: 'red' }}>Error</span>

// ✅ Color + ícono + texto
<span className="error">
  <AlertIcon /> Error: Campo obligatorio
</span>
```

### `visual-responsive-text`

- **Regla:** El texto debe ser redimensionable hasta 200% sin pérdida de
  contenido.
- **Acción:** Usar `rem`/`em` en lugar de `px` para font-size.

### `visual-motion-preference`

- **Regla:** Respetar `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
```

## 5. Formularios (ALTO)

### `form-labels`

- **Regla:** TODO input DEBE tener un `<label>` asociado:

```tsx
// ✅ Label explícito con htmlFor
<label htmlFor="email">Correo electrónico</label>
<input id="email" type="email" />

// ✅ Label implícito (wrapping)
<label>
  Correo electrónico
  <input type="email" />
</label>
```

### `form-error-messages`

- **Regla:** Los errores deben estar asociados al input:

```tsx
<label htmlFor="rfc">RFC</label>
<input
  id="rfc"
  aria-invalid={!!errors.rfc}
  aria-describedby={errors.rfc ? 'rfc-error' : undefined}
/>
{errors.rfc && (
  <p id="rfc-error" role="alert" className="error-text">
    {errors.rfc.message}
  </p>
)}
```

### `form-autocomplete`

- **Regla:** Inputs de datos personales DEBEN usar autocomplete:

```tsx
<input type="email" autoComplete="email" />
<input type="text" autoComplete="name" />
<input type="tel" autoComplete="tel" />
<input type="text" autoComplete="street-address" />
```

### `form-required-indication`

- **Regla:** Campos obligatorios deben indicarse visual y programáticamente:

```tsx
<label htmlFor="name">
  Nombre <span aria-hidden="true">*</span>
</label>
<input id="name" required aria-required="true" />
```

## Checklist Rápido para Revisión

```
□  Todos los elementos interactivos son focusables con Tab
□  El foco es visible en todo momento
□  Los modales atrapan el foco
□  Headings siguen jerarquía sin saltos
□  Imágenes tienen alt text descriptivo
□  Los formularios tienen labels asociados
□  Los errores se comunican con role="alert"
□  El contraste cumple 4.5:1 (texto) / 3:1 (elementos)
□  La información no depende solo del color
□  prefers-reduced-motion está implementado
□  aria-live se usa para contenido dinámico
```
