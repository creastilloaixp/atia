#!/bin/bash
# =============================================================================
# creastilo AI XPERIENCE — Deploy n8n Workflows
# =============================================================================
# Usage: bash scripts/deploy-n8n-workflows.sh
# Requires: N8N_BASE_URL and N8N_API_KEY environment variables
# =============================================================================

set -e

# Config
N8N_BASE_URL="${N8N_BASE_URL:-https://n8n.creastilo.com}"
N8N_API_KEY="${N8N_API_KEY:-$(grep VITE_N8N_API_KEY .env | cut -d= -f2)}"
WORKFLOWS_DIR="n8n-workflows"

if [ -z "$N8N_API_KEY" ]; then
  echo "ERROR: N8N_API_KEY not set. Set it in .env or export it."
  exit 1
fi

echo "=== Deploying n8n Workflows ==="
echo "Target: $N8N_BASE_URL"
echo ""

# Deploy each workflow
for workflow_file in "$WORKFLOWS_DIR"/*.json; do
  workflow_name=$(basename "$workflow_file" .json)
  echo "Deploying: $workflow_name..."

  response=$(curl -s -w "\n%{http_code}" \
    -X POST "$N8N_BASE_URL/api/v1/workflows" \
    -H "X-N8N-API-KEY: $N8N_API_KEY" \
    -H "Content-Type: application/json" \
    -d @"$workflow_file")

  http_code=$(echo "$response" | tail -1)
  body=$(echo "$response" | head -n -1)

  if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
    workflow_id=$(echo "$body" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "  OK: Created workflow $workflow_name (ID: $workflow_id)"
  else
    echo "  WARN: $workflow_name returned HTTP $http_code"
    echo "  Response: $body"
    echo "  (Workflow may already exist — try importing manually via n8n UI)"
  fi

  echo ""
done

echo "=== Deployment Complete ==="
echo ""
echo "Next steps:"
echo "1. Open n8n UI and verify all 4 workflows were imported"
echo "2. Configure credentials in each workflow:"
echo "   - Postgres/Supabase connection"
echo "   - Set GEMINI_API_KEY in n8n environment variables"
echo "   - Set BLOTATO_API_KEY in n8n environment variables"
echo "3. Activate workflows that use webhooks (multipost, campaign-generator)"
echo "4. Activate scheduled workflows (repurpose-engine, queue-poster)"
echo "5. Test: POST to /webhook/multipost with a test caption"
