-- =============================================================================
-- chat_memory: Conversation history for WhatsApp AI Agent (Adriana)
-- Used by: evolution-webhook edge function
-- =============================================================================

CREATE TABLE IF NOT EXISTS chat_memory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'model')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Fast lookups by phone + chronological order
CREATE INDEX IF NOT EXISTS idx_chat_memory_phone_created
  ON chat_memory (phone, created_at DESC);

-- Auto-cleanup: messages older than 7 days
-- Run via pg_cron or Supabase scheduled function
-- SELECT cron.schedule('cleanup-chat-memory', '0 3 * * *', $$
--   DELETE FROM chat_memory WHERE created_at < now() - interval '7 days';
-- $$);

-- RLS: only service_role can access (edge functions use service_role key)
ALTER TABLE chat_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on chat_memory"
  ON chat_memory
  FOR ALL
  USING (true)
  WITH CHECK (true);
