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

// ── Sandbox: si SANDBOX_MODE=true, solo responde a teléfonos en SANDBOX_PHONES ─
// Los demás números reciben handoff a humano (no se les pierde el mensaje).
const SANDBOX_MODE = (Deno.env.get("SANDBOX_MODE") || "").toLowerCase() === "true";
const SANDBOX_PHONES_RAW = Deno.env.get("SANDBOX_PHONES") || "";

function normalizePhone(p: string): string {
  return (p || "").replace(/\D/g, "");
}

const SANDBOX_PHONES: string[] = SANDBOX_PHONES_RAW
  .split(",")
  .map((p) => normalizePhone(p))
  .filter(Boolean);

// Match robusto: compara los últimos 10 dígitos (número local MX) para tolerar
// variaciones de código país y prefijo móvil: 52 vs 521 vs +52 vs +521.
// Ej: "526671371218", "5216671371218", "+5216671371218" -> todos matchean si el
// SANDBOX_PHONES contiene cualquiera de ellos.
function lastDigits(s: string, n: number): string {
  return s.length >= n ? s.slice(-n) : s;
}

function isSandboxAllowed(phone: string): boolean {
  if (!SANDBOX_MODE) return true;
  const normalized = normalizePhone(phone);
  if (!normalized || SANDBOX_PHONES.length === 0) return false;
  const tail = lastDigits(normalized, 10);
  return SANDBOX_PHONES.some(
    (allowed) => allowed === normalized || lastDigits(allowed, 10) === tail
  );
}

if (SANDBOX_MODE) {
  console.log(`[SANDBOX] ENABLED. Whitelist: ${SANDBOX_PHONES.join(", ") || "(empty — bot silenced for ALL)"}`);
}

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

const SYSTEM_PROMPT = `Eres Adriana, asesora inmobiliaria de Atia en Culiacán.

FORMATO WHATSAPP (NO NEGOCIABLE):
- Negritas con *un asterisco*, nunca **dos** ni [texto](url) ni markdown.
- URLs siempre planas, sin formato.
- 3-5 líneas por mensaje. Nunca más.
- Máximo 2 propiedades por mensaje (con 1 línea cada una: tipo, colonia, precio, recámaras).
- Sin emojis decorativos (máx. 1 cada 5 mensajes si aporta).

TONO:
- Directa, cálida, como asesora humana real.
- Prohibido: "Entiendo perfectamente", "Es un placer", "Excelente", "¡Qué interesante!", "Gracias por contactarnos".
- No repitas tu nombre ni la empresa en cada mensaje (solo al saludar por primera vez).
- Habla de tú, en español natural de Sinaloa.

FLUJO DE CONVERSACIÓN (crítico, en este orden):
1. CALIFICAR primero: pregunta 1-2 datos clave antes de recomendar (¿compra/venta/renta? ¿zona? ¿presupuesto?).
2. RECOMENDAR después: solo si ya tienes intención + zona O presupuesto. Máximo 2 opciones.
3. La "visita de diagnóstico gratuita" es para CERRAR, no para abrir. Solo mencionarla si ya hay interés concreto en una propiedad o tras 3+ intercambios. Nunca en el primer mensaje, nunca dos veces seguidas.

LECTURA DE CONTEXTO:
- Si el cliente bromea, está ocupado, dice "estoy en el cine" / "más tarde" / "jajaja" / "ahorita no": responde 1 línea corta, reconoce el momento, cede espacio. NO vendas, NO propongas visitas.
- Si el mensaje es vago (<10 palabras) y no hay historial de calificación: haz UNA pregunta corta, no des inventario.

INVENTARIO:
- Si recibes "INVENTARIO RECOMENDADO" en contexto, úsalo solo cuando el cliente ya compartió intención + zona o presupuesto.
- Si aún no calificaste: IGNORA el inventario y pregunta.
- Al recomendar, 1 línea por propiedad: tipo en colonia · precio · recámaras/baños. Link de fotos plano al final si existe.

DATOS A RECOPILAR (naturalmente, 1 por turno): nombre, teléfono real si viene por WhatsApp sin número, operación, zona, presupuesto, forma de pago, urgencia.

QUEJAS Y CLIENTES MOLESTOS (crítico):
- Si el cliente expresa molestia ("pésimo", "no sirven", "no resuelven", "estafa", "lo peor", "qué mal", "cancela", "reclamo"): UNA sola disculpa breve, máximo. NUNCA te disculpes dos mensajes seguidos por el mismo motivo.
- PROHIBIDO inventar problemas que el cliente no mencionó. Si dice "pésimo servicio" y tú no sabes a qué se refiere, NO hables de "enlaces mal enviados" ni de errores específicos que no fueron mencionados. Pregúntale qué pasó o pásalo a un asesor humano.
- Si el cliente repite la queja o sigue molesto: deja de disculparte y deriva: "Te paso con un asesor humano para que te atienda directo. Te contacta en breve." Nada más.
- No uses frases huecas como "Lamento mucho", "Una disculpa sincera", "Tienes toda la razón" repetidas. Una vez es suficiente.`;

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
async function sendPropertyPhotos(remoteJid: string, properties: any[]): Promise<void> {
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
          number: remoteJid,
          mediatype: "image",
          media: imageUrl,
          caption,
        }),
      });
      console.log(`[PHOTO] Sent property image to ${remoteJid}: ${caption}`);
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

// Clean and normalize display names from WhatsApp pushName or LLM extraction
function cleanName(raw: string | null | undefined): string {
  if (!raw) return "";
  let t = String(raw).trim();
  if (t.length < 2) return "";
  if (/^[_\-\.\s]+$/.test(t)) return "";              // only punctuation
  if (/^\d+$/.test(t)) return "";                      // only digits
  if (/^[\p{Extended_Pictographic}\p{Emoji_Presentation}\s]+$/u.test(t)) return ""; // only emojis
  // Strip trailing company/role keywords
  t = t.replace(/\s+(inmobiliaria|bienes\s*raices|bienes\s*raíces|broker|real\s*estate|inmobiliario|asesor\w*)\b.*/i, "");
  // Capitalize words (first letter upper, rest lower)
  return t.split(/\s+/).map(w => w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w).join(" ").trim();
}

// Build a safe fallback display name when we have no good input
function fallbackName(phone: string, isLid: boolean): string {
  const last4 = (phone || "").replace(/\D/g, "").slice(-4) || "0000";
  return isLid ? `Cliente WA ${last4}` : `Cliente ${last4}`;
}

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

// Detector de mensajes de cliente molesto/frustrado
const ANGER_PATTERNS = /(?:^|\s|[.,!¡?¿])(p[eé]simo|no\s+(?:sirven?|resuelven?|funciona?n?)|estaf|fraude|lo\s+peor|terrible|horrible|qu[eé]\s+mal|muy\s+mal|enga[ñn]|mienten|mentira|robaron|denuncia|demand|hartad?o|harto|tonter[íi]a|pendej|idiot|cancela|ya\s+no\s+quiero|d[eé]jenme|no\s+me\s+molest|molesto|molesta|enojad[ao]|reclam|queja\b)/i;

function detectAnger(text: string): boolean {
  if (!text) return false;
  return ANGER_PATTERNS.test(text);
}

// Crea un lead mínimo (skeleton) si no existe — NO requiere intención inmobiliaria.
// Esto garantiza que TODA conversación de WhatsApp queda registrada en el CRM,
// incluso si es solo una queja o un saludo. La extracción enriquecida llega después.
async function ensureLeadShell(
  supabase: any,
  phone: string,
  userName: string,
  isLid = false
): Promise<string | null> {
  const { data: existing } = await supabase
    .from("leads")
    .select("id")
    .eq("whatsapp", phone)
    .eq("org_id", ORG_ID)
    .limit(1)
    .maybeSingle();
  if (existing?.id) return existing.id;

  const leadName = cleanName(userName) || fallbackName(phone, isLid);
  const realPhone = isLid ? null : phone;
  const { data: newLead, error } = await supabase
    .from("leads")
    .insert({
      org_id: ORG_ID,
      full_name: leadName,
      name: leadName,
      whatsapp: phone,
      phone: realPhone,
      city: "Culiacán",
      status: "new",
      vertical: "inmobiliaria",
      source: "whatsapp_adriana",
      lead_score: 10,
      metadata: {
        campaign: "adriana_whatsapp",
        is_lid: isLid,
        whatsapp_lid: isLid ? phone : null,
        skeleton: true,
      },
    })
    .select("id")
    .single();

  if (error) {
    console.error("[CRM] Skeleton lead error:", error.message);
    return null;
  }
  console.log(`[CRM] Skeleton lead created: ${leadName} (${phone})`);
  return newLead?.id || null;
}

// Handoff por sentimiento negativo: una sola disculpa, escalar a humano y silenciar el bot.
async function triggerAngerHandoff(
  supabase: any,
  leadId: string,
  phone: string,
  name: string,
  userText: string
): Promise<void> {
  try {
    await supabase.from("ai_conversation_context").upsert({
      lead_id: leadId,
      org_id: ORG_ID,
      status: "handed_off",
      handoff_reason: `Cliente molesto: "${(userText || "").slice(0, 200)}"`,
      handed_off_at: new Date().toISOString(),
    }, { onConflict: "lead_id" });

    await supabase.from("leads").update({ status: "handed_off" }).eq("id", leadId);

    const advisorMsg = `CLIENTE MOLESTO — REVISAR\n\n` +
      `Cliente: ${name}\n` +
      `Tel: ${phone}\n` +
      `Mensaje: "${(userText || "").slice(0, 300)}"\n\n` +
      `Adriana se silenció. Toma el control desde el CRM.`;

    await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
      method: "POST",
      headers: { apikey: EVOLUTION_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ number: ADVISOR_PHONE, text: advisorMsg }),
    });

    const clientMsg = `Te paso con un asesor humano para que revise tu caso directo. Te contacta en breve.`;
    await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
      method: "POST",
      headers: { apikey: EVOLUTION_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ number: phone, text: clientMsg }),
    });

    console.log(`[HANDOFF-ANGER] ${name} (${phone}) -> Advisor`);
  } catch (e) {
    console.error("[HANDOFF-ANGER] Error:", e);
  }
}

async function extractAndSaveLead(
  supabase: any,
  phone: string,
  userName: string,
  conversationHistory: string,
  isLid = false
): Promise<string | null> {
  // Check if lead already exists (skeleton or fully enriched)
  const { data: existingLead } = await supabase
    .from("leads")
    .select("id, phone, metadata")
    .eq("whatsapp", phone)
    .eq("org_id", ORG_ID)
    .limit(1)
    .maybeSingle();

  // If lead exists and is NOT a skeleton, no enrichment needed
  if (existingLead && !existingLead.metadata?.skeleton) {
    leadExtractedPhones.add(phone);
    return existingLead.id;
  }

  // Don't re-extract for same phone in this function instance lifecycle
  if (leadExtractedPhones.has(phone)) return existingLead?.id || null;

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

    if (!lead.is_lead) {
      // No es lead aún, pero el skeleton ya existe (si lo había). Marcar como intentado.
      leadExtractedPhones.add(phone);
      return existingLead?.id || null;
    }

    console.log(`[CRM] Lead detected: ${userName} (${phone}) — ${lead.operation} ${lead.property_type} — Cat: ${lead.category} — isLid: ${isLid}`);

    // Use phone from conversation if available, otherwise use WhatsApp ID
    const realPhone = lead.phone_mentioned || (isLid ? null : phone);
    const leadName = cleanName(lead.name) || cleanName(userName) || fallbackName(phone, isLid);
    const leadFields = {
      full_name: leadName,
      name: leadName,
      phone: realPhone,
      email: lead.email || null,
      city: lead.city || "Culiacán",
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
        skeleton: false,
      },
    };

    let newLead: { id: string } | null = null;
    if (existingLead?.id) {
      // Enriquecer skeleton existente
      const { data: updated, error: updErr } = await supabase
        .from("leads")
        .update(leadFields)
        .eq("id", existingLead.id)
        .select("id")
        .single();
      if (updErr) {
        console.error("[CRM] Lead enrich error:", updErr.message);
        return existingLead.id;
      }
      newLead = updated;
      console.log(`[CRM] Skeleton enriched: ${existingLead.id}`);
    } else {
      // Sin skeleton (caso raro): insertar lead completo
      const { data: inserted, error: leadError } = await supabase
        .from("leads")
        .insert({
          org_id: ORG_ID,
          whatsapp: phone,
          status: "new",
          vertical: "inmobiliaria",
          source: "whatsapp_adriana",
          ...leadFields,
        })
        .select("id")
        .single();
      if (leadError) {
        console.error("[CRM] Lead insert error:", leadError.message);
        return null;
      }
      newLead = inserted;
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

// ── Background Task: Humanized delay + AI Generation + Response ──────────────

async function handleBackgroundResponse(
  supabase: any,
  data: any,
  phone: string,
  remoteJid: string,
  userName: string,
  messageId: string,
  isLid: boolean,
  userText: string,
  hasMedia: boolean,
  msgType: string
) {
  try {
    // ── 0. INTENCIÓN DE IMAGEN (Sin delay previo) ──
    const isImageRequest = /^(genera|hazme|crea|diseña|muéstrame|ponme)\s+(una|un)?\s*(imagen|foto|diseño|dibujo|render|póster|flyer|visual)/i.test(userText.trim().toLowerCase());
    
    if (isImageRequest) {
      console.log(`[ADRIANA] Detectada solicitud de imagen de ${phone}`);
      
      // Notificación inmediata
      await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
        method: "POST",
        headers: { apikey: EVOLUTION_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ number: remoteJid, text: "🎨 ¡Entendido! Estoy diseñando ese visual con el estilo de Atia Inmobiliaria. Dame un momento..." }),
      });

      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
        const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
        const genRes = await fetch(`${supabaseUrl}/functions/v1/generate-branded-image`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${serviceKey}`
          },
          body: JSON.stringify({ prompt: userText, user_id: phone }),
        });

        if (genRes.ok) {
          const { url } = await genRes.json();
          await fetch(`${EVOLUTION_API_URL}/message/sendMedia/${EVOLUTION_INSTANCE}`, {
            method: "POST",
            headers: { apikey: EVOLUTION_API_KEY, "Content-Type": "application/json" },
            body: JSON.stringify({
              number: remoteJid,
              mediatype: "image",
              media: url,
              caption: "Aquí tienes el diseño que me pediste. ¿Qué te parece? 🏠✨",
            }),
          });
          console.log(`[ADRIANA] Imagen enviada.`);
        } else {
          const errText = await genRes.text();
          console.error("[ADRIANA] Error en función imagen:", errText);
          await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
            method: "POST",
            headers: { apikey: EVOLUTION_API_KEY, "Content-Type": "application/json" },
            body: JSON.stringify({ number: remoteJid, text: "Tuve un problema técnico con el diseñador de IA. ¿Podrías intentar pedirlo de nuevo?" }),
          });
        }
      } catch (e) {
        console.error("[ADRIANA] Exception imagen:", e);
      }
      return; // Fin para imágenes
    }

    // ── 1. Fetch history first (needed for adaptive delay) ──
    const { data: historyData } = await supabase.from("chat_memory").select("role, content").eq("phone", phone).order("created_at", { ascending: false }).limit(6);
    const history = (historyData || []).reverse().map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    // ── 1.5. CRM SHELL: garantiza que el lead exista en CRM desde el primer mensaje ──
    // Esto fija el bug donde clientes que solo se quejaban nunca aparecían registrados.
    const crmLeadId = await ensureLeadShell(supabase, phone, userName, isLid);

    // ── 1.6. ANGER HANDOFF: cliente molesto -> una sola disculpa + asesor humano ──
    if (crmLeadId && detectAnger(userText)) {
      console.log(`[ADRIANA] Anger detected from ${phone}, escalating to advisor.`);
      const inboundContent = userText || "[Audio/Media]";
      try {
        await supabase.from("conversations").insert([
          { lead_id: crmLeadId, org_id: ORG_ID, direction: "inbound", content: inboundContent, is_bot: false, message_id: messageId },
        ]);
      } catch (e: any) { console.error("[ANGER] conv insert:", e?.message); }
      try {
        await supabase.from("chat_memory").insert([
          { phone, role: "user", content: inboundContent },
        ]);
      } catch (e: any) { console.error("[ANGER] memory insert:", e?.message); }
      const leadName = cleanName(userName) || fallbackName(phone, isLid);
      await triggerAngerHandoff(supabase, crmLeadId, phone, leadName, userText);
      return;
    }

    // ── 2. HUMANIZED DELAY (adaptive: long on first contact, short on follow-ups) ──
    const isFirstTurn = !historyData || historyData.length === 0;
    const typingDelay = isFirstTurn
      ? 25000 + Math.random() * 15000   // 25-40s first message (feels human arriving)
      : 7000 + Math.random() * 8000;    // 7-15s follow-ups (snappy)
    console.log(`[ADRIANA] Waiting ${Math.round(typingDelay / 1000)}s (firstTurn=${isFirstTurn}) before response to ${phone}...`);
    await new Promise((r) => setTimeout(r, typingDelay));

    // ── 3. Intent detection — skip RAG for greetings, jokes, unavailability, vague msgs ──
    const textLower = (userText || "").toLowerCase().trim();
    const isShortGreeting = userText && userText.length < 15 && /^(hola|hey|buenas?|buenos?\s|ola|hi|que tal|qué tal)/i.test(textLower);
    const isCasualOrUnavailable = userText && (
      /^(jaj+|jeje+|jiji+|xd|lol|ok|okay|va|sale|gracias|thx)/i.test(textLower) ||
      /(estoy en|ahorita no|más tarde|mas tarde|despu[eé]s|luego te|ocupad|cine|trabajando|manejando|conduciendo|no puedo ahor|te hablo|te contacto luego|marcame|márcame)/i.test(textLower)
    );
    const isVagueNoIntent = userText && textLower.length < 10 && !historyData?.length;
    const skipRag = isShortGreeting || isCasualOrUnavailable || isVagueNoIntent;
    const ragResult = skipRag
      ? { text: "", properties: [] }
      : await getSemanticContext(supabase, userText || "vender casa");

    // ── 4. Media download (voice notes, images, docs) ──
    const mediaData = hasMedia ? await getMediaBase64(data) : null;

    // 5. Prepare Gemini Request
    const contents = [...history];
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
    }
    contents.push({ role: "user", parts: currentMessageParts });

    // 6. Fetch Obsidian knowledge base (synced via obsidian-sync Edge Function)
    let kbContext = "";
    try {
      const { data: kbData } = await supabase
        .from("knowledge_base")
        .select("topic, content")
        .order("topic", { ascending: true });
      if (kbData && kbData.length > 0) {
        kbContext = "\n\n=== BASE DE CONOCIMIENTO ATIA ===\n" +
          kbData.map((k: any) => `## ${k.topic}\n${k.content}`).join("\n\n");
      }
    } catch (kbErr) {
      console.error("[KB] Error fetching knowledge_base:", kbErr);
    }

    // 7. Generate AI response (with retry on 429)
    let aiText: string | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: `${SYSTEM_PROMPT}${kbContext}\n\nCliente: ${userName}${ragResult.text}` }] },
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
        }),
      });

      if (geminiRes.status === 429) {
        await new Promise((r) => setTimeout(r, (attempt + 1) * 5000));
        continue;
      }

      if (!geminiRes.ok) break;

      const geminiData = await geminiRes.json();
      aiText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || null;
      break;
    }

    if (!aiText) aiText = `Hola ${userName}, gracias por escribir. En un momento te atiendo con detalle.`;

    // 7. Save memory
    const memoryContent = userText || (isVoiceNote ? "[Nota de voz]" : "[Media]");
    await supabase.from("chat_memory").insert([
      { phone, role: "user", content: memoryContent },
      { phone, role: "model", content: aiText },
    ]);

    // 8. Send reply via Evolution API
    await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
      method: "POST",
      headers: { apikey: EVOLUTION_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ number: remoteJid, text: aiText }),
    });

    phoneCooldowns.set(phone, Date.now());

    // 9. Send photos if any
    if (ragResult.properties.length > 0) {
      await sendPropertyPhotos(remoteJid, ragResult.properties).catch((e) => console.error("[PHOTO] Error:", e));
    }

    // 10. CRM sync — SIEMPRE guardar conversación (incluso si aún no es lead enriquecido)
    const leadId = crmLeadId; // skeleton garantizado desde paso 1.5
    if (leadId) {
      try {
        await supabase.from("conversations").insert([
          { lead_id: leadId, org_id: ORG_ID, direction: "inbound", content: userText || "[Audio/Media]", is_bot: false, message_id: messageId },
          { lead_id: leadId, org_id: ORG_ID, direction: "outbound", content: aiText, is_bot: true, message_id: `bot_${messageId}` },
        ]);
      } catch (e: any) { console.error("[CRM] Conversation insert error:", e?.message); }
    }

    // Enriquecimiento del lead (extracción AI) cuando hay sustancia conversacional
    const allMessages = [
      ...(historyData || []).reverse().map((m: any) => `${m.role === "user" ? "Cliente" : "Adriana"}: ${m.content}`),
      `Cliente: ${userText || "[Audio/Media]"}`,
      `Adriana: ${aiText}`,
    ].join("\n");

    const messageCount = (historyData?.length || 0) + 1;
    const hasSubstance = !skipRag || messageCount >= 4;
    if (hasSubstance) {
      await extractAndSaveLead(supabase, phone, userName, allMessages, isLid);
    }

    if (leadId) {
      // Auto-advance pipeline stage based on engagement signals
      try {
        const { data: leadRow } = await supabase.from("leads").select("status, metadata").eq("id", leadId).maybeSingle();
        const currentStatus = leadRow?.status;
        // Only advance forward, never regress; skip if already past funnel or handed off
        const advanceable = ["new", "nuevo", "wa_sent", "wa_delivered"];
        if (currentStatus && advanceable.includes(currentStatus)) {
          const { count: inboundCount } = await supabase
            .from("conversations")
            .select("id", { count: "exact", head: true })
            .eq("lead_id", leadId)
            .eq("direction", "inbound");
          const n = inboundCount || 0;
          const category = leadRow?.metadata?.ai_category;
          // B with 3+ inbound msgs or any lead with 5+ msgs → interested
          // Anyone with ≥1 inbound → in_conversation
          let nextStatus: string | null = null;
          if (category === "B" && n >= 3) nextStatus = "interested";
          else if (n >= 5) nextStatus = "interested";
          else if (n >= 1) nextStatus = "in_conversation";
          if (nextStatus && nextStatus !== currentStatus) {
            await supabase.from("leads").update({ status: nextStatus }).eq("id", leadId);
            console.log(`[PIPELINE] Lead ${leadId}: ${currentStatus} → ${nextStatus} (inbound=${n}, cat=${category})`);
          }
        }
      } catch (e) {
        console.error("[PIPELINE] Auto-advance error:", e);
      }
    }

    console.log(`[ADRIANA] Response sent to ${phone}`);
  } catch (e) {
    console.error(`[ADRIANA] Background task error for ${phone}:`, e);
  }
}

// ── Main Controller ──────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();

    if (body.event !== "messages.upsert") {
      return new Response(JSON.stringify({ status: "ignored", reason: "not_message" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = body.data;
    if (!data?.key) {
      return new Response(JSON.stringify({ status: "ignored", reason: "no_key" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const remoteJid = data.key.remoteJid || "";
    const messageId = data.key.id || "";
    const fromMe = data.key.fromMe === true;

    if (remoteJid.includes("@g.us") || remoteJid.includes("@broadcast")) {
      return new Response(JSON.stringify({ status: "ignored", reason: "group" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isLid = remoteJid.includes("@lid");
    const phone = remoteJid.replace("@s.whatsapp.net", "").replace("@lid", "");

    if (!shouldProcess(messageId, phone, fromMe)) {
      return new Response(JSON.stringify({ status: "ignored", reason: "dedup_or_cooldown" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userName = cleanName(data.pushName) || fallbackName(phone, isLid);
    const msgType = data.messageType || "unknown";
    const userText = data.message?.conversation || data.message?.extendedTextMessage?.text || data.message?.imageMessage?.caption || "";

    const hasMedia =
      data.message?.imageMessage ||
      data.message?.audioMessage ||
      data.message?.pttMessage ||
      data.message?.documentMessage ||
      data.message?.documentWithCaptionMessage ||
      data.message?.videoMessage ||
      data.message?.stickerMessage ||
      msgType === "audioMessage" ||
      msgType === "pttMessage";

    if (!userText && !hasMedia) {
      return new Response(JSON.stringify({ status: "ignored", reason: "no_content" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

    // 0. Synchronous Handoff check
    const { data: existingLead } = await supabase.from("leads").select("id, status").eq("whatsapp", phone).eq("org_id", ORG_ID).limit(1).maybeSingle();

    if (existingLead) {
      const { data: aiCtx } = await supabase.from("ai_conversation_context").select("status").eq("lead_id", existingLead.id).maybeSingle();
      if (aiCtx?.status === "handed_off" || existingLead.status === "handed_off") {
        try {
          await supabase
            .from("conversations")
            .insert({ lead_id: existingLead.id, org_id: ORG_ID, direction: "inbound", content: userText || "[Audio/Media]", is_bot: false, message_id: messageId });
        } catch (e: any) { console.error("[HANDOFF] conv insert:", e?.message); }
        return new Response(JSON.stringify({ status: "handed_off", reason: "human_advisor_active" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // 0.5. SANDBOX MODE: si activo, solo responde a teléfonos en whitelist.
    // Los demás se silencian (bot no responde) pero su lead + mensaje se guardan
    // en CRM y se notifica al asesor humano UNA vez (al primer mensaje).
    if (!isSandboxAllowed(phone)) {
      console.log(`[SANDBOX] Phone ${phone} NOT whitelisted, silencing bot + handoff`);
      const sandboxLeadId = await ensureLeadShell(supabase, phone, userName, isLid);
      if (sandboxLeadId) {
        try {
          await supabase.from("conversations").insert({
            lead_id: sandboxLeadId,
            org_id: ORG_ID,
            direction: "inbound",
            content: userText || "[Audio/Media]",
            is_bot: false,
            message_id: messageId,
          });
        } catch (e: any) { console.error("[SANDBOX] conv insert:", e?.message); }

        // Marcar handoff y notificar asesor solo la primera vez
        const { data: ctx } = await supabase
          .from("ai_conversation_context")
          .select("status")
          .eq("lead_id", sandboxLeadId)
          .maybeSingle();

        if (ctx?.status !== "handed_off") {
          await supabase.from("ai_conversation_context").upsert({
            lead_id: sandboxLeadId,
            org_id: ORG_ID,
            status: "handed_off",
            handoff_reason: `Sandbox mode: ${phone} no está en whitelist`,
            handed_off_at: new Date().toISOString(),
          }, { onConflict: "lead_id" });

          await supabase.from("leads").update({ status: "handed_off" }).eq("id", sandboxLeadId);

          const leadName = cleanName(userName) || fallbackName(phone, isLid);
          const advisorMsg = `🧪 SANDBOX MODE — bot en pruebas\n\n` +
            `Cliente: ${leadName}\n` +
            `Tel: ${phone}\n` +
            `Mensaje: "${(userText || "[Media]").slice(0, 300)}"\n\n` +
            `Adriana NO va a responder. Atiende manual desde el CRM.`;

          await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
            method: "POST",
            headers: { apikey: EVOLUTION_API_KEY, "Content-Type": "application/json" },
            body: JSON.stringify({ number: ADVISOR_PHONE, text: advisorMsg }),
          }).catch(() => {});
        }
      }

      return new Response(JSON.stringify({ status: "sandbox_blocked", phone }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── FIRE AND FORGET: Start background processing ──
    handleBackgroundResponse(supabase, data, phone, remoteJid, userName, messageId, isLid, userText, hasMedia, msgType);

    // Respond immediately to Evolution API to avoid timeout
    return new Response(JSON.stringify({ status: "processing", message: "Adriana is typing..." }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[ADRIANA Error]", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
