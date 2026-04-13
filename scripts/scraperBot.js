import puppeteer from 'puppeteer';

// Scrapeo de demostración para portales inmobiliarios
// Basado en el requerimiento de la Guía de Corretaje ATIA Inmobiliaria.
// Este bot extrae resultados y los normaliza a la interfaz `ExternalProperty`.

const WIGGOT_SEARCH_URL = 'https://wiggot.com/propiedades?operation_type=1&property_type=1&location=Culiacan';

async function runScraper() {
  console.log("🚀 Iniciando Bot de Scrapeo (Casto Inmobiliaria Corretaje)...");
  
  // Puppeteer usa un navegador headless
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080'],
  });

  try {
    const page = await browser.newPage();
    
    // User Agent realista para evitar bloqueos
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log(`🌐 Navegando a: ${WIGGOT_SEARCH_URL}`);
    await page.goto(WIGGOT_SEARCH_URL, { waitUntil: 'networkidle2', timeout: 60000 });

    console.log("🔍 Analizando DOM de propiedades...");
    
    // NOTA: Los selectores de Wiggot/Lamudi cambian con el tiempo.
    // Este es un selector genérico de demostración para extraer tarjetas de propiedades.
    const properties = await page.evaluate(() => {
      // Intentamos capturar las tarjetas de anuncio típicas
      const cards = Array.from(document.querySelectorAll('[class*="card"], [class*="property"], li'));
      
      const results = [];
      let count = 0;
      
      for (const card of cards) {
        // Detenerse si ya tenemos suficientes ejemplos
        if (count >= 5) break;

        const text = card.innerText.toLowerCase();
        
        // Filtro muy básico para asegurar que es de bienes raíces
        if (text.includes('rec') || text.includes('baño') || text.includes('$')) {
          
          // Extraer precio
          const priceMatch = card.innerText.match(/\$[0-9,.]+/);
          const price = priceMatch ? priceMatch[0] : 'Consultar';
          let priceValue = 0;
          if (price !== 'Consultar') {
             priceValue = parseInt(price.replace(/[^0-9]/g, ''), 10);
          }

          // Extraer Link del anuncio
          const linkEl = card.querySelector('a');
          const link = linkEl ? linkEl.href : '';

          // Inferir tipo
          let propertyType = 'Casa';
          if (text.includes('departamento') || text.includes('depto')) propertyType = 'Departamento';
          if (text.includes('terreno')) propertyType = 'Terreno';

          results.push({
            id: `WIG-${Date.now()}-${count}`,
            source: 'Wiggot',
            propertyType,
            operationType: text.includes('renta') ? 'Renta' : 'Compra',
            price,
            priceValue,
            sector: 'Culiacán / Centro (Scraped)', // En producción: extraer de la tarjeta
            bedrooms: text.includes('3 rec') ? 3 : 2, // Dummy infer
            bathrooms: text.includes('2 bañ') ? 2 : 1, // Dummy infer
            status: 'found',
            link,
            notes: link // Guardamos el link en notas para que el asesor pueda contactarlo
          });
          count++;
        }
      }
      return results;
    });

    console.log(`✅ Extracción completada. Se encontraron ${properties.length} opciones útiles.\n`);
    
    // Imprimir el resultado formateado (Listo para inyectarse a Supabase o mostrarse en Dashboard)
    properties.forEach(p => {
      console.log(`🏠 [${p.source}] ${p.propertyType} en Venta`);
      console.log(`   💰 Precio: ${p.price}`);
      console.log(`   📍 Sector: ${p.sector}`);
      console.log(`   🛏️ ${p.bedrooms} Rec | 🛁 ${p.bathrooms} Baños`);
      console.log(`   🔗 Link: ${p.link}`);
      console.log(`----------------------------------------`);
    });

    console.log("\n💡 Para integrarlo al Dashboard, estos datos se deben insertar en la tabla `inmuebles` o agregarse vía `corretajeService.ts`.");

  } catch (error) {
    console.error("❌ Error durante el scrapeo:", error.message);
  } finally {
    await browser.close();
  }
}

runScraper();
