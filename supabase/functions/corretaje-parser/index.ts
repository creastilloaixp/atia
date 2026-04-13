import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// Esta función recibe el Webhook, usa Gemini para extraer los datos del lead y lo inserta en Supabase.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message, phone, senderName } = await req.json();

    if (!message) {
      throw new Error("El mensaje está vacío");
    }

    // 1. Llamar a Gemini para parsear el mensaje
    const geminiApiKey = Deno.env.get('VITE_GEMINI_API_KEY') || Deno.env.get('GEMINI_API_KEY');
    
    if (!geminiApiKey) throw new Error("Falta GEMINI_API_KEY");

    const prompt = `Analiza el siguiente mensaje de corretaje inmobiliario (usualmente viene de un grupo de WhatsApp) y extrae las variables.
Devuelve ÚNICAMENTE un JSON válido sin markdown, con esta estructura exacta:
{
  "clientName": "Nombre del cliente o agente solicitante si se menciona (si no, usa 'Agente Desconocido')",
  "operationType": "Compra", "Venta", o "Renta",
  "propertyType": "Casa", "Departamento", "Terreno", "Local Comercial", "Oficina", o "Bodega",
  "budgetDisplay": "El string literal que den (ej. '$2.8M', '$18K')",
  "budgetMax": número entero calculado del presupuesto (ej. 2800000),
  "sector": "Sector, Zona o Colonia de interés",
  "details": "Detalles adicionales como el # de recámaras, créditos, etc.",
  "category": "A", "B" o "C" (A si tiene prisa o especificaciones muy exactas, C si es genérico, B para intermedios)
}

MENSAJE:
"${message}"`;

    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    const geminiData = await geminiRes.json();
    const resultText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!resultText) throw new Error("Fallo al interpretar con IA");

    const parsedData = JSON.parse(resultText);

    // 2. Conectar a Supabase como Administrador (Service Role)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const ORG_ID = 'e67404e2-d14c-44ad-9275-9b89372aa57d'; // Atia Inmobiliaria

    // 3. Insertar el Lead base
    const { data: leadData, error: leadError } = await supabase
      .from('leads')
      .insert({
        org_id: ORG_ID,
        name: parsedData.clientName !== 'Agente Desconocido' ? parsedData.clientName : (senderName || 'Agente de Grupo'),
        phone: phone || 'Sin número',
        status: 'new',
        vertical: 'inmobiliaria',
        source: 'whatsapp_group'
      })
      .select()
      .single();

    if (leadError) throw leadError;

    // 4. Insertar la solicitud de Corretaje vinculada a este Lead
    const { error: requestError } = await supabase
      .from('corretaje_requests')
      .insert({
        org_id: ORG_ID,
        lead_id: leadData.id,
        operation_type: parsedData.operationType || 'Compra',
        property_type: parsedData.propertyType || 'Casa',
        budget_display: parsedData.budgetDisplay || 'No especificado',
        budget_max: parsedData.budgetMax || null,
        sector: parsedData.sector || 'Abierto',
        details: parsedData.details || '',
        category: parsedData.category || 'B',
        whatsapp_broadcast: message,
        status: 'new',
        options_target: 3,
        options_found: 0
      });

    if (requestError) throw requestError;

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Prospecto parseado e insertado con éxito',
      extracted: parsedData 
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
