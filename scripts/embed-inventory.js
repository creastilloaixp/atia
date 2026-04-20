// ============================================================
// embed-inventory.js — Genera embeddings del inventario Atia
// Corre directo en Node.js, llama Gemini + escribe a Supabase
// Uso: node scripts/embed-inventory.js
// ============================================================

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "HIDDEN";
const SUPABASE_URL = "https://vjdlndntsmzoxggtruot.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "";

if (!SUPABASE_SERVICE_KEY) {
  console.error("❌ Set SUPABASE_SERVICE_KEY environment variable");
  process.exit(1);
}

// ── Gemini Embedding ──────────────────────────────────────────────────────────
async function generateEmbedding(text) {
  const model = "models/embedding-001";
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/${model}:embedContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: model,
        content: { parts: [{ text }] },
        taskType: "RETRIEVAL_DOCUMENT",
      }),
    }
  );
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini error ${res.status}: ${errText}`);
  }
  const data = await res.json();
  return data.embedding.values;
}

// ── Supabase helpers ──────────────────────────────────────────────────────────
async function supabaseQuery(path, method = "GET", body = null) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: method === "POST" ? "resolution=merge-duplicates" : "",
    },
    body: body ? JSON.stringify(body) : null,
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`  ❌ Supabase Error DETAIL:`, text);
    throw new Error(`Supabase error ${res.status}: ${text}`);
  }
  try { return JSON.parse(text); } catch { return text; }
}

// ── Format property text ──────────────────────────────────────────────────────
function formatCorretaje(p) {
  return [
    p.property_type && `Propiedad tipo ${p.property_type}`,
    p.operation_type && `en ${p.operation_type}`,
    p.sector && `en sector ${p.sector}`,
    p.price && `precio $${Number(p.price).toLocaleString("es-MX")} MXN`,
    p.bedrooms && `${p.bedrooms} recámaras`,
    p.bathrooms && `${p.bathrooms} baños`,
    p.is_gem && `precio destacado ${Math.abs(p.market_deviation || 0).toFixed(0)}% bajo mercado`,
    p.notes ? p.notes.substring(0, 100) : null,
    "Culiacán Sinaloa México",
  ].filter(Boolean).join(", ");
}

function formatInmueble(p) {
  return [
    p.property_type && `${p.property_type}`,
    p.operation_type && `en ${p.operation_type}`,
    p.sector && `sector ${p.sector}`,
    p.price && `precio ${p.price}`,
    p.bedrooms && `${p.bedrooms} recámaras`,
    p.bathrooms && `${p.bathrooms} baños`,
    p.source && `portal ${p.source}`,
    "Sinaloa México",
  ].filter(Boolean).join(", ");
}

// ── Delay ─────────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🚀 Atia Inventory Embedder — Starting...\n");

  // ── 1. Corretaje Properties ──
  console.log("📦 Processing corretaje_properties...");
  const corretajeProps = await supabaseQuery(
    "corretaje_properties?status=eq.available&select=*"
  );
  console.log(`  🔍 Found ${Array.isArray(corretajeProps) ? corretajeProps.length : 0} corretaje properties`);
  if (!Array.isArray(corretajeProps)) console.log("  ⚠️ Response was not an array:", corretajeProps);

  const existingCorretaje = await supabaseQuery(
    "corretaje_embeddings?select=property_id"
  );
  const corretajeEmbeddedIds = new Set(
    (Array.isArray(existingCorretaje) ? existingCorretaje : []).map((e) => e.property_id)
  );

  let corretajeOk = 0, corretajeSkip = 0, corretajeErr = 0;
  for (const p of Array.isArray(corretajeProps) ? corretajeProps : []) {
    if (corretajeEmbeddedIds.has(p.id)) {
      corretajeSkip++;
      console.log(`  ⏩ Skip (already embedded): ${p.property_type} / ${p.sector}`);
      continue;
    }
    try {
      const content = formatCorretaje(p);
      process.stdout.write(`  ⏳ Embedding: ${p.property_type} / ${p.sector}... `);
      const vec = await generateEmbedding(content);

      await supabaseQuery("corretaje_embeddings", "POST", [{
        property_id: p.id,
        content,
        embedding: `[${vec.join(",")}]`,
        metadata: {
          property_type: p.property_type,
          sector: p.sector,
          price: p.price,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          is_gem: p.is_gem,
          market_deviation: p.market_deviation,
          operation_type: p.operation_type,
        },
      }]);

      corretajeOk++;
      console.log("✅");
      await sleep(300); // brief pause between calls
    } catch (e) {
      corretajeErr++;
      console.log(`❌ ${e.message.substring(0, 80)}`);
    }
  }
  console.log(`\n  Corretaje: ${corretajeOk} embedded, ${corretajeSkip} skipped, ${corretajeErr} errors\n`);

  // ── 2. Inmuebles ──
  console.log("📦 Processing inmuebles...");
  const inmuebles = await supabaseQuery("inmuebles?select=*&limit=69");
  console.log(`  🔍 Found ${Array.isArray(inmuebles) ? inmuebles.length : 0} inmuebles`);
  if (!Array.isArray(inmuebles)) console.log("  ⚠️ Response was not an array:", inmuebles);

  const existingInmuebles = await supabaseQuery("inmuebles_embeddings?select=id");
  const inmuebleEmbeddedIds = new Set(
    (Array.isArray(existingInmuebles) ? existingInmuebles : []).map((e) => e.id)
  );

  let inmOk = 0, inmSkip = 0, inmErr = 0;
  for (const p of Array.isArray(inmuebles) ? inmuebles : []) {
    if (inmuebleEmbeddedIds.has(p.id)) {
      inmSkip++;
      continue; // silently skip already-embedded
    }
    try {
      const content = formatInmueble(p);
      process.stdout.write(`  ⏳ ${p.property_type} / ${p.sector}... `);
      const vec = await generateEmbedding(content);

      await supabaseQuery("inmuebles_embeddings", "POST", [{
        id: p.id,
        content,
        embedding: `[${vec.join(",")}]`,
        metadata: {
          property_type: p.property_type,
          sector: p.sector,
          price_value: p.price_value,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          operation_type: p.operation_type,
          source: p.source,
        },
      }]);

      inmOk++;
      console.log("✅");
      await sleep(300);
    } catch (e) {
      inmErr++;
      console.log(`❌ ${e.message.substring(0, 80)}`);
    }
  }
  console.log(`\n  Inmuebles: ${inmOk} embedded, ${inmSkip} skipped, ${inmErr} errors\n`);

  // ── Summary ──
  console.log("═══════════════════════════════════════════════════");
  console.log(`✅ DONE: ${corretajeOk + inmOk} embeddings generados`);
  console.log(`⏩ Skipped: ${corretajeSkip + inmSkip}`);
  console.log(`❌ Errors: ${corretajeErr + inmErr}`);
  console.log("═══════════════════════════════════════════════════");
  console.log("\n🤖 Adriana ahora puede hacer búsqueda semántica en tiempo real");
}

main().catch(console.error);
