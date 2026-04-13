---
name: marketing-automation
description: Configuración y uso de equipos de marketing autónomos con Claude Code y Claude
  Skills. Incluye: crear equipo de agentes de marketing, automatizar creación de contenido
  (videos, imágenes, textos), distribución multi-plataforma, pipelines de n8n, investigación
  de audiencia, y métricas de rendimiento. Activa cuando el usuario mencione: marketing
  automation, autonomous marketing, ai marketing team, content generation, marketing agents,
  ad campaigns, social media automation, marketing pipeline, content distribution.
triggers:
  - marketing automation
  - autonomous marketing
  - ai marketing team
  - content generation
  - marketing agents
  - ad campaigns
  - social media automation
  - marketing pipeline
  - content distribution
  - marketing autonomo
  - equipo marketing IA
  - campañas automatizadas
tools:
  - Read
  - Write
  - Bash
  - Grep
  - Glob
---

# Marketing Automation con Claude Code

## Concepto de Equipo de Marketing Autónoma

Un equipo de marketing autónomo consiste en múltiples agentes especializados que trabajan juntos para ejecutar campañas completas sin intervención humana.

## Estructura del Equipo de Marketing

### Agentes Principales

| Agente | Función | Herramientas |
|--------|---------|--------------|
| **Research Agent** | Investigar audiencia, tendencias, competidores | Tavily, APIs de búsqueda |
| **Content Strategist** | Planificar calendario y estrategia | Claude Code |
| **Copywriting Agent** | Escribir textos para anuncios y posts | Claude Code + LLMs |
| **Visual Designer** | Crear imágenes y creatividades | DALL-E, Midjourney |
| **Video Producer** | Producir videos promocionales | Remotion, Runway |
| **Distribution Agent** | Publicar en múltiples plataformas | Playwright, APIs sociales |
| **Analytics Agent** | Medir y optimizar resultados | APIs de métricas |

## Configuración de Agentes en claude.json

```json
{
  "agents": [
    {
      "name": "researcher",
      "description": "Investiga audiencia objetivo, tendencias del mercado, y competidores. Proporciona insights accionables para la estrategia de marketing."
    },
    {
      "name": "copywriter",
      "description": "Escribe textos persuasivos para anuncios, emails, posts redes sociales, y landing pages. Adapta el tono según el público objetivo."
    },
    {
      "name": "designer",
      "description": "Crea imágenes y creatividades para campañas publicitarias. Genera assets visualmente atractivos que convierten."
    },
    {
      "name": "distributor",
      "description": "Publica contenido en múltiples plataformas: Instagram, Facebook, LinkedIn, YouTube, TikTok. Optimiza horarios y formatos."
    }
  ]
}
```

## Pipeline de Marketing Automation

### Fase 1: Investigación

```
Input: [Tema/Nicho] → Research Agent → Output: [Insights de audiencia, tendencias, competidores]
```

```javascript
// Prompts para Research Agent
const researchPrompt = `
Eres un researcher de marketing. Investiga sobre [ Nicho/Producto ].

Proporciona:
1. Audiencias objetivo (demográficos, intereses, pain points)
2. Tendencias actuales del mercado
3. Competidores principales y sus estrategias
4. Palabras clave relevantes
5. Contenido exitoso en el espacio

Formato: JSON con las secciones acima.
`;
```

### Fase 2: Estrategia y Creación

```
Research → Content Strategist → Copywriter + Designer + Video Producer
```

```javascript
// Coordinación de agentes
const strategyPrompt = `
Basándote en los insights de investigación, crea un plan de contenido para la próxima semana.

Incluye:
- 5 temas para posts
- 2 conceptos para videos
- 3 campañas de anuncios
- Calendar de publicación

Cada pieza debe tener: headline, copy, formato, plataforma objetivo.
`;
```

### Fase 3: Producción

```
Copywriter → Textos
Designer → Imágenes
Video Producer → Videos
```

### Fase 4: Distribución

```
Contenido → Distribution Agent → Multiple Plataformas
```

```javascript
// Distribución cross-platform
const distributionPrompt = `
Distribuye el siguiente contenido a las plataformas indicadas:

Contenido: [ asset generado ]
Plataformas: Instagram, LinkedIn, Facebook
Horario: [ optimal times para cada plataforma ]
Formatos: [ adaptar a cada plataforma ]

Para cada plataforma, adapta:
- Tamaño y formato de imagen/video
- Copy (largo/corto)
- Hashtags relevantes
- Timing óptimo
`;
```

## Integración con n8n

### Workflow Básico

```json
{
  "name": "Marketing Pipeline",
  "nodes": [
    {
      "name": "Webhook Trigger",
      "type": "n8n-nodes-base.webhook",
      "parameters": { "httpMethod": "POST", "path": "marketing-campaign" }
    },
    {
      "name": "Research",
      "type": "n8n-nodes-base.function",
      "parameters": { "functionCode": "return n8nExecuteAgent('researcher', input)" }
    },
    {
      "name": "Generate Content",
      "type": "n8n-nodes-base.function",
      "parameters": { "functionCode": "return parallelExecute(['copywriter', 'designer'])" }
    },
    {
      "name": "Distribute",
      "type": "n8n-nodes-base.function",
      "parameters": { "functionCode": "return n8nExecuteAgent('distributor', input)" }
    }
  ]
}
```

### Automatización de Campañas

```
Campaña Input → n8n Workflow → Agentes → Distribución → Reporte
```

## Métricas y Optimización

### KPIs a Medir

| Métrica | Descripción | Meta |
|---------|-------------|------|
| CTR | Click-through rate | > 2% |
| Conversión | Conversiones por impresión | > 5% |
| Engagement | Interacciones / alcance | > 3% |
| Costo por lead | Costo / lead generado | < $10 |
| ROI | Retorno sobre inversión | > 300% |

### Loop de Optimización

```
Recolectar métricas → Analizar → Ajustar prompts → Probar → Medir de nuevo
```

## Casos de Uso para tu Proyecto

### Autocobro

1. **Lead Generation**: Agentes que investigan potenciales clientes y generan contenido personalizado
2. **Seguimiento**: Automatización de seguimiento con mensajes personalizados
3. **Upselling**: Recomendaciones de servicios adicionales basadas en comportamiento

### Implementación Paso a Paso

1. **Semana 1**: Setup Research Agent + Copywriter
2. **Semana 2**: Agregar Designer + Distribution Agent
3. **Semana 3**: Integrar con n8n
4. **Semana 4**: Métricas y optimización

## Recursos

- [Andy Lo's Marketing Course](https://www.skool.com/andynocode-premium)
- [n8n Workflows](https://docs.n8n.io)
- [Playwright for Automation](https://playwright.dev)