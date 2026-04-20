// =============================================================================
// Atia Inmobiliaria — Adriana v4 (Multimodal + RAG Semantic Search)
// Anti-loop: dedup by message ID + cooldown per phone
// =============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL") || "https://n8n-evolution-api.yxmkwr.easypanel.host";
const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY") || "";
const EVOLUTION_INSTANCE = Deno.env.get("EVOLUTION_INSTANCE") || "GRUPOATIA";
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "";
const ADVISOR_PHONE = Deno.env.get("ADVISOR_PHONE") || "526672543464"; // Asesor humano para handoff

// ── Anti-loop: in-memory dedup + cooldown ────────────────────────────────────
const processedMessages = new Set<string>();
const phoneCooldowns = new Map<string, number>();
const COOLDOWN_MS = 5000; // 5 seconds between responses to same phone

function shouldProcess(messageId: string, phone: string, fromMe: boolean): boolean {
  // 1. Never process our own messages
  if (fromMe) return false;

  // 2. Skip if we already processed this message ID
  if (processedMessages.has(messageId)) return false;
  processedMessages.add(messageId);

  // Keep set from growing forever (max 500 entries)
  if (processedMessages.size > 500) {
    const first = processedMessages.values().next().value;
    if (first) processedMessages.delete(first);
  }

  // 3. Skip if this phone is in cooldown
  const lastReply = phoneCooldowns.get(phone) || 0;
  if (Date.now() - lastReply < COOLDOWN_MS) return false;

  return true;
}
// ─────────────────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Eres Adriana, asesora inmobiliaria virtual de Atia Inmobiliaria.
Tu objetivo es ayudar a clientes en Culiacán/Sinaloa a vender, comprar o rentar propiedades.

CAPACIDADES:
- Puedes ver fotos de fachadas, interiores o documentos que el cliente te envíe.
- Puedes escuchar notas de voz y audios. Cuando recibas un audio, escúchalo y responde a lo que el cliente dice en el audio.
- Tienes acceso al inventario real de propiedades. Usa los datos del INVENTARIO RECOMENDADO.

REGLAS DE ORO:
- Sé profesional, empática y directa.
- Responde en UN solo mensaje completo, no fragmentes la respuesta.
- Cuando recomiendes propiedades, incluye: tipo, colonia, precio, recámaras, baños.
- Si el inventario incluye link de fotos, SIEMPRE compártelo al cliente.
- Si el cliente pide fotos y no hay link disponible, dile que le enviarás las fotos por este medio en breve.
- Prioriza agendar una visita de diagnóstico gratuito.
- No cortes tu respuesta a la mitad. Termina siempre con una pregunta o propuesta clara.

DATOS QUE NECESITAS RECOPILAR (pide naturalmente durante la conversación, NO todo de golpe):
- Nombre completo
- Número de teléfono (si el contacto no tiene número real, pídelo: "Para darte mejor atención, ¿me compartes tu número de celular?")
- Qué busca: comprar, vender o rentar
- Tipo de propiedad y zona/colonia
- Presupuesto o rango de precio
- Forma de pago (Infonavit, crédito bancario, contado)
- Urgencia (inmediato, 1-3 meses, solo explorando)
- Si vende: ¿tiene avalúo? ¿predial al corriente? ¿escrituras listas? ¿cuánto tiempo lleva publicada?`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

async function getMediaBase64(webhookData: any): Promise<{ data: string; mimeType: string } | null> {
  // 1. Check if base64 is already embedded in the webhook data
  const mediaTypes = ['audioMessage', 'pttMessage', 'imageMessage', 'videoMessage', 'documentMessage', 'stickerMessage'];
  for (const mt of mediaTypes) {
    const msgObj = webhookData.message?.[mt];
    if (msgObj?.base64) {
      const rawMime = msgObj.mimetype || msgObj.mimeType || "application/octet-stream";
      console.log(`[ADRIANA] Base64 found directly in webhook (${mt}), mime: ${rawMime}`);
      return { data: msgObj.base64, mimeType: rawMime.split(';')[0].trim() };
    }
  }

  // 2. Fetch from Evolution API — try convertToMp4 false first, then true for audio
  const url = `${EVOLUTION_API_URL}/chat/getBase64FromMediaMessage/${EVOLUTION_INSTANCE}`;
  const isAudio = !!(webhookData.message?.audioMessage || webhookData.message?.pttMessage);
  const attempts = isAudio ? [false, true] : [false]; // Try convertToMp4=true for audio as fallback

  for (const convertMp4 of attempts) {
    const payload = {
      message: {
        key: webhookData.key,
        message: webhookData.message,
      },
      convertToMp4: convertMp4,
    };
    console.log(`[ADRIANA] Requesting media (convertToMp4=${convertMp4})...`);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const res = await fetch(url, {
        method: "POST",
        headers: { apikey: EVOLUTION_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        console.error(`[ADRIANA] Media fetch failed ${res.status} (mp4=${convertMp4}): ${errText.substring(0, 200)}`);
        continue;
      }

      const json = await res.json();
      const base64 = json.base64 || json.base64Media;
      const rawMime = json.mimetype || json.mimeType || (isAudio ? "audio/ogg" : "application/octet-stream");

      if (!base64) {
        console.error(`[ADRIANA] No base64 in response (mp4=${convertMp4}):`, JSON.stringify(json).substring(0, 300));
        continue;
      }

      // Clean mimeType — remove codec suffixes like "; codecs=opus"
      const cleanMime = rawMime.split(';')[0].trim();
      console.log(`[ADRIANA] Media fetched OK: ${cleanMime}, ${base64.length} chars base64`);
      return { data: base64, mimeType: cleanMime };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`[ADRIANA] Media fetch error (mp4=${convertMp4}): ${msg}`);
    }
  }

  return null;
}

// ── Send property photos via Evolution API sendMedia ─────────────────────────
async function sendPropertyPhotos(phone: string, properties: any[]): Promise<void> {
  for (const prop of properties.slice(0, 3)) { // Max 3 photos per response
    const imageUrl = prop.images_url || prop.lamudi_url || prop.tokko_url;
    if (!imageUrl) continue;

    // Only send if it's a direct image URL (jpg, png, webp)
    const isDirectImage = /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(imageUrl);
    if (!isDirectImage) continue;

    try {
      const caption = `${prop.property_type || "Propiedad"} en ${prop.colonia || prop.sector || "Culiacán"}`;
      await fetch(`${EVOLUTION_API_URL}/message/sendMedia/${EVOLUTION_INSTANCE}`, {
        method: "POST",
        headers: { apikey: EVOLUTION_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({
          number: phone,
          mediatype: "image",
          media: imageUrl,
          caption,
        }),
      });
      console.log(`[PHOTO] Sent property image to ${phone}: ${caption}`);
    } catch (e) {
      console.error(`[PHOTO] Failed to send image:`, e);
    }
  }
}

async function getSemanticContext(supabase: any, query: string): Promise<{ text: string; properties: any[] }> {
  try {
    // DB stores vector(3072) — must use gemini-embedding-001 which outputs 3072 dims by default
    const embedModel = "models/gemini-embedding-001";
    console.log(`[DEBUG] Generando embedding con ${embedModel} para query: ${query.substring(0, 50)}...`);
    
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/${embedModel}:embedContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: embedModel,
        content: { parts: [{ text: query }] },
        taskType: "RETRIEVAL_QUERY",
      }),
    });

    if (!res.ok) {
      const errorData = await res.text();
      console.error(`[DEBUG] Gemini Embedding API error: ${res.status} - ${errorData}`);
      return { text: "", properties: [] };
    }

    const resJson = await res.json();
    const embedding = resJson.embedding;

    if (!embedding || !embedding.values) {
      console.error("[DEBUG] Invalid embedding response format:", JSON.stringify(resJson).substring(0, 200));
      return { text: "", properties: [] };
    }

    console.log(`[DEBUG] Embedding generado (${embedding.values.length} dims). Buscando en DB...`);

    const { data: matches, error: rpcError } = await supabase.rpc("match_properties_semantic", {
      query_embedding: embedding.values,
      match_threshold: 0.50,
      match_count: 5
    });

    if (rpcError) {
      console.error("[DEBUG] RPC match_properties_semantic error:", JSON.stringify(rpcError));
      return { text: "", properties: [] };
    }

    if (!matches || matches.length === 0) {
      console.log("[DEBUG] No semantic matches found.");
      return { text: "", properties: [] };
    }

    console.log(`[DEBUG] ${matches.length} propiedades encontradas en RAG.`);

    // RPC returns 'id' (not 'property_id') — enrich with extra columns from properties table
    const ids = matches.map((m: any) => m.id);
    const { data: fullProps } = await supabase
      .from("properties")
      .select("id, lamudi_url, tokko_url, drive_link, images_url, address, has_pool, is_furnished, is_private, parking_spots, extra_features")
      .in("id", ids);
    const linksMap = new Map((fullProps || []).map((p: any) => [p.id, p]));

    // Build enriched properties list (for photo sending)
    const enrichedProperties = matches.map((m: any) => ({
      ...m,
      ...(linksMap.get(m.id) || {}),
    }));

    const text = "\n\nINVENTARIO RECOMENDADO:\n" + matches.map((m: any) => {
      const extra = linksMap.get(m.id) || {};
      let line = `- ${m.property_type} en ${m.operation}`;
      if (m.colonia) line += ` en ${m.colonia}`;
      if (m.sector) line += ` (${m.sector})`;
      if (m.city) line += `, ${m.city}`;
      if (m.price) line += `: $${Number(m.price).toLocaleString()} MXN`;
      if (m.bedrooms) line += `. ${Number(m.bedrooms)} recámaras`;
      if (m.bathrooms) line += `, ${Number(m.bathrooms)} baños`;
      if (extra.parking_spots) line += `, ${Number(extra.parking_spots)} estacionamientos`;
      if (extra.has_pool) line += `, con alberca`;
      if (extra.is_furnished) line += `, amueblada`;
      if (extra.extra_features) line += `. ${extra.extra_features}`;
      if (extra.lamudi_url) line += `\n  Fotos: ${extra.lamudi_url}`;
      else if (extra.tokko_url) line += `\n  Fotos: ${extra.tokko_url}`;
      else if (extra.drive_link) line += `\n  Fotos: ${extra.drive_link}`;
      return line;
    }).join("\n");

    return { text, properties: enrichedProperties };
  } catch (e) {
    console.error("[RAG Error]", e);
    return { text: "", properties: [] };
  }
}

// ── CRM: Lead extraction + auto-classification ─────────────────────────────

const ORG_ID = "e67404e2-d14c-44ad-9275-9b89372aa57d";
const leadExtractedPhones = new Set<string>(); // avoid re-extracting same phone in same session

const EXTRACT_PROMPT = `Analiza la siguiente conversación de WhatsApp entre un cliente y Adriana (asesora inmobiliaria de Atia).
Extrae los datos del cliente SOLO si hay suficiente información para crear un lead (mínimo: intención clara de comprar, vender o rentar).

Responde ÚNICAMENTE con un JSON válido, sin markdown ni texto adicional:
{
  "is_lead": true/false,
  "name": "nombre del cliente o null",
  "phone_mentioned": "número de teléfono que el cliente haya compartido en la conversación o null",
  "email": "email si lo compartió o null",
  "operation": "Compra" | "Venta" | "Renta" | "Administración Airbnb" | null,
  "property_type": "Casa" | "Departamento" | "Terreno" | "Local" | "Bodega" | "Oficina" | null,
  "budget": "presupuesto mencionado como texto o null",
  "budget_value": número o null,
  "sector": "sector/colonia mencionada o null",
  "city": "ciudad mencionada o Culiacán",
  "bedrooms": número de recámaras o null,
  "bathrooms": número de baños o null,
  "payment_method": "Infonavit" | "Crédito bancario" | "Contado" | "Mixto" | null,
  "urgency": "alta" | "media" | "baja",
  "category": "A" | "B" | "C",
  "details": "resumen breve de lo que busca el cliente",
  "property_status": "Vacía" | "Habitada" | "Rentada" | "En remodelación" | null,
  "has_debts": true/false/null,
  "has_appraisal": true/false/null,
  "time_on_market": "0-30 días" | "1-3 meses" | "3-6 meses" | "6+ meses" | null,
  "has_other_agency": true/false/null
}

Reglas de clasificación:
- A: Presupuesto definido + zona clara + urgencia alta (quiere agendar, quiere ver hoy, tiene dinero listo)
- B: Interés claro pero falta presupuesto o zona, o urgencia media
- C: Solo pregunta general, compara precios, no da datos concretos

Si la conversación es solo un saludo o no hay intención inmobiliaria clara, responde: {"is_lead": false}`;

async function extractAndSaveLead(
  supabase: any,
  phone: string,
  userName: string,
  conversationHistory: string,
  isLid = false
): Promise<string | null> {
  // Check if lead already exists in DB (check both whatsapp and phone fields)
  const { data: existingLead } = await supabase
    .from("leads")
    .select("id, phone")
    .eq("whatsapp", phone)
    .eq("org_id", ORG_ID)
    .limit(1)
    .maybeSingle();

  if (existingLead) {
    leadExtractedPhones.add(phone);
    return existingLead.id; // Return existing lead ID for conversation saving
  }

  // Don't re-extract for same phone in this function instance lifecycle
  if (leadExtractedPhones.has(phone)) return null;

  try {
    const extractRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: EXTRACT_PROMPT }] },
          contents: [{ role: "user", parts: [{ text: conversationHistory }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 512 },
        }),
      }
    );

    const extractData = await extractRes.json();
    const rawText = extractData?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Parse JSON from response (strip markdown code fences if present)
    const jsonStr = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const lead = JSON.parse(jsonStr);

    if (!lead.is_lead) return null;

    console.log(`[CRM] Lead detected: ${userName} (${phone}) — ${lead.operation} ${lead.property_type} — Cat: ${lead.category} — isLid: ${isLid}`);

    // Use phone from conversation if available, otherwise use WhatsApp ID
    const realPhone = lead.phone_mentioned || (isLid ? null : phone);
    const leadName = lead.name || userName;
    const { data: newLead, error: leadError } = await supabase
      .from("leads")
      .insert({
        org_id: ORG_ID,
        full_name: leadName,
        name: leadName,
        whatsapp: phone, // Always store the WhatsApp ID (works for messaging even if LID)
        phone: realPhone || phone, // Prefer real phone, fallback to WhatsApp ID
        email: lead.email || null,
        city: lead.city || "Culiacán",
        status: "new",
        vertical: "inmobiliaria",
        source: "whatsapp_adriana",
        coverage_type: lead.operation || null,
        value_estimate: lead.budget_value || null,
        lead_score: lead.category === "A" ? 80 : lead.category === "B" ? 50 : 20,
        metadata: {
          intent: lead.operation?.toLowerCase() || "general",
          property_type: lead.property_type || null,
          property_value: lead.budget || "no_especificado",
          campaign: "adriana_whatsapp",
          location: lead.city || "Culiacán",
          sector: lead.sector || null,
          urgency: lead.urgency,
          ai_category: lead.category,
          ai_details: lead.details,
          bedrooms: lead.bedrooms || null,
          bathrooms: lead.bathrooms || null,
          payment_method: lead.payment_method || null,
          property_status: lead.property_status || null,
          has_debts: lead.has_debts ?? null,
          has_appraisal: lead.has_appraisal ?? null,
          time_on_market: lead.time_on_market || null,
          has_other_agency: lead.has_other_agency ?? null,
          is_lid: isLid,
          whatsapp_lid: isLid ? phone : null,
        },
      })
      .select("id")
      .single();

    if (leadError) {
      console.error("[CRM] Lead insert error:", leadError.message);
      return null;
    }

    // Insert corretaje_request
    if (newLead?.id) {
      await supabase.from("corretaje_requests").insert({
        org_id: ORG_ID,
        lead_id: newLead.id,
        operation_type: lead.operation || "Venta",
        property_type: lead.property_type || "Casa",
        budget_display: lead.budget || "No especificado",
        budget_max: lead.budget_value || null,
        sector: lead.sector || lead.city || "Culiacán",
        details: lead.details || "",
        category: lead.category || "B",
        status: "new",
        options_target: 3,
        options_found: 0,
      });

      console.log(`[CRM] Lead saved: ${newLead.id} — ${lead.category} — ${lead.operation} ${lead.property_type}`);
    }

    leadExtractedPhones.add(phone);

    // HANDOFF: If category A lead, notify human advisor
    if (lead.category === "A" && newLead?.id) {
      await triggerHandoff(supabase, newLead.id, phone, leadName, lead);
    }

    return newLead?.id || null;
  } catch (e) {
    console.error("[CRM] Extract error:", e);
    return null;
  }
}

// ── Handoff inteligente: Notificar asesor humano ─────────────────────────────

async function triggerHandoff(
  supabase: any,
  leadId: string,
  phone: string,
  name: string,
  leadData: any
): Promise<void> {
  try {
    // 1. Mark lead as handed_off in ai_conversation_context
    await supabase.from("ai_conversation_context").upsert({
      lead_id: leadId,
      org_id: ORG_ID,
      status: "handed_off",
      handoff_reason: `Lead A: ${leadData.operation} ${leadData.property_type} — ${leadData.details}`,
      handed_off_at: new Date().toISOString(),
    }, { onConflict: "lead_id" });

    // 2. Update lead status
    await supabase.from("leads")
      .update({ status: "handed_off" })
      .eq("id", leadId);

    // 3. Send WhatsApp notification to human advisor
    const advisorMsg = `NUEVO LEAD CALIENTE (A)\n\n` +
      `Cliente: ${name}\n` +
      `Tel: ${phone}\n` +
      `Operacion: ${leadData.operation || "N/A"}\n` +
      `Tipo: ${leadData.property_type || "N/A"}\n` +
      `Presupuesto: ${leadData.budget || "No especificado"}\n` +
      `Zona: ${leadData.sector || leadData.city || "Culiacán"}\n` +
      `Urgencia: ${leadData.urgency || "media"}\n\n` +
      `Detalle: ${leadData.details || ""}\n\n` +
      `Adriana ya esta atendiendo. Toma el control desde el CRM o contacta directo.`;

    await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
      method: "POST",
      headers: { apikey: EVOLUTION_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ number: ADVISOR_PHONE, text: advisorMsg }),
    });

    // 4. Inform client that a human advisor will follow up
    const clientMsg = `${name}, tu busqueda es muy interesante. Te voy a poner en contacto con uno de nuestros asesores especializados para que te atienda de forma personalizada. Te contactara en breve.`;

    await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
      method: "POST",
      headers: { apikey: EVOLUTION_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ number: phone, text: clientMsg }),
    });

    console.log(`[HANDOFF] Lead A: ${name} (${phone}) -> Advisor notified at ${ADVISOR_PHONE}`);
  } catch (e) {
    console.error("[HANDOFF] Error:", e);
  }
}

// ── Main Controller ──────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();

    // Only process new messages
    if (body.event !== "messages.upsert") {
      return new Response(JSON.stringify({ status: "ignored", reason: "not_message" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = body.data;
    if (!data?.key) {
      return new Response(JSON.stringify({ status: "ignored", reason: "no_key" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const remoteJid = data.key.remoteJid || "";
    const messageId = data.key.id || "";
    const fromMe = data.key.fromMe === true;

    // Ignore group messages
    if (remoteJid.includes("@g.us") || remoteJid.includes("@broadcast")) {
      return new Response(JSON.stringify({ status: "ignored", reason: "group" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle both @s.whatsapp.net (normal) and @lid (WhatsApp Linked ID)
    const isLid = remoteJid.includes("@lid");
    const phone = remoteJid.replace("@s.whatsapp.net", "").replace("@lid", "");

    // Anti-loop: dedup + cooldown + fromMe check
    if (!shouldProcess(messageId, phone, fromMe)) {
      return new Response(JSON.stringify({ status: "ignored", reason: "dedup_or_cooldown" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userName = data.pushName || "Cliente";

    // ── Diagnostic: log message structure for debugging ──
    const msgKeys = Object.keys(data.message || {});
    const msgType = data.messageType || "unknown";
    console.log(`[ADRIANA] Message from ${userName} (${phone}): type=${msgType}, keys=[${msgKeys.join(',')}]`);

    // Parse message content
    const userText = data.message?.conversation || data.message?.extendedTextMessage?.text || data.message?.imageMessage?.caption || "";
    let mediaData: any = null;

    // Detect media — check both message object AND messageType field
    const hasMedia = data.message?.imageMessage
      || data.message?.audioMessage
      || data.message?.pttMessage
      || data.message?.documentMessage
      || data.message?.documentWithCaptionMessage
      || data.message?.videoMessage
      || data.message?.stickerMessage
      || msgType === "audioMessage"
      || msgType === "pttMessage";

    if (hasMedia) {
      console.log(`[ADRIANA] Media detected: audio=${!!data.message?.audioMessage}, ptt=${!!data.message?.pttMessage}, msgType=${msgType}`);
      try {
        mediaData = await getMediaBase64(data);
        console.log(`[ADRIANA] Media result: ${mediaData ? 'OK' : 'FAILED'}, type: ${mediaData?.mimeType || 'unknown'}`);
      } catch (e) {
        console.error("[ADRIANA] Media download failed:", e);
      }
    }

    // Skip if no text, no media intent, and no media data
    if (!userText && !mediaData && !hasMedia) {
      console.log(`[ADRIANA] Skipping: no content. userText='${userText}', mediaData=${!!mediaData}, hasMedia=${!!hasMedia}`);
      return new Response(JSON.stringify({ status: "ignored", reason: "no_content" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[ADRIANA] Processing: text='${userText.substring(0, 80)}', hasMedia=${!!hasMedia}, mediaOK=${!!mediaData}`);

    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

    // 0. Check if this lead is handed_off (human advisor took over)
    // Defense #1: check ai_conversation_context.status
    // Defense #2: check leads.status directly (fallback if upsert ever failed)
    try {
      const { data: existingLead } = await supabase
        .from("leads")
        .select("id, status")
        .eq("whatsapp", phone)
        .eq("org_id", ORG_ID)
        .limit(1)
        .maybeSingle();

      if (existingLead) {
        const { data: aiCtx } = await supabase
          .from("ai_conversation_context")
          .select("status")
          .eq("lead_id", existingLead.id)
          .maybeSingle();

        const isHandedOff = aiCtx?.status === "handed_off" || existingLead.status === "handed_off";

        if (isHandedOff) {
          // Still save message to CRM inbox for advisor visibility
          await supabase.from("conversations").insert({
            lead_id: existingLead.id,
            org_id: ORG_ID,
            direction: "inbound",
            content: userText || "[Audio/Media]",
            is_bot: false,
            message_id: messageId,
          }).catch(() => {});
          console.log(`[ADRIANA] ${phone} is handed_off (lead.status=${existingLead.status}, ctx=${aiCtx?.status}) — CRM saved, bot skipped.`);
          return new Response(JSON.stringify({ status: "handed_off", reason: "human_advisor_active" }), {
            status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    } catch (e) {
      console.error("[ADRIANA] Handoff check failed (continuing):", e);
      // Don't block — continue to respond normally if check fails
    }

    // 1. Memory retrieval
    const { data: historyData } = await supabase.from("chat_memory").select("role, content").eq("phone", phone).order("created_at", { ascending: false }).limit(6);
    const history = (historyData || []).reverse().map((m: any) => ({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.content }] }));

    // 2. RAG Context (semantic search) — skip for short greetings to save API quota
    const isShortGreeting = userText && userText.length < 15 && /^(hola|hey|buenas?|buenos?\s|ola|hi|que tal|qué tal)/i.test(userText.trim());
    const ragResult = isShortGreeting
      ? { text: "", properties: [] }
      : await getSemanticContext(supabase, userText || "vender casa");

    // 3. Prepare Gemini Request
    const contents = [...history];

    // Determine what the user sent
    const isVoiceNote = !!(data.message?.audioMessage?.ptt || data.message?.pttMessage || msgType === "pttMessage");
    let userMessageText = userText;
    if (!userText && hasMedia && mediaData) {
      userMessageText = isVoiceNote
        ? "(El cliente envio una nota de voz. Escucha el audio adjunto y responde a lo que dice.)"
        : "(El cliente envio un archivo multimedia. Analiza el contenido adjunto.)";
    } else if (!userText && hasMedia && !mediaData) {
      userMessageText = isVoiceNote
        ? "(El cliente envio una nota de voz pero no se pudo descargar el audio. Preguntale amablemente que te repita lo que dijo por texto.)"
        : "(El cliente envio un archivo multimedia pero no se pudo procesar. Pidele que lo reenvie o describa su consulta por texto.)";
    }

    const currentMessageParts: any[] = [{ text: userMessageText || "hola" }];

    if (mediaData) {
      currentMessageParts.push({ inlineData: { data: mediaData.data, mimeType: mediaData.mimeType } });
      console.log(`[ADRIANA] Sending to Gemini: text + inlineData (${mediaData.mimeType})`);
    }
    contents.push({ role: "user", parts: currentMessageParts });

    // 4. Generate AI response (with retry on 429)
    let aiText: string | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: `${SYSTEM_PROMPT}\n\nCliente: ${userName}${ragResult.text}` }] },
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
        }),
      });

      if (geminiRes.status === 429) {
        console.log(`[ADRIANA] Gemini rate limited (attempt ${attempt + 1}/3), waiting...`);
        await new Promise(r => setTimeout(r, (attempt + 1) * 10000));
        continue;
      }

      if (!geminiRes.ok) {
        const errorData = await geminiRes.text();
        console.error(`[ADRIANA] Gemini API error: ${geminiRes.status} - ${errorData.substring(0, 200)}`);
        break;
      }

      const geminiData = await geminiRes.json();
      aiText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || null;
      break;
    }

    // Fallback message if Gemini is unavailable
    if (!aiText) {
      aiText = `Hola ${userName}, gracias por escribir a Atia Inmobiliaria. En este momento tengo alta demanda. Un asesor te contactara en breve. Mientras tanto, puedes llamarnos al (667) 454-0164.`;
      console.log(`[ADRIANA] Using fallback message for ${phone}`);
    }

    // 5. Save memory (legacy)
    const memoryContent = userText || (isVoiceNote ? "[Nota de voz]" : "[Media]");
    await supabase.from("chat_memory").insert([
      { phone, role: "user", content: memoryContent },
      { phone, role: "model", content: aiText },
    ]);

    // 6. Send reply + mark cooldown
    await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
      method: "POST",
      headers: { apikey: EVOLUTION_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ number: phone, text: aiText }),
    });

    // Mark cooldown AFTER sending to prevent double-fire
    phoneCooldowns.set(phone, Date.now());

    // 6b. Send property photos if RAG found matches with images
    if (ragResult.properties.length > 0) {
      sendPropertyPhotos(phone, ragResult.properties).catch((e) =>
        console.error("[PHOTO] Background send failed:", e)
      );
    }

    console.log(`[ADRIANA] Reply -> ${phone}: ${aiText.substring(0, 80)}...`);

    // 7. CRM: Extract lead + save conversations (non-blocking)
    // Only extract lead if conversation has substance (skip for greetings)
    const messageCount = (historyData?.length || 0) + 1;
    const hasSubstance = !isShortGreeting || messageCount >= 4;

    const allMessages = [
      ...(historyData || []).reverse().map((m: any) => `${m.role === "user" ? "Cliente" : "Adriana"}: ${m.content}`),
      `Cliente: ${userText || "[Audio/Media]"}`,
      `Adriana: ${aiText}`,
    ].join("\n");

    // Fire and forget — don't block the WhatsApp response
    (async () => {
      try {
        // 7a. Extract and save lead if new (skip Gemini call for simple greetings)
        const leadId = hasSubstance
          ? await extractAndSaveLead(supabase, phone, userName, allMessages, isLid)
          : null;

        // 7b. Save conversations to CRM Inbox (if we have a lead_id)
        if (leadId) {
          await supabase.from("conversations").insert([
            {
              lead_id: leadId,
              org_id: ORG_ID,
              direction: "inbound",
              content: userText || "[Audio/Media]",
              is_bot: false,
              message_id: messageId,
            },
            {
              lead_id: leadId,
              org_id: ORG_ID,
              direction: "outbound",
              content: aiText,
              is_bot: true,
              message_id: `bot_${messageId}`,
            },
          ]);
        }
      } catch (e) {
        console.error("[CRM] Background sync failed:", e);
      }
    })();

    return new Response(JSON.stringify({ status: "success" }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("[ADRIANA Error]", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
