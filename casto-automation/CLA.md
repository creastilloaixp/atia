# CLA.md — Casto Automation System

## Project Overview

**Casto Automation** es un sistema de automatización de ventas para Casto Inmobiliaria. Su objetivo es encontrar automáticamente propiedades con problemas financieros (deuda, embargo, herencia, divorcio) y contactar a los propietarios mediante llamadas de voz AI y emails automatizados.

## Tech Stack

- **Backend**: Node.js/TypeScript + Express
- **Database**: Supabase (PostgreSQL)
- **Voice AI**: VAPI (voice calls)
- **Email**: Resend (cold emails)
- **Queue**: BullMQ + Redis (job processing)
- **Crawler**: Puppeteer + Python scripts
- **AI Assistant**: Claude Code como engineering collaborator

## Database Schema

```sql
-- Leads table
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20),
  email VARCHAR(255),
  name VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  property_type VARCHAR(50),
  debt_type VARCHAR(50), -- 'deuda', 'embargo', 'herencia', 'divorcio'
  debt_amount DECIMAL,
  status VARCHAR(50) DEFAULT 'new', -- 'new', 'queued', 'called', 'emailed', 'contacted', 'appointment', 'closed', 'unreachable'
  source VARCHAR(100), -- 'crawler', 'manual', 'referral'
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Activity log
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id),
  action VARCHAR(100), -- 'call_started', 'call_ended', 'email_sent', 'appointment_booked'
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Folder Structure

```
casto-automation/
├── src/
│   ├── crawler/         # Google Maps & portal scrapers
│   ├── voice-ai/        # VAPI integration
│   ├── integrations/    # Resend, Supabase clients
│   ├── orchestrator/     # Main pipeline logic
│   └── index.ts          # Entry point
├── knowledge-base/       # AI agent configs
├── db/                   # SQL migrations
└── package.json
```

## Pipeline Flow

1. **Crawler** → Encuentra propiedades con deuda → Guarda en Supabase (status: 'new')
2. **Orchestrator** → Cada 5 min revisa leads 'new' → Los pone en cola
3. **Queue** → Procesa cada lead → Decide: call or email
4. **Voice AI** → Si tiene teléfono: Llama con VAPI (status: 'called')
5. **Email** → Si no tiene teléfono: Envía email con Resend (status: 'emailed')
6. **Webhook** → Recibe resultado de VAPI/Resend → Actualiza status

## Test Mode

- `TEST_MODE=true` → Todas las llamadas/emails van a números/emails de prueba
- Located in `.env` file

## Coding Conventions

- TypeScript strict mode
- ESLint + Prettier
- Environment variables in `.env`
- All secrets in `.env` (never commit)

## Contact Info

- Website: castosearch.com
- Phone: (667) 454-0164
- Email: hola@atia.mx
- Location: Culiacán, Sinaloa