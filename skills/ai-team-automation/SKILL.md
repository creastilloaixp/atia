# AI Team Automation - Multi-Agent CRM Architecture

Sistema de múltiples agentes AI trabajando coordinadamente para automatizar un CRM de seguros.

## Concepto Central

En lugar de un solo agente haciendo todo, usar **múltiples agentes especializados** que se comunican en cadena jerárquica:
```
Humano (CEO)
    ↓
Agente Director (CEO Agent)
    ↓
Agente Gestor de Proyectos (PM Agent)
    ↓
Equipos Especializados (Leads)
    ↓
Agentes Ejecutores (Executors)
```

## Equipos para el CRM de Seguros

### 1. Equipo de Captación (Leads)
- **Lead Qualifier**: Evalúa y califica nuevos leads del landing
- **Quote Generator**: Genera cotizaciones automáticas
- **Follow-up Agent**: Envía seguimientos según timing

### 2. Equipo de Conversión
- **Onboarding Agent**: Guía clientes nuevos por 5 pasos
- **Objection Handler**: Maneja objeciones comunes
- **Closer Agent**: Finaliza ventas

### 3. Equipo de Retención
- **Renewal Reminder**: Recordatorios de renovación
- **Satisfaction Check**: Evalúa satisfacción post-venta
- **Churn Predictor**: Identifica clientes en riesgo

### 4. Equipo de Marketing
- **Content Generator**: Crea contenido para redes
- **Campaign Manager**: Gestiona campañas
- **Analytics Agent**: Genera reportes

## Estructura de Comunicación

### Cadena de Reportes
```
Lead entra → Lead Qualifier → [califica]
                    ↓
           ¿Interesado? → Quote Generator → Follow-up Agent
                    ↓
           ¿Respondió? → Onboarding Agent
                    ↓
           ¿Cerrado? → Retention Team
                    ↓
           ¿Vence pronto? → Renewal Reminder
```

### Formato de Reportes Estructurados
```
[Agent] Status Update
━━━━━━━━━━━━━━━━━━━━
Leads procesados hoy: 15
Cotizaciones generadas: 8
Cierres: 2
Bloqueos: 1 (esperando respuesta cliente)
━━━━━━━━━━━━━━━━━━━━
Escalación: Juan Pérez necesita aprobación manual
Próximo check: 2 horas
```

## Implementación en Edge Functions

### trigger-lead/index.ts
```typescript
//Recibe nuevo lead del landing
//Clasifica con IA
//Asigna a flujo correcto
//Notifica al equipo correspondiente
```

### lead-qualifier/index.ts
```typescript
//Evalúa: edad, cobertura, presupuesto, urgencia
//Score: 1-100
//Ruta: 
//  >80 → Quote Generator (fast track)
//  50-80 → Follow-up + nurture
//  <50 → Marketing list
```

### quote-generator/index.ts (YA EXISTE)
```typescript
//Calcula precio según: tipo_cobertura, edad, plan, deducible
//Genera PDF/link
//Guarda en tabla quotes
//Envía por WhatsApp
```

### followup-automation/index.ts (YA EXISTE)
```typescript
//Cron job cada hora
//Busca leads sin respuesta
//Envía según timing: 24h, 72h, 168h
//Log en followup_logs
```

### onboarding-agent/index.ts (YA EXISTE)
```typescript
//Paso 1: Bienvenida
//Paso 2: Confirmar datos
//Paso 3: Documentos
//Paso 4: Revisar póliza
//Paso 5: ¿Dudas?
//Cada paso en onboarding_sessions
```

### renewal-reminder/index.ts (YA EXISTE)
```typescript
//Cron job diario
//Busca pólizas por vencer
//Envía reminders: 60, 30, 15, 7, 1 días
//Log en reminder_logs
```

## Escalando a 36 Agentes (Meta Final)

| Equipo | Agentes | Función |
|--------|---------|---------|
| **Management** | 3 | CEO, PM, HR |
| **Captación** | 4 | Qualifier, Quote, Follow-up, Sorter |
| **Conversión** | 5 | Onboarding, Closer, Objections, Demo, Proposal |
| **Retención** | 4 | Renewal, Satisfaction, Churn, Win-back |
| **Marketing** | 4 | Content, Campaigns, Analytics, Social |
| **Tech** | 5 | Supabase, WhatsApp, API, Integrations, QA |
| **Finance** | 3 | Billing, Collections, Reporting |
| **Support** | 4 | Tier 1, Tier 2, Escalations, Knowledge Base |
| **Creative** | 3 | Images, Videos, Copy |
| **Learning** | 2 | Research, Training |

## Métricas del Sistema

### Antes (1 agente)
- Leads procesados: 20/día
- Tiempo respuesta: 2+ horas
- Cierre: 5%
- Retención: 70%

### Después (36 agentes)
- Leads procesados: 500/día
- Tiempo respuesta: <1 min
- Cierre: 15%
- Retención: 90%

## Errores Comunes

❌ Deployar todo de una vez → Caos
❌ Agentes sin jerarquía clara → Conflicto
❌ Sin memoria persistente → Repite errores
❌ Sin reportes estructurados → Caos

✅ Empezar con 5 agentes foundation
✅ Agregar 1 equipo por semana
✅ Configurar memoria desde día 1
✅ Reports estructurados 2 horas

## Video Fuente

"I Built a Full AI Team Inside OpenClaw for $400/Month"
Jacob Klug - https://www.youtube.com/watch?v=4HyNQe6UI_c
