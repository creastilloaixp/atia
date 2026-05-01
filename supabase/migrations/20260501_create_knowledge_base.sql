-- =============================================
-- KNOWLEDGE BASE TABLE (Obsidian Integration)
-- Almacena el contenido de los archivos .md
-- sincronizados desde Obsidian vía GitHub Webhook
-- =============================================

CREATE TABLE IF NOT EXISTS public.knowledge_base (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Identificación del archivo
  file_path text UNIQUE NOT NULL,           -- 'Ventas.md', 'Rentas/Requisitos.md'
  topic text NOT NULL,                       -- Categoría extraída: 'Ventas', 'Rentas', etc.
  
  -- Contenido
  content text NOT NULL,                     -- El Markdown completo del archivo
  
  -- Metadata
  org_id uuid DEFAULT 'e67404e2-d14c-44ad-9275-9b89372aa57d'::uuid,
  repo_name text,                            -- 'ATIA-Obsidian'
  commit_sha text,                           -- SHA del commit que lo actualizó
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índice para búsquedas rápidas por topic
CREATE INDEX IF NOT EXISTS idx_knowledge_base_topic ON public.knowledge_base (topic);

-- Índice para filtrar por organización
CREATE INDEX IF NOT EXISTS idx_knowledge_base_org ON public.knowledge_base (org_id);

-- RLS: Habilitar Row Level Security
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- Policy: Las Edge Functions (service_role) pueden leer y escribir
CREATE POLICY "Service role full access" ON public.knowledge_base
  FOR ALL USING (true) WITH CHECK (true);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_knowledge_base_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_knowledge_base_timestamp
  BEFORE UPDATE ON public.knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION update_knowledge_base_timestamp();

-- Comentarios descriptivos
COMMENT ON TABLE public.knowledge_base IS 'Base de conocimiento sincronizada desde Obsidian para alimentar a Adriana IA';
COMMENT ON COLUMN public.knowledge_base.file_path IS 'Ruta del archivo .md en la bóveda de Obsidian';
COMMENT ON COLUMN public.knowledge_base.content IS 'Contenido Markdown completo del archivo';
COMMENT ON COLUMN public.knowledge_base.topic IS 'Categoría del servicio: Ventas, Rentas, Inversiones, etc.';
