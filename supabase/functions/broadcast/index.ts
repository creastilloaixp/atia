// =============================================================================
// Atia Inmobiliaria — Broadcast Segmentado
// Envía mensajes masivos a leads filtrados por sector, interés o categoría
// =============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL") || "https://n8n-evolution-api.yxmkwr.easypanel.host";
const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY") || "";
const EVOLUTION_INSTANCE = Deno.env.get("EVOLUTION_INSTANCE") || "GRUPOATIA";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function sendWhatsApp(phone: string, text: string): Promise<boolean> {
  const res = await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
    method: "POST",
    headers: { apikey: EVOLUTION_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ number: phone, text }),
  });
  return res.ok;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const body = await req.json();
    const {
      org_id,
      message,         // Texto del mensaje (soporta {{name}} como placeholder)
      filters = {},    // { status, sector, operation, category, source, min_score }
      dry_run = false, // Si true, solo cuenta cuántos leads recibirían el mensaje
    } = body;

    if (!org_id || !message) {
      return new Response(JSON.stringify({ error: "org_id y message son requeridos" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build query with filters
    let query = supabase
      .from("leads")
      .select("id, name, full_name, phone, whatsapp, status, metadata, lead_score")
      .eq("org_id", org_id);

    if (filters.status) {
      query = query.in("status", Array.isArray(filters.status) ? filters.status : [filters.status]);
    }
    if (filters.source) {
      query = query.eq("source", filters.source);
    }
    if (filters.min_score) {
      query = query.gte("lead_score", filters.min_score);
    }

    const { data: leads, error } = await query;
    if (error) throw error;

    // Client-side filters for JSONB metadata fields
    let filtered = leads || [];
    if (filters.sector) {
      filtered = filtered.filter((l: any) =>
        l.metadata?.location?.toLowerCase().includes(filters.sector.toLowerCase()) ||
        l.metadata?.sector?.toLowerCase().includes(filters.sector.toLowerCase())
      );
    }
    if (filters.operation) {
      filtered = filtered.filter((l: any) =>
        l.metadata?.intent?.toLowerCase().includes(filters.operation.toLowerCase())
      );
    }
    if (filters.category) {
      filtered = filtered.filter((l: any) =>
        l.metadata?.ai_category === filters.category
      );
    }

    // Filter out leads without phone
    filtered = filtered.filter((l: any) => l.phone || l.whatsapp);

    if (dry_run) {
      return new Response(JSON.stringify({
        status: "dry_run",
        total_leads: leads?.length || 0,
        filtered_leads: filtered.length,
        sample: filtered.slice(0, 5).map((l: any) => ({
          name: l.name || l.full_name,
          phone: l.phone || l.whatsapp,
          score: l.lead_score,
        })),
      }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send messages with 1-second delay between each to avoid rate limits
    const results = { sent: 0, failed: 0, total: filtered.length };

    for (const lead of filtered) {
      const phone = lead.phone || lead.whatsapp;
      const name = (lead.name || lead.full_name || "").split(" ")[0] || "Cliente";

      // Replace {{name}} placeholder
      const personalizedMsg = message.replace(/\{\{name\}\}/g, name);

      const ok = await sendWhatsApp(phone, personalizedMsg);
      if (ok) {
        results.sent++;
        // Log to conversations
        await supabase.from("conversations").insert({
          lead_id: lead.id,
          org_id,
          direction: "outbound",
          content: personalizedMsg,
          is_bot: true,
          message_id: `broadcast_${lead.id}_${Date.now()}`,
        }).catch(() => {});
      } else {
        results.failed++;
      }

      // Rate limit: 1 message per second
      await new Promise((r) => setTimeout(r, 1000));
    }

    console.log(`[BROADCAST] ${results.sent} sent, ${results.failed} failed of ${results.total}`);

    return new Response(JSON.stringify({ status: "ok", ...results }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[BROADCAST] Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
