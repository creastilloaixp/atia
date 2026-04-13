---
name: ai-automation-architecture
description: Patrones de arquitectura para sistemas de automatización con IA y agentes.
  Incluye: diseño de sistemas multi-agente, pipelines de automatización, flujos de trabajo
  con n8n y LLMs, patrones de orchestration, manejo de estado, error handling,
  y mejores prácticas para producción. Activa cuando el usuario mencione: arquitectura,
  sistemas multi-agent, automation workflow, orchestration patterns, n8n workflows,
  pipeline de IA, agentic workflows, AI automation, estado y memoria, error handling,
  producción, scalability.
triggers:
  - arquitectura
  - sistemas multi-agent
  - automation workflow
  - orchestration patterns
  - n8n workflows
  - pipeline de IA
  - agentic workflows
  - AI automation
  - estado y memoria
  - error handling
  - producción
  - scalability
  - diseño de sistemas
  - patrones de diseño
tools:
  - Read
  - Write
  - Bash
  - Grep
  - Glob
---

# Arquitectura de Automatización con IA

## Principios de Diseño

### 1. Modularidad
Cada componente debe ser independiente y reemplazable.

### 2. Single Responsibility
Un agente o función hace una cosa bien.

### 3. Interfaces Claras
Definir contratos entre componentes.

### 4. Observabilidad
Logging y métricas en cada paso.

## Patrones de Arquitectura

### Patrón 1: Pipeline Lineal

```
[Input] → [Procesamiento] → [IA] → [Output]
```

Usar para: transformaciones simples, validaciones.

```javascript
// Ejemplo con n8n (JSON)
{
  "nodes": [
    { "name": "Webhook", "type": "n8n-nodes-base.webhook" },
    { "name": "Transform", "type": "n8n-nodes-base.function" },
    { "name": "LLM", "type": "@n8n/n8n-nodes-langchain.chat" },
    { "name": "Response", "type": "n8n-nodes-base.response" }
  ]
}
```

### Patrón 2: Fan-out / Fan-in

```
        → [Agente A] →
[Input] → [Agente B] → [Aggregator] → [Output]
        → [Agente C] →
```

Usar para: procesamiento paralelo, múltiples perspectivas.

```javascript
// En código
const results = await Promise.all([
  agenteA.procesar(input),
  agenteB.procesar(input),
  agenteC.procesar(input)
]);
const aggregated = agregarResultados(results);
```

### Patrón 3: Orchestrator

```
       [Orquestador]
     ↙    ↓    ↘
[Ag1] [Ag2] [Ag3]
     ↘    ↓    ↙
       [Resultado]
```

Usar para: coordinación complexa, dependecias entre agentes.

```javascript
class Orquestador {
  async ejecutar(tarea) {
    const paso1 = await this.agente1.ejecutar(tarea);
    const paso2 = await this.agente2.procesar(paso1.resultado);
    return this.agente3.finalizar(paso2.resultado);
  }
}
```

### Patrón 4: State Machine

```
[Estado A] --evento--> [Estado B] --evento--> [Estado C]
```

Usar para: flujos con múltiples estados, procesos multi-paso.

```javascript
const workflow = {
  estado: 'inicio',
  transiciones: {
    inicio: { validar: 'validado', omitir: 'procesado' },
    validado: { procesar: 'procesado', error: 'revisar' },
    procesar: { completar: 'completado', error: 'revisar' }
  }
};
```

### Patrón 5: Event-Driven

```
[Evento] → [Trigger] → [Acción] → [Notificación]
```

Usar para: reacciones a eventos, integrations asíncronas.

## Componentes de un Sistema de Automatización

### 1. Capa de Input

- Webhooks
- APIs REST
- Cola de mensajes (RabbitMQ, SQS)
- Cron jobs

### 2. Capa de Procesamiento

- Transformaciones de datos
- Validaciones
- Enriquecimiento de contexto

### 3. Capa de IA

- LLMs para generación
- Embeddings para búsqueda
- Modelos de clasificación

### 4. Capa de Output

- Notificaciones (Slack, email)
- Actualización de bases de datos
- Llamadas a APIs externas

## Manejo de Estado

### Estado en Memoria (para ejecución única)

```javascript
const contexto = {
  sessionId: uuid(),
  historia: [],
  variables: {}
};
```

### Estado Persistente (para workflows largos)

```javascript
// Base de datos
await db.historial.create({
  sessionId,
  estado: JSON.stringify(estadoActual),
  metadata: { inicio: fecha }
});
```

### Patrón: Snapshot y Resume

```javascript
async function checkpoint(estado, paso) {
  await db.checkpoints.create({
    workflowId,
    paso,
    estado,
    timestamp: new Date()
  });
}

async function resume(workflowId) {
  const checkpoint = await db.checkpoints.find({
    where: { workflowId },
    order: { paso: 'DESC' }
  });
  return checkpoint.estado;
}
```

## Error Handling

### Retry con Exponential Backoff

```javascript
async function retry(fn, maxAttempts = 3) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxAttempts - 1) throw error;
      await sleep(Math.pow(2, i) * 1000);
    }
  }
}
```

### Circuit Breaker

```javascript
class CircuitBreaker {
  constructorUmbral = 5;
  constructor() {
    this.failures = 0;
    this.state = 'closed';
  }

  async execute(fn) {
    if (this.state === 'open') throw new Error('Circuit open');
    try {
      const result = await fn();
      this.failures = 0;
      return result;
    } catch (e) {
      this.failures++;
      if (this.failures >= this.umbral) this.state = 'open';
      throw e;
    }
  }
}
```

### Dead Letter Queue

```javascript
try {
  await procesarMensaje(msg);
} catch (error) {
  await dlq.send({
    mensaje: msg,
    error: error.message,
    retryCount: msg.retryCount + 1
  });
}
```

## Patrones con n8n

### Sub-workflows Reutilizables

Crear workflows modulares que se llaman entre sí:

```
Main Workflow
  → Call: [Validación]
  → Call: [Enriquecimiento]
  → Call: [Procesamiento IA]
```

### Variables Globales

```javascript
// En n8n Expression
{{ $json.metadata.sessionId }}
{{ $env.API_KEY }}
```

### Errores Centralizados

```
[All Errors] → [Error Handler] → [Notify] → [Log]
```

## Métricas y Observabilidad

### Métricas Clave

| Métrica | Descripción | Target |
|---------|-------------|--------|
| Latencia | Tiempo promedio por ejecución | < 2s |
| Error Rate | % de ejecuciones fallidas | < 1% |
| Throughput | Ejecuciones por minuto | según load |
| Queue Depth | Mensajes pendientes | < 100 |

### Logging Estructurado

```javascript
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  level: 'info',
  workflow: 'procesamiento',
  paso: 'enriquecimiento',
  sessionId,
  duration: end - start,
  status: 'success'
}));
```

## Mejores Prácticas para Producción

1. **Ambienteparadojo**: Dev → Staging → Prod
2. **Feature Flags**: Control de cambios gradual
3. **Canary Deployments**: Probar con porcentaje pequeño
4. **Monitoreo activo**: Alertas en tiempo real
5. **Rollback automático**: Si error rate > umbral
6. **Documentación**: README + arquitectura diagram

## Recursos

- [n8n Documentation](https://docs.n8n.io)
- [LangChain Patterns](https://python.langchain.com/docs/concepts/#patterns)
- [AWS Well-Architected - AI](https://docs.aws.amazon.com/wellarchitected/latest/aiops-lens/aiops-lens.html)