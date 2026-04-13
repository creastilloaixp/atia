# Social Media Multi-Post Skill

**Trigger phrases:** "publica esto", "post this", "publica en redes", "share on social media", "multipost"

## Purpose
Publish a single post across multiple social media platforms simultaneously using Blotato via the n8n webhook `creastilo-multipost`.

## How to Use

When the user asks you to publish something on social media, extract:
1. **caption** (required) — The main text of the post
2. **image_prompt** (optional) — Description for AI-generated image (Gemini Imagen 3)
3. **platforms** (optional) — Array of platforms. Default: `["facebook", "instagram", "x", "linkedin"]`
4. **hashtags** (optional) — Array of hashtag strings (without #)
5. **cta_whatsapp** (optional) — WhatsApp link. Default: `wa.me/526671326265`

## Execution

Call the n8n webhook:

```bash
curl -X POST "https://n8n.creastilo.com/webhook/multipost" \
  -H "Content-Type: application/json" \
  -d '{
    "caption": "El texto del post aqui",
    "image_prompt": "Professional real estate photo of modern apartment in Mexico City with skyline view",
    "platforms": ["facebook", "instagram", "x", "linkedin"],
    "hashtags": ["inmobiliaria", "CDMX", "departamento"],
    "cta_whatsapp": "wa.me/526671326265"
  }'
```

Replace `n8n.creastilo.com` with the actual n8n instance URL from the environment.

## Platform Adaptations (automatic)

The workflow automatically adapts the caption:
- **X (Twitter):** Truncated to 280 chars, max 2 hashtags
- **Instagram:** Full caption + all hashtags + "Link en bio"
- **Facebook:** Full caption + WhatsApp CTA
- **LinkedIn:** Full caption + WhatsApp CTA + hashtags
- **TikTok:** Full caption + hashtags
- **Threads:** Truncated to 500 chars
- **Pinterest:** Truncated to 500 chars + hashtags
- **Bluesky:** Truncated to 300 chars

## Notes
- If `image_prompt` is provided, Gemini Imagen 3 generates an image automatically
- Posts are published immediately (not scheduled)
- All posts are logged to Supabase `campaign_posts` table
- Language default: Spanish (es-MX)
- Always include WhatsApp CTA for Mexican audience

## Example Interaction

**User:** "Publica en redes: Nuevo departamento disponible en Polanco, 2 recamaras, vista increible. Agenda tu visita hoy."

**Assistant action:** Extract caption, add relevant hashtags, generate image prompt about modern apartment in Polanco, call webhook.
