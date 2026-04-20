/**
 * Landing Page Analytics — Event Tracker
 * Tracks user behavior and sends events to Supabase landing_events table
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Session ID persists across page reloads but not across browser sessions
function getSessionId(): string {
  let sid = sessionStorage.getItem('atia_session_id');
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem('atia_session_id', sid);
  }
  return sid;
}

function getUTMParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
  };
}

function getDeviceType(): string {
  const w = window.innerWidth;
  if (w < 768) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
}

async function trackEvent(eventType: string, eventData: Record<string, any> = {}) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;

  const utm = getUTMParams();

  try {
    await fetch(`${SUPABASE_URL}/rest/v1/landing_events`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        session_id: getSessionId(),
        event_type: eventType,
        event_data: eventData,
        page_url: window.location.pathname,
        referrer: document.referrer || null,
        utm_source: utm.utm_source,
        utm_medium: utm.utm_medium,
        utm_campaign: utm.utm_campaign,
        device_type: getDeviceType(),
      }),
    });
  } catch {
    // Silent fail — analytics should never break the UX
  }
}

// ── Public API ──────────────────────────────────────────────────────────

export function trackPageView() {
  trackEvent('page_view', { title: document.title });
}

export function trackScrollDepth(depth: number) {
  trackEvent('scroll_depth', { percent: depth });
}

export function trackCTAClick(ctaName: string) {
  trackEvent('cta_click', { cta: ctaName });
}

export function trackFormStart(formName: string) {
  trackEvent('form_start', { form: formName });
}

export function trackFormSubmit(formName: string, data?: Record<string, any>) {
  trackEvent('form_submit', { form: formName, ...data });
}

export function trackCalculatorUse(inputs: Record<string, any>) {
  trackEvent('calculator_use', inputs);
}

export function trackTimeOnPage(seconds: number) {
  trackEvent('time_on_page', { seconds });
}

export function trackWhatsAppClick() {
  trackEvent('whatsapp_click');
}

export function trackPhoneClick() {
  trackEvent('phone_click');
}

// ── Auto-tracking (call once on app mount) ──────────────────────────────

export function initAutoTracking() {
  // Page view
  trackPageView();

  // Scroll depth milestones
  const milestones = new Set<number>();
  const handleScroll = () => {
    const scrollPercent = Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    );
    for (const milestone of [25, 50, 75, 100]) {
      if (scrollPercent >= milestone && !milestones.has(milestone)) {
        milestones.add(milestone);
        trackScrollDepth(milestone);
      }
    }
  };
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Time on page (track at 30s, 60s, 120s, 300s)
  const timeThresholds = [30, 60, 120, 300];
  let timeIndex = 0;
  const startTime = Date.now();
  const timeInterval = setInterval(() => {
    if (timeIndex >= timeThresholds.length) {
      clearInterval(timeInterval);
      return;
    }
    const elapsed = (Date.now() - startTime) / 1000;
    if (elapsed >= timeThresholds[timeIndex]) {
      trackTimeOnPage(timeThresholds[timeIndex]);
      timeIndex++;
    }
  }, 5000);

  // Cleanup
  return () => {
    window.removeEventListener('scroll', handleScroll);
    clearInterval(timeInterval);
  };
}
