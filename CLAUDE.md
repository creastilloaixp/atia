# CastoProject / Atia Inmobiliaria — Instrucciones para Claude Code

## ⚠️ LEER ANTES DE CUALQUIER ACCIÓN

Este proyecto tiene **automatizaciones en producción** con clientes reales.
Un error en las edge functions puede romper la captación de leads en tiempo real.

---

## 🔴 ZONAS PROHIBIDAS — NO TOCAR

```bash
# Edge Functions en PRODUCCIÓN (reciben webhooks de WhatsApp ahora mismo)
supabase/functions/evolution-webhook/    # Adriana AI v4 — CORE del negocio
supabase/functions/incoming-lead/        # Pipeline leads desde landing
supabase/functions/copilot/              # CRM AI assistant
supabase/functions/send-voice-note/      # TTS WhatsApp
supabase/functions/lead-followup/        # Followup automático
supabase/functions/broadcast/            # Envío masivo

# Base de datos
supabase/migrations/                     # SOLO agregar, NUNCA modificar existentes
```

**Protocolo para modificar una edge function:**
1. Hacer `git commit` del estado actual primero
2. Modificar SOLO la función necesaria (no otras)
3. Probar localmente con `supabase functions serve`
4. Hacer commit descriptivo antes de deploy
5. Informar a Antigravity del cambio

---

## 🟡 ALTO RIESGO — Coordinar primero

- `src/App.tsx` — Routing principal activo
- `src/lib/leads.ts` — Lógica de leads en landing
- `api/leads.ts` — API de Vercel activa
- `n8n-Workflow-*.json` — Flujos n8n en producción

---

## 🏗️ Stack del proyecto

- **Frontend**: React 19 + Vite + TypeScript + Tailwind CSS
- **Backend**: Supabase (Postgres + Edge Functions + Auth)
- **WhatsApp**: Evolution API (instancia: GRUPOATIA)
- **AI**: Gemini-2.5-Flash (texto + audio + imágenes)
- **RAG**: Embeddings vector(3072) con `match_properties_semantic`
- **PBX**: Zadarma (callback automático)
- **Deploy**: Vercel (frontend) + Supabase (edge functions)

---

## 📦 Supabase Project

```
Project ID: vjdlndntsmzoxggtruot
Project:    Inmobiliaria
Region:     us-west-2
URL:        https://vjdlndntsmzoxggtruot.supabase.co
```

---

## 🗄️ Tablas críticas (con RLS)

```sql
leads               -- CRM principal de leads
conversations       -- Inbox WhatsApp por lead
chat_memory         -- Memoria conversacional Adriana
properties          -- Inventario inmobiliario con embeddings
corretaje_requests  -- Solicitudes de corretaje
ai_conversation_context -- Control handoff bot→humano
tasks               -- Tareas del CRM
```

---

## ⚡ Variables de entorno (NUNCA hardcodear)

```bash
# Supabase (en edge functions: Deno.env.get)
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_ANON_KEY

# WhatsApp
EVOLUTION_API_URL=https://n8n-evolution-api.yxmkwr.easypanel.host
EVOLUTION_API_KEY
EVOLUTION_INSTANCE=GRUPOATIA

# AI
GEMINI_API_KEY

# PBX
ZADARMA_KEY
ZADARMA_SECRET
ZADARMA_FROM=105

# Business
ADVISOR_PHONE=526672543464
DEFAULT_ORG_ID=e67404e2-d14c-44ad-9275-9b89372aa57d
```

---

## 🔄 Flujo de trabajo seguro

```bash
# Antes de empezar
git status
git pull origin main

# Durante el trabajo
git add [archivos específicos]
git commit -m "feat: descripción clara"

# Al terminar
git push origin main
```

---

## 🤝 Coordinación con Antigravity

- Antigravity maneja: UI, animaciones, landing, componentes React
- Claude Code maneja: backend, edge functions, migraciones, integraciones
- Si hay duda sobre responsabilidad → preguntar al usuario

---

## 📌 Notas importantes

- El `ORG_ID` hardcodeado en edge functions es `e67404e2-d14c-44ad-9275-9b89372aa57d` — No cambiar sin actualizar todas las funciones
- El sistema de anti-loop en `evolution-webhook` usa memoria en-proceso (Set/Map) — No mover a DB sin pruebas extensas
- La vectorización usa `gemini-embedding-001` con 3072 dims — Cambiar el modelo rompe el RAG
