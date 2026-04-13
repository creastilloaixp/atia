#!/usr/bin/env node
/**
 * Voice AI — VAPI Integration
 * Realiza llamadas automáticas a leads usando VAPI
 */

const VAPI_API_KEY = process.env.VAPI_API_KEY || 'your-vapi-key';
const VAPI_ASSISTANT_ID = process.env.VAPI_ASSISTANT_ID || 'your-assistant-id';
const VAPI_PHONE_NUMBER_ID = process.env.VAPI_PHONE_NUMBER_ID || 'your-phone-id';
const TEST_MODE = process.env.TEST_MODE === 'true';

/**
 * Inicia una llamada con VAPI
 */
async function startCall(lead) {
  const { name, phone, property_type, debt_type, city } = lead;
  
  console.log(`📞 Initiating call to ${name} (${phone})`);
  console.log(`   Property: ${property_type} | Debt: ${debt_type} | City: ${city}`);
  
  if (TEST_MODE) {
    console.log(`   ⚠️ TEST MODE: Redirecting to test number`);
  }
  
  const requestBody = {
    assistant_id: VAPI_ASSISTANT_ID,
    phone_number_id: VAPI_PHONE_NUMBER_ID,
    customer: {
      number: TEST_MODE ? '+526674540164' : phone
    },
    dynamic_variables: {
      customer_name: name,
      property_type: property_type,
      debt_type: debt_type,
      city: city,
      agent_name: 'Andrea'
    }
  };
  
  // En producción, hacer POST a VAPI:
  // const response = await fetch('https://api.vapi.ai/call', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${VAPI_API_KEY}`,
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify(requestBody)
  // });
  
  // Simular respuesta
  console.log(`   ✅ Call initiated (mock)`);
  console.log(`   📝 Call ID: call-${Date.now()}`);
  
  return {
    call_id: `call-${Date.now()}`,
    status: 'initiated',
    test_mode: TEST_MODE
  };
}

/**
 * Poll estado de llamada
 */
async function getCallStatus(callId) {
  // En producción: GET https://api.vapi.ai/call/{callId}
  return {
    call_id: callId,
    status: 'completed',
    duration: 180,
    outcome: 'appointment_scheduled'
  };
}

/**
 * Webhook handler para resultados de VAPI
 */
function handleWebhook(payload) {
  const { call_id, status, transcript, recording_url, outcome } = payload;
  
  console.log(`📥 Webhook received for call ${call_id}`);
  console.log(`   Status: ${status}`);
  console.log(`   Outcome: ${outcome}`);
  
  // Actualizar Supabase con resultado
  // await supabase.from('activity_log').insert({...})
  
  return { received: true };
}

/**
 * Main: procesar lead
 */
async function processLead(lead) {
  if (!lead.phone) {
    console.log(`❌ No phone number for lead: ${lead.name}`);
    return null;
  }
  
  try {
    const call = await startCall(lead);
    return call;
  } catch (error) {
    console.error(`❌ Error starting call: ${error.message}`);
    return null;
  }
}

// Exportar funciones
module.exports = { startCall, getCallStatus, handleWebhook, processLead };

// CLI usage
if (require.main === module) {
  const lead = {
    name: process.argv[2] || 'Test Lead',
    phone: process.argv[3] || '+526674540164',
    property_type: 'casa',
    debt_type: 'infonavit',
    city: 'Culiacan'
  };
  
  console.log('🎙️ Casto Voice AI - VAPI Integration\n');
  processLead(lead).then(result => {
    console.log('\n✅ Call processing complete');
  });
}