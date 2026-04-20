-- =============================================================================
-- Cron: Lead Follow-up Automático — cada hora
-- Ejecutar CADA BLOQUE por separado en Supabase SQL Editor
-- =============================================================================

-- ══════════════════════════════════════════════════════════════════════════════
-- BLOQUE 1: Habilitar extensiones necesarias
-- ══════════════════════════════════════════════════════════════════════════════
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- ══════════════════════════════════════════════════════════════════════════════
-- BLOQUE 2: Programar el cron job (cada hora en punto)
-- ══════════════════════════════════════════════════════════════════════════════
SELECT cron.schedule(
  'lead-followup-hourly',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://vjdlndntsmzoxggtruot.supabase.co/functions/v1/lead-followup'::text,
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqZGxuZG50c216b3hnZ3RydW90Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzE1NTYxNCwiZXhwIjoyMDgyNzMxNjE0fQ.EBcrUcApmzerJAbtBMkVz_n40pjuwbNJiVrYwE6CT2k"}'::jsonb,
    body := '{"source": "pg_cron"}'::jsonb
  );
  $$
);

-- ══════════════════════════════════════════════════════════════════════════════
-- VERIFICAR: Ejecuta esto para confirmar que el cron quedó registrado
-- ══════════════════════════════════════════════════════════════════════════════
-- SELECT jobid, jobname, schedule, command FROM cron.job;
