# Campaign Generator Skill

**Trigger phrases:** "crea campana", "genera campana", "30-day campaign", "campana de marketing", "campaign for", "lanza campana"

## Purpose
Generate a complete 30-day marketing campaign with AI-generated content, images, and automatic scheduling across all social media platforms.

## How to Use

When the user asks to create a campaign, extract:
1. **product** (required) — Product or service name
2. **industry** (required) — Business industry (inmobiliaria, ecommerce, servicios, restaurante, etc.)
3. **target_audience** (optional) — Target audience description
4. **tone** (optional) — Content tone: profesional, casual, divertido, formal. Default: profesional
5. **duration_days** (optional) — Campaign length. Default: 30
6. **platforms** (optional) — Array of platforms. Default: `["facebook", "instagram", "x", "linkedin"]`
7. **cta_whatsapp** (optional) — WhatsApp link. Default: `wa.me/526671326265`
8. **client_id** (optional) — UUID of agency client from `agency_clients` table

## Execution

Call the n8n webhook:

```bash
curl -X POST "https://n8n.creastilo.com/webhook/generate-campaign" \
  -H "Content-Type: application/json" \
  -d '{
    "product": "Departamento de lujo en Polanco",
    "industry": "inmobiliaria",
    "target_audience": "Profesionistas 30-50 anos CDMX con ingreso alto",
    "tone": "profesional",
    "duration_days": 30,
    "platforms": ["facebook", "instagram", "x", "linkedin"],
    "cta_whatsapp": "wa.me/526671326265"
  }'
```

## Content Mix (automatic)
- **40% Educativo** — Tips, datos del mercado, guias
- **30% Promocional** — Producto/servicio, ofertas, CTAs directos
- **20% Social Proof** — Testimoniales, casos de exito, numeros
- **10% Behind the Scenes** — Equipo, proceso, cultura

## Scheduling (automatic)
Horarios optimos para Mexico (CST):
- **Lunes-Viernes:** 9-10am, 1-2pm, 7-8pm
- **Sabado:** 10-11am
- **Domingo:** Sin posts (configurable)

## What Happens
1. Creates campaign record in Supabase
2. Gemini 2.0 Flash generates 30-day content calendar (JSON)
3. For each post (in batches of 5):
   - Gemini Imagen 3 generates an image
   - Blotato schedules the post
   - Post saved to `campaign_posts` table
4. Campaign status updated to "active"
5. Returns campaign ID and summary

## Campaign Templates Available

### Inmobiliaria
Dia 1-5: Hero image + intro propiedad
Dia 6-10: Tour virtual + datos de la zona
Dia 11-15: Testimoniales + comparativas
Dia 16-20: Tips financieros + proceso de compra
Dia 21-25: Urgencia + escasez
Dia 26-30: CTA WhatsApp + cierre

### E-Commerce
Dia 1-5: Teaser + reveal producto
Dia 6-10: Beneficios + como funciona
Dia 11-15: Social proof + reviews
Dia 16-20: Oferta especial + countdown
Dia 21-25: Behind scenes + equipo
Dia 26-30: Recap + mega oferta + CTA

### Servicios/Agencias
Dia 1-5: Intro marca + propuesta de valor
Dia 6-10: Caso de exito detallado
Dia 11-15: Tips gratis + educacion
Dia 16-20: Equipo + cultura
Dia 21-25: Tutorial + how-to
Dia 26-30: CTA consulta + WhatsApp

## Example Interaction

**User:** "Crea una campana de 30 dias para una taqueria en Guadalajara"

**Assistant action:**
1. Extract: product="Taqueria en Guadalajara", industry="restaurante"
2. Call webhook with appropriate parameters
3. Report: "Campana generada: 30 posts programados en Facebook, Instagram, X y LinkedIn. ID: [uuid]. Los posts comienzan manana a las 10am CST."

## Notes
- Campaign generation takes 2-5 minutes (image generation is the bottleneck)
- Rate limiting: 2-second wait between batches to respect API limits
- Each post gets a unique AI-generated image
- All content in Spanish (es-MX) with Mexican cultural context
- Gemini Imagen 3: 50 free images/day on the free tier
