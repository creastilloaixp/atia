/**
 * Zadarma Full Diagnostic Script
 * Queries all relevant API endpoints to diagnose callback issues
 */
const crypto = require('crypto');

const ZADARMA_KEY = 'd8a6348ef909f8b21047';
const ZADARMA_SECRET = '8f47b458a1105d59ec42';

function zadarmaSign(method, params = {}) {
  const sortedKeys = Object.keys(params).sort();
  const paramsStr = sortedKeys
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k]).replace(/%20/g, '+')}`)
    .join('&');
  const md5 = crypto.createHash('md5').update(paramsStr).digest('hex');
  const signStr = `${method}${paramsStr}${md5}`;
  const hmac = crypto.createHmac('sha1', ZADARMA_SECRET).update(signStr).digest('hex');
  return { signature: Buffer.from(hmac).toString('base64'), paramsStr };
}

async function apiCall(method, params = {}) {
  const { signature, paramsStr } = zadarmaSign(method, params);
  const url = `https://api.zadarma.com${method}${paramsStr ? '?' + paramsStr : ''}`;
  const res = await fetch(url, {
    headers: { 'Authorization': `${ZADARMA_KEY}:${signature}` }
  });
  return res.json();
}

async function run() {
  console.log('=== ZADARMA FULL DIAGNOSTIC ===\n');

  // 1. Account balance & info
  console.log('--- 1. BALANCE ---');
  const balance = await apiCall('/v1/info/balance/');
  console.log(JSON.stringify(balance, null, 2));

  // 2. SIP list with online status
  console.log('\n--- 2. SIP LIST ---');
  const sips = await apiCall('/v1/sip/');
  console.log(JSON.stringify(sips, null, 2));

  // 3. PBX info
  console.log('\n--- 3. PBX INTERNAL ---');
  const pbxInternal = await apiCall('/v1/pbx/internal/');
  console.log(JSON.stringify(pbxInternal, null, 2));

  // 4. PBX internal details (forwarding, etc) for each extension
  if (pbxInternal.status === 'success' && pbxInternal.pbx_id) {
    const extensions = pbxInternal.extensions || pbxInternal.pbx_id;
    console.log('\n--- 4. PBX EXTENSION DETAILS ---');
    // Try getting individual extension settings
    if (Array.isArray(pbxInternal.extensions)) {
      for (const ext of pbxInternal.extensions) {
        console.log(`\n  Extension ${ext}:`);
        const detail = await apiCall(`/v1/pbx/internal/${ext}/settings/`);
        console.log('  ' + JSON.stringify(detail, null, 2).replace(/\n/g, '\n  '));
      }
    }
  }

  // 5. Direct numbers
  console.log('\n--- 5. DIRECT NUMBERS ---');
  const numbers = await apiCall('/v1/direct_numbers/');
  console.log(JSON.stringify(numbers, null, 2));

  // 6. Recent call history (last 10)
  console.log('\n--- 6. RECENT CALLS (last 24h) ---');
  const now = new Date();
  const yesterday = new Date(now - 86400000);
  const fmt = d => d.toISOString().slice(0, 19).replace('T', ' ');
  const calls = await apiCall('/v1/statistics/', {
    start: fmt(yesterday),
    end: fmt(now),
  });
  console.log(JSON.stringify(calls, null, 2));

  // 7. PBX call recording status
  console.log('\n--- 7. PBX RECORDING ---');
  const recording = await apiCall('/v1/pbx/record/');
  console.log(JSON.stringify(recording, null, 2));

  // 8. Caller IDs
  console.log('\n--- 8. CALLER IDs ---');
  const callerids = await apiCall('/v1/info/lists/callerid/');
  console.log(JSON.stringify(callerids, null, 2));

  // 9. Current callback settings
  console.log('\n--- 9. REDIRECTION SETTINGS ---');
  if (Array.isArray(pbxInternal.extensions)) {
    for (const ext of pbxInternal.extensions) {
      const redir = await apiCall(`/v1/pbx/redirection/${ext}/`);
      console.log(`  Extension ${ext}:`, JSON.stringify(redir));
    }
  }

  console.log('\n=== DIAGNOSTIC COMPLETE ===');
}

run().catch(console.error);
