import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const EVOLUTION_URL = Deno.env.get("EVOLUTION_API_URL") || "https://n8n-evolution-api.yxmkwr.easypanel.host";
const EVOLUTION_KEY = Deno.env.get("EVOLUTION_API_KEY") || "";
const EVOLUTION_INSTANCE = Deno.env.get("EVOLUTION_INSTANCE") || "GRUPOATIA";
const ORG_ID = "e67404e2-d14c-44ad-9275-9b89372aa57d";

// ── Action executor ──────────────────────────────────────────────────
async function executeAction(
  actionJson: any,
  sb: any,
  orgId: string
): Promise<{ type: string; success: boolean; detail: string }> {
  try {
    const { action, params } = actionJson;

    if (action === "send_whatsapp") {
      const phone = params.phone?.replace(/\D/g, "");
      if (!phone || !params.message) {
        return { type: "send_whatsapp", success: false, detail: "Falta teléfono o mensaje" };
      }
      const res = await fetch(`${EVOLUTION_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: EVOLUTION_KEY,
        },
        body: JSON.stringify({
          number: phone,
          text: params.message,
        }),
      });
      if (res.ok) {
        // Log to conversations
        await sb.from("conversations").insert({
          org_id: orgId,
          lead_id: params.lead_id || null,
          direction: "outbound",
          content: params.message,
          is_bot: true
        });
        return { type: "send_whatsapp", success: true, detail: `WhatsApp enviado a ${phone}` };
      }
      return { type: "send_whatsapp", success: false, detail: "Error al enviar WhatsApp" };
    }

    if (action === "update_lead_status") {
      const { lead_id, new_status } = params;
      if (!lead_id || !new_status) {
        return { type: "update_status", success: false, detail: "Falta lead_id o new_status" };
      }
      const { error } = await sb
        .from("leads")
        .update({ status: new_status })
        .eq("id", lead_id)
        .eq("org_id", orgId);
      if (error) {
        return { type: "update_status", success: false, detail: error.message };
      }
      return { type: "update_status", success: true, detail: `Lead actualizado a "${new_status}"` };
    }

    if (action === "create_task") {
      const { title, due_date, lead_id } = params;
      await sb.from("tasks").insert({
        org_id: orgId,
        title,
        due_date: due_date || null,
        lead_id: lead_id || null,
        status: "pending",
      });
      return { type: "create_task", success: true, detail: `Tarea creada: "${title}"` };
    }

    if (action === "send_voice_note") {
      const phone = params.phone?.replace(/\D/g, "");
      if (!phone || !params.message) {
        return { type: "send_voice_note", success: false, detail: "Falta teléfono o mensaje" };
      }
      // Call the send-voice-note Edge Function (handles TTS + Evolution API)
      const vnRes = await fetch(`${SUPABASE_URL}/functions/v1/send-voice-note`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_KEY}`,
          "apikey": SUPABASE_KEY,
        },
        body: JSON.stringify({ phone, message: params.message }),
      });
      if (vnRes.ok) {
        const vnData = await vnRes.json();
        await sb.from("conversations").insert({
          org_id: orgId,
          lead_id: params.lead_id || null,
          direction: "outbound",
          content: `🎙️ [Nota de voz] ${params.message}`,
          is_bot: true,
        }).catch(() => {});
        return { type: "send_voice_note", success: true, detail: `Nota de voz enviada a ${phone} (${vnData.type || "audio"})` };
      }
      const vnErr = await vnRes.text().catch(() => "");
      console.error(`[COPILOT] send-voice-note ${vnRes.status}: ${vnErr.slice(0, 200)}`);
      return { type: "send_voice_note", success: false, detail: `send-voice-note ${vnRes.status}: ${vnErr.slice(0, 150) || "sin detalle"}` };
    }

    return { type: action, success: false, detail: "Acción no reconocida" };
  } catch (err) {
    console.error("Action error:", err);
    return { type: "unknown", success: false, detail: "Error ejecutando acción" };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { org_id, messages, context, attachments } = await req.json();
    const effectiveOrgId = org_id || ORG_ID;

    const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

    // Fetch org data for context
    const [leadsRes, convRes] = await Promise.all([
      sb.from("leads")
        .select("*")
        .eq("org_id", effectiveOrgId)
        .order("created_at", { ascending: false })
        .limit(50),
      sb.from("conversations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(40),
    ]);

    const leads = leadsRes.data ?? [];
    const conversations = convRes.data ?? [];

    // Build stats
    const totalLeads = leads.length;
    const byStatus: Record<string, number> = {};
    leads.forEach((l: any) => {
      byStatus[l.status || "sin_status"] = (byStatus[l.status || "sin_status"] || 0) + 1;
    });
    const getScore = (l: any) => l.value_estimate || l.lead_score || 0;
    const catA = leads.filter((l: any) => getScore(l) >= 70).length;
    const catB = leads.filter((l: any) => getScore(l) >= 40 && getScore(l) < 70).length;
    const catC = leads.filter((l: any) => getScore(l) < 40).length;

    // Selected lead context
    let leadCtx = "";
    if (context?.selectedLead) {
      const sl = context.selectedLead;
      const leadConvos = conversations.filter((c: any) => c.lead_id === sl.id);
      leadCtx = `
LEAD SELECCIONADO:
- ID: ${sl.id}
- Nombre: ${sl.name}
- Teléfono: ${sl.phone || "N/A"}
- Email: ${sl.email || "N/A"}
- Ciudad: ${sl.city || "N/A"}
- Status: ${sl.status || "N/A"}
- Tipo: ${sl.coverage_type || "N/A"}
- Valor estimado: ${sl.value_estimate || "N/A"}
- Historial de conversaciones:
${leadConvos.slice(0, 8).map((c: any) => `  [${c.direction}] ${c.content?.slice(0, 120)}`).join("\n") || "  Sin conversaciones"}
`;
    }

    // Fetch Obsidian knowledge base (synced via obsidian-sync Edge Function)
    let kbContext = "";
    try {
      const { data: kbData } = await sb
        .from("knowledge_base")
        .select("topic, content")
        .order("topic", { ascending: true });
      if (kbData && kbData.length > 0) {
        kbContext = "\n\n=== BASE DE CONOCIMIENTO ATIA (Obsidian) ===\n" +
          kbData.map((k: any) => `## ${k.topic}\n${k.content}`).join("\n\n");
      }
    } catch (kbErr) {
      console.error("[COPILOT-KB] Error:", kbErr);
    }

    const systemPrompt = `Eres ADRIANA, la asistente IA omnicanal de Atia Inmobiliaria en Culiacán, Sinaloa.
Eres la misma Adriana que atiende WhatsApp — ahora también estás dentro del CRM como copiloto del equipo.

PERSONALIDAD:
- Profesional pero cálida, usas "tú" informal
- Proactiva: siempre sugiere el siguiente paso
- Directa y concisa, sin relleno
- Conocedora del mercado inmobiliario de Culiacán/Sinaloa

DATOS ACTUALES DEL CRM:
- Total leads: ${totalLeads}
- Por status: ${JSON.stringify(byStatus)}
- Categoría A (urgente/alta prioridad): ${catA}
- Categoría B (interesado/media): ${catB}
- Categoría C (informativo/baja): ${catC}
- Leads recientes: ${leads.slice(0, 12).map((l: any) => `${l.name} (${l.status}, score:${getScore(l)}, tel:${l.phone || "?"}, ${l.city || "?"})`).join(", ")}
- Últimas conversaciones: ${conversations.slice(0, 6).map((c: any) => `[${c.direction}/${c.is_bot ? "bot" : "human"}] ${c.content?.slice(0, 60)}`).join(" | ")}
${leadCtx}
PÁGINA ACTUAL: ${context?.currentPage || "desconocida"}
${kbContext}
CAPACIDADES DE ACCIÓN:
Puedes EJECUTAR acciones reales. Cuando el usuario te pida una acción, responde con tu mensaje normal Y agrega un bloque JSON al final en este formato exacto:

\`\`\`action
{"action": "send_whatsapp", "params": {"phone": "521234567890", "message": "Texto del mensaje", "lead_id": "uuid-del-lead"}}
\`\`\`

Acciones disponibles:
1. send_whatsapp — Enviar mensaje de TEXTO por WhatsApp (necesitas phone y message)
2. send_voice_note — Enviar NOTA DE VOZ por WhatsApp. Adriana habla el mensaje como audio (necesitas phone y message). Usar cuando digan "nota de voz", "audio", "háblale", etc.
3. update_lead_status — Cambiar status de un lead (necesitas lead_id y new_status)
4. create_task — Crear una tarea (necesitas title, opcionalmente due_date y lead_id)

REGLAS:
- Responde en español, conciso y accionable
- Usa SOLO datos reales del CRM, nunca inventes datos
- Cuando muestres un resumen, usa formato de tabla o lista con bullet points
- Si el usuario sube una imagen, analízala y describe lo que ves (puede ser foto de propiedad, documento, etc.)
- Si el usuario envía audio, transcribe/interpreta el contenido
- Formatea con markdown (bold, listas, etc.)
- Siempre sugiere 1-2 acciones concretas al final de tu respuesta`;

    // ── Build Gemini contents (multimodal) ─────────────────────────
    const geminiContents: any[] = [
      { role: "user", parts: [{ text: systemPrompt }] },
    ];

    // Add conversation history
    for (const m of messages.slice(0, -1)) {
      geminiContents.push({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      });
    }

    // Last message — potentially multimodal
    const lastMsg = messages[messages.length - 1];
    const lastParts: any[] = [{ text: lastMsg.content }];

    // Add attachments as inline_data
    if (attachments && attachments.length > 0) {
      for (const att of attachments) {
        if (att.type === "image") {
          lastParts.push({
            inline_data: {
              mime_type: att.mimeType,
              data: att.base64,
            },
          });
        } else if (att.type === "audio") {
          lastParts.push({
            inline_data: {
              mime_type: att.mimeType,
              data: att.base64,
            },
          });
        } else {
          // For documents, just mention them in text
          lastParts[0] = {
            text: `${lastMsg.content}\n\n[Documento adjunto: ${att.name} (${att.mimeType})]`,
          };
        }
      }
    }

    geminiContents.push({
      role: lastMsg.role === "assistant" ? "model" : "user",
      parts: lastParts,
    });

    // ── Call Gemini ──────────────────────────────────────────────────
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: geminiContents,
          generationConfig: { maxOutputTokens: 2048, temperature: 0.7 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini error:", errText);
      return new Response(
        JSON.stringify({ reply: "No pude procesar tu solicitud. Intenta de nuevo en unos segundos." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiData = await geminiRes.json();
    let reply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta.";

    // ── Extract and execute action if present ─────────────────────
    let actionResult = null;
    const actionMatch = reply.match(/```action\s*\n?([\s\S]*?)```/);
    if (actionMatch) {
      try {
        const actionJson = JSON.parse(actionMatch[1].trim());
        actionResult = await executeAction(actionJson, sb, effectiveOrgId);
        // Remove action block from reply text
        reply = reply.replace(/```action\s*\n?[\s\S]*?```/, "").trim();
      } catch (e) {
        console.error("Action parse error:", e);
      }
    }

    const response: any = { reply };
    if (actionResult) response.action = actionResult;

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Copilot error:", err);
    return new Response(
      JSON.stringify({ error: "Error interno de Adriana." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
