#!/usr/bin/env node
/**
 * Zadarma API Integration — Casto Automation
 * Usado para llamar al asesor automáticamente cuando un lead quiere contactarse
 */

const https = require('https');
const crypto = require('crypto');

class ZadarmaClient {
  constructor(apiKey, secret) {
    this.apiKey = apiKey;
    this.secret = secret;
    this.baseUrl = 'api.zadarma.com';
  }

  /**
   * Genera la firma de autorización para Zadarma API
   * Algoritmo: HMAC-SHA1(secret, method + sortedParams + MD5(sortedParams)) -> hex -> base64
   */
  generateSignature(apiPath, params = {}) {
    const sortedKeys = Object.keys(params).sort();
    const paramsStr = new URLSearchParams(
      sortedKeys.reduce((acc, k) => { acc[k] = params[k]; return acc; }, {})
    ).toString().replace(/%20/g, '+');

    const md5Params = crypto.createHash('md5').update(paramsStr).digest('hex');
    // SDK format: /v1/method/ + paramsStr + MD5(paramsStr) -> HMAC-SHA1 hex -> base64
    const signString = `${apiPath}${paramsStr}${md5Params}`;
    const hmacHex = crypto.createHmac('sha1', this.secret).update(signString).digest('hex');

    return Buffer.from(hmacHex).toString('base64');
  }

  /**
   * Realiza una solicitud a la API de Zadarma
   */
  request(method, params = {}, post = false) {
    return new Promise((resolve, reject) => {
      // Add format param like official SDK
      const allParams = { ...params, format: 'json' };
      // SDK signs with /v1/method/ (leading /v1/ and trailing /)
      const apiPath = `/v1/${method}/`;
      const signature = this.generateSignature(apiPath, allParams);

      const queryString = new URLSearchParams(allParams).toString();
      const path = post
        ? apiPath
        : (queryString ? `${apiPath}?${queryString}` : apiPath);

      const options = {
        hostname: this.baseUrl,
        path: path,
        method: post ? 'POST' : 'GET',
        headers: {
          'Authorization': `${this.apiKey}:${signature}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve(json);
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on('error', reject);

      if (post) {
        req.write(new URLSearchParams(allParams).toString());
      }

      req.end();
    });
  }

  /**
   * Obtiene el saldo de la cuenta
   */
  async getBalance() {
    return this.request('info/balance');
  }

  /**
   * Obtiene el costo de una llamada a un número
   */
  async getPrice(number, callerId = null) {
    const params = { number };
    if (callerId) params.caller_id = callerId;
    return this.request('info/price', params);
  }

  /**
   * Callback - El sistema llama primero al asesor y luego al cliente
   */
  async callback(from, to, sip = null, predicted = false) {
    const params = { from, to };
    if (sip) params.sip = sip;
    if (predicted) params.predicted = 1;
    
    return this.request('request/callback', params, true);
  }

  /**
   * Verifica el estado de un número SIP
   */
  async getSipStatus(sipId) {
    return this.request(`sip/${sipId}/status`);
  }

  /**
   * Obtiene estadísticas de llamadas
   */
  async getStatistics(start, end, sip = null) {
    const params = { start, end };
    if (sip) params.sip = sip;
    return this.request('statistics', params);
  }
}

/**
 * Contactar asesor automáticamente
 */
async function contactAdvisor(lead, advisorPhone, client) {
  const { name, phone, property_type, city } = lead;
  
  console.log(`📞 Contacting advisor for: ${name}`);
  console.log(`   Property: ${property_type} | City: ${city}`);
  console.log(`   Lead phone: ${phone}`);
  
  const result = await client.callback(
    advisorPhone,
    phone,
    null,
    true
  );
  
  console.log(`   ✅ Result:`, result);
  return result;
}

module.exports = { ZadarmaClient, contactAdvisor };

if (require.main === module) {
  const API_KEY = process.env.ZADARMA_KEY;
  const SECRET = process.env.ZADARMA_SECRET;
  
  if (!API_KEY || !SECRET) {
    console.log('⚠️ Configura tus credenciales:');
    console.log('   export ZADARMA_KEY="tu-key"');
    console.log('   export ZADARMA_SECRET="tu-secret"');
    process.exit(1);
  }
  
  const client = new ZadarmaClient(API_KEY, SECRET);
  client.getBalance().then(console.log).catch(console.error);
}