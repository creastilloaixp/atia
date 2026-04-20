// =============================================================================
// Atia Inmobiliaria — incoming-lead Edge Function
// =============================================================================
// Replaces: Vercel api/leads.ts + n8n "Casto Lead Capture" workflow
// Pipeline: Validate -> Save to Supabase -> WhatsApp welcome -> Zadarma callback
// =============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL") || "https://n8n-evolution-api.yxmkwr.easypanel.host";
const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY") || "";
const EVOLUTION_INSTANCE = Deno.env.get("EVOLUTION_INSTANCE") || "GRUPOATIA";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ── Normalize Mexican phone number ──────────────────────────────────────
function normalizePhone(phone: string): string {
  let clean = phone.replace(/[^0-9]/g, "");
  if (!clean.startsWith("52") && clean.length === 10) {
    clean = "52" + clean;
  } else if (clean.startsWith("1") && clean.length === 11) {
    clean = "52" + clean.slice(1);
  }
  return clean;
}

// ── Send WhatsApp welcome via Evolution API ─────────────────────────────
async function sendWhatsAppWelcome(phone: string, name: string, opts: {
  appointmentScheduled?: boolean;
  preferredDate?: string;
  preferredTime?: string;
  location?: string;
}) {
  let text: string;

  if (opts.appointmentScheduled && opts.preferredDate && opts.preferredTime) {
    const dateObj = new Date(opts.preferredDate + "T12:00:00");
    const formattedDate = dateObj.toLocaleDateString("es-MX", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    const [hour, minutes] = opts.preferredTime.split(":");
    text = `¡Hola ${name}! 👋 Soy Adriana de Atia Inmobiliaria.

He recibido tu solicitud y confirmo tu *cita gratuita* para el ${formattedDate} a las ${hour}:${minutes} hrs.

Un asesor experto visitará tu propiedad para darte el diagnóstico legal sin costo. ¿Hay algo que quieras prepararnos antes de la visita?`;
  } else if (opts.location && opts.location !== "Sin Ubicación") {
    text = `¡Hola ${name}! 👋 Soy Adriana, asesora virtual de Atia Inmobiliaria para la zona de ${opts.location}. He recibido tu solicitud de diagnóstico gratuito. ¿Te gustaría agendar una cita con nuestro asesor legal? También puedo resolver cualquier duda que tengas sobre tu propiedad.`;
  } else {
    text = `¡Hola ${name}! 👋 Soy Adriana de Atia Inmobiliaria. He recibido tu solicitud de diagnóstico gratuito. ¿Te gustaría agendar una cita gratuita con nuestro asesor legal? También puedo resolver cualquier duda que tengas.`;
  }

  const res = await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
    method: "POST",
    headers: {
      apikey: EVOLUTION_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ number: phone, text }),
  });

  return { status: res.status, ok: res.ok };
}

// ── Trigger Zadarma callback ────────────────────────────────────────────
async function triggerZadarmaCallback(phone: string): Promise<{ status: string }> {
  const zadarmaKey = Deno.env.get("ZADARMA_KEY");
  const zadarmaSecret = Deno.env.get("ZADARMA_SECRET");
  const zadarmaFrom = Deno.env.get("ZADARMA_FROM") || "105";

  if (!zadarmaKey || !zadarmaSecret) {
    return { status: "skipped_no_credentials" };
  }

  try {
    // Use the existing zadarma-callback edge function internally
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || "";

    const cleanPhone = phone.startsWith("52") ? `+${phone}` : `+52${phone.slice(-10)}`;

    const res = await fetch(`${supabaseUrl}/functions/v1/zadarma-callback`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone: cleanPhone }),
    });

    const data = await res.json();
    return { status: data.status || (res.ok ? "success" : "failed") };
  } catch (e) {
    console.error("[ZADARMA] Error:", e.message);
    return { status: "error" };
  }
}

// ── Main handler ─────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();

    // Support both formats: direct fields or nested contact/lead_details
    const contact = body.contact || {};
    const details = body.lead_details || {};
    const metadata = body.metadata || {};

    const name = body.name || contact.name || "Lead Desconocido";
    const rawPhone = body.phone || contact.phone || "";
    const intent = metadata.interes || details.intent || "general";
    const location = body.city || metadata.ubicacion || details.location || "Sin Ubicación";
    const source = body.source || metadata.fuente_campana || "Landing Atia";
    const campaign = body.campaign || metadata.proyecto || "general";
    const preferredDate = metadata.cita_fecha || details.preferred_date;
    const preferredTime = metadata.cita_hora || details.preferred_time;
    const appointmentScheduled = metadata.cita_agendada || details.appointment_scheduled || false;
    const propertyValue = metadata.presupuesto || details.property_value || "no_especificado";
    const vertical = body.vertical || "inmobiliaria";
    const orgId = body.org_id || Deno.env.get("DEFAULT_ORG_ID") || "e67404e2-d14c-44ad-9275-9b89372aa57d";

    // 1. VALIDATE
    const phone = normalizePhone(rawPhone);
    if (phone.length < 12) {
      return new Response(
        JSON.stringify({ status: "error", message: "Teléfono inválido (mín 10 dígitos)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!name || name.length < 2) {
      return new Response(
        JSON.stringify({ status: "error", message: "Nombre requerido (mín 2 caracteres)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const results: Array<{ step: string; status: string | number; detail?: string }> = [];

    // 2. CHECK DUPLICATE — skip if same phone already exists for this org
    let leadId: string | null = null;
    try {
      const { data: existingLead } = await supabase
        .from("leads")
        .select("id")
        .eq("whatsapp", phone)
        .eq("org_id", orgId)
        .limit(1)
        .maybeSingle();

      if (existingLead) {
        leadId = existingLead.id;
        results.push({ step: "supabase_lead", status: "duplicate", detail: leadId });
      } else {
        // 2b. SAVE TO SUPABASE — leads table (CRM-compatible: name + phone + full_name + whatsapp)
        const { data: leadData, error: leadError } = await supabase
          .from("leads")
          .insert({
            org_id: orgId,
            full_name: name,
            name: name,
            whatsapp: phone,
            phone: phone,
            city: location !== "Sin Ubicación" ? location : null,
            status: appointmentScheduled ? "cita_agendada" : "nuevo",
            vertical,
            source,
            lead_score: appointmentScheduled ? 70 : 40,
            metadata: {
              intent,
              property_value: propertyValue,
              campaign,
              location,
              preferred_date: preferredDate || null,
              preferred_time: preferredTime || null,
              appointment_scheduled: appointmentScheduled,
            },
          })
          .select("id")
          .single();

        if (leadError) throw leadError;
        leadId = leadData?.id;
        results.push({ step: "supabase_lead", status: "success", detail: leadId || undefined });
      }
    } catch (e) {
      console.error("[LEAD SAVE] Error:", e.message);
      results.push({ step: "supabase_lead", status: "failed", detail: e.message });
    }

    // 3. SAVE corretaje_request if we have a lead
    if (leadId) {
      try {
        await supabase.from("corretaje_requests").insert({
          org_id: orgId,
          lead_id: leadId,
          operation_type: intent === "inversion" ? "Compra" : "Venta",
          property_type: "Casa",
          budget_display: propertyValue,
          sector: location,
          category: appointmentScheduled ? "A" : "B",
          status: "new",
          options_target: 3,
          options_found: 0,
        });
        results.push({ step: "corretaje_request", status: "success" });
      } catch (e) {
        results.push({ step: "corretaje_request", status: "failed", detail: e.message });
      }
    }

    // 4. WHATSAPP WELCOME via Evolution API
    try {
      const waResult = await sendWhatsAppWelcome(phone, name.split(" ")[0], {
        appointmentScheduled,
        preferredDate,
        preferredTime,
        location,
      });
      results.push({ step: "whatsapp_welcome", status: waResult.status });
    } catch (e) {
      console.error("[WHATSAPP] Error:", e.message);
      results.push({ step: "whatsapp_welcome", status: "failed", detail: e.message });
    }

    // 5. SAVE TO CRM CONVERSATIONS — so welcome message appears in Inbox
    if (leadId) {
      try {
        await supabase.from("conversations").insert({
          lead_id: leadId,
          org_id: orgId,
          direction: "outbound",
          content: `[Mensaje de bienvenida enviado automáticamente desde landing]`,
          is_bot: true,
          message_id: `landing_welcome_${leadId}_${Date.now()}`,
        });
        results.push({ step: "crm_conversation", status: "success" });
      } catch (e) {
        results.push({ step: "crm_conversation", status: "failed", detail: e.message });
      }
    }

    // 6. ZADARMA CALLBACK (automatic call bridge)
    try {
      const callResult = await triggerZadarmaCallback(phone);
      results.push({ step: "zadarma_callback", status: callResult.status });
    } catch (e) {
      console.error("[ZADARMA] Error:", e.message);
      results.push({ step: "zadarma_callback", status: "failed" });
    }

    console.log(`[INCOMING LEAD] ${name} (${phone}) — ${results.length} steps completed`);

    return new Response(
      JSON.stringify({
        status: "success",
        message: "Lead procesado correctamente",
        phone,
        lead_id: leadId,
        results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[INCOMING LEAD] Critical error:", error.message);
    return new Response(
      JSON.stringify({ status: "error", message: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
