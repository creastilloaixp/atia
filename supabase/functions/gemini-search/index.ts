const PROD_ORIGINS = [
  'https://castosearch.com',
  'https://www.castosearch.com',
  'https://cotizacion-creastilo.vercel.app',
  'https://atiasanatudeuda.vercel.app',
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  const isAllowed = PROD_ORIGINS.includes(origin) || origin.startsWith('http://localhost:');
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : PROD_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

// Rate limiter: max 10 searches per minute per IP
const searchLog = new Map<string, number[]>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (searchLog.get(ip) || []).filter(t => now - t < 60_000);
  if (timestamps.length >= 10) return true;
  timestamps.push(now);
  searchLog.set(ip, timestamps);
  return false;
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(clientIp)) {
    return new Response(JSON.stringify({ error: 'Too many requests' }), {
      status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { query, properties } = await req.json();

    if (!query || typeof query !== 'string' || query.length > 500) {
      return new Response(JSON.stringify({ error: 'Invalid query' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiKey) {
      return new Response(JSON.stringify({ error: 'Service unavailable' }), {
        status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const SYSTEM_PROMPT = `Eres Trinity AI, el motor de inteligencia inmobiliaria de CASTO. Tu rol es analizar queries de inversores inmobiliarios en México y matchearlos con propiedades de nuestra base de datos.

REGLAS:
1. Interpreta queries en español natural (coloquial o técnico)
2. Extrae: ubicación, presupuesto, ROI mínimo, tipo de propiedad, nivel de riesgo, situación legal preferida
3. Matchea contra la base de datos y devuelve las mejores opciones ordenadas por relevancia
4. Para cada resultado, incluye un análisis breve de inversión y recomendación
5. Incluye un insight de mercado general al final
6. Sé preciso con números, no inventes datos — usa solo lo que está en la base de datos
7. Si el query es vago, devuelve las mejores oportunidades generales
8. Responde SIEMPRE en español

FORMATO DE RESPUESTA (JSON estricto, sin markdown):
{
  "query_understanding": {
    "intent": "descripción breve de lo que busca el inversor",
    "filters_detected": "filtros extraídos del query",
    "search_strategy": "estrategia de búsqueda aplicada"
  },
  "matched_ids": ["CSTO-XXX", ...],
  "scores": [98, 95, ...],
  "analyses": ["análisis de inversión para cada propiedad matcheada..."],
  "recommendations": ["recomendación específica..."],
  "risk_summaries": ["resumen de riesgo..."],
  "market_insight": "insight general del mercado relevante al query"
}

IMPORTANTE: matched_ids, scores, analyses, recommendations, y risk_summaries deben tener la misma longitud y estar en el mismo orden. Máximo 5 resultados.`;

    const prompt = `${SYSTEM_PROMPT}\n\nBASE DE DATOS DE PROPIEDADES:\n${JSON.stringify(properties)}\n\nQUERY DEL INVERSOR:\n"${query}"\n\nAnaliza el query, matchea con las propiedades más relevantes y devuelve el JSON.`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2048,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    const geminiData = await geminiRes.json();
    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return new Response(JSON.stringify({ error: 'No response from AI' }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ result: JSON.parse(text) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Gemini search error:', error);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
