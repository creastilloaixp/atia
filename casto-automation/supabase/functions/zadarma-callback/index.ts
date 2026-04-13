const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { phone, from } = await req.json();
    
    const zadarmaKey = Deno.env.get('ZADARMA_KEY');
    const zadarmaSecret = Deno.env.get('ZADARMA_SECRET');
    const fromNumber = from || Deno.env.get('ZADARMA_FROM') || '+526674540164';

    if (!zadarmaKey || !zadarmaSecret) {
      return new Response(JSON.stringify({ status: 'error', message: 'No Zadarma credentials' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calcular firma según Zadarma
    const method = 'request/callback';
    const params = { from: fromNumber, to: phone };
    const sortedKeys = Object.keys(params).sort();
    const sortedParams = sortedKeys.map(k => `${k}=${params[k as keyof typeof params]}`).join('&');
    
    // MD5
    const md5Buffer = await crypto.subtle.digest('MD5', new TextEncoder().encode(sortedParams));
    const md5Params = Array.from(new Uint8Array(md5Buffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    // SHA1 HMAC
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(zadarmaSecret),
      { name: 'HMAC', hash: 'SHA-1' },
      false,
      ['sign']
    );
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`/v1/${method}${sortedParams}${md5Params}`));
    const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));

    const zadarmaUrl = `https://api.zadarma.com/v1/request/callback/?${sortedParams}&key=${zadarmaKey}&signature=${encodeURIComponent(signature)}`;

    console.log('Zadarma URL:', zadarmaUrl);
    console.log('Signature:', signature);

    const zadarmaRes = await fetch(zadarmaUrl, {
      method: 'GET',
      headers: {
        'Authorization': `${zadarmaKey}:${signature}`,
      }
    });

    const zadarmaData = await zadarmaRes.json();
    console.log('Zadarma Response:', zadarmaData);

    return new Response(JSON.stringify(zadarmaData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ status: 'error', message: String(error) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});