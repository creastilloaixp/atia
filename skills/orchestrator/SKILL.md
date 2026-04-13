---
name: orchestrator
description: Agente orquestador principal que coordina múltiples skills y agentes según la tarea.
  Incluye: análisis de requerimientos, selección de skills apropiados, coordinación de agentes,
  gestión de contexto compartido, pipelines de múltiples pasos, y fallback strategies.
  Activa cuando el usuario mencione: orquestador, coordinator, múltiples skills, workflow
  completo, pipeline, end-to-end, chain agents, orchestrate, coordinar, flujo completo,
  integrar skills, agente principal, main agent, brain.
triggers:
  - orquestador
  - coordinator
  - múltiples skills
  - workflow completo
  - pipeline
  - end-to-end
  - chain agents
  - orchestrate
  - coordinar
  - flujo completo
  - integrar skills
  - agente principal
  - main agent
  - brain
  - todo junto
  - proceso completo
tools:
  - Read
  - Write
  - Bash
  - Grep
  - Glob
  - Task
---

# Orquestador Central

## Propósito

El orquestador es el "cerebro" que:
1. Entiende el objetivo del usuario
2. Determina qué skills/agentes necesita
3. Coordina la ejecución en orden
4. Gestiona el contexto entre pasos
5. Retorna resultado unificado

## Cómo Funciona

```
User Input → Análisis → Plan → Ejecución Coordinada → Output
```

### Paso 1: Análisis de Requerimiento

```
INPUT: "Quiero hacer una campaña de marketing para mi negocio de autocobro"

ANÁLISIS:
- Tipo: Marketing campaign
- Componentes necesarios:
  1. Research (audiencia, competidores)
  2. Content (copy, imágenes)
  3. Distribution (publicar)
  4. Metrics (medir resultados)
- Skills requeridos: research-agent, content-generation, marketing-automation
- Output esperado: Campaign completa lista para publicar
```

### Paso 2: Plan de Ejecución

```
PLAN:
[1] research-agent → Insights de audiencia y competidores
    ↓
[2] content-generation → Copy y creatividades
    ↓
[3] marketing-automation → Pipeline de distribución
    ↓
[4] Output final
```

## Coordinación de Skills

### Map de Skills por Tipo de Tarea

| Tipo de Tarea | Skills a Coordinar |
|---------------|-------------------|
| Campaña Marketing completa | research-agent → content-generation → marketing-automation |
| Investigación de mercado | research-agent → ai-automation-architecture |
| Crear equipo de agentes | agent-teams → prompt-engineering |
| Automatizar proceso de negocio | n8n-automation → ai-automation-architecture → mcp-servers |
| Deployment de agente | claude-code-deployment → mcp-servers |
| Investigación + contenido | research-agent → content-generation → voice-workflow |

### Ejemplo de Coordinación

```javascript
// Pseudocode del orquestador
async function orquestar(input) {
  // 1. Analizar
  const tipoTarea = analizarInput(input);
  
  // 2. Seleccionar skills
  const skillsRequeridos = mapSkills[tipoTarea];
  
  // 3. Ejecutar en secuencia
  let contexto = {};
  for (const skill of skillsRequeridos) {
    const resultado = await ejecutarSkill(skill, contexto);
    Object.assign(contexto, resultado);
  }
  
  // 4. Retornar resultado unificado
  return formatearOutput(contexto);
}
```

## Gestión de Contexto

### Estado Compartido

```
contexto = {
  objetivo: "...",
  inputs: { ... },
  resultadosParciales: [ ... ],
  metadata: { ... }
}
```

### Pasaje de Información

```
Skill A → output → contexto → input → Skill B → ...
```

## Templates de Orquestación

### Template 1: Investigación + Contenido

```
Input: [Tema/Nicho]
→ research-agent: Investigar audiencia y tendencias
→ content-generation: Generar contenido basado en insights
→ Output: Contenido listo para publicación
```

### Template 2: Equipo + Deployment

```
Input: [Descripción del equipo necesario]
→ agent-teams: Crear configuración de agentes
→ mcp-servers: Configurar integrations necesarias
→ claude-code-deployment: Preparar deployment
→ Output: Equipo configurado y desplegado
```

### Template 3: Automatización de Negocio

```
Input: [Proceso de negocio a automatizar]
→ ai-automation-architecture: Diseñar arquitectura
→ n8n-automation: Crear workflow
→ mcp-servers: Integrar sistemas
→ Output: Automatización lista
```

## Fallback Strategies

Si un skill falla:

```javascript
async function ejecutarConFallback(skill, contexto, retryCount = 3) {
  try {
    return await ejecutarSkill(skill, contexto);
  } catch (error) {
    if (retryCount > 0) {
      // Retry con backoff
      await sleep(1000 * (4 - retryCount));
      return ejecutarConFallback(skill, contexto, retryCount - 1);
    }
    // Fallback: continuar sin este componente
    console.warn(`Skill ${skill} falló, continuando...`);
    return { fallback: true, skill };
  }
}
```

## Casos de Uso para Autocobro

### Caso 1: Nuevo Lead → Cliente

```
Input: "Un restaurante no ha pagado, necesito recuperarlo"

Orquestación:
[1] research-agent: Investigar el negocio, historial, contactos
[2] prompt-engineering: Generar mensaje personalizado
[3] mcp-servers: Enviar por WhatsApp/Email
[4] Output: Mensaje enviado, listo para seguimiento
```

### Caso 2: Campaña de Nuevos Clientes

```
Input: "QuieroClient nuevos restaurantes en mi zona"

Orquestación:
[1] research-agent: Encontrar restaurantes objetivo
[2] content-generation: Crear propuesta de valor
[3] marketing-automation: Configurar outreach
[4] mcp-servers: Enviar propuestas
[5] Output: Pipeline de leads generado
```

### Caso 3: Optimizar Proceso de Cobro

```
Input: "Mi proceso de cobro es lento, necesito optimizarlo"

Orquestación:
[1] ai-automation-architecture: Analizar proceso actual
[2] n8n-automation: Diseñar workflow optimizado
[3] mcp-servers: Integrar con sistemas existentes
[4] Output: Proceso automatizado nuevo
```

## Métricas del Orquestador

| Métrica | Descripción |
|---------|-------------|
| Precisión de selección | % de veces que elige los skills correctos |
| Eficiencia | Tiempo total vs tiempo ideal |
| Success rate | % de ejecuciones que completan exitosamente |
| Calidad de output | Satisfacción del usuario con el resultado |

## Configuración de Agentes en claude.json

```json
{
  "agents": [
    {
      "name": "orchestrator",
      "description": "Agente orquestador principal. Analiza requerimientos,coordina múltiples skills y agentes,gestiona contexto,y retorna resultados unificados. Acts as the central brain that knows which specialized skills to invoke for each task."
    }
  ]
}
```

## Recursos

- Skills disponibles en .claude/skills/
- Ver cada SKILL.md para detalles de cada skill