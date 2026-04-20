interface LeadPayload {
  name: string;
  email?: string;
  phone: string;
  city: string;
  metadata: {
    situation?: string;
    urgency?: string;
    marketValue?: string | number;
    debts?: string | number;
    intent?: string;
    valueRange?: string;
    campaign?: string;
    preferred_date?: string;
    preferred_time?: string;
    appointment_scheduled?: boolean;
    [key: string]: any;
  };
}

/**
 * Motor de envío de leads centralizado — Versión 3.0 "Supabase Edge"
 * Pipeline: Supabase Edge Function -> Save lead -> WhatsApp welcome -> Zadarma callback
 * Reemplaza: Vercel api/leads.ts + n8n workflows
 */
export async function submitLead(payload: LeadPayload) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const orgId = import.meta.env.VITE_SUPABASE_LEAD_ORG_ID;
  const vertical = import.meta.env.VITE_SUPABASE_LEAD_VERTICAL || 'inmobiliaria';

  const body = {
    org_id: orgId,
    vertical,
    name: payload.name,
    phone: payload.phone,
    city: payload.city,
    source: 'Landing Atia',
    campaign: payload.metadata.campaign || 'general',
    metadata: {
      interes: payload.metadata.situation || payload.metadata.intent || 'venta_directa',
      presupuesto: payload.metadata.marketValue || payload.metadata.valueRange || 'sin_definir',
      ubicacion: payload.city || 'Desconocida',
      urgencia: payload.metadata.urgency || 'normal',
      adeudos_estimados: payload.metadata.debts || 0,
      fuente_campana: payload.metadata.campaign || 'directo',
      proyecto: 'Atia Inmobiliaria',
      cita_fecha: payload.metadata.preferred_date || null,
      cita_hora: payload.metadata.preferred_time || null,
      cita_agendada: payload.metadata.appointment_scheduled || false,
    },
    lead_details: {
      intent: payload.metadata.intent || payload.metadata.situation || 'general',
      property_value: payload.metadata.valueRange || payload.metadata.marketValue || 'no_especificado',
      location: payload.city || 'Sin Ubicación',
      preferred_date: payload.metadata.preferred_date,
      preferred_time: payload.metadata.preferred_time,
      appointment_scheduled: payload.metadata.appointment_scheduled || false,
    },
  };

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/incoming-lead`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
