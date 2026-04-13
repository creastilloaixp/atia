
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const WHATSAPP_TOKEN = Deno.env.get("WHATSAPP_TOKEN");
const PHONE_NUMBER_ID = Deno.env.get("WHATSAPP_PHONE_ID");
const TARGET_PHONE = "526671234567"; // Tu número de administrador para pruebas

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Manejo de CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { lead_name, lead_phone, property_title } = await req.json();

    console.log(`📱 Procesando alerta de WhatsApp para Lead: ${lead_name}`);

    // Construcción del mensaje para Meta WhatsApp API
    const messagePayload = {
      messaging_product: "whatsapp",
      to: TARGET_PHONE,
      type: "template",
      template: {
        name: "new_lead_alert", // Tu template aprobado en Meta
        language: { code: "es" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: lead_name },
              { type: "text", text: property_title || "Consultoría" },
              { type: "text", text: lead_phone }
            ]
          }
        ]
      }
    };

    const response = await fetch(
      `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messagePayload),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error?.message || "Error desconocido en WhatsApp API");
    }

    return new Response(JSON.stringify({ success: true, messageId: result.messages[0].id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("❌ Error enviando WhatsApp:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
