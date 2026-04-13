-- =============================================================================
-- Casto Inmobiliaria — Sistema de Corretaje Inteligente
-- Supabase Migration: 003_brokerage_system.sql
-- =============================================================================

-- 1. broker_registry — Directorio de asesores externos y aliados
CREATE TABLE IF NOT EXISTS broker_registry (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL, -- Formato: 526671234567
  email TEXT,
  agency_name TEXT,
  is_aisin_member BOOLEAN DEFAULT false,
  shares_commission BOOLEAN DEFAULT true,
  commission_percentage NUMERIC(3,2) DEFAULT 2.50, -- Porcentaje estándar
  status TEXT DEFAULT 'active', -- active, blacklisted, inactive
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_broker_registry_phone ON broker_registry(phone);
CREATE INDEX idx_broker_registry_status ON broker_registry(status);

-- 2. brokerage_inventory — Propiedades encontradas en plataformas (Wiggot, FB, etc.)
CREATE TABLE IF NOT EXISTS brokerage_inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  broker_id UUID REFERENCES broker_registry(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- wiggot, lamudi, facebook, whatsapp
  external_id TEXT, -- ID en la plataforma original
  property_type TEXT NOT NULL, -- casa, departamento, terreno, oficina
  operation_type TEXT NOT NULL, -- venta, renta
  price NUMERIC(15,2) NOT NULL,
  currency TEXT DEFAULT 'MXN',
  city TEXT NOT NULL,
  sector TEXT, -- Colonia o Fraccionamiento
  description TEXT,
  images JSONB DEFAULT '[]',
  external_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_brokerage_inv_price ON brokerage_inventory(price);
CREATE INDEX idx_brokerage_inv_location ON brokerage_inventory(city, sector);

-- 3. lead_matches — Vinculacion inteligente Lead <-> Propiedad
CREATE TABLE IF NOT EXISTS lead_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL, -- Referencia al lead entrante (si usas la tabla de leads)
  property_id UUID REFERENCES brokerage_inventory(id) ON DELETE CASCADE,
  match_score NUMERIC(5,2), -- Generado por Gemini (0-100)
  status TEXT DEFAULT 'suggested', -- suggested, sent_to_client, visited, sold, discarded
  ai_analysis TEXT, -- Explicación de por qué es buen match
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS permisivo para service role (n8n/Edge Functions)
ALTER TABLE broker_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE brokerage_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all" ON broker_registry FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON brokerage_inventory FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON lead_matches FOR ALL USING (true) WITH CHECK (true);
