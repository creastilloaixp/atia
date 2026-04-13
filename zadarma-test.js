import { createHash, createHmac } from "node:crypto";
import dotenv from "dotenv";

dotenv.config();

async function testZadarma() {
    const zadarmaKey = process.env.ZADARMA_KEY;
    const zadarmaSecret = process.env.ZADARMA_SECRET;
    const fromNumber = '526674540164';
    const cleanPhone = '526671234567';

    const apiMethod = '/v1/request/callback/';
    const allParams = { format: 'json', from: fromNumber, to: cleanPhone };
    const sortedKeys = Object.keys(allParams).sort();
    
    const paramsStr = sortedKeys
      .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(allParams[k]).replace(/%20/g, '+')}`)
      .join('&');

    const md5Params = createHash('md5').update(paramsStr).digest('hex');
    const signString = `${apiMethod}${paramsStr}${md5Params}`;
    const signature = createHmac('sha1', zadarmaSecret).update(signString).digest('base64');

    console.log("Calling with signature:", signature);

    const zadarmaRes = await fetch(`https://api.zadarma.com${apiMethod}?${paramsStr}`, {
      method: 'GET',
      headers: { 'Authorization': `${zadarmaKey}:${signature}` },
    });

    const zadarmaData = await zadarmaRes.json();
    console.log('Zadarma Response:', zadarmaData);
}

testZadarma();
