---
name: session-handoff
description: >
  Persiste el contexto de la sesión actual antes de que se agoten los tokens.
  TRIGGER: cuando el usuario diga "guarda contexto", "handoff", "guarda el hilo",
  "save session", o cuando detectes que el contexto está cerca de su límite.
version: "1.0.0"
metadata:
  author: pro-trinity
  emoji: "🧠"
  language: es
  always: false
  requires: {}
  invocation:
    userInvocable: true
    disableModelInvocation: false
  tags: ["context", "memory", "handoff", "session", "continuity"]
---

# Session Handoff — Protocolo de Continuidad

Esta skill garantiza que el contexto de trabajo NUNCA se pierda entre sesiones
de Claude Code, incluso cuando los tokens se agotan.

## Cuándo ejecutar

1. **Manual:** El usuario dice "guarda el contexto" o "handoff"
2. **Proactivo:** Cuando detectes que la conversación es larga y hay riesgo de
   truncamiento, ofrece hacer el handoff
3. **Pre-cierre:** Antes de que el usuario cierre la sesión

## Qué guardar

Actualiza el archivo `memory/session-handoff.md` con:

```markdown
## Last Session
- **Date:** [fecha actual]
- **Focus:** [resumen de 1 línea del tema principal]
- **Status:** [IN_PROGRESS | COMPLETE | BLOCKED]

### What was done
[Lista numerada de lo que se logró]

### Files modified this session
[Lista de archivos creados/modificados con descripción breve]

### Next steps (user's priorities)
[Checklist con lo que falta por hacer]

### Open decisions
[Decisiones pendientes que necesitan input del usuario]

### Active bugs / blockers
[Si hay errores sin resolver o bloqueos]
```

## Reglas

1. **NO inventes contexto.** Solo documenta lo que realmente se hizo en la sesión.
2. **Sé conciso.** Máximo 40 líneas en el handoff.
3. **Prioriza lo actionable.** "Next steps" debe ser suficiente para que el
   próximo Claude retome sin preguntar "¿en qué estábamos?"
4. **Actualiza MEMORY.md** si hubo cambios arquitectónicos importantes
   (nuevo servicio, nueva edge function, nuevo patrón).
5. **No dupliques.** Si algo ya está en MEMORY.md, no lo repitas en el handoff.

## Cómo retomar

Al inicio de la próxima sesión, Claude automáticamente lee MEMORY.md (que
incluye link a session-handoff.md). El flujo es:

```
Nueva sesión → Claude lee MEMORY.md → Ve link a session-handoff.md
→ Lee el handoff → Tiene contexto completo → Continúa sin preguntar
```
