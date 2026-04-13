#!/usr/bin/env node
/**
 * Email Integration — Resend
 * Envía emails automatizados a leads sin teléfono
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_xxx';
const TEST_MODE = process.env.TEST_MODE === 'true';
const FROM_EMAIL = 'Casto Inmobiliaria <hola@atia.mx>';

// Email templates
const templates = {
  initial: {
    subject: '¿Tienes una propiedad que necesitas vender rápidamente?',
    body: `Hola {{name}},

Me llamo {{agent}} de Casto Inmobiliaria.

Te contacto porque talvez podemos ayudarte con una situación que tengo disponible para ti.

¿Tienes una propiedad que:
- Tiene deuda con Infonavit, banco o alguna institución?
- Está en proceso de embargo?
- Es una herencia sin resolver?
- Necesitas vender urgente?

Nosotros compramos ese tipo de propiedades. Nos encargamos de liquidar la deuda y te damos el剩余 de la venta.

El proceso es simple:
1. Nos contactas
2. Te damos una oferta en 24 horas
3. Cerramos ante notario en 7-15 días

No te costo nada y no pierdes nada con una valoración.

¿Quieres que te llame para explicarte mejor?

Saludos,
{{agent}}
Casto Inmobiliria
{{whatsapp}}`
  },
  followup: {
    subject: '¿Ya pudiste revisar mi mensaje?',
    body: `Hola {{name}},

Te escribo de nuevo porque no quiero que se te pase esta oportunidad.

Si tu propiedad tiene algún tema financiero (deuda, embargo, herencia, etc.), podemos ayudarte.

No te cobran nada por una evaluación.

¿Te interesa que te llame?

Saludos,
{{agent}}
Casto Inmobiliaria`
  },
  final: {
    subject: 'Última oportunidad - propiedad en {{city}}',
    body: `Hola {{name}},

Solo un último mensaje para ver si te puede servir lo que offercemos.

Si tienes una propiedad con deuda o situación legal, la compramos.

Es un proceso gratuito y sin compromiso.

Mi número es {{whatsapp}} por si decides comunicarte.

Gracias por tu tiempo.

Saludos,
{{agent}}
Casto Inmobiliaria`
  }
};

/**
 * Personaliza template con variables
 */
function fillTemplate(template, vars) {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return result;
}

/**
 * Envía email usando Resend API
 */
async function sendEmail(to, templateType, vars) {
  const template = templates[templateType];
  if (!template) {
    throw new Error(`Template '${templateType}' not found`);
  }
  
  const personalizedSubject = fillTemplate(template.subject, vars);
  const personalizedBody = fillTemplate(template.body, vars);
  
  console.log(`📧 Sending ${templateType} email to: ${to}`);
  console.log(`   Subject: ${personalizedSubject}`);
  
  if (TEST_MODE) {
    console.log(`   ⚠️ TEST MODE: Sending to test email instead`);
    to = 'test@atia.mx';
  }
  
  // En producción, usar Resend API:
  // const response = await fetch('https://api.resend.com/emails', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${RESEND_API_KEY}`,
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify({
  //     from: FROM_EMAIL,
  //     to: to,
  //     subject: personalizedSubject,
  //     text: personalizedBody
  //   })
  // });
  
  // Simular respuesta
  console.log(`   ✅ Email sent (mock)`);
  console.log(`   📝 Email ID: email-${Date.now()}`);
  
  return {
    email_id: `email-${Date.now()}`,
    to: to,
    template: templateType,
    test_mode: TEST_MODE
  };
}

/**
 * Main: enviar a lead sin teléfono
 */
async function processLead(lead, templateType = 'initial') {
  if (!lead.email) {
    console.log(`❌ No email for lead: ${lead.name}`);
    return null;
  }
  
  const vars = {
    name: lead.name,
    agent: 'Andrea',
    whatsapp: '+526674540164',
    city: lead.city || 'Sinaloa'
  };
  
  try {
    const result = await sendEmail(lead.email, templateType, vars);
    return result;
  } catch (error) {
    console.error(`❌ Error sending email: ${error.message}`);
    return null;
  }
}

module.exports = { sendEmail, processLead, templates };

if (require.main === module) {
  const lead = {
    name: process.argv[2] || 'Test Lead',
    email: process.argv[3] || 'test@email.com',
    city: 'Culiacan'
  };
  
  console.log('📧 Casto Email Integration - Resend\n');
  processLead(lead, 'initial').then(result => {
    console.log('\n✅ Email processing complete');
  });
}