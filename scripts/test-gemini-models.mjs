// Test new Gemini 2.5 Flash key
const API_KEY = "AIzaSyD_l6lLO8YVvzYMWwwyIzkT_8JeoA-Gm5I";

const genBody = {
  contents: [{ role: "user", parts: [{ text: "di hola en una palabra" }] }]
};

const models = [
  "gemini-2.5-flash-preview-04-17",
  "gemini-2.5-flash-preview",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
];

const embedModels = [
  "gemini-embedding-001",
  "text-embedding-004",
];

console.log("=== GENERACION ===");
for (const model of models) {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(genBody)
    });
    const data = await res.json();
    if (res.ok) {
      console.log(`✅ ${model} -> OK`);
    } else {
      console.log(`❌ ${model} -> ${res.status}: ${data.error?.message?.substring(0, 100)}`);
    }
  } catch(e) { console.log(`❌ ${model} -> ${e.message}`); }
}

console.log("\n=== EMBEDDING ===");
for (const model of embedModels) {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: `models/${model}`, content: { parts: [{ text: "casa en venta culiacan" }] }, taskType: "RETRIEVAL_QUERY" })
    });
    const data = await res.json();
    if (res.ok) {
      console.log(`✅ ${model} -> OK (dims: ${data.embedding?.values?.length})`);
    } else {
      console.log(`❌ ${model} -> ${res.status}: ${data.error?.message?.substring(0, 100)}`);
    }
  } catch(e) { console.log(`❌ ${model} -> ${e.message}`); }
}
