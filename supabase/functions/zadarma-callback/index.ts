import { Client } from "npm:zadarma-api";

const PROD_ORIGINS = [
  'https://castosearch.com',
  'https://www.castosearch.com',
  'https://cotizacion-creastilo.vercel.app',
  'https://atiasanatudeuda.vercel.app',
];

function getCorsHeaders(_req: Request) {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { phone } = await req.json();
    const rawDigits = (phone || '').replace(/\D/g, '');
    
    // FORZAMOS FORMATO E.164 CON EL SIGNO "+"
    // Zadarma para Mexico agradece el +52 + 10 digitos
    const cleanPhone = rawDigits.startsWith('52') ? `+${rawDigits}` : `+52${rawDigits.slice(-10)}`;

    const zadarmaKey = Deno.env.get('ZADARMA_KEY');
    const zadarmaSecret = Deno.env.get('ZADARMA_SECRET');
    
    // Usamos '105' o el que tengas configurado. 
    // Asegúrate de que este 'from' tenga permiso de llamadas salientes.
    const zFrom = Deno.env.get('ZADARMA_FROM') || '105';

    if (!zadarmaKey || !zadarmaSecret) throw new Error("Missing Zadarma credentials");

    const client = new Client(zadarmaKey, zadarmaSecret);

    console.log('[DEBUG] Triangulando llamada:', { from: zFrom, destination: cleanPhone });

    const result = await client.call('/v1/request/callback/', {
      from: zFrom,
      to: cleanPhone
    }, 'GET');

    console.log('[DEBUG] Resultado Triangulación:', JSON.stringify(result));

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[CRITICAL] Error en Puente Zadarma:', error.message);
    return new Response(JSON.stringify({ status: 'error', message: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
