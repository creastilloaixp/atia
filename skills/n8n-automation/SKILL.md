---
name: n8n-automation
description: Automatización de workflows con n8n. Incluye: nodos esenciales, integraciones API, 
  webhooks, triggers, autenticación, manejo de errores, patrones de automatización empresarial,
  deployment self-hosted, y mejores prácticas de Node-RED alternativo.
  Activa en: n8n, automation, workflows, webhooks, integrations, no-code, Node-RED,
  business automation, trigger based, scheduled tasks, API connections.
triggers:
  - n8n
  - automation
  - workflows
  - webhooks
  - no-code automation
  - business automation
  - integrate APIs
  - scheduled tasks
  - trigger based
tools:
  - Read
  - Write
  - Bash
  - Grep
  - Glob
  - WebFetch
  - codesearch
---

# Automatización con n8n

## Introducción

n8n es una plataforma de automatización de workflows de código abierto que permite conectar servicios, automatizar tareas y crear integrations sin código.

## Conceptos Fundamentales

### Nodos Esenciales

| Nodo | Uso |
|------|-----|
| **HTTP Request** | Llamadas a APIs externas |
| **Webhooks** | Triggers externos |
| **IF / Switch** | Condiciones y branching |
| **Function / Code** | Lógica personalizada |
| **Schedule Trigger** | Tareas programadas |
| **Webhook Trigger** | Eventos externos |
| **Transform** | Manipulación de datos |

### Tipos de Triggers

1. **Webhook** - Evento instantáneo
2. **Schedule** - Intervalo temporal (cron)
3. **Poll** - Verificación periódica
4. **Manual** - Ejecución bajo demanda

## Autenticación

### Métodos Soportados

```javascript
// Basic Auth
{
  "auth": {
    "type": "basic",
    "basic": {
      "username": "{{VAR}}",
      "password": "{{VAR}}"
    }
  }
}

// Bearer Token
{
  "headers": {
    "Authorization": "Bearer {{TOKEN}}"
  }
}

// API Key
{
  "headers": {
    "X-API-Key": "{{API_KEY}}"
  }
}

// OAuth2
{
  "auth": {
    "type": "oauth2",
    "oauth2": {
      "grantType": "authorization_code",
      "authorizationUrl": "...",
      "accessTokenUrl": "..."
    }
  }
}
```

## Patrones de Automatización

### Patrón 1: Webhook → Procesar → Responder

```
[Webhook] → [Function] → [HTTP Request] → [Respond]
```

```json
{
  "name": "webhook-processor",
  "nodes": [
    { "type": "Webhook", "parameters": { "httpMethod": "POST" } },
    { "type": "Function", "parameters": { "jsCode": "return { body: items[0].json }" } },
    { "type": "HTTP Request", "parameters": { "url": "https://api.example.com" } },
    { "type": "Respond to Webhook", "parameters": { "respondWith": "json" } }
  ]
}
```

### Patrón 2: Schedule → Fetch → Transform → Store

```
[Schedule] → [HTTP GET] → [Function] → [Database]
```

### Patrón 3: Event → Queue → Process → Notify

```
[Webhook] → [Queue] → [Function] → [Slack/Email]
```

## Manejo de Errores

### Retry Strategy

```javascript
// En Function node
try {
  const result = await makeApiCall();
  return { success: true, data: result };
} catch (error) {
  // Retry con backoff
  if (error.statusCode === 429) {
    await sleep(5000); // Wait 5s
    return await makeApiCall();
  }
  throw error;
}
```

### Error Workflow

```
[Main Workflow]
  ↓ (on error)
[Error Handler] → [Notify] → [Log]
```

## Deployment Self-Hosted

### Docker Compose

```yaml
version: '3'
services:
  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=password
      - N8N_HOST=0.0.0.0
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=https://tu-dominio.com
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  n8n_data:
```

### Configuración con Variables

| Variable | Descripción |
|----------|-------------|
| `N8N_BASIC_AUTH_ACTIVE` | Habilitar auth básica |
| `N8N_HOST` | Host del servidor |
| `N8N_PROTOCOL` | http o https |
| `EXECUTIONS_MODE` | regular o queue |
| `N8N_METRICS` | habilitar métricas |

## Integraciones Comunes

### Notificaciones

- **Slack** - Enviar mensajes a canales
- **Discord** - Webhooks para alertas
- **Telegram** - Bot notifications
- **Email (SMTP)** - Correos transaccionales

### Bases de Datos

- **PostgreSQL** - Queries directos
- **MongoDB** - Documentos
- **Redis** - Cache y queues
- **Supabase** - REST API

### APIs Externas

- **Stripe** - Pagos y subscriptions
- **Shopify** - E-commerce
- **Google Sheets** - Spreadsheets
- **Airtable** - Bases de datos visual

## Mejores Prácticas

### 1. Modularidad
- Crear workflows pequeños y reutilizables
- Usar sub-workflows para lógica compartida

### 2. Manejo de Datos
- Validar datos en cada paso
- Usar Transform nodes para clean data

### 3. Logging
- Agregar logs en puntos críticos
- Usar nodes de logging para debugging

### 4. Testing
- Probar cada branch del workflow
- Usar modo de prueba con datos pequeños

### 5. Seguridad
- No exponer credenciales en logs
- Usar credentials management de n8n
- Rotar API keys periódicamente

## Variables de Entorno

```bash
# .env para n8n
N8N_HOST=tu-dominio.com
N8N_PROTOCOL=https
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=password_fuerte
EXECUTIONS_MODE=queue
N8N_QUEUE_HEALTH_CHECK_ACTIVE=true
WEBHOOK_URL=https://tu-dominio.com
```

## Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| Timeout en HTTP Request | API lenta | Aumentar timeout o implementar retry |
| Loop infinito | Circular reference | Agregar condiciones de salida |
| Memory overflow | Datos muy grandes | Procesar en batches |
| Auth failures | Token expirado | Implementar refresh token |

## Recursos

- [Documentación oficial](https://docs.n8n.io/)
- [Templates community](https://n8n.io/workflows/)
- [Discord community](https://discord.gg/n8n)

---

**Referencia rápida**: Para crear un workflow, usa la UI de n8n y exporta como JSON para versionar en git.