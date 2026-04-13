---
name: prompt-engineering
description: Técnicas y mejores prácticas para escribir prompts efectivos en Claude Code.
  Incluye: estructura de prompts, claridad y especificidad, contexto y limitaciones,
  formatos de salida, cadenas de pensamiento (chain of thought), few-shot learning,
  iteración y refinamiento, y errores comunes. Activa cuando el usuario mencione:
  prompt, prompts, writing prompts, prompt optimization, chain of thought, few-shot,
  output format, clear instructions, contexto, specificity, iteración de prompts.
triggers:
  - prompt
  - prompts
  - writing prompts
  - prompt optimization
  - chain of thought
  - few-shot
  - output format
  - clear instructions
  - contexto
  - specificity
  - iteración de prompts
  - refinar prompt
  - mejor prompt
tools:
  - Read
  - Write
  - Bash
  - Grep
  - Glob
---

# Prompt Engineering para Claude Code

## Principios Fundamentales

### 1. Claridad sobre Ambigüedad

**❌ Malo**: "Haz algo con el código"
**✅ Bueno**: "Refactoriza la función `processUserData` para usar async/await"

### 2. Contexto Específico

**❌ Malo**: "Mejora esto"
**✅ Bueno**: "Optimiza esta query para que tarde menos de 100ms, considerando que la tabla tiene 10M registros"

### 3. Formato de Salida Definido

**❌ Malo**: "Explícame cómo funciona"
**✅ Bueno**: "Explica el código en máximo 3 párrafos usando esta estructura:
1. Propósito general
2. Flujo principal
3. Puntos clave a recordar"

## Estructura de un Prompt Efectivo

```
[Rol/Contexto] + [Tarea Específica] + [Restricciones] + [Formato de Salida]

Ejemplo:
"Como experto en seguridad, revisa este código JavaScript buscando 
vulnerabilidades XSS. Prioriza los hallazgos por criticidad (crítico/medio/bajo).
Presenta los resultados en una tabla con: línea, descripción, y solución recomendada."
```

### Componentes Clave

| Componente | Descripción | Ejemplo |
|------------|--------------|---------|
| **Rol** | Quién eres o qué perspectiva adoptar | "Como DevOps senior..." |
| **Tarea** | Qué hacer exactamente | "...configura CI/CD con GitHub Actions" |
| **Contexto** | Información relevante | "...para un repo Node.js con 5 servicios" |
| **Restricciones** | Límites a respetar | "...sin usar servicios externos" |
| **Formato** | Cómo quieres el resultado | "...en formato JSON" |

## Técnicas Avanzadas

### Chain of Thought (CoT)

Pedir a Claude que "piense paso a paso" mejora la calidad en tareas complejas:

```
"Resuelve este problema explicando tu razonamiento paso a paso.
Al final, indica la complejidad temporal de tu solución."
```

### Few-Shot Learning

Dar ejemplos de entrada/salida esperados:

```
"Clasifica estos tweets como positivo/negativo/neutral:

'Love this product!' -> positivo
'Terrible experience' -> negativo
' arrives tomorrow' -> neutral

Clasifica: 'Not bad, could be better'
"
```

### Formatos de Salida Estructurados

**JSON**:
```json
{
  "summary": "...",
  "changes": [...],
  "risks": [...]
}
```

**Tabla**:
```
| Archivo | Cambios | Líneas |
|---------|---------|--------|
```

**Lista numerada**:
```
1. Primer paso...
2. Segundo paso...
```

### Constraints y Guardrails

```
"Responde solo con código. No incluyas explicaciones.
Si no tienes suficiente información, indica claramente qué necesitas."
```

```
"Antes de escribir código, pregunta si la arquitectura propuesta te parece correcta."
```

## Patrones de Prompts para Claude Code

### Patrón 1: Revisor
```
"Actúa como code reviewer senior. Revisa el siguiente código y proporciona:
- Issues críticos (must fix)
- Mejoras recomendadas (should fix)
- Sugerencias opcionales (nice to have)
Usa el formato: [SEVERIDAD] [LÍNEA]: [DESCRIPCIÓN]"
```

### Patrón 2: Arquitecto
```
"Eres un arquitecto de software. Para el siguiente requerimiento, crea:
1. Diagrama de componentes (ASCII)
2. Schema de base de datos
3. API endpoints propuestos
4. Consideraciones de seguridad

Requerimiento: [DESCRIPCIÓN]"
```

### Patrón 3: Docente
```
"Explica [CONCEPTO] como si fuera un mentor senior explicando a un junior.
Usa analogías del mundo real. Incluye un ejemplo de código mínimo.
Termina con 3 preguntas de práctica."
```

### Patrón 4: Debugger
```
"Analiza este error como un debugger experto:
1. Posibles causas raíz
2. Cómo reproducirlo
3. Solución paso a paso
4. Cómo prevenirlo en el futuro

Error: [STACK TRACE]"
```

## Errores Comunes y Soluciones

| Error | Síntoma | Solución |
|-------|---------|----------|
| Prompt muy largo | Respuestas irrelevantes | Dividir en pasos más pequeños |
| Sin formato específico | Respuestas inconsistentes | Definir formato explícitamente |
| Contexto insuficiente | Claude假设incorrectas | Dar información de fondo |
| Restricciones vagas | Resultados inesperados | Ser específico en límites |
| Sin ejemplos | Formato incorrecto | Añadir few-shot examples |

## Iteración de Prompts

### Ciclo de Refinamiento

1. **Primera iteración**: Prompt inicial
2. **Evaluar**: ¿La respuesta cumple el objetivo?
3. **Ajustar**: Añadir contexto, formato, o restricciones
4. **Probar**:Nueva versión del prompt
5. **Repetir** hasta obtener el resultado deseado

### Checklist de Prompt optimizado

- [ ] ¿El objetivo está claro en una frase?
- [ ] ¿Tiene contexto suficiente?
- [ ] ¿El formato de salida está definido?
- [ ] ¿Hay restricciones claras?
- [ ] ¿Hay ejemplos si es necesario?
- [ ] ¿Es suficientemente específico?

## Prompts para Agent Teams

En equipos de agentes, el prompt del orquestador debe incluir:

```
Eres el orquestador de un equipo de [N] agentes.

Equipo:
- Agente1: [rol y responsabilidad]
- Agente2: [rol y responsabilidad]

Protocolo de comunicación:
1. [Cómo se pasan información]
2. [Cómo se validan resultados]
3. [Cómo se resuelve conflictos]

Objetivo: [resultado específico]
Tangibilidad: [criterios de éxito medibles]

Inicia coordinando al equipo para [tarea específica].
"""

## Recursos

- [Anthropic Prompt Engineering Guide](https://docs.anthropic.com/en/docs/claude-code/prompts)
- [Anthropic Cookbook - Prompt Patterns](https://github.com/anthropics/cookbook)