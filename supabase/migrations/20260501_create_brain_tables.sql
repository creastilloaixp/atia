-- =============================================
-- ADRIANA BRAIN — Session Memory & Analytics
-- Tablas para el cerebro universal de Adriana
-- Soporta: Landing, WhatsApp, CRM, Redes Sociales
-- =============================================

-- 1. BRAIN SESSIONS: Memoria conversacional por sesión
CREATE TABLE IF NOT EXISTS public.brain_sessions (
  session_id text PRIMARY KEY,
  
  -- Conversación almacenada como JSON array
  -- [{ "role": "user", "content": "..." }, { "role": "assistant", "content": "..." }]
  messages jsonb DEFAULT '[]'::jsonb,
  
  -- Metadata del canal
  channel text DEFAULT 'landing',       -- landing | whatsapp | crm | social
  role text DEFAULT 'general',           -- capacitadora | vendedora | reclutadora | copilot | general
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices para queries frecuentes
CREATE INDEX IF NOT EXISTS idx_brain_sessions_channel ON public.brain_sessions (channel);
CREATE INDEX IF NOT EXISTS idx_brain_sessions_updated ON public.brain_sessions (updated_at DESC);

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_brain_sessions_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_brain_sessions_timestamp
  BEFORE UPDATE ON public.brain_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_brain_sessions_timestamp();

-- RLS
ALTER TABLE public.brain_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON public.brain_sessions
  FOR ALL USING (true) WITH CHECK (true);

-- Limpiar sesiones inactivas > 7 días (ejecutar via cron)
-- DELETE FROM brain_sessions WHERE updated_at < now() - interval '7 days';


-- 2. BRAIN ANALYTICS: Registro de cada interacción para análisis
CREATE TABLE IF NOT EXISTS public.brain_analytics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  
  session_id text,
  channel text,                          -- landing | whatsapp | crm | social
  role text,                             -- capacitadora | vendedora | reclutadora | copilot | general
  
  -- Contenido (truncado a 500 chars para no inflar la BD)
  user_message text,
  ai_response text,
  
  -- Metadata
  org_id uuid DEFAULT 'e67404e2-d14c-44ad-9275-9b89372aa57d'::uuid,
  tokens_used integer,
  
  created_at timestamptz DEFAULT now()
);

-- Índices para dashboards y reportes
CREATE INDEX IF NOT EXISTS idx_brain_analytics_channel ON public.brain_analytics (channel);
CREATE INDEX IF NOT EXISTS idx_brain_analytics_role ON public.brain_analytics (role);
CREATE INDEX IF NOT EXISTS idx_brain_analytics_created ON public.brain_analytics (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_brain_analytics_session ON public.brain_analytics (session_id);

-- RLS
ALTER TABLE public.brain_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON public.brain_analytics
  FOR ALL USING (true) WITH CHECK (true);

-- Comentarios
COMMENT ON TABLE public.brain_sessions IS 'Memoria conversacional de Adriana por sesión. Cada sesión mantiene hasta 20 mensajes recientes.';
COMMENT ON TABLE public.brain_analytics IS 'Log de todas las interacciones con Adriana para análisis, métricas y mejora continua.';
