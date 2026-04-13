---
name: research-agent
description: Configuración y uso de agentes de investigación con IA para marketing y negocio.
  Incluye: investigación de audiencia, análisis de competidores, búsqueda de tendencias,
  integración con Tavily y otras APIs de búsqueda, estructura de prompts para research,
  organización de insights, y automatización de investigación continua. Activa cuando el
  usuario mencione: research agent, ia research, market research, competitor analysis,
  audience research, tavily, search api, investigation, insights, trends analysis,
  análisis de mercado, investigación de competidores.
triggers:
  - research agent
  - ia research
  - market research
  - competitor analysis
  - audience research
  - tavily
  - search api
  - investigation
  - insights
  - trends analysis
  - análisis de mercado
  - investigación de competidores
  - investigación de audiencia
tools:
  - Read
  - Write
  - Bash
  - Grep
  - Glob
---

# Research Agent con Claude Code

## ¿Qué es un Research Agent?

Un Research Agent es un agente especializado en recopilación y análisis de información. A diferencia de un asistente general, está optimizado para:

- Búsqueda exhaustiva de información
- Análisis de múltiples fuentes
- Síntesis de insights accionables
- Validación de datos

## Configuración del Agent

```json
{
  "agents": [
    {
      "name": "researcher",
      "description": "Especialista en investigación de mercado y audiencias. Encuentra insights accionables sobre competidores, tendencias, y comportamiento de usuarios. Organiza la información de forma clara y estructurada."
    }
  ]
}
```

## Integración con APIs de Búsqueda

### Tavily API

Tavily es una API de búsqueda optimizada para LLMs.

```javascript
// Configuración en .env
TAVILY_API_KEY=tu_api_key
```

```javascript
// Función de búsqueda con Tavily
async function searchTavily(query, options = {}) {
  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      query,
      max_results: options.maxResults || 10,
      search_depth: options.depth || 'basic',
      include_answer: true,
      include_raw_content: false
    })
  });
  return response.json();
}
```

### SerpAPI (Google)

```javascript
async function searchGoogle(query) {
  const response = await fetch(
    `https://serpapi.com/search?q=${encodeURIComponent(query)}&api_key=${process.env.SERPAPI_KEY}`
  );
  return response.json();
}
```

## Estructura de Prompts para Research

### Prompt de Investigación de Audiencia

```
Eres un researcher especializado en investigación de audiencias.

Tu tarea es investigar a fondo la audiencia objetivo para [PRODUCTO/SERVICIO].

Investigación requerida:
1. Demográficos: edad, género, ubicación, ingresos, educación
2. Psicográficos: valores, intereses, lifestyle, pain points
3. Comportamiento: dónde consumen contenido, qué apps usan, cómo compran
4. Journey del cliente: conciencia → consideración → decisión → lealtad

Fuentes a consultar:
- Estudios de mercado
- Estadísticas de industria
- Testimonios y reseñas
- Foros y comunidades relevantes

Output: JSON con las siguientes secciones:
{
  "demographics": { ... },
  "psychographics": { ... },
  "behavior": { ... },
  "journey": { ... },
  "insights": ["insight 1", "insight 2", ...]
}
```

### Prompt de Análisis de Competidores

```
Investiga a los siguientes competidores: [LISTA DE COMPETIDORES]

Para cada competidor, encuentra:
1. Productos/servicios que ofrecen
2. Estrategia de pricing
3. Fortalezas y debilidades
4. Marketing y posicionamiento
5. Tecnología y herramientas que usan
6. Reviews y feedback de clientes
7. Tendencias recientes

Organiza la información en una tabla comparativa y proporciona recomendaciones estratégicas.
```

### Prompt de Investigación de Tendencias

```
Investiga las tendencias actuales en [INDUSTRIA/NICHO].

Incluye:
1. Tendencias de consumo
2. Innovaciones tecnológicas
3. Cambios regulatorios
4. Tendencias de marketing
5. Predicciones de expertos

Para cada tendencia, indica:
- Nivel de impacto (alto/medio/bajo)
- Horizonte temporal (corto/medio/largo)
- Oportunidades que genera
- Riesgos a considerar
```

## Automatización con n8n

### Workflow de Investigación Automática

```json
{
  "nodes": [
    {
      "name": "Trigger",
      "type": "n8n-nodes-base.schedule",
      "parameters": {
        "rule": { "interval": [{ "field": "weeks", "weeks": 1 }] }
      }
    },
    {
      "name": "Research Topics",
      "type": "n8n-nodes-base.function",
      "parameters": {
        "functionCode": "return ['competitor updates', 'industry trends', 'audience changes']"
      }
    },
    {
      "name": "Tavily Search",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://api.tavily.com/search",
        "method": "POST",
        "bodyParameters": {
          "api_key": "{{ $env.TAVILY_API_KEY }}",
          "query": "{{ $json.topic }}",
          "max_results": 10
        }
      }
    },
    {
      "name": "Synthesize Insights",
      "type": "n8n-nodes-base.openai",
      "parameters": {
        "operation": "chat",
        "prompt": "Sintetiza los siguientes resultados de búsqueda en insights accionables: {{ $json.results }}"
      }
    },
    {
      "name": "Save to DB",
      "type": "n8n-nodes-base.supabase",
      "parameters": {
        "operation": "insert",
        "table": "research_insights",
        "data": "{{ $json }}"
      }
    }
  ]
}
```

## Tipos de Investigación

### 1. Research Pasivo (On-demand)

```
User → Prompt → Agent → Research → Output
```

### 2. Research Programado (Scheduled)

```
Schedule → Agent → Multiple Searches → Synthesis → Report
```

### 3. Research Reactivo (Trigger-based)

```
Trigger (news/event) → Agent → Quick Research → Alert
```

## Métricas de Research

| Métrica | Descripción |
|---------|-------------|
| Tiempo de investigación | Cuánto tarda en completar una investigación |
| Precisión | % de información verificable y útil |
| Profundidad | Número de fuentes consultadas |
| Relevancia | % de insights accionables vs. ruido |

## Mejores Prácticas

1. **Specifidad**: Queries específicos = mejores resultados
2. **Iteración**: Primeiro broad, luego deep
3. **Triangulación**: Múltiples fuentes para confirmar
4. **Organización**: Estructurar siempre los hallazgos
5. **Actualización**: Research older caduca rápido

## Casos de Uso para Autocobro

### Investigación de Leads

```
Input: [Nombre de empresa/industria]
Output: Insights sobre el cliente potencial para personalizar outreach
```

### Análisis de Mercado Local

```
Investigación del mercado de autocobro en [ciudad/región]:
- Competidores locales
- Regulaciones específicas
- Oportunidades de nicho
```

## Recursos

- [Tavily API](https://www.tavily.com)
- [SerpAPI](https://serpapi.com)
- [Apify (web scraping)](https://www.apify.com)