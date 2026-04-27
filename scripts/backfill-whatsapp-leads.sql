-- =============================================================================
-- BACKFILL: sincronizar todos los teléfonos de WhatsApp (chat_memory) al CRM
-- =============================================================================
-- Qué hace:
--   1. Crea un lead skeleton en `leads` para cada `phone` distinto en
--      `chat_memory` que aún no tenga registro en `leads` (org Atia).
--   2. Inserta en `conversations` cada mensaje histórico de `chat_memory`
--      preservando el `created_at` original, marcando `is_bot` cuando role=model.
--   3. Es 100% idempotente — re-correr no duplica leads ni mensajes.
--
-- Cómo correr:
--   Pegar todo este archivo en Supabase Studio → SQL Editor → Run.
--   También se puede ejecutar via psql con SERVICE_ROLE_KEY.
-- =============================================================================

DO $backfill$
DECLARE
  v_org_id CONSTANT UUID := 'e67404e2-d14c-44ad-9275-9b89372aa57d';
  v_phone TEXT;
  v_first_seen TIMESTAMPTZ;
  v_is_lid BOOLEAN;
  v_real_phone TEXT;
  v_last4 TEXT;
  v_lead_name TEXT;
  v_leads_created INT := 0;
  v_msgs_synced INT := 0;
BEGIN
  -- ───────────────────────────────────────────────────────────────────────
  -- 1) Lead skeleton para cada teléfono nuevo
  -- ───────────────────────────────────────────────────────────────────────
  FOR v_phone, v_first_seen IN
    SELECT cm.phone, MIN(cm.created_at)
    FROM chat_memory cm
    WHERE NOT EXISTS (
      SELECT 1 FROM leads l
      WHERE l.whatsapp = cm.phone AND l.org_id = v_org_id
    )
    GROUP BY cm.phone
  LOOP
    -- Detectar LID (id de WhatsApp opaco) vs número real
    v_is_lid := v_phone !~ '^[0-9]+$';
    v_real_phone := CASE WHEN v_is_lid THEN NULL ELSE v_phone END;

    -- Nombre fallback "Cliente <últimos 4 dígitos>" o "Cliente WA <últimos 4>" para LIDs
    v_last4 := COALESCE(NULLIF(RIGHT(REGEXP_REPLACE(v_phone, '[^0-9]', '', 'g'), 4), ''), '0000');
    v_lead_name := CASE WHEN v_is_lid THEN 'Cliente WA ' ELSE 'Cliente ' END || v_last4;

    INSERT INTO leads (
      org_id, full_name, name, whatsapp, phone, city, status,
      vertical, source, lead_score, created_at, metadata
    ) VALUES (
      v_org_id,
      v_lead_name,
      v_lead_name,
      v_phone,
      v_real_phone,
      'Culiacán',
      'new',
      'inmobiliaria',
      'whatsapp_adriana_backfill',
      10,
      v_first_seen,
      jsonb_build_object(
        'campaign', 'adriana_whatsapp',
        'skeleton', true,
        'backfilled', true,
        'backfilled_at', NOW(),
        'is_lid', v_is_lid,
        'whatsapp_lid', CASE WHEN v_is_lid THEN v_phone ELSE NULL END
      )
    );
    v_leads_created := v_leads_created + 1;
  END LOOP;

  -- ───────────────────────────────────────────────────────────────────────
  -- 2) Sincronizar mensajes históricos a `conversations`
  -- ───────────────────────────────────────────────────────────────────────
  -- message_id determinístico = 'chatmem_' || cm.id  → garantiza idempotencia.
  -- Usamos NOT EXISTS en lugar de ON CONFLICT porque idx_conversations_message_id
  -- es un índice UNIQUE parcial (WHERE message_id IS NOT NULL) que requeriría
  -- predicado coincidente en ON CONFLICT.
  WITH inserted AS (
    INSERT INTO conversations (
      lead_id, org_id, direction, content, is_bot, message_id, created_at
    )
    SELECT
      l.id,
      v_org_id,
      CASE WHEN cm.role = 'user' THEN 'inbound' ELSE 'outbound' END,
      cm.content,
      cm.role = 'model',
      'chatmem_' || cm.id,
      cm.created_at
    FROM chat_memory cm
    JOIN leads l ON l.whatsapp = cm.phone AND l.org_id = v_org_id
    WHERE NOT EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.message_id = 'chatmem_' || cm.id
    )
    RETURNING 1
  )
  SELECT COUNT(*) INTO v_msgs_synced FROM inserted;

  RAISE NOTICE '────────────────────────────────────────';
  RAISE NOTICE 'BACKFILL COMPLETO';
  RAISE NOTICE 'Leads skeleton creados: %', v_leads_created;
  RAISE NOTICE 'Mensajes sincronizados: %', v_msgs_synced;
  RAISE NOTICE '────────────────────────────────────────';
END $backfill$;

-- ───────────────────────────────────────────────────────────────────────
-- Verificación post-backfill (corre estas queries para confirmar)
-- ───────────────────────────────────────────────────────────────────────
-- Total de leads del backfill:
--   SELECT COUNT(*) FROM leads
--   WHERE source = 'whatsapp_adriana_backfill'
--     AND org_id = 'e67404e2-d14c-44ad-9275-9b89372aa57d';
--
-- Phones en chat_memory que aún NO tienen lead (debería ser 0):
--   SELECT COUNT(DISTINCT cm.phone) FROM chat_memory cm
--   LEFT JOIN leads l ON l.whatsapp = cm.phone
--     AND l.org_id = 'e67404e2-d14c-44ad-9275-9b89372aa57d'
--   WHERE l.id IS NULL;
--
-- Últimos 10 leads creados (para revisar en el inbox):
--   SELECT id, name, whatsapp, phone, source, created_at
--   FROM leads
--   WHERE source = 'whatsapp_adriana_backfill'
--   ORDER BY created_at DESC
--   LIMIT 10;
