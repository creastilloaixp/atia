import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

// Configuramos Deno para entender los tipos de los payloads de Webhooks de Supabase
interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  record: any      // El nuevo registro
  old_record: any  // El registro anterior (en UPDATES)
}

serve(async (req) => {
  try {
    // 1. Verificar si la petición es un preflight CORS
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }})
    }

    // 2. Extraer el payload que envía el Database Webhook
    const payload: WebhookPayload = await req.json()
    console.log(`Recibido evento ${payload.type} para la tabla ${payload.table}`)

    // Solo nos interesan los INSERTS o UPDATES
    if (payload.type === 'DELETE') {
      return new Response(JSON.stringify({ message: "Ignorando DELETE" }), { headers: { 'Content-Type': 'application/json' } })
    }

    const lead = payload.record;

    // 3. Obtener credenciales del CRM desde las variables de entorno de esta Edge Function
    // Las configuraremos con supabase secrets set
    const CRM_SUPABASE_URL = Deno.env.get('CRM_SUPABASE_URL')
    const CRM_SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('CRM_SUPABASE_SERVICE_ROLE_KEY')

    if (!CRM_SUPABASE_URL || !CRM_SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Faltan variables de entorno del CRM")
      return new Response(JSON.stringify({ error: "Configuración incompleta" }), { status: 500 })
    }

    // 4. Crear cliente apuntando al CRM (usando la Service Role Key para saltar el RLS y escribir directamente)
    const crmSupabase = createClient(CRM_SUPABASE_URL, CRM_SUPABASE_SERVICE_ROLE_KEY)

    // 5. Mapear y enviar datos a la tabla 'leads' del CRM
    // Aquí puedes transformar campos si las columnas se llaman diferente en el CRM
    const { data, error } = await crmSupabase
      .from('leads')
      .upsert({
        id: lead.id, // Mantenemos el mismo ID para evitar duplicados si hay reintentos
        full_name: lead.full_name,
        whatsapp: lead.whatsapp,
        email: lead.email,
        status: lead.status || 'nuevo',
        // Mapea aquí otros campos que necesites si también existen en el CRM
      }, { onConflict: 'id' }) // Si ya existe el ID, lo actualiza

    if (error) {
      console.error("Error insertando en CRM:", error)
      throw error
    }

    console.log("Lead sincronizado exitosamente con el CRM", data)
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error("Error en Edge Function sync-to-crm:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
