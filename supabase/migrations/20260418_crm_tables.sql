-- =============================================================================
-- CRM Tables for landing-pro-app Inbox (WhatsApp + AI Agent)
-- Target: vjdlndntsmzoxggtruot.supabase.co
-- =============================================================================

-- 1. Organizations
CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Org Members (auth-based access)
CREATE TABLE IF NOT EXISTS org_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, user_id)
);

-- 3. Ensure leads table has CRM-compatible columns
-- The leads table already exists, add missing columns
DO $$
BEGIN
  -- Add 'name' as alias column if not exists (CRM uses 'name', existing uses 'full_name')
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='name') THEN
    ALTER TABLE leads ADD COLUMN name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='phone') THEN
    ALTER TABLE leads ADD COLUMN phone TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='city') THEN
    ALTER TABLE leads ADD COLUMN city TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='plan') THEN
    ALTER TABLE leads ADD COLUMN plan TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='coverage_type') THEN
    ALTER TABLE leads ADD COLUMN coverage_type TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='age_range') THEN
    ALTER TABLE leads ADD COLUMN age_range TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='deductible') THEN
    ALTER TABLE leads ADD COLUMN deductible TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='value_estimate') THEN
    ALTER TABLE leads ADD COLUMN value_estimate NUMERIC;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='lead_score') THEN
    ALTER TABLE leads ADD COLUMN lead_score INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='updated_at') THEN
    ALTER TABLE leads ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- Sync full_name -> name for existing rows
UPDATE leads SET name = full_name WHERE name IS NULL AND full_name IS NOT NULL;
UPDATE leads SET phone = whatsapp WHERE phone IS NULL AND whatsapp IS NOT NULL;

-- 4. Conversations (WhatsApp messages — the Inbox core)
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  org_id UUID NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  content TEXT NOT NULL,
  is_bot BOOLEAN DEFAULT false,
  message_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_message_id
  ON conversations (message_id) WHERE message_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conversations_lead_id ON conversations (lead_id, created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_org_id ON conversations (org_id);

-- 5. AI Conversation Context (bot active/handed_off per lead)
CREATE TABLE IF NOT EXISTS ai_conversation_context (
  lead_id UUID PRIMARY KEY REFERENCES leads(id) ON DELETE CASCADE,
  org_id UUID NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'handed_off')),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. AI Agent Logs (real-time monitoring in Inbox)
CREATE TABLE IF NOT EXISTS ai_agent_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  org_id UUID NOT NULL,
  step TEXT NOT NULL,
  message TEXT,
  intent TEXT,
  extracted_data JSONB,
  confidence NUMERIC,
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_agent_logs_lead ON ai_agent_logs (lead_id, created_at);

-- 7. Appointments (calendar)
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  org_id UUID NOT NULL,
  title TEXT,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  status TEXT DEFAULT 'scheduled',
  meeting_url TEXT,
  attendee_name TEXT,
  attendee_phone TEXT,
  metadata JSONB,
  reminder_24h_sent BOOLEAN DEFAULT false,
  reminder_1h_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Follow-up logs
CREATE TABLE IF NOT EXISTS followup_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  org_id UUID NOT NULL,
  rule_id TEXT,
  channel TEXT DEFAULT 'whatsapp',
  message TEXT,
  status TEXT DEFAULT 'sent',
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Automation config
CREATE TABLE IF NOT EXISTS automation_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  key TEXT NOT NULL,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, key)
);

-- 10. Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  due_date TIMESTAMPTZ,
  assigned_to UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- RLS Policies
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversation_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE followup_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Service role full access on all tables
CREATE POLICY "service_all_organizations" ON organizations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all_org_members" ON org_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all_conversations" ON conversations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all_ai_context" ON ai_conversation_context FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all_ai_logs" ON ai_agent_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all_appointments" ON appointments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all_followup_logs" ON followup_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all_automation_config" ON automation_config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all_tasks" ON tasks FOR ALL USING (true) WITH CHECK (true);

-- Authenticated users: org-scoped access
CREATE POLICY "org_read_conversations" ON conversations FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "org_insert_conversations" ON conversations FOR INSERT
  WITH CHECK (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

CREATE POLICY "org_read_leads" ON leads FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "org_write_leads" ON leads FOR UPDATE
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

CREATE POLICY "org_read_ai_context" ON ai_conversation_context FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "org_write_ai_context" ON ai_conversation_context FOR ALL
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

CREATE POLICY "org_read_ai_logs" ON ai_agent_logs FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

CREATE POLICY "org_read_org_members" ON org_members FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "org_read_organizations" ON organizations FOR SELECT
  USING (id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

-- ═══════════════════════════════════════════════════════════════
-- Seed: Atia Inmobiliaria organization
-- ═══════════════════════════════════════════════════════════════

INSERT INTO organizations (id, name, slug)
VALUES ('e67404e2-d14c-44ad-9275-9b89372aa57d', 'Atia Inmobiliaria', 'atia-inmobiliaria')
ON CONFLICT (id) DO NOTHING;

-- Enable realtime for Inbox
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE leads;
ALTER PUBLICATION supabase_realtime ADD TABLE ai_agent_logs;

NOTIFY pgrst, 'reload schema';
