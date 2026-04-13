#!/bin/bash
# ============================================================================
# export-toolkit.sh — Exporta el toolkit completo de CastoProject
# ============================================================================
# Uso:
#   bash scripts/export-toolkit.sh [destino]
#
# Ejemplo:
#   bash scripts/export-toolkit.sh ~/NuevoProyecto
#   bash scripts/export-toolkit.sh /c/Users/carlo/OneDrive/Escritorio/OtroProyecto
#
# Que exporta:
#   - 23 agent skills (.agents/)
#   - 4 formal skills (.claude/skills/)
#   - Permisos y config (.claude/settings.local.json)
#   - Safety protocols (.agents/maintainers.md)
#   - Scripts custom (browser.cjs, deploy, setup)
#   - n8n workflows
#   - SQL migrations
#   - Config files (tsconfig, vite, tailwind, eslint, postcss)
#   - .env.example (sin keys reales)
#   - Bootstrap script para el nuevo proyecto
# ============================================================================

set -euo pipefail

# --- Colores ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# --- Validar argumento ---
if [ -z "${1:-}" ]; then
  echo -e "${RED}Error: Especifica el directorio destino${NC}"
  echo "Uso: bash scripts/export-toolkit.sh /ruta/al/nuevo/proyecto"
  exit 1
fi

DEST="$1"
SRC="$(cd "$(dirname "$0")/.." && pwd)"

echo -e "${CYAN}============================================${NC}"
echo -e "${CYAN}  CastoProject Toolkit Export${NC}"
echo -e "${CYAN}============================================${NC}"
echo -e "Origen:  ${GREEN}$SRC${NC}"
echo -e "Destino: ${GREEN}$DEST${NC}"
echo ""

# --- Crear directorio destino si no existe ---
mkdir -p "$DEST"

# ============================================================================
# 1. AGENT SKILLS (23 skills)
# ============================================================================
echo -e "${YELLOW}[1/10] Exportando Agent Skills (.agents/)...${NC}"
mkdir -p "$DEST/.agents/skills"
cp -r "$SRC/.agents/skills/"* "$DEST/.agents/skills/" 2>/dev/null || true
cp "$SRC/.agents/maintainers.md" "$DEST/.agents/" 2>/dev/null || true
AGENT_SKILLS=$(ls -d "$DEST/.agents/skills/"*/ 2>/dev/null | wc -l)
echo -e "        ${GREEN}$AGENT_SKILLS agent skills copiadas${NC}"

# ============================================================================
# 2. FORMAL SKILLS (.claude/skills/)
# ============================================================================
echo -e "${YELLOW}[2/10] Exportando Formal Skills (.claude/skills/)...${NC}"
mkdir -p "$DEST/.claude/skills"
cp -r "$SRC/.claude/skills/"* "$DEST/.claude/skills/" 2>/dev/null || true
FORMAL_SKILLS=$(ls -d "$DEST/.claude/skills/"*/ 2>/dev/null | wc -l)
echo -e "        ${GREEN}$FORMAL_SKILLS formal skills copiadas${NC}"

# ============================================================================
# 3. CLAUDE CODE CONFIG
# ============================================================================
echo -e "${YELLOW}[3/10] Exportando Claude Code config...${NC}"
cp "$SRC/.claude/settings.local.json" "$DEST/.claude/" 2>/dev/null || true
echo -e "        ${GREEN}settings.local.json copiado${NC}"

# ============================================================================
# 4. AGENT DIRECTORY (.agent/ — workflows, browser-controller)
# ============================================================================
echo -e "${YELLOW}[4/10] Exportando Agent directory (.agent/)...${NC}"
mkdir -p "$DEST/.agent/browser-controller"
mkdir -p "$DEST/.agent/skills"
mkdir -p "$DEST/.agent/workflows"
cp "$SRC/.agent/browser-controller/SKILL.md" "$DEST/.agent/browser-controller/" 2>/dev/null || true
cp -r "$SRC/.agent/skills/"* "$DEST/.agent/skills/" 2>/dev/null || true
cp -r "$SRC/.agent/workflows/"* "$DEST/.agent/workflows/" 2>/dev/null || true
# NOTA: yt-dlp.exe NO se copia (18MB binary, se descarga con bootstrap)
echo -e "        ${GREEN}.agent/ copiado (sin binarios)${NC}"

# ============================================================================
# 5. SCRIPTS CUSTOM
# ============================================================================
echo -e "${YELLOW}[5/10] Exportando scripts custom...${NC}"
mkdir -p "$DEST/scripts"
cp "$SRC/scripts/browser.cjs" "$DEST/scripts/" 2>/dev/null || true
cp "$SRC/scripts/deploy-n8n-workflows.sh" "$DEST/scripts/" 2>/dev/null || true
cp "$SRC/scripts/setup-marketing-automation.sh" "$DEST/scripts/" 2>/dev/null || true
echo -e "        ${GREEN}3 scripts copiados${NC}"

# ============================================================================
# 6. n8n WORKFLOWS
# ============================================================================
echo -e "${YELLOW}[6/10] Exportando n8n workflows...${NC}"
mkdir -p "$DEST/n8n-workflows"
cp "$SRC"/n8n-workflows/*.json "$DEST/n8n-workflows/" 2>/dev/null || true
# Workflows raiz (WhatsApp/EvolutionAPI)
cp "$SRC"/n8n-Workflow-*.json "$DEST/" 2>/dev/null || true
N8N_WF=$(ls "$DEST/n8n-workflows/"*.json 2>/dev/null | wc -l)
echo -e "        ${GREEN}$N8N_WF workflows copiados${NC}"

# ============================================================================
# 7. SQL MIGRATIONS
# ============================================================================
echo -e "${YELLOW}[7/10] Exportando SQL migrations...${NC}"
mkdir -p "$DEST/sql"
cp "$SRC"/sql/*.sql "$DEST/sql/" 2>/dev/null || true
SQL_FILES=$(ls "$DEST/sql/"*.sql 2>/dev/null | wc -l)
echo -e "        ${GREEN}$SQL_FILES migrations copiadas${NC}"

# ============================================================================
# 8. CONFIG FILES
# ============================================================================
echo -e "${YELLOW}[8/10] Exportando config files...${NC}"
for f in package.json tsconfig.json tsconfig.app.json tsconfig.node.json \
         vite.config.ts tailwind.config.js postcss.config.js eslint.config.js \
         .gitignore index.html; do
  if [ -f "$SRC/$f" ]; then
    cp "$SRC/$f" "$DEST/"
  fi
done
echo -e "        ${GREEN}Config files copiados${NC}"

# ============================================================================
# 9. .ENV EXAMPLE (sin keys reales)
# ============================================================================
echo -e "${YELLOW}[9/10] Exportando .env.example...${NC}"
cp "$SRC/.env.example" "$DEST/" 2>/dev/null || true
echo -e "        ${GREEN}.env.example copiado (sin keys reales)${NC}"

# ============================================================================
# 10. DOCUMENTACION
# ============================================================================
echo -e "${YELLOW}[10/10] Exportando documentacion...${NC}"
cp "$SRC/project_skills_overview.md" "$DEST/" 2>/dev/null || true
cp "$SRC/CAPACIDADES_COMPLETAS.txt" "$DEST/" 2>/dev/null || true
echo -e "        ${GREEN}Documentacion copiada${NC}"

# ============================================================================
# CREAR BOOTSTRAP SCRIPT EN DESTINO
# ============================================================================
cat > "$DEST/scripts/bootstrap.sh" << 'BOOTSTRAP_EOF'
#!/bin/bash
# ============================================================================
# bootstrap.sh — Inicializa un nuevo proyecto con el toolkit CastoProject
# ============================================================================
# Uso: bash scripts/bootstrap.sh
# ============================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}============================================${NC}"
echo -e "${CYAN}  CastoProject Toolkit Bootstrap${NC}"
echo -e "${CYAN}============================================${NC}"
echo ""

# --- 1. Verificar .env ---
if [ ! -f .env ]; then
  echo -e "${YELLOW}[1/6] Creando .env desde .env.example...${NC}"
  cp .env.example .env
  echo -e "       ${RED}IMPORTANTE: Edita .env con tus API keys reales${NC}"
else
  echo -e "${GREEN}[1/6] .env ya existe${NC}"
fi

# --- 2. Instalar dependencias ---
echo -e "${YELLOW}[2/6] Instalando dependencias npm...${NC}"
npm install

# --- 3. Verificar Chrome CDP ---
echo -e "${YELLOW}[3/6] Verificando Chrome CDP...${NC}"
if curl -s http://localhost:9222/json > /dev/null 2>&1; then
  echo -e "       ${GREEN}Chrome CDP activo en puerto 9222${NC}"
else
  echo -e "       ${YELLOW}Chrome CDP no detectado. Para activar:${NC}"
  echo -e "       ${CYAN}start chrome --remote-debugging-port=9222${NC}"
fi

# --- 4. Descargar yt-dlp (opcional) ---
echo -e "${YELLOW}[4/6] Verificando yt-dlp...${NC}"
if [ ! -f .agent/yt-dlp.exe ] && [ ! -f .agent/yt-dlp ]; then
  echo -e "       Descargando yt-dlp..."
  mkdir -p .agent
  if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    curl -L -o .agent/yt-dlp.exe https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe 2>/dev/null || echo "       (Descarga manual: https://github.com/yt-dlp/yt-dlp/releases)"
  else
    curl -L -o .agent/yt-dlp https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp 2>/dev/null && chmod +x .agent/yt-dlp || echo "       (Descarga manual: https://github.com/yt-dlp/yt-dlp/releases)"
  fi
else
  echo -e "       ${GREEN}yt-dlp ya existe${NC}"
fi

# --- 5. Verificar Supabase ---
echo -e "${YELLOW}[5/6] Verificando conexion Supabase...${NC}"
if grep -q "your_supabase" .env 2>/dev/null; then
  echo -e "       ${RED}Supabase no configurado — edita .env${NC}"
else
  echo -e "       ${GREEN}Supabase configurado en .env${NC}"
  echo -e "       ${YELLOW}Recuerda ejecutar las SQL migrations en sql/${NC}"
fi

# --- 6. Verificar n8n ---
echo -e "${YELLOW}[6/6] Verificando n8n...${NC}"
if grep -q "your-n8n" .env 2>/dev/null; then
  echo -e "       ${RED}n8n no configurado — edita .env${NC}"
else
  echo -e "       ${GREEN}n8n configurado en .env${NC}"
  echo -e "       ${YELLOW}Importa workflows desde n8n-workflows/ en tu instancia n8n${NC}"
fi

echo ""
echo -e "${CYAN}============================================${NC}"
echo -e "${GREEN}  Bootstrap completado${NC}"
echo -e "${CYAN}============================================${NC}"
echo ""
echo -e "Siguiente paso: ${YELLOW}edita .env con tus API keys${NC}"
echo -e "Luego: ${YELLOW}npm run dev${NC}"
echo ""
echo -e "${CYAN}Skills disponibles:${NC}"
echo -e "  - 23 agent skills en .agents/skills/"
echo -e "  - 4 formal skills en .claude/skills/"
echo -e "  - browser.cjs en scripts/"
echo -e "  - Ver: project_skills_overview.md"
echo -e "  - Ver: CAPACIDADES_COMPLETAS.txt"
BOOTSTRAP_EOF

chmod +x "$DEST/scripts/bootstrap.sh" 2>/dev/null || true

# ============================================================================
# RESUMEN
# ============================================================================
echo ""
echo -e "${CYAN}============================================${NC}"
echo -e "${GREEN}  Export completado${NC}"
echo -e "${CYAN}============================================${NC}"
echo ""

# Calcular tamano
EXPORT_SIZE=$(du -sh "$DEST" 2>/dev/null | cut -f1)
echo -e "Tamano total: ${GREEN}${EXPORT_SIZE}${NC}"
echo ""
echo -e "Exportado:"
echo -e "  ${GREEN}✓${NC} $AGENT_SKILLS agent skills (.agents/skills/)"
echo -e "  ${GREEN}✓${NC} $FORMAL_SKILLS formal skills (.claude/skills/)"
echo -e "  ${GREEN}✓${NC} Claude Code config (.claude/settings.local.json)"
echo -e "  ${GREEN}✓${NC} Safety protocols (.agents/maintainers.md)"
echo -e "  ${GREEN}✓${NC} 3 scripts custom (browser.cjs, deploy, setup)"
echo -e "  ${GREEN}✓${NC} $N8N_WF n8n workflows"
echo -e "  ${GREEN}✓${NC} $SQL_FILES SQL migrations"
echo -e "  ${GREEN}✓${NC} Config files (package.json, tsconfig, vite, tailwind, eslint)"
echo -e "  ${GREEN}✓${NC} .env.example (sin keys reales)"
echo -e "  ${GREEN}✓${NC} Documentacion (skills overview, capacidades)"
echo ""
echo -e "NO exportado (por seguridad/tamano):"
echo -e "  ${RED}✗${NC} .env (contiene API keys reales)"
echo -e "  ${RED}✗${NC} node_modules/ (se reinstalan con npm install)"
echo -e "  ${RED}✗${NC} .vercel/ (IDs de proyecto unicos)"
echo -e "  ${RED}✗${NC} yt-dlp.exe (18MB, se descarga con bootstrap)"
echo -e "  ${RED}✗${NC} dist/ (se regenera con npm run build)"
echo -e "  ${RED}✗${NC} Memory files (especificos del proyecto original)"
echo ""
echo -e "${YELLOW}Para iniciar en el nuevo proyecto:${NC}"
echo -e "  cd $DEST"
echo -e "  cp .env.example .env"
echo -e "  # Edita .env con tus API keys"
echo -e "  bash scripts/bootstrap.sh"
echo ""
