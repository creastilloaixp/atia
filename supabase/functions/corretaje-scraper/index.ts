import * as cheerio from "npm:cheerio";
import { createClient } from "npm:@supabase/supabase-js";

// URL Base de Wiggot
const WIGGOT_SEARCH_URL = "https://wiggot.com/propiedades?operation_type=1&property_type=1&location=Culiacan";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log("Iniciando Edge Function Scraper de ATIA Inmobiliaria...");
    
    const response = await fetch(WIGGOT_SEARCH_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8"
      }
    });
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const properties: any[] = [];
    let count = 0;
    
    // Intentar buscar tarjetas típicas
    $('[class*="card"], [class*="property"], li').each((_, element) => {
      if (count >= 5) return;
      
      const card = $(element);
      const text = card.text().toLowerCase();
      
      // Filtro heurístico 
      if (text.includes('rec') || text.includes('baño') || text.includes('$')) {
         const priceMatch = text.match(/\$[0-9,.]+/);
         const price = priceMatch ? priceMatch[0] : 'Consultar';
         let priceValue = 0;
         if (price !== 'Consultar') {
           priceValue = parseInt(price.replace(/[^0-9]/g, ''), 10);
         }
         
         const initialLink = card.find('a').attr('href');
         const link = initialLink ? (initialLink.startsWith('http') ? initialLink : `https://wiggot.com${initialLink}`) : WIGGOT_SEARCH_URL;
         
         let propertyType = 'Casa';
         if (text.includes('departamento') || text.includes('depto') || text.includes('dpto')) propertyType = 'Departamento';
         if (text.includes('terreno') || text.includes('lote')) propertyType = 'Terreno';

         properties.push({
           source: 'Wiggot',
           property_type: propertyType,
           operation_type: text.includes('renta') ? 'Renta' : 'Compra',
           price,
           price_value: priceValue,
           sector: 'Culiacán / Detectado',
           bedrooms: text.includes('3 rec') ? 3 : 2, 
           bathrooms: text.includes('2 bañ') ? 2 : 1,
           status: 'found',
           notes: link
         });
         count++;
      }
    });

    // If WAF blocked or no results, report it — do NOT inject fake data
    if (properties.length === 0) {
      console.warn('WAF detected or 0 results. No data to insert.');
      return new Response(JSON.stringify({
        success: false,
        message: 'No properties found. Source may be blocking automated requests.',
        data: []
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log(`Se encontraron ${properties.length} propiedades válidas`);

    // Insert into Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { error } = await supabase.from('inmuebles').insert(properties);
      if (error) {
         console.error('Error insertando en la BD:', error);
      } else {
         console.log('Datos guardados correctamente en Supabase');
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Scrapeo completo. ${properties.length} opciones reales insertadas.`,
      data: properties
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error crítico durante el scrapeo:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : "Error desconocido" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
