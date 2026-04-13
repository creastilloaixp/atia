-- =============================================================================
-- creastilo AI XPERIENCE — Marketing Automation System
-- Supabase Migration: 001_marketing_automation.sql
-- =============================================================================
-- Tablas: agency_clients, campaigns, campaign_posts, campaign_templates,
--         content_queue, repurpose_sources
-- =============================================================================

-- 1. agency_clients — Gestion de clientes de la agencia
CREATE TABLE IF NOT EXISTS agency_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  business_name TEXT,
  industry TEXT NOT NULL, -- inmobiliaria, ecommerce, servicios, restaurante, etc.
  whatsapp TEXT, -- formato: 526671326265
  email TEXT,
  website TEXT,
  social_accounts JSONB DEFAULT '{}', -- {"instagram": "@handle", "facebook": "url", ...}
  package TEXT NOT NULL DEFAULT 'auto-post', -- auto-post, campana-ai, marketing-automatico
  monthly_price_mxn NUMERIC(10,2),
  status TEXT NOT NULL DEFAULT 'active', -- active, paused, cancelled
  onboarded_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agency_clients_status ON agency_clients(status);
CREATE INDEX idx_agency_clients_industry ON agency_clients(industry);

-- 2. campaigns — Metadata de campanas de marketing
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES agency_clients(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  product_or_service TEXT NOT NULL, -- "Reaper Bomber Jacket", "Departamento en Polanco"
  description TEXT,
  industry TEXT NOT NULL,
  template_id UUID, -- referencia a campaign_templates
  duration_days INT NOT NULL DEFAULT 30,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  target_audience TEXT, -- "Jovenes 25-35 CDMX interesados en moda streetwear"
  tone TEXT DEFAULT 'profesional', -- profesional, casual, divertido, formal
  language TEXT DEFAULT 'es-MX',
  cta_whatsapp TEXT DEFAULT 'wa.me/526671326265',
  platforms JSONB DEFAULT '["facebook","instagram","x","linkedin"]',
  content_mix JSONB DEFAULT '{"educativo":40,"promocional":30,"social_proof":20,"behind_scenes":10}',
  total_posts INT DEFAULT 0,
  posts_published INT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'generating', -- generating, active, paused, completed, failed
  generated_by TEXT DEFAULT 'gemini-2.0-flash', -- modelo AI usado
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_campaigns_client ON campaigns(client_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_dates ON campaigns(start_date, end_date);

-- 3. campaign_posts — Posts individuales de una campana
CREATE TABLE IF NOT EXISTS campaign_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  day_number INT NOT NULL, -- dia 1-30
  post_type TEXT NOT NULL, -- educativo, promocional, social_proof, behind_scenes
  caption TEXT NOT NULL,
  caption_x TEXT, -- version corta para X (280 chars max)
  caption_linkedin TEXT, -- version larga para LinkedIn
  caption_instagram TEXT, -- con hashtags
  caption_facebook TEXT,
  image_prompt TEXT, -- prompt para Gemini Imagen 3
  image_url TEXT, -- URL de imagen generada (Supabase Storage)
  image_base64 TEXT, -- base64 temporal durante generacion
  video_url TEXT, -- si aplica (Fase 2: JSON2Video)
  platforms JSONB DEFAULT '["facebook","instagram","x","linkedin"]',
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL DEFAULT '10:00:00', -- hora CST
  blotato_post_id TEXT, -- ID retornado por Blotato API
  status TEXT NOT NULL DEFAULT 'pending', -- pending, scheduled, posted, failed
  engagement JSONB DEFAULT '{}', -- {"likes": 0, "comments": 0, "shares": 0}
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_campaign_posts_campaign ON campaign_posts(campaign_id);
CREATE INDEX idx_campaign_posts_status ON campaign_posts(status);
CREATE INDEX idx_campaign_posts_schedule ON campaign_posts(scheduled_date, scheduled_time);
CREATE INDEX idx_campaign_posts_date_status ON campaign_posts(scheduled_date, status);

-- 4. campaign_templates — Templates reutilizables por industria
CREATE TABLE IF NOT EXISTS campaign_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT NOT NULL, -- inmobiliaria, ecommerce, servicios
  description TEXT,
  duration_days INT NOT NULL DEFAULT 30,
  content_structure JSONB NOT NULL, -- calendario de temas dia por dia
  -- Ejemplo content_structure:
  -- [
  --   {"day": 1, "type": "educativo", "theme": "intro_marca", "time": "10:00"},
  --   {"day": 2, "type": "social_proof", "theme": "testimonial", "time": "13:00"},
  --   ...
  -- ]
  prompt_template TEXT NOT NULL, -- prompt base para Gemini
  image_style TEXT DEFAULT 'profesional', -- estilo visual default
  hashtag_sets JSONB DEFAULT '{}', -- {"educativo": ["#tip","#aprende"], ...}
  cta_templates JSONB DEFAULT '{}', -- CTAs por tipo de post
  is_active BOOLEAN DEFAULT true,
  usage_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_campaign_templates_industry ON campaign_templates(industry);
CREATE INDEX idx_campaign_templates_active ON campaign_templates(is_active);

-- 5. repurpose_sources — URLs/canales a monitorear (antes de content_queue por FK)
CREATE TABLE IF NOT EXISTS repurpose_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES agency_clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- "Canal YouTube de Juan"
  source_type TEXT NOT NULL, -- youtube_channel, youtube_playlist, blog_rss, podcast_rss
  source_url TEXT NOT NULL, -- URL del canal/blog/podcast
  source_identifier TEXT, -- YouTube channel ID, RSS feed URL
  check_interval_hours INT DEFAULT 6,
  last_checked_at TIMESTAMPTZ,
  last_content_id TEXT, -- ultimo video/articulo procesado (para detectar nuevos)
  output_platforms JSONB DEFAULT '["facebook","instagram","x","linkedin"]',
  transform_instructions TEXT, -- instrucciones especiales para Gemini
  is_active BOOLEAN DEFAULT true,
  total_items_processed INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_repurpose_sources_client ON repurpose_sources(client_id);
CREATE INDEX idx_repurpose_sources_active ON repurpose_sources(is_active);
CREATE INDEX idx_repurpose_sources_type ON repurpose_sources(source_type);

-- 6. content_queue — Cola de contenido repurposeado
CREATE TABLE IF NOT EXISTS content_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID REFERENCES repurpose_sources(id) ON DELETE SET NULL,
  client_id UUID REFERENCES agency_clients(id) ON DELETE SET NULL,
  original_url TEXT, -- URL del contenido original
  original_title TEXT,
  original_type TEXT, -- youtube_video, blog_post, podcast_episode
  platform TEXT NOT NULL, -- facebook, instagram, x, linkedin, tiktok
  caption TEXT NOT NULL,
  image_url TEXT,
  image_prompt TEXT,
  scheduled_date DATE,
  scheduled_time TIME DEFAULT '10:00:00',
  blotato_post_id TEXT,
  priority INT DEFAULT 5, -- 1=urgente, 5=normal, 10=baja
  status TEXT NOT NULL DEFAULT 'pending', -- pending, scheduled, posted, failed, skipped
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_content_queue_status ON content_queue(status);
CREATE INDEX idx_content_queue_schedule ON content_queue(scheduled_date, scheduled_time);
CREATE INDEX idx_content_queue_platform ON content_queue(platform);
CREATE INDEX idx_content_queue_source ON content_queue(source_id);

-- =============================================================================
-- Row Level Security (RLS) — habilitado pero permisivo para service role
-- =============================================================================

ALTER TABLE agency_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE repurpose_sources ENABLE ROW LEVEL SECURITY;

-- Politicas permisivas para service_role (n8n usa service key)
CREATE POLICY "service_role_all" ON agency_clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON campaigns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON campaign_posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON campaign_templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON content_queue FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON repurpose_sources FOR ALL USING (true) WITH CHECK (true);

-- Politicas para anon (lectura de templates publicos)
CREATE POLICY "anon_read_templates" ON campaign_templates FOR SELECT USING (is_active = true);

-- =============================================================================
-- Triggers para updated_at automatico
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_agency_clients_updated
  BEFORE UPDATE ON agency_clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_campaigns_updated
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_campaign_posts_updated
  BEFORE UPDATE ON campaign_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_campaign_templates_updated
  BEFORE UPDATE ON campaign_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_content_queue_updated
  BEFORE UPDATE ON content_queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_repurpose_sources_updated
  BEFORE UPDATE ON repurpose_sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- Nota: Ejecutar en Supabase SQL Editor en este orden:
-- 1. Primero crear repurpose_sources (content_queue tiene FK a ella)
-- 2. Luego el resto de tablas
-- O simplemente ejecutar este archivo completo — los IF NOT EXISTS previenen errores
-- =============================================================================
