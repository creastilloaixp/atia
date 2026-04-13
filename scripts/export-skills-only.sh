#!/bin/bash
# ============================================================================
# export-skills-only.sh — Exporta SOLO las skills y config de Claude Code
# ============================================================================
# Uso para proyecto EXISTENTE que ya tiene su propio stack:
#   bash scripts/export-skills-only.sh ~/MiOtroProyecto
#
# Que exporta:
#   - 23 agent skills (.agents/skills/)
#   - 4 formal skills (.claude/skills/)
#   - Safety protocols (.agents/maintainers.md)
#   - Claude Code permissions template
#   - browser.cjs (herramienta de scraping)
#   - Documentacion de skills
#
# Que NO exporta:
#   - package.json, configs, SQL, n8n workflows, etc.
#   - Nada que interfiera con el stack existente del proyecto destino
# ============================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

if [ -z "${1:-}" ]; then
  echo -e "${RED}Error: Especifica el directorio destino${NC}"
  echo "Uso: bash scripts/export-skills-only.sh /ruta/al/proyecto"
  exit 1
fi

DEST="$1"
SRC="$(cd "$(dirname "$0")/.." && pwd)"

echo -e "${CYAN}============================================${NC}"
echo -e "${CYAN}  Skills-Only Export${NC}"
echo -e "${CYAN}============================================${NC}"
echo ""

# --- Agent Skills ---
echo -e "${YELLOW}[1/6] Agent Skills (.agents/skills/)...${NC}"
mkdir -p "$DEST/.agents/skills"
cp -r "$SRC/.agents/skills/"* "$DEST/.agents/skills/"
cp "$SRC/.agents/maintainers.md" "$DEST/.agents/"
COUNT=$(ls -d "$DEST/.agents/skills/"*/ 2>/dev/null | wc -l)
echo -e "       ${GREEN}$COUNT skills${NC}"

# --- Formal Skills ---
echo -e "${YELLOW}[2/6] Formal Skills (.claude/skills/)...${NC}"
mkdir -p "$DEST/.claude/skills"
cp -r "$SRC/.claude/skills/"* "$DEST/.claude/skills/"
echo -e "       ${GREEN}4 skills${NC}"

# --- Agent extras ---
echo -e "${YELLOW}[3/6] Agent extras (.agent/)...${NC}"
mkdir -p "$DEST/.agent/browser-controller"
mkdir -p "$DEST/.agent/skills"
mkdir -p "$DEST/.agent/workflows"
cp "$SRC/.agent/browser-controller/SKILL.md" "$DEST/.agent/browser-controller/" 2>/dev/null || true
cp -r "$SRC/.agent/skills/"* "$DEST/.agent/skills/" 2>/dev/null || true
cp -r "$SRC/.agent/workflows/"* "$DEST/.agent/workflows/" 2>/dev/null || true
echo -e "       ${GREEN}Copiado${NC}"

# --- Browser script ---
echo -e "${YELLOW}[4/6] browser.cjs...${NC}"
mkdir -p "$DEST/scripts"
cp "$SRC/scripts/browser.cjs" "$DEST/scripts/"
echo -e "       ${GREEN}Copiado${NC}"

# --- Settings template ---
echo -e "${YELLOW}[5/6] Settings template...${NC}"
if [ -f "$DEST/.claude/settings.local.json" ]; then
  echo -e "       ${YELLOW}settings.local.json ya existe — NO se sobreescribe${NC}"
  echo -e "       Copia de referencia en: .claude/settings.local.json.template"
  cp "$SRC/.claude/settings.local.json" "$DEST/.claude/settings.local.json.template"
else
  cp "$SRC/.claude/settings.local.json" "$DEST/.claude/"
  echo -e "       ${GREEN}Copiado${NC}"
fi

# --- Docs ---
echo -e "${YELLOW}[6/6] Documentacion...${NC}"
cp "$SRC/project_skills_overview.md" "$DEST/" 2>/dev/null || true
cp "$SRC/CAPACIDADES_COMPLETAS.txt" "$DEST/" 2>/dev/null || true
echo -e "       ${GREEN}Copiado${NC}"

echo ""
echo -e "${GREEN}Skills exportadas exitosamente a:${NC} $DEST"
echo -e "${YELLOW}El stack del proyecto destino no fue modificado.${NC}"
echo ""
