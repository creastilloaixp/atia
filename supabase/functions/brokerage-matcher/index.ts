// =============================================================================
// Casto Inmobiliaria — brokerage-matcher Edge Function
// =============================================================================
// Logic: Automates the "Brokerage Guide" Step 1 & Matching.
// =============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.24.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { lead_id, budget, sector, property_type, operation_type = "venta" } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const genAI = new GoogleGenerativeAI(Deno.env.get("GEMINI_API_KEY") ?? "");
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // 1. Search in local inventory FIRST (Propio de Casto o Aliados conocidos)
    const { data: inventory, error: invError } = await supabase
      .from("brokerage_inventory")
      .select("*, broker_registry(*)")
      .eq("property_type", property_type)
      .eq("operation_type", operation_type)
      .eq("city", "Culiacán") // Default for now
      .is("is_active", true)
      .lte("price", budget * 1.1) // 10% tolerance
      .gte("price", budget * 0.7);

    // 2. If no local inventory, generate ONLY the WhatsApp "Solicitud" format from the Guide
    const prompt = `Actua como un experto asesor inmobiliario de la empresa 'Casto'.
    Basado en el siguiente lead:
    - Tipo: ${property_type}
    - Operación: ${operation_type}
    - Presupuesto: $${budget}
    - Sector: ${sector}

    Genera dos salidas en formato JSON:
    1. 'whatsapp_request': El mensaje exacto para enviar a grupos de WhatsApp siguiendo el formato de la Guía de Corretaje:
       "Buen dia compañeros -Solicito... -Ppto $... -Sector... Enviar opciones por privado. ¡Muchas gracias! Atia Inmobiliaria"
    2. 'ai_search_terms': 3 términos clave para buscar en Wiggot/Lamudi (ej: "casa venta culiacan economica").

    Retorna SOLO JSON.`;

    const result = await model.generateContent(prompt);
    const response = JSON.parse(result.response.text());

    // 3. Log results in matches table if inventory found
    if (inventory && inventory.length > 0) {
      // Logic to insert into lead_matches...
    }

    return new Response(
      JSON.stringify({
        success: true,
        matches: inventory || [],
        automation: response,
        guide_status: inventory?.length > 0 ? "matches_found" : "manual_search_required",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
