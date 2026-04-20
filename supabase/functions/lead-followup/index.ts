// =============================================================================
// Atia Inmobiliaria — Lead Follow-up Automático
// Cron: cada hora revisa leads sin respuesta y envía follow-up por WhatsApp
// =============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL") || "https://n8n-evolution-api.yxmkwr.easypanel.host";
const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY") || "";
const EVOLUTION_INSTANCE = Deno.env.get("EVOLUTION_INSTANCE") || "GRUPOATIA";
const ORG_ID = "e67404e2-d14c-44ad-9275-9b89372aa57d";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ── Follow-up messages by stage ─────────────────────────────────────────
const FOLLOWUP_TEMPLATES: Record<string, (name: string) => string> = {
  "24h": (name) =>
    `Hola ${name}, soy Adriana de Atia Inmobiliaria. Ayer platicamos sobre tu busqueda de propiedad. ¿Pudiste revisar las opciones que te comparti? Estoy aqui para ayudarte a agendar una visita sin compromiso.`,
  "48h": (name) =>
    `Hola ${name}, te saluda Adriana de Atia. Solo queria recordarte que tenemos opciones disponibles que podrian interesarte. ¿Te gustaria que te envie mas opciones o agendamos una visita? Estoy a tus ordenes.`,
  "7d": (name) =>
    `Hola ${name}, han pasado unos dias desde que platicamos. En Atia Inmobiliaria tenemos nuevas propiedades disponibles. Si sigues buscando, con gusto te comparto las opciones mas recientes. ¿Te interesa?`,
};

// ── Send WhatsApp ───────────────────────────────────────────────────────
async function sendWhatsApp(phone: string, text: string): Promise<boolean> {
  const res = await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
    method: "POST",
    headers: { apikey: EVOLUTION_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ number: phone, text }),
  });
  return res.ok;
}

// ── Main ────────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const now = new Date();
  const results = { processed: 0, sent: 0, skipped: 0, errors: 0 };

  try {
    // Get all leads that might need follow-up
    const { data: leads, error } = await supabase
      .from("leads")
      .select("id, name, full_name, phone, whatsapp, status, created_at")
      .eq("org_id", ORG_ID)
      .in("status", ["new", "nuevo", "wa_sent", "wa_delivered", "in_conversation"])
      .order("created_at", { ascending: true });

    if (error) throw error;
    if (!leads || leads.length === 0) {
      return new Response(JSON.stringify({ status: "ok", message: "No leads to follow up", ...results }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    for (const lead of leads) {
      results.processed++;
      const phone = lead.phone || lead.whatsapp;
      const name = (lead.name || lead.full_name || "").split(" ")[0] || "Cliente";

      if (!phone) { results.skipped++; continue; }

      // Check last conversation timestamp
      const { data: lastMsg } = await supabase
        .from("conversations")
        .select("created_at, direction")
        .eq("lead_id", lead.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // Also check chat_memory for leads not yet in conversations
      let lastActivity: Date;
      if (lastMsg) {
        // If last message was inbound (client responded), skip — they're engaged
        if (lastMsg.direction === "inbound") { results.skipped++; continue; }
        lastActivity = new Date(lastMsg.created_at);
      } else {
        lastActivity = new Date(lead.created_at);
      }

      const hoursSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);

      // Check what follow-ups we already sent
      const { data: existingFollowups } = await supabase
        .from("followup_logs")
        .select("channel, created_at")
        .eq("lead_id", lead.id)
        .eq("status", "sent");

      const followupCount = existingFollowups?.length || 0;

      // Determine which follow-up to send
      let templateKey: string | null = null;
      if (hoursSinceActivity >= 24 && hoursSinceActivity < 48 && followupCount === 0) {
        templateKey = "24h";
      } else if (hoursSinceActivity >= 48 && hoursSinceActivity < 168 && followupCount <= 1) {
        templateKey = "48h";
      } else if (hoursSinceActivity >= 168 && followupCount <= 2) {
        templateKey = "7d";
      }

      if (!templateKey) { results.skipped++; continue; }

      // Check if AI bot is handed off for this lead
      const { data: ctx } = await supabase
        .from("ai_conversation_context")
        .select("status")
        .eq("lead_id", lead.id)
        .maybeSingle();

      if (ctx?.status === "handed_off") { results.skipped++; continue; }

      // Send follow-up
      const message = FOLLOWUP_TEMPLATES[templateKey](name);
      const sent = await sendWhatsApp(phone, message);

      if (sent) {
        // Log follow-up
        await supabase.from("followup_logs").insert({
          lead_id: lead.id,
          org_id: ORG_ID,
          channel: "whatsapp",
          message,
          status: "sent",
        });

        // Save to conversations for CRM Inbox
        await supabase.from("conversations").insert({
          lead_id: lead.id,
          org_id: ORG_ID,
          direction: "outbound",
          content: message,
          is_bot: true,
          message_id: `followup_${templateKey}_${lead.id}_${Date.now()}`,
        });

        console.log(`[FOLLOWUP] ${templateKey} sent to ${name} (${phone})`);
        results.sent++;
      } else {
        await supabase.from("followup_logs").insert({
          lead_id: lead.id,
          org_id: ORG_ID,
          channel: "whatsapp",
          message,
          status: "failed",
          error: "Evolution API send failed",
        });
        results.errors++;
      }
    }

    console.log(`[FOLLOWUP] Done: ${results.sent} sent, ${results.skipped} skipped, ${results.errors} errors`);

    return new Response(JSON.stringify({ status: "ok", ...results }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[FOLLOWUP] Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
