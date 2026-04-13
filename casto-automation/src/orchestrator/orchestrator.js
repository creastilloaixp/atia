#!/usr/bin/env node
/**
 * Orchestrator — Casto Automation Pipeline
 * Coordina el flujo completo: crawler → queue → call/email → webhook
 */

const TEST_MODE = process.env.TEST_MODE === 'true';
const CALLS_PER_HOUR = 10;

// Simulated database (en producción, usar Supabase)
const leads = [];
const activityLog = [];

/**
 * Decisión: llamar o enviar email
 */
function decideContactMethod(lead) {
  if (lead.phone) {
    return 'call';
  } else if (lead.email) {
    return 'email';
  } else {
    return 'none';
  }
}

/**
 * Procesa un lead del pipeline
 */
async function processLead(lead) {
  console.log(`\n🔄 Processing lead: ${lead.name}`);
  console.log(`   Phone: ${lead.phone || 'N/A'} | Email: ${lead.email || 'N/A'}`);
  
  // Actualizar status a queued
  lead.status = 'queued';
  
  // Decidir método de contacto
  const method = decideContactMethod(lead);
  console.log(`   📌 Decision: ${method}`);
  
  if (method === 'none') {
    lead.status = 'unreachable';
    console.log(`   ❌ No contact method available`);
    return lead;
  }
  
  // Simular delay para rate limiting
  await sleep(1000 / CALLS_PER_HOUR * 1000);
  
  if (method === 'call') {
    // Simular llamada VAPI
    lead.status = 'called';
    console.log(`   📞 Calling... (VAPI mock)`);
    console.log(`   ✅ Call completed → Status: called`);
  } else {
    // Simular email Resend
    lead.status = 'emailed';
    console.log(`   📧 Sending email... (Resend mock)`);
    console.log(`   ✅ Email sent → Status: emailed`);
  }
  
  // Log actividad
  activityLog.push({
    lead_id: lead.id,
    action: method === 'call' ? 'call_completed' : 'email_sent',
    timestamp: new Date().toISOString()
  });
  
  return lead;
}

/**
 * Main orchestrator loop
 */
async function runOrchestrator() {
  console.log('🎛️ Casto Orchestrator Starting...');
  console.log(`   Test Mode: ${TEST_MODE}`);
  console.log(`   Calls per hour: ${CALLS_PER_HOUR}`);
  console.log('=' .repeat(50));
  
  // Simular leads nuevos (en producción, venir de Supabase)
  const newLeads = [
    { id: 1, name: 'Juan Pérez', phone: '+526671234567', email: 'juan@email.com', city: 'Culiacán', status: 'new' },
    { id: 2, name: 'María García', phone: '+526678765432', email: 'maria@email.com', city: 'Mazatlán', status: 'new' },
    { id: 3, name: 'Roberto López', phone: null, email: 'roberto@email.com', city: 'Monterrey', status: 'new' },
    { id: 4, name: 'Sofia Hernández', phone: '+526679998877', email: 'sofia@email.com', city: 'Culiacán', status: 'new' },
    { id: 5, name: 'Carlos Mendoza', phone: null, email: null, city: 'Tijuana', status: 'new' },
  ];
  
  console.log(`\n📥 Found ${newLeads.length} new leads`);
  
  // Procesar cada lead
  for (const lead of newLeads) {
    await processLead(lead);
  }
  
  // Resumen
  console.log('\n' + '='.repeat(50));
  console.log('📊 Pipeline Summary:');
  console.log(`   Total processed: ${newLeads.length}`);
  console.log(`   Called: ${newLeads.filter(l => l.status === 'called').length}`);
  console.log(`   Emailed: ${newLeads.filter(l => l.status === 'emailed').length}`);
  console.log(`   Unreachable: ${newLeads.filter(l => l.status === 'unreachable').length}`);
  console.log(`\n✅ Orchestrator complete`);
}

/**
 * Webhook handler (simulado)
 */
function handleWebhook(event) {
  const { type, call_id, email_id, outcome } = event;
  
  console.log(`\n📥 Webhook received: ${type}`);
  console.log(`   Call/Email ID: ${call_id || email_id}`);
  console.log(`   Outcome: ${outcome}`);
  
  // Actualizar lead en DB
  // await supabase.from('leads').update({ status: outcome }).eq('id', leadId)
  
  return { received: true };
}

// Utility
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run
if (require.main === module) {
  runOrchestrator();
}

module.exports = { runOrchestrator, processLead, handleWebhook };