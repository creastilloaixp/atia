-- Casto Automation Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20),
  email VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  property_type VARCHAR(50), -- 'casa', 'departamento', 'terreno', 'local', 'oficina'
  debt_type VARCHAR(50), -- 'infonavit', 'banco', 'embargo', 'herencia', 'divorcio', 'otro'
  debt_amount DECIMAL,
  status VARCHAR(50) DEFAULT 'new', -- 'new', 'queued', 'called', 'emailed', 'contacted', 'appointment', 'closed', 'unreachable'
  source VARCHAR(100), -- 'crawler', 'manual', 'referral', 'website'
  notes TEXT,
  call_id VARCHAR(100),
  email_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Activity log
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  action VARCHAR(100), -- 'call_started', 'call_ended', 'email_sent', 'appointment_booked', 'status_updated'
  details JSONB,
  outcome VARCHAR(100),
  duration_seconds INTEGER,
  recording_url TEXT,
  transcript TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_city ON leads(city);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_activity_log_lead_id ON activity_log(lead_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update timestamp
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS Policies (Row Level Security)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role can do everything on leads" ON leads
  FOR ALL USING (true);

CREATE POLICY "Service role can do everything on activity_log" ON activity_log
  FOR ALL USING (true);

-- Insert test data (optional)
-- INSERT INTO leads (name, phone, email, city, property_type, debt_type, status, source)
-- VALUES 
--   ('Juan Pérez', '+526671234567', 'juan@email.com', 'Culiacán', 'casa', 'infonavit', 'new', 'crawler'),
--   ('María García', '+526678765432', 'maria@email.com', 'Mazatlán', 'departamento', 'embargo', 'new', 'crawler'),
--   ('Roberto López', NULL, 'roberto@email.com', 'Monterrey', 'casa', 'herencia', 'new', 'manual');

-- Verify setup
SELECT 'Leads table created' as status, COUNT(*) as count FROM leads;
SELECT 'Activity log table created' as status, COUNT(*) as count FROM activity_log;