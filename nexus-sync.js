// C:\Users\carlo\OneDrive\Escritorio\CastoProject\nexus-sync.js
import https from 'node:https';
import crypto from 'node:crypto';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

let isScraping = false;

/**
 * NEXUS SYNC SENSOR v1.3 + BI Real-Time
 * Reporta el estado de ATIA, métricas de Zadarma e inventario de propiedades.
 */

const getZadarmaMetrics = async () => {
    const ZADARMA_KEY = process.env.ZADARMA_KEY;
    const ZADARMA_SECRET = process.env.ZADARMA_SECRET;
    const apiMethod = '/v1/info/balance/';
    const paramsStr = 'format=json';
    
    const md5Params = crypto.createHash('md5').update(paramsStr).digest('hex');
    const signString = apiMethod + paramsStr + md5Params;
    const hmacHex = crypto.createHmac('sha1', ZADARMA_SECRET).update(signString).digest('hex');
    const signature = Buffer.from(hmacHex).toString('base64');

    try {
        const response = await fetch(`https://api.zadarma.com${apiMethod}?${paramsStr}`, {
            headers: { 'Authorization': `${ZADARMA_KEY}:${signature}` }
        });
        const data = await response.json();
        return data.status === 'success' ? data : null;
    } catch (e) { return null; }
};

const getInventoryMetrics = async () => {
    const SB_URL = process.env.VITE_SUPABASE_URL;
    const SB_KEY = process.env.VITE_SUPABASE_ANON_KEY;
    
    try {
        const response = await fetch(`${SB_URL}/rest/v1/corretaje_properties?select=id`, {
            headers: { 
                'apikey': SB_KEY,
                'Authorization': `Bearer ${SB_KEY}`,
                'Prefer': 'count=exact'
            }
        });
        
        const range = response.headers.get('content-range');
        if (range) {
            const count = range.split('/')[1];
            if (count) return parseInt(count);
        }

        // Fallback: Si no hay header, contamos la longitud del body
        const data = await response.json();
        if (Array.isArray(data)) {
            return data.length;
        }
        
        return 0;
    } catch (e) { 
        console.error('⚠️ Error en sensor de inventario:', e.message);
        return 0; 
    }
};

const triggerAutoScrape = async () => {
    if (isScraping) {
        console.log('⏳ Scraper ya en curso, saltando activación...');
        return false;
    }

    isScraping = true;
    console.log('⚡ ALERTA: Inventario insuficiente. Disparando Auto-Scraper...');
    try {
        await reportSync('⚠️ Alerta Salud', 'Inventario Crítico (0). Iniciando autoreparación...');
        await execAsync('npm run scrape:auto');
        console.log('🤖 Auto-Scraper finalizado con éxito.');
        await reportSync('❤️ Curación', 'Inventario recuperado via Auto-Scraper.');
        return true;
    } catch (e) {
        console.error('💥 Fallo al disparar Auto-Scraper:', e.message);
        return false;
    } finally {
        isScraping = false;
    }
};

const reportSync = async (action, message) => {
  console.log(`📡 Nexus [${action}]: Extrayendo inteligencia multi-nodo...`);
  
  const [zadarma, inventoryCount] = await Promise.all([
    getZadarmaMetrics(),
    getInventoryMetrics()
  ]);
  
  const details = `Propiedades: ${inventoryCount} | Saldo: ${zadarma?.balance || 'N/A'} ${zadarma?.currency || ''}`;
  const uptime = Math.floor(process.uptime() / 60);

  const data = JSON.stringify({
    action: action,
    target: 'ATIA Producción',
    details: `${message} (${details}) | Uptime: ${uptime}m | PID: ${process.pid}`,
    project_id: 'atia_core_v1',
    project_name: 'ATIA Inmobiliaria',
    client_code: 'ATIA-NEXOS',
    timestamp: new Date().toISOString()
  });

  const options = {
    hostname: 'hscxpnqgfmhektdutgfx.supabase.co',
    path: '/rest/v1/activity_logs',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzY3hwbnFnZm1oZWt0ZHV0Z2Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxODEwNzcsImV4cCI6MjA3OTc1NzA3N30.eAoKZ8v_tQf-P6Ug_IgILr53oz0cjqCBiJrMUS3QpIw',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzY3hwbnFnZm1oZWt0ZHV0Z2Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxODEwNzcsImV4cCI6MjA3OTc1NzA3N30.eAoKZ8v_tQf-P6Ug_IgILr53oz0cjqCBiJrMUS3QpIw',
      'Prefer': 'return=minimal'
    }
  };

  const req = https.request(options, (res) => {
    if (res.statusCode === 201) {
      console.log('🟢 Nexus Sync: BI Multiplexado reportado con éxito.');
      console.log(`📊 Datos: ${details}`);
    } else {
      console.log(`❌ Nexus Sync: Error (Status: ${res.statusCode})`);
    }
  });

  req.on('error', (e) => console.error('🔴 Error:', e));
  req.write(data);
  req.end();
};

// --- ORQUESTACIÓN DEL LATIDO (HEARTBEAT) ---
const INTERVAL_MS = 1 * 60 * 1000; // 1 minuto para pruebas iniciales, luego subir a 15

const initNexusSensor = async () => {
    console.log('🚀 Iniciando Nexus Heartbeat v2.1 (Auto-Healing)...');
    
    // 1. Reporte inicial y verificación de inventario
    const initialCount = await getInventoryMetrics();
    console.log(`📊 Inventario Detectado: ${initialCount} propiedades.`);
    
    if (initialCount === 0) {
        triggerAutoScrape(); // No esperamos (background)
    } else {
        await reportSync('⚡ Inicio de Sensor', `Sensor Atia activado. Inventario: ${initialCount}`);
    }
    
    // 2. Loop de latido persistente
    setInterval(async () => {
        const currentCount = await getInventoryMetrics();
        if (currentCount === 0 && !isScraping) {
            triggerAutoScrape(); // Background healing
            await reportSync('❤️ Latido', 'Sistema Operativo (Auto-Scraping en curso)');
        } else {
            await reportSync('❤️ Latido (Heartbeat)', isScraping ? 'Sistema Operativo (Scrapeando...)' : 'Sistema Atia Operativo.');
        }
    }, INTERVAL_MS);
    
    console.log(`⏳ Sensor Nexus en escucha cada ${INTERVAL_MS/60000} minutos. Auto-Scraping configurado.`);
};

initNexusSensor().catch(err => {
    console.error('💥 Error crítico en Sensor Nexus:', err);
    process.exit(1);
});
