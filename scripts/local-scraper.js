
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';

// Configuración
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const orgId = "e67404e2-d14c-44ad-9275-9b89372aa57d";

const supabase = createClient(supabaseUrl, supabaseKey);

const SOURCES = {
  'Propiedades.com': {
    url: 'https://propiedades.com/culiacan/casas-venta',
    container: 'section, .pcom-property-card',
    title: 'h2, h3',
    price: '[class*="price"], .price',
    link: 'a',
    image: 'img[src*="cdn.propiedades.com/files/"], .pcom-property-card img, section img',
    sector: '.address, p',
    wait: 8000
  },
  'Lamudi': {
    url: 'https://www.lamudi.com.mx/sinaloa/culiacan/casa/for-sale/',
    container: '.v3-property-card, .v2-property-card',
    title: '.v3-property-card__title',
    price: '.v3-property-card__price',
    link: 'a.v3-property-card__link',
    image: 'img.v3-property-card__image-main, .v3-property-card img',
    sector: '.v3-property-card__location',
    wait: 8000
  },
  'Inmuebles24': {
    url: 'https://www.inmuebles24.com/casas-en-venta-en-culiacan.html',
    container: '[data-qa="posting-card"]',
    title: '[data-qa="POSTING_CARD_DESCRIPTION"]',
    price: '[data-qa="POSTING_CARD_PRICE"]',
    link: 'a',
    image: 'img',
    sector: '[data-qa="POSTING_CARD_LOCATION"]',
    wait: 10000
  }
};

async function runScraper() {
  console.log(`\n🕒 [${new Date().toLocaleTimeString()}] INICIANDO ESCANEO MASIVO (Multisource)...`);
  
  const browser = await puppeteer.launch({ 
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  try {
    console.log("🛠️ Sincronizando Broker Central...");
    const { data: broker } = await supabase
      .from('corretaje_brokers')
      .upsert({ name: 'Nexus Multi-Portal', org_id: orgId }, { onConflict: 'name' })
      .select('id')
      .single();
    
    const brokerId = broker?.id || '24566c79-e64e-4f7f-8e4a-5f04b2f1e68c';

    for (const [sourceName, config] of Object.entries(SOURCES)) {
      console.log(`📡 Conectando con ${sourceName}...`);
      const page = await browser.newPage();
      
      // Rotación de User-Agent básica
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
      
      try {
        await page.goto(config.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        
        // Scroll Inteligente
        await page.evaluate(async () => {
          for(let i=0; i<5; i++){
            window.scrollBy(0, 800);
            await new Promise(r => setTimeout(r, 1000));
          }
        });

        const extracted = await page.evaluate((cfg) => {
          const cards = Array.from(document.querySelectorAll(cfg.container)).slice(0, 20);
          return cards.map(card => {
            const title = card.querySelector(cfg.title)?.innerText?.trim() || "Propiedad Nexus";
            const priceText = card.querySelector(cfg.price)?.innerText?.trim() || "0";
            const priceValue = parseInt(priceText.replace(/[^0-9]/g, ''), 10) || 0;
            const img = card.querySelector(cfg.image);
            const imageUrl = img?.src || img?.dataset?.src || null;
            const link = card.querySelector(cfg.link)?.href || null;
            const sector = card.querySelector(cfg.sector)?.innerText?.trim() || "Sector Desconocido";
            
            return { title, priceValue, imageUrl, link, sector };
          }).filter(p => p.priceValue > 100000); // Filtro de seguridad
        }, config);

        const properties = extracted.map(p => ({
          org_id: orgId,
          source: sourceName,
          property_type: p.title.toLowerCase().includes('depto') ? 'Departamento' : 'Casa',
          operation_type: 'Venta',
          price: p.priceValue,
          sector: p.sector.substring(0, 80),
          bedrooms: 3,
          bathrooms: 2,
          broker_id: brokerId,
          status: 'available',
          image_url: p.imageUrl,
          external_link: p.link || config.url,
          notes: `Mass Scrape: ${new Date().toLocaleDateString()} via ${sourceName}`
        }));

        if (properties.length > 0) {
          // Limpieza selectiva para evitar duplicados masivos del mismo portal
          await supabase.from('corretaje_properties').delete().eq('source', sourceName).eq('org_id', orgId);
          await supabase.from('corretaje_properties').insert(properties);
          console.log(`✅ ${sourceName}: ${properties.length} propiedades capturadas.`);
        }
      } catch (e) {
        console.warn(`⚠️ Omisión de ${sourceName} por timeout o protección antibot.`);
      } finally {
        await page.close();
      }
    }
  } catch (err) {
    console.error("❌ Error Crítico en Scraper:", err.message);
  } finally {
    await browser.close();
    console.log(`\n🏁 [${new Date().toLocaleTimeString()}] ESCANEO FINALIZADO.`);
  }
}

runScraper();
