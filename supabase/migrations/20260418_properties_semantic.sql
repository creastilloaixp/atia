-- =============================================================================
-- properties: Inventario unificado con embeddings para RAG (Adriana v4)
-- Fuentes: INV. ATIA (propias) + CORRETAJE (brokers)
-- =============================================================================

-- Habilitar pgvector si no existe
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Clasificación
  source TEXT NOT NULL CHECK (source IN ('inventario_atia', 'corretaje')),
  property_type TEXT NOT NULL,         -- Casa, Departamento, Terreno, Local, Bodega...
  operation TEXT NOT NULL,             -- Venta, Renta
  city TEXT DEFAULT 'Culiacán',
  sector TEXT,
  colonia TEXT,

  -- Precio
  price NUMERIC,
  price_currency TEXT DEFAULT 'MXN',

  -- Detalles (corretaje)
  bedrooms NUMERIC,
  bathrooms NUMERIC,
  parking_spots NUMERIC,
  has_pool BOOLEAN DEFAULT false,
  is_private BOOLEAN DEFAULT false,
  is_furnished BOOLEAN DEFAULT false,
  extra_features TEXT,

  -- Links y referencias (inventario ATIA)
  address TEXT,
  location_url TEXT,
  images_url TEXT,
  lamudi_url TEXT,
  tokko_url TEXT,
  wiggot_url TEXT,
  wiggot_id TEXT,
  internal_code TEXT,
  expediente TEXT,

  -- Corretaje extras
  broker_name TEXT,
  broker_phone TEXT,
  commission_pct TEXT,
  drive_link TEXT,

  -- RAG: texto plano para búsqueda + embedding
  content TEXT NOT NULL,               -- Descripción textual completa para RAG
  embedding vector(3072),               -- Gemini embedding-001 = 768 dims

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_properties_embedding
  ON properties USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10);

CREATE INDEX IF NOT EXISTS idx_properties_source ON properties (source);
CREATE INDEX IF NOT EXISTS idx_properties_operation ON properties (operation);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties (city);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties (property_type);

-- RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access on properties"
  ON properties FOR SELECT USING (true);

CREATE POLICY "Service role full access on properties"
  ON properties FOR ALL USING (true) WITH CHECK (true);

-- =============================================================================
-- Función RPC para búsqueda semántica (usada por evolution-webhook)
-- =============================================================================
CREATE OR REPLACE FUNCTION match_properties_semantic(
  query_embedding vector(3072),
  match_threshold float DEFAULT 0.55,
  match_count int DEFAULT 3
)
RETURNS TABLE (
  id UUID,
  property_type TEXT,
  operation TEXT,
  sector TEXT,
  colonia TEXT,
  city TEXT,
  price NUMERIC,
  bedrooms NUMERIC,
  bathrooms NUMERIC,
  content TEXT,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.property_type,
    p.operation,
    p.sector,
    p.colonia,
    p.city,
    p.price,
    p.bedrooms,
    p.bathrooms,
    p.content,
    1 - (p.embedding <=> query_embedding) AS similarity
  FROM properties p
  WHERE 1 - (p.embedding <=> query_embedding) > match_threshold
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
