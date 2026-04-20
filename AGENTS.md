# AGENTS.md — Reglas de Coordinación Multi-Agente
# CastoProject / Atia Inmobiliaria
# Última actualización: 2026-04-20

## 🎯 PROPÓSITO
Este archivo define las reglas para todos los agentes IA (Antigravity, Claude Code, etc.)
que trabajan en este repositorio. TODOS los agentes deben leer y respetar estas reglas.

---

## 🔴 ARCHIVOS PROTEGIDOS — NO MODIFICAR SIN AUTORIZACIÓN EXPLÍCITA

### Edge Functions (Supabase) — CRÍTICAS EN PRODUCCIÓN
```
supabase/functions/evolution-webhook/index.ts   ← Adriana v4 WhatsApp CORE
supabase/functions/incoming-lead/index.ts        ← Pipeline leads landing
supabase/functions/copilot/index.ts              ← CRM Copilot
supabase/functions/send-voice-note/index.ts      ← TTS WhatsApp
supabase/functions/send-whatsapp/index.ts        ← Envío WA simple
supabase/functions/lead-followup/index.ts        ← Seguimiento automático
supabase/functions/broadcast/index.ts             ← Envío masivo
```
⚠️ Estas funciones están en PRODUCCIÓN y reciben webhooks de WhatsApp en tiempo real.
Cualquier cambio puede romper la automatización de leads activa.

### Base de datos — Migraciones
```
supabase/migrations/                             ← NUNCA eliminar migraciones existentes
```
⚠️ Las migraciones son irreversibles en producción. Solo AGREGAR, nunca modificar las existentes.

### Variables de entorno
```
.env.edge                                        ← Keys de producción (NO commitear)
crm/.env                                         ← DB y API keys del CRM
```

---

## 🟡 ARCHIVOS DE ALTO RIESGO — Coordinar antes de modificar

| Archivo | Razón |
|---------|-------|
| `src/App.tsx` | Routing principal activo en producción |
| `src/lib/leads.ts` | Lógica de captura de leads de landing |
| `api/leads.ts` | API endpoint Vercel de leads |
| `crm/src/` | CRM activo con datos reales |
| `n8n-Workflow-*.json` | Flujos de automatización n8n en producción |

---

## 🟢 ZONAS SEGURAS — Modificar libremente

```
src/components/          ← UI components (sin lógica de negocio crítica)
public/                  ← Assets estáticos
src/index.css            ← Estilos globales
scripts/                 ← Scripts de utilidad/importación
bot.txt                  ← Documentación estratégica
*.html (raíz)            ← Documentos informativos
```

---

## 📋 PROTOCOLO ANTES DE CUALQUIER SESIÓN DE REFACTOR

### Checklist obligatorio:
- [ ] `git status` — verificar rama y estado limpio
- [ ] `git pull origin main` — sincronizar con remoto
- [ ] Crear rama de feature si el cambio es grande: `git checkout -b feature/nombre`
- [ ] Identificar si el archivo está en zona ROJA o AMARILLA
- [ ] Si es ROJA → pedir confirmación explícita del usuario

### Al terminar cada sesión:
- [ ] `git add -A`
- [ ] `git commit -m "descripción clara del cambio"`
- [ ] `git push origin [rama]`

---

## 🤖 DIVISIÓN DE RESPONSABILIDADES

### Antigravity (este agente)
- ✅ Refinamiento de UI/UX (componentes, estilos, animaciones)
- ✅ Optimización de landing page
- ✅ Análisis y documentación de Edge Functions
- ✅ Migraciones nuevas de BD (previa revisión)
- ❌ NO desplegar edge functions sin verificar que no hay cambios pendientes de Claude Code

### Claude Code
- ✅ Refactoring profundo de lógica de backend
- ✅ Creación de nuevas edge functions
- ✅ Integración de nuevas APIs
- ❌ NO modificar evolution-webhook sin hacer snapshot primero
- ❌ NO eliminar campos de tablas existentes

---

## 🏗️ ESTRUCTURA DE RAMAS RECOMENDADA

```
main                    ← Producción estable (protegida)
├── feature/ui-refactor ← Cambios de UI (Antigravity)
├── feature/bot-v5      ← Nueva versión de Adriana (Claude Code)
└── hotfix/xxx          ← Correcciones urgentes
```

---

## ⚡ VARIABLES DE ENTORNO REQUERIDAS (Edge Functions)

```bash
SUPABASE_URL                    ← URL del proyecto Supabase
SUPABASE_SERVICE_ROLE_KEY       ← Key de servicio (NO anon)
EVOLUTION_API_URL               ← https://n8n-evolution-api.yxmkwr.easypanel.host
EVOLUTION_API_KEY               ← Key de Evolution API
EVOLUTION_INSTANCE              ← GRUPOATIA
GEMINI_API_KEY                  ← API key de Google Gemini
ZADARMA_KEY                     ← Key Zadarma PBX
ZADARMA_SECRET                  ← Secret Zadarma PBX
ADVISOR_PHONE                   ← 526672543464 (asesor humano handoff)
DEFAULT_ORG_ID                  ← e67404e2-d14c-44ad-9275-9b89372aa57d
```

---

## 📊 ARQUITECTURA ACTUAL (No romper)

```
WhatsApp (Evolution API)
    ↓
evolution-webhook (Edge Fn v49) ← ADRIANA v4
    ├── Anti-loop dedup
    ├── Chat memory (Supabase: chat_memory)
    ├── RAG: match_properties_semantic (vector 3072d)
    ├── Gemini-2.5-Flash (texto + audio + imágenes)
    ├── Lead extraction + scoring A/B/C
    ├── Handoff automático → asesor humano (cat. A)
    └── CRM sync (leads + conversations)

Landing Page (Vercel)
    ↓
incoming-lead (Edge Fn v19)
    ├── Validación + dedup
    ├── Save leads + corretaje_requests
    ├── WhatsApp welcome
    └── Zadarma callback (llamada automática)

CRM (localhost:5173 / Supabase)
    ↓
copilot (Edge Fn v5)
    ├── Context CRM (leads, conversaciones)
    ├── Acciones: send_whatsapp, send_voice_note, update_status, create_task
    └── Gemini-2.5-Flash multimodal
```
