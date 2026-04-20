-- =============================================================================
-- Landing Page Analytics — Tracking de eventos de usuario
-- =============================================================================

CREATE TABLE IF NOT EXISTS landing_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid NOT NULL DEFAULT 'e67404e2-d14c-44ad-9275-9b89372aa57d',
  session_id  text NOT NULL,
  event_type  text NOT NULL, -- page_view, scroll_depth, cta_click, form_start, form_submit, calculator_use, time_on_page
  event_data  jsonb DEFAULT '{}',
  page_url    text,
  referrer    text,
  utm_source  text,
  utm_medium  text,
  utm_campaign text,
  device_type text, -- mobile, desktop, tablet
  created_at  timestamptz DEFAULT now()
);

-- Index for fast dashboard queries
CREATE INDEX IF NOT EXISTS idx_landing_events_org_type ON landing_events(org_id, event_type);
CREATE INDEX IF NOT EXISTS idx_landing_events_session ON landing_events(session_id);
CREATE INDEX IF NOT EXISTS idx_landing_events_created ON landing_events(created_at DESC);

-- RLS
ALTER TABLE landing_events ENABLE ROW LEVEL SECURITY;

-- Public insert (anyone can track events from landing)
CREATE POLICY "Anyone can insert landing events"
  ON landing_events FOR INSERT
  WITH CHECK (true);

-- Only org members can read
CREATE POLICY "Org members can view landing events"
  ON landing_events FOR SELECT
  USING (
    org_id IN (
      SELECT om.org_id FROM org_members om WHERE om.user_id = auth.uid()
    )
  );
