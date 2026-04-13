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
 * Motor de envío de leads centralizado — Versión 2.0 "Sistematizada"
 * Implementa la visión estratégica de Castor de respuesta en < 5 minutos.
 */
export async function submitLead(payload: LeadPayload) {
  const endpoint = import.meta.env.VITE_SUPABASE_LEAD_ENDPOINT;
  const orgId = import.meta.env.VITE_SUPABASE_LEAD_ORG_ID;
  const secret = import.meta.env.VITE_SUPABASE_LEAD_SECRET;
  const vertical = import.meta.env.VITE_SUPABASE_LEAD_VERTICAL || 'inmobiliaria';

  // MAPEÓ IMPECABLE PARA EL CRM GLOBAL
  const standardizedMetadata = {
    interes: payload.metadata.situation || payload.metadata.intent || 'venta_directa',
    presupuesto: payload.metadata.marketValue || payload.metadata.valueRange || 'sin_definir',
    ubicacion: payload.city || 'Desconocida',
    urgencia: payload.metadata.urgency || 'normal',
    adeudos_estimados: payload.metadata.debts || 0,
    fuente_campana: payload.metadata.campaign || 'directo',
    proyecto: 'Casto Inmobiliaria',
    platform: 'Vite React App',
    // Métrica de Castor: La Cita es la Venta
    status: payload.metadata.appointment_scheduled ? 'cita_agendada' : 'nuevo_prospecto',
    tracking_step: 'diagnostico_completado',
    speed_to_lead_target: '< 5 mins',
    // Datos de cita
    cita_fecha: payload.metadata.preferred_date || null,
    cita_hora: payload.metadata.preferred_time || null,
    cita_agendada: payload.metadata.appointment_scheduled || false
  };

  const body = {
    org_id: orgId,
    vertical: vertical,
    name: payload.name,
    email: payload.email || '',
    phone: payload.phone,
    city: payload.city,
    metadata: standardizedMetadata
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': secret || ''
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error CRM (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    return { success: true, data };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
