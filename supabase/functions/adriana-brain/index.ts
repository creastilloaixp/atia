// =============================================================================
// ADRIANA BRAIN — Universal AI Edge Function
// Cerebro central para TODOS los canales: Landing, WhatsApp, CRM, Redes Sociales
// v1.0 — Best Practices Architecture
// =============================================================================
//
// ARCHITECTURE:
// ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
// │ Landing Chat │    │  WhatsApp    │    │  CRM Copilot │
// │  (Widget)    │    │ (Evolution)  │    │  (Internal)  │
// └──────┬───────┘    └──────┬───────┘    └──────┬───────┘
//        │                   │                   │
//        └───────────────────┼───────────────────┘
//                            ▼
//                  ┌─────────────────┐
//                  │  ADRIANA BRAIN  │  ← THIS FILE
//                  │  (Edge Function)│
//                  ├─────────────────┤
//                  │ • Role Engine   │
//                  │ • Knowledge RAG │
//                  │ • Session Memory│
//                  │ • Channel Format│
//                  └────────┬────────┘
//                           ▼
//               ┌───────────────────────┐
//               │  Gemini 2.5 Flash     │
//               │  + Supabase Vectors   │
//               │  + Knowledge Base     │
//               └───────────────────────┘
//
// USAGE (from any channel):
//   POST /functions/v1/adriana-brain
//   {
//     "channel": "landing" | "whatsapp" | "crm" | "social",
//     "role": "capacitadora" | "vendedora" | "reclutadora" | "copilot",
//     "session_id": "unique-session-id",
//     "message": "Hola, quiero saber sobre el embudo",
//     "user_context": { ... optional metadata ... },
//     "attachments": [ ... optional multimodal ... ]
//   }
// =============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// ── Environment ──────────────────────────────────────────────────────────────
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const DEFAULT_ORG_ID = Deno.env.get("DEFAULT_ORG_ID") || "e67404e2-d14c-44ad-9275-9b89372aa57d";

// ── CORS ─────────────────────────────────────────────────────────────────────
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ── Types ────────────────────────────────────────────────────────────────────
type Channel = "landing" | "whatsapp" | "crm" | "social";
type Role = "capacitadora" | "vendedora" | "reclutadora" | "copilot" | "general";

interface BrainRequest {
  channel: Channel;
  role: Role;
  session_id: string;
  message: string;
  user_context?: {
    user_name?: string;
    user_phone?: string;
    page_url?: string;
    lead_id?: string;
    org_id?: string;
  };
  attachments?: Array<{
    type: "image" | "audio" | "document";
    mimeType: string;
    base64: string;
    name?: string;
  }>;
}

// ── Role Definitions (SINGLE SOURCE OF TRUTH) ────────────────────────────────
const ROLE_PROMPTS: Record<Role, {
  name: string;
  persona: string;
  objective: string;
  knowledge_focus: string[];
  tone: string;
}> = {
  capacitadora: {
    name: "Adriana — Entrenadora ATIA",
    persona: "Eres Adriana en modo Capacitadora. Tu audiencia es el STAFF INTERNO de ATIA (asesores, practicantes, coordinadores).",
    objective: "Capacitar al equipo sobre los embudos de calificación y captación. Enseñar las reglas de negocio con ejemplos prácticos.",
    knowledge_focus: ["Ventas", "General"],
    tone: "Didáctica, clara, paciente. Usa analogías si ayudan. Cuando el staff cometa un error conceptual, corrige con firmeza pero sin ser grosera."
  },
  vendedora: {
    name: "Adriana — Agente Inmobiliario IA",
    persona: "Eres Adriana en modo Agente Inmobiliario. Atiendes a CLIENTES EXTERNOS que quieren comprar, vender o rentar.",
    objective: "Calificar leads rápidamente. Clasificar en categorías (VIP/A/B/C). Recomendar propiedades solo después de calificar.",
    knowledge_focus: ["Ventas", "Rentas", "Valuacion", "General"],
    tone: "Directa, profesional, enfocada a cerrar. No pierdas el tiempo del cliente."
  },
  reclutadora: {
    name: "Adriana — Reclutadora ATIA",
    persona: "Eres Adriana en modo Reclutadora de Talento. Tu audiencia son candidatos para unirse al equipo de ATIA.",
    objective: "Perfilar talento: ¿Es practicante universitario, asesor freelance con experiencia, o candidato interno? Ofrecer la propuesta de valor correcta según el perfil.",
    knowledge_focus: ["Ventas"],
    tone: "Corporativa pero cálida. Vende la oportunidad de crecer en ATIA. Sé directa con comisiones y beneficios."
  },
  copilot: {
    name: "Adriana — CRM Copilot",
    persona: "Eres Adriana como copiloto del CRM. Ayudas a los asesores a gestionar su pipeline, enviar mensajes, y tomar decisiones sobre leads.",
    objective: "Dar insights sobre el CRM, sugerir acciones concretas, ejecutar tareas (enviar WA, cambiar status, crear recordatorios).",
    knowledge_focus: ["Ventas", "Rentas", "Inversiones", "Valuacion", "General"],
    tone: "Ejecutiva, concisa, orientada a datos. Siempre sugiere el siguiente paso."
  },
  general: {
    name: "Adriana — ATIA Asistente",
    persona: "Eres Adriana, asistente general de Grupo ATIA Inmobiliaria en Culiacán, Sinaloa.",
    objective: "Responder preguntas generales sobre ATIA, sus servicios, horarios y proceso de trabajo.",
    knowledge_focus: ["General"],
    tone: "Amigable, profesional, informativa. Invita al usuario a dar el siguiente paso."
  }
};

// ── Channel-specific formatting rules ────────────────────────────────────────
const CHANNEL_RULES: Record<Channel, string> = {
  landing: `FORMATO WEB:
- Usa **markdown** (negritas, listas, links).
- Respuestas de 3-8 líneas máximo.
- Incluye bullet points para listas.
- NO uses emojis excesivos.`,
  
  whatsapp: `FORMATO WHATSAPP (NO NEGOCIABLE):
- Negritas con *un asterisco*, nunca **dos**.
- URLs siempre planas, sin formato markdown.
- 3-5 líneas por mensaje. Nunca más.
- Máximo 2 propiedades por mensaje (1 línea cada una).
- Sin emojis decorativos (máx. 1 cada 5 mensajes).`,
  
  crm: `FORMATO CRM INTERNO:
- Usa markdown completo (tablas, listas, bold, code blocks).
- Puedes ser más detallada ya que el usuario es del equipo.
- Incluye métricas y datos cuando sean relevantes.
- Siempre sugiere 1-2 acciones concretas al final.`,
  
  social: `FORMATO REDES SOCIALES:
- Breve y con gancho (2-4 líneas).
- Termina siempre con un CTA claro.
- Tono conversacional y cercano.
- Puedes usar 1-2 emojis relevantes.`
};

// ── Knowledge Retrieval ──────────────────────────────────────────────────────
async function getKnowledge(
  sb: any,
  focusAreas: string[]
): Promise<string> {
  try {
    // 1. Try knowledge_base table (Obsidian sync)
    let query = sb.from("knowledge_base").select("topic, content");
    
    // Filter by relevant topics if possible
    if (focusAreas.length > 0 && focusAreas[0] !== "General") {
      // Get all and filter — Supabase doesn't support OR on text contains easily
      const { data, error } = await query.order("topic", { ascending: true });
      
      if (data && data.length > 0) {
        // Filter to relevant topics
        const relevant = data.filter((k: any) => {
          const topicLower = (k.topic || "").toLowerCase();
          return focusAreas.some(area => topicLower.includes(area.toLowerCase()));
        });
        
        // If we found specific topics, use them; otherwise use all
        const toUse = relevant.length > 0 ? relevant : data;
        return toUse.map((k: any) => `## ${k.topic}\n${k.content}`).join("\n\n");
      }
    } else {
      const { data } = await query.order("topic", { ascending: true });
      if (data && data.length > 0) {
        return data.map((k: any) => `## ${k.topic}\n${k.content}`).join("\n\n");
      }
    }
  } catch (err) {
    console.error("[BRAIN-KB] Error fetching knowledge_base:", err);
  }
  
  return "";
}

// ── Session Memory (Supabase) ────────────────────────────────────────────────
async function getSessionMemory(
  sb: any,
  sessionId: string
): Promise<Array<{ role: string; content: string }>> {
  try {
    const { data } = await sb
      .from("brain_sessions")
      .select("messages")
      .eq("session_id", sessionId)
      .single();
    
    if (data?.messages) {
      return data.messages;
    }
  } catch {
    // Session doesn't exist yet — that's fine
  }
  return [];
}

async function saveSessionMemory(
  sb: any,
  sessionId: string,
  messages: Array<{ role: string; content: string }>,
  channel: Channel,
  role: Role
): Promise<void> {
  try {
    // Keep only last 20 messages to prevent token overflow
    const trimmed = messages.slice(-20);
    
    await sb
      .from("brain_sessions")
      .upsert({
        session_id: sessionId,
        messages: trimmed,
        channel,
        role,
        updated_at: new Date().toISOString()
      }, { onConflict: "session_id" });
  } catch (err) {
    console.error("[BRAIN-MEMORY] Error saving session:", err);
  }
}

// ── Build System Prompt ──────────────────────────────────────────────────────
function buildSystemPrompt(
  role: Role,
  channel: Channel,
  knowledge: string,
  userContext?: BrainRequest["user_context"]
): string {
  const roleConfig = ROLE_PROMPTS[role];
  const channelRules = CHANNEL_RULES[channel];
  
  let prompt = `${roleConfig.persona}

NOMBRE: ${roleConfig.name}
OBJETIVO: ${roleConfig.objective}
TONO: ${roleConfig.tone}

${channelRules}

REGLAS UNIVERSALES (aplican SIEMPRE):
- Responde SOLO en español.
- NUNCA inventes datos. Si no sabes, di "No tengo esa información en mi base de datos".
- NUNCA repitas tu saludo si ya saludaste en esta conversación.
- NUNCA uses frases vacías: "Entiendo perfectamente", "Es un placer", "Excelente pregunta".
- Sé concisa. El usuario valora su tiempo.
- Si te preguntan algo fuera de tu rol, redirige amablemente.`;

  // Add user context if available
  if (userContext) {
    const ctx: string[] = [];
    if (userContext.user_name) ctx.push(`Nombre del usuario: ${userContext.user_name}`);
    if (userContext.user_phone) ctx.push(`Teléfono: ${userContext.user_phone}`);
    if (userContext.page_url) ctx.push(`Página actual: ${userContext.page_url}`);
    if (ctx.length > 0) {
      prompt += `\n\nCONTEXTO DEL USUARIO:\n${ctx.join("\n")}`;
    }
  }

  // Add knowledge base
  if (knowledge) {
    prompt += `\n\n=== BASE DE CONOCIMIENTO ATIA ===\nUsa esta información para responder. NO la repitas textualmente, pero basa tus respuestas en ella.\n\n${knowledge}`;
  }

  return prompt;
}

// ── Main Handler ─────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Only accept POST
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed. Use POST." }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // ── Parse & Validate Request ───────────────────────────────────
    const body: BrainRequest = await req.json();
    
    const {
      channel = "landing",
      role = "general",
      session_id,
      message,
      user_context,
      attachments
    } = body;

    // Validate required fields
    if (!message || !message.trim()) {
      return new Response(
        JSON.stringify({ error: "El campo 'message' es requerido." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!session_id) {
      return new Response(
        JSON.stringify({ error: "El campo 'session_id' es requerido para mantener la memoria." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate role
    const validRoles: Role[] = ["capacitadora", "vendedora", "reclutadora", "copilot", "general"];
    const activeRole: Role = validRoles.includes(role) ? role : "general";

    // Validate channel
    const validChannels: Channel[] = ["landing", "whatsapp", "crm", "social"];
    const activeChannel: Channel = validChannels.includes(channel) ? channel : "landing";

    console.log(`[BRAIN] Channel: ${activeChannel} | Role: ${activeRole} | Session: ${session_id}`);

    // ── Initialize Supabase ────────────────────────────────────────
    const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

    // ── Fetch Knowledge & Memory in parallel ───────────────────────
    const roleConfig = ROLE_PROMPTS[activeRole];
    
    const [knowledge, sessionHistory] = await Promise.all([
      getKnowledge(sb, roleConfig.knowledge_focus),
      getSessionMemory(sb, session_id)
    ]);

    // ── Build System Prompt ────────────────────────────────────────
    const systemPrompt = buildSystemPrompt(
      activeRole,
      activeChannel,
      knowledge,
      user_context
    );

    // ── Build Gemini Contents (Multi-turn) ─────────────────────────
    const geminiContents: Array<{ role: string; parts: any[] }> = [
      { role: "user", parts: [{ text: systemPrompt }] },
      { role: "model", parts: [{ text: `Entendido. Soy ${roleConfig.name}. Estoy lista.` }] }
    ];

    // Add conversation history
    for (const msg of sessionHistory) {
      geminiContents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      });
    }

    // ── Build current message (potentially multimodal) ─────────────
    const currentParts: any[] = [{ text: message }];

    if (attachments && attachments.length > 0) {
      for (const att of attachments) {
        if (att.type === "image" || att.type === "audio") {
          currentParts.push({
            inline_data: {
              mime_type: att.mimeType,
              data: att.base64
            }
          });
        } else if (att.type === "document") {
          // Append document reference to text
          currentParts[0] = {
            text: `${message}\n\n[Documento adjunto: ${att.name || "archivo"} (${att.mimeType})]`
          };
        }
      }
    }

    geminiContents.push({ role: "user", parts: currentParts });

    // ── Call Gemini ─────────────────────────────────────────────────
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: geminiContents,
          generationConfig: {
            maxOutputTokens: activeChannel === "whatsapp" ? 400 : 1024,
            temperature: activeRole === "vendedora" ? 0.3 : 0.2
          }
        })
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("[BRAIN-GEMINI] Error:", errText);
      return new Response(
        JSON.stringify({ 
          error: "Error de IA. Intenta de nuevo.",
          detail: errText.substring(0, 200)
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiData = await geminiRes.json();
    const reply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!reply) {
      return new Response(
        JSON.stringify({ 
          error: "Sin respuesta del modelo.",
          raw: JSON.stringify(geminiData).substring(0, 300)
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Save to Session Memory ─────────────────────────────────────
    const updatedHistory = [
      ...sessionHistory,
      { role: "user", content: message },
      { role: "assistant", content: reply }
    ];

    // Fire and forget — don't block the response
    saveSessionMemory(sb, session_id, updatedHistory, activeChannel, activeRole);

    // ── Log to analytics (optional) ────────────────────────────────
    sb.from("brain_analytics").insert({
      session_id,
      channel: activeChannel,
      role: activeRole,
      user_message: message.substring(0, 500),
      ai_response: reply.substring(0, 500),
      org_id: user_context?.org_id || DEFAULT_ORG_ID,
      tokens_used: geminiData.usageMetadata?.totalTokenCount || null
    }).then(() => {}).catch(() => {});

    // ── Return Response ────────────────────────────────────────────
    return new Response(
      JSON.stringify({
        reply,
        role: activeRole,
        role_name: roleConfig.name,
        channel: activeChannel,
        session_id,
        tokens: geminiData.usageMetadata?.totalTokenCount || null
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("[BRAIN] Fatal error:", err);
    return new Response(
      JSON.stringify({ error: "Error interno de Adriana Brain.", detail: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
