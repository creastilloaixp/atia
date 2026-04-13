#!/bin/bash
# =============================================================================
# creastilo AI XPERIENCE — Marketing Automation Setup
# =============================================================================
# Master setup script. Run this once to initialize everything.
# =============================================================================

set -e

echo "=========================================="
echo " creastilo AI XPERIENCE"
echo " Marketing Automation System Setup"
echo "=========================================="
echo ""

# --- Step 1: Check prerequisites ---
echo "[1/5] Checking prerequisites..."

# Check .env
if [ ! -f .env ]; then
  echo "ERROR: .env file not found"
  exit 1
fi

# Check required env vars
source .env 2>/dev/null || true

if [ -z "$VITE_GEMINI_API_KEY" ]; then
  echo "WARN: VITE_GEMINI_API_KEY not found in .env"
fi
if [ -z "$VITE_SUPABASE_URL" ]; then
  echo "ERROR: VITE_SUPABASE_URL not found in .env"
  exit 1
fi
if [ -z "$VITE_N8N_API_KEY" ]; then
  echo "WARN: VITE_N8N_API_KEY not found in .env"
fi

echo "  .env loaded OK"
echo ""

# --- Step 2: Supabase migration ---
echo "[2/5] Supabase Database Setup"
echo "  Run these SQL files in your Supabase SQL Editor (in order):"
echo ""
echo "  1. sql/001_marketing_automation.sql"
echo "     Creates tables: agency_clients, campaigns, campaign_posts,"
echo "     campaign_templates, repurpose_sources, content_queue"
echo ""
echo "  2. sql/002_seed_campaign_templates.sql"
echo "     Seeds 3 campaign templates: inmobiliaria, ecommerce, servicios"
echo ""
echo "  Supabase URL: $VITE_SUPABASE_URL"
echo ""

# --- Step 3: Blotato setup ---
echo "[3/5] Blotato Setup"
echo "  1. Create account at https://blotato.com"
echo "  2. Connect your social media accounts (SSO)"
echo "     - Facebook, Instagram, X, LinkedIn (minimum)"
echo "     - Optional: TikTok, Threads, Pinterest, Bluesky"
echo "  3. Get your API key from Blotato dashboard"
echo "  4. Add to .env: BLOTATO_API_KEY=your_key_here"
echo ""

# --- Step 4: n8n workflows ---
echo "[4/5] n8n Workflow Deployment"
echo "  Workflows to import (via n8n UI or API):"
echo ""
echo "  1. creastilo-multipost.json        — Level 1: Post to all platforms"
echo "  2. creastilo-campaign-generator.json — Level 2: 30-day campaign generation"
echo "  3. creastilo-repurpose-engine.json  — Level 3A: Content repurposing (every 6h)"
echo "  4. creastilo-queue-poster.json      — Level 3B: Queue poster (hourly L-V 8am-8pm)"
echo ""
echo "  After importing, configure in each workflow:"
echo "  - Postgres credential (Supabase connection)"
echo "  - Environment variables: GEMINI_API_KEY, BLOTATO_API_KEY"
echo ""
echo "  To deploy via API: bash scripts/deploy-n8n-workflows.sh"
echo ""

# --- Step 5: Verify Gemini Imagen 3 ---
echo "[5/5] Gemini Imagen 3 Verification"
echo "  Testing image generation API..."
echo ""

if [ -n "$VITE_GEMINI_API_KEY" ]; then
  echo "  Sending test request to Gemini Imagen 3..."
  response=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=$VITE_GEMINI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"instances":[{"prompt":"A simple blue square on white background"}],"parameters":{"sampleCount":1,"aspectRatio":"1:1","personGeneration":"DONT_ALLOW"}}' \
    --max-time 30 2>/dev/null || echo "timeout")

  if [ "$response" = "200" ]; then
    echo "  Gemini Imagen 3: OK (API key works)"
  elif [ "$response" = "timeout" ]; then
    echo "  Gemini Imagen 3: TIMEOUT (try again later)"
  else
    echo "  Gemini Imagen 3: HTTP $response"
    echo "  (May need to enable Imagen API in Google Cloud Console)"
  fi
else
  echo "  SKIP: No GEMINI_API_KEY found"
fi

echo ""
echo "=========================================="
echo " Setup Summary"
echo "=========================================="
echo ""
echo " Files created:"
echo "  sql/001_marketing_automation.sql     — Database schema (6 tables)"
echo "  sql/002_seed_campaign_templates.sql  — 3 industry templates"
echo "  n8n-workflows/creastilo-multipost.json"
echo "  n8n-workflows/creastilo-campaign-generator.json"
echo "  n8n-workflows/creastilo-repurpose-engine.json"
echo "  n8n-workflows/creastilo-queue-poster.json"
echo "  .agents/skills/social-media-multipost/SKILL.md"
echo "  .agents/skills/campaign-generator/SKILL.md"
echo "  .agents/skills/content-repurpose/SKILL.md"
echo "  templates/campaigns/inmobiliaria.json"
echo "  templates/campaigns/ecommerce.json"
echo "  templates/campaigns/servicios.json"
echo ""
echo " Required env variables (add to .env):"
echo "  BLOTATO_API_KEY=your_blotato_api_key"
echo "  GEMINI_API_KEY=\$VITE_GEMINI_API_KEY  (same key, non-VITE prefix for n8n)"
echo "  N8N_BASE_URL=https://your-n8n-instance.com"
echo ""
echo " Testing:"
echo "  Level 1: curl -X POST /webhook/multipost -d '{\"caption\":\"Hola mundo\"}'"
echo "  Level 2: curl -X POST /webhook/generate-campaign -d '{\"product\":\"Tacos\",\"industry\":\"restaurante\"}'"
echo "  Level 3: INSERT INTO repurpose_sources (...) — then wait 6 hours"
echo ""
echo "=========================================="
