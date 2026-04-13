# Content Repurpose Skill

**Trigger phrases:** "repurposea", "automatiza contenido", "monitorea canal", "repurpose", "convierte contenido", "agrega fuente"

## Purpose
Configure automatic content repurposing from external sources (YouTube, blogs, podcasts) into social media posts. The system monitors sources every 6 hours and converts new content into platform-optimized posts.

## How to Use

### Adding a New Source

When the user wants to monitor a content source, extract:
1. **name** (required) — Friendly name for the source
2. **source_type** (required) — `youtube_channel`, `youtube_playlist`, `blog_rss`, `podcast_rss`
3. **source_url** (required) — URL of the channel/blog/podcast
4. **source_identifier** (optional) — YouTube channel ID (for youtube_channel type)
5. **client_id** (optional) — UUID of the agency client
6. **output_platforms** (optional) — Platforms to publish on. Default: `["facebook", "instagram", "x", "linkedin"]`
7. **transform_instructions** (optional) — Special instructions for content transformation
8. **check_interval_hours** (optional) — How often to check. Default: 6

### Execution: Add Source

Insert directly into Supabase `repurpose_sources` table:

```sql
INSERT INTO repurpose_sources (
  name, source_type, source_url, source_identifier,
  client_id, output_platforms, transform_instructions,
  check_interval_hours, is_active
) VALUES (
  'Canal YouTube de Carlos',
  'youtube_channel',
  'https://youtube.com/@CarlosChannel',
  'UCxxxxxxxxxx',
  NULL,
  '["facebook", "instagram", "x", "linkedin"]'::jsonb,
  'Usar tono casual y fresco. Enfocarse en tips practicos. Siempre mencionar wa.me/526671326265',
  6,
  true
);
```

### Execution: Check Queue Status

```sql
-- Ver posts pendientes
SELECT * FROM content_queue WHERE status = 'pending' ORDER BY created_at DESC LIMIT 20;

-- Ver posts publicados hoy
SELECT * FROM content_queue WHERE status = 'posted' AND updated_at::date = CURRENT_DATE;

-- Ver fuentes activas
SELECT * FROM repurpose_sources WHERE is_active = true;
```

## How the Automation Works

### Workflow A: `creastilo-repurpose-engine` (Every 6 hours)
1. Checks all active sources in `repurpose_sources`
2. For each source, detects new content (videos, articles)
3. Sends content to Gemini 2.0 Flash for repurposing
4. Gemini generates per-platform versions:
   - **LinkedIn:** 500-800 word article with insights
   - **X:** 3 individual tweets (280 chars max each)
   - **Instagram:** Caption with relevant hashtags
   - **Facebook:** Engagement-focused post
5. All generated posts go to `content_queue` with status "pending"

### Workflow B: `creastilo-queue-poster` (Hourly, L-V 8am-8pm CST)
1. Fetches pending posts from `content_queue`
2. Generates images if `image_prompt` exists
3. Publishes via Blotato API
4. Updates queue status to "posted" or "failed"

## Supported Source Types

| Type | Example | Detection |
|---|---|---|
| `youtube_channel` | youtube.com/@channel | YouTube Data API v3 — new videos |
| `youtube_playlist` | youtube.com/playlist?list=PL... | YouTube Data API v3 — new items |
| `blog_rss` | blog.com/feed.xml | RSS feed — new entries |
| `podcast_rss` | anchor.fm/.../podcast/rss | RSS feed — new episodes |

## Getting YouTube Channel ID

To find a channel's ID:
1. Go to the YouTube channel page
2. View page source or use: `https://www.youtube.com/feeds/videos.xml?channel_id=CHANNEL_ID`
3. Or use YouTube Data API: search by channel name

## Example Interactions

**User:** "Monitorea el canal de YouTube de RoboNuggets y convierte sus videos en posts para nuestras redes"

**Assistant action:**
1. Find RoboNuggets channel ID
2. Insert into `repurpose_sources` with type `youtube_channel`
3. Confirm: "Fuente agregada. El sistema revisara el canal cada 6 horas y convertira videos nuevos en posts para Facebook, Instagram, X y LinkedIn."

**User:** "Repurposea el blog de creastilo"

**Assistant action:**
1. Get blog RSS URL
2. Insert into `repurpose_sources` with type `blog_rss`
3. Confirm source added

## Notes
- YouTube Data API key is the same Gemini API key
- RSS feeds are checked via direct HTTP request
- Queue poster respects Mexican business hours (L-V 8am-8pm CST)
- Failed posts are retried on next queue-poster cycle
- Deactivate a source: `UPDATE repurpose_sources SET is_active = false WHERE id = 'uuid'`
