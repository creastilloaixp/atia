import { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

/**
 * Helper para normalizar el teléfono al formato 52XXXXXXXXXX (México)
 */
function normalizePhone(phone: string): string {
  let clean = phone.replace(/[^0-9]/g, '');
  if (!clean.startsWith('52') && clean.length === 10) {
    clean = '52' + clean;
  } else if (clean.startsWith('1') && clean.length === 11) {
    clean = '52' + clean.slice(1);
  }
  return clean;
}


export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Manejo de CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { contact, lead_details, source = 'Landing Casto' } = req.body;
    const name = contact?.name || 'Lead Desconocido';
    const rawPhone = contact?.phone || '';
    const intent = lead_details?.intent || 'general';
    const location = lead_details?.location || 'Sin Ubicación';
    const preferredDate = lead_details?.preferred_date;
    const preferredTime = lead_details?.preferred_time;
    const appointmentScheduled = lead_details?.appointment_scheduled;

    // 1. VALIDACIÓN
    const phone = normalizePhone(rawPhone);
    if (phone.length < 12) {
      return res.status(400).json({ status: 'error', message: 'Teléfono inválido (mín 10 dígitos)' });
    }

    const results: any = { steps: [] };

    // 2. KOMMO CRM - Crear Lead
    // Requiere: KOMMO_DOMAIN, KOMMO_TOKEN, KOMMO_PHONE_FIELD_ID, KOMMO_CITY_FIELD_ID (opcional)
    if (process.env.KOMMO_TOKEN) {
      try {
        const custom_fields_values: any[] = [
          {
            field_id: parseInt(process.env.KOMMO_PHONE_FIELD_ID || '0'),
            values: [{ value: `+${phone}` }]
          }
        ];

        // Añadir Ciudad si el ID del campo está configurado
        if (process.env.KOMMO_CITY_FIELD_ID) {
          custom_fields_values.push({
            field_id: parseInt(process.env.KOMMO_CITY_FIELD_ID),
            values: [{ value: location }]
          });
        }

        const kommoRes = await fetch(`https://${process.env.KOMMO_DOMAIN}.kommo.com/api/v4/leads`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.KOMMO_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify([{
            name: `Lead Casto (${location}): ${name} - ${intent}`,
            custom_fields_values
          }])
        });
        results.steps.push({ step: 'kommo', status: kommoRes.status });
      } catch (e) {
        results.steps.push({ step: 'kommo', status: 'failed', error: String(e) });
      }
    }

    // 3. ZADARMA - Callback
    // Requiere: ZADARMA_KEY, ZADARMA_SECRET, ZADARMA_FROM
    if (process.env.ZADARMA_KEY && process.env.ZADARMA_SECRET) {
      try {
        const fromNumber = process.env.ZADARMA_FROM || '+526674540164';

        console.log('Zadarma - Phone:', phone);
        console.log('Zadarma - From:', fromNumber);

        const cleanNumber = (n: string) => n.replace(/\D/g, '');
        const apiMethod = '/v1/request/callback/';
        const allParams: Record<string, string> = { format: 'json', from: cleanNumber(fromNumber), to: cleanNumber(phone) };

        // Firma SDK Zadarma: /v1/method/ + sortedParams + MD5(sortedParams) -> HMAC-SHA1 hex -> base64
        const sortedKeys = Object.keys(allParams).sort();
        const sortedObj = sortedKeys.reduce((acc, k) => { acc[k] = allParams[k]; return acc; }, {} as Record<string, string>);
        const paramsStr = new URLSearchParams(sortedObj).toString().replace(/%20/g, '+');
        const md5Params = crypto.createHash('md5').update(paramsStr).digest('hex');
        const signString = `${apiMethod}${paramsStr}${md5Params}`;
        const hmacHex = crypto.createHmac('sha1', process.env.ZADARMA_SECRET).update(signString).digest('hex');
        const signature = Buffer.from(hmacHex).toString('base64');

        // SDK sends callback as GET with params in query string
        const zadarmaRes = await fetch(`https://api.zadarma.com${apiMethod}?${paramsStr}`, {
          method: 'GET',
          headers: {
            'Authorization': `${process.env.ZADARMA_KEY}:${signature}`,
          },
        });

        const zadarmaData = await zadarmaRes.json();
        console.log('Zadarma Response:', zadarmaData);

        results.steps.push({ step: 'zadarma', status: zadarmaRes.status, response: zadarmaData });
      } catch (e) {
        console.error('Zadarma Error:', e);
        results.steps.push({ step: 'zadarma', status: 'failed', error: String(e) });
      }
    } else {
      console.log('Zadarma - No credentials found');
    }

    // 4. EVOLUTION API - WhatsApp
    // Requiere: EVOLUTION_API_KEY, EVOLUTION_INSTANCE
    if (process.env.EVOLUTION_API_KEY) {
      try {
        let welcomeText;
        
        if (appointmentScheduled && preferredDate && preferredTime) {
          const dateObj = new Date(preferredDate + 'T12:00:00');
          const formattedDate = dateObj.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
          const hour = preferredTime.split(':')[0];
          const minutes = preferredTime.split(':')[1];
          
          welcomeText = `¡Hola ${name}! 👋 Soy Adriana de CompramosTuCasa.mx. 

He recibido tu solicitud y confirmo tu **cita gratuita** para el ${formattedDate} a las ${hour}:${minutes} hrs.

Un asesor experto visitará tu propiedad para darte el diagnóstico legal sin costo. ¿Hay algo que quieras prepararnos antes de la visita?`;
        } else {
          welcomeText = location !== 'Sin Ubicación' 
            ? `¡Hola ${name}! 👋 Soy Adriana, asesora virtual de CompramosTuCasa.mx para la zona de ${location}. He recibido tu solicitud de diagnóstico gratuito. ¿Te gustaría agendar una cita con nuestro asesor legal? También puedo resolver cualquier duda que tengas sobre tu propiedad.`
            : `¡Hola ${name}! 👋 Soy Adriana de CompramosTuCasa.mx. He recibido tu solicitud de diagnóstico gratuito. ¿Te gustaría agendar una cita gratuita con nuestro asesor legal? También puedo resolver cualquier duda que tengas.`;
        }

        const evolutionRes = await fetch(`${process.env.EVOLUTION_API_URL || 'https://n8n-evolution-api.yxmkwr.easypanel.host'}/message/sendText/${process.env.EVOLUTION_INSTANCE || 'GRUPOATIA'}`, {
          method: 'POST',
          headers: {
            'apikey': process.env.EVOLUTION_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            number: phone,
            text: welcomeText
          })
        });
        results.steps.push({ step: 'evolution', status: evolutionRes.status });
      } catch (e) {
        results.steps.push({ step: 'evolution', status: 'failed' });
      }
    }

    return res.status(200).json({
      status: 'success',
      message: 'Lead procesado correctamente',
      phone: phone,
      results
    });

  } catch (error) {
    console.error('Error in leads handler:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
}
