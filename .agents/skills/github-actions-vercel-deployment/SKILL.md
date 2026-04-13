---
name: github-actions-vercel-deployment
description: >
  CI/CD con GitHub Actions + Vercel deployments.
  TRIGGER: al configurar workflows, automatizar deploys, manejar secretos,
  configurar quality gates, branch protection, o revisiones automáticas de PRs.
version: "1.1.0"
metadata:
  author: pro-trinity
  emoji: "🚀"
  language: es
  always: false
  primaryEnv: VERCEL_TOKEN
  requires:
    env: ["VERCEL_TOKEN"]
    bins: ["gh"]
  invocation:
    userInvocable: true
    disableModelInvocation: true
  tags: ["ci-cd", "github-actions", "vercel", "deployment", "devops"]
---

# GitHub Actions & Vercel Deployment Pipeline

Protocolo para que Antigravity configure y mantenga pipelines de CI/CD
profesionales para Pro-Trinity.

## Cuándo Aplicar

Referencia estas directrices cuando:

- Configures o modifiques workflows de GitHub Actions
- Automatices despliegues a Vercel (Preview / Production)
- Manejes secretos y variables de entorno
- Implementes gates de calidad (tests, lint, type-check)
- Configures notificaciones de deploy

## Reglas por Prioridad

| Prioridad | Categoría             | Impacto | Prefijo   |
| --------- | --------------------- | ------- | --------- |
| 1         | Seguridad de Secretos | CRÍTICO | `sec-`    |
| 2         | Pipeline de Deploy    | ALTO    | `deploy-` |
| 3         | Quality Gates         | ALTO    | `gate-`   |
| 4         | Optimización          | MEDIO   | `opt-`    |

## 1. Seguridad de Secretos (CRÍTICO)

### `sec-never-hardcode`

- **Regla:** JAMÁS hardcodear secretos en archivos de workflow.
- **Acción:** Usar GitHub Secrets (`${{ secrets.NOMBRE }}`) para todo:
  - `VERCEL_TOKEN`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `GEMINI_API_KEY`
  - Cualquier token de acceso

### `sec-environment-separation`

- **Regla:** Separar secretos por Environment de GitHub:
  - `production` → variables de producción
  - `preview` → variables de staging/desarrollo
- **Acción:** Configurar Environments con protection rules:
  - Production: requiere aprobación manual
  - Preview: deploy automático

### `sec-minimal-permissions`

- **Regla:** Workflows deben usar permisos mínimos:

```yaml
permissions:
    contents: read
    deployments: write
    pull-requests: write
```

## 2. Pipeline de Deploy (ALTO)

### `deploy-workflow-structure`

- **Patrón recomendado para el workflow principal:**

```yaml
name: Deploy Pro-Trinity

on:
    push:
        branches: [main]
    pull_request:
        branches: [main]

jobs:
    quality:
        name: Quality Gates
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4
            - uses: actions/setup-node@v4
              with:
                  node-version: "20"
                  cache: "npm"
            - run: npm ci
            - run: npm run lint
            - run: npm run type-check
            - run: npm run test

    deploy-preview:
        name: Deploy Preview
        needs: quality
        if: github.event_name == 'pull_request'
        runs-on: ubuntu-latest
        environment: preview
        steps:
            - uses: actions/checkout@v4
            - uses: amondnet/vercel-action@v25
              with:
                  vercel-token: ${{ secrets.VERCEL_TOKEN }}
                  vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
                  vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

    deploy-production:
        name: Deploy Production
        needs: quality
        if: github.ref == 'refs/heads/main' && github.event_name == 'push'
        runs-on: ubuntu-latest
        environment: production
        steps:
            - uses: actions/checkout@v4
            - uses: amondnet/vercel-action@v25
              with:
                  vercel-token: ${{ secrets.VERCEL_TOKEN }}
                  vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
                  vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
                  vercel-args: "--prod"
```

### `deploy-pr-comments`

- **Regla:** Los deploys de Preview deben comentar automáticamente en el PR con
  la URL de la preview.
- Vercel Action ya incluye esto por defecto.

### `deploy-rollback-strategy`

- **Regla:** Documentar cómo hacer rollback:
  1. Redeploy del commit anterior vía Vercel Dashboard
  2. O bien: `vercel rollback` desde CLI
  3. Para DB: mantener migraciones reversibles

## 3. Quality Gates (ALTO)

### `gate-required-checks`

- **Regla:** Los siguientes checks DEBEN pasar antes de merge a `main`:
  1. `npm run lint` — Sin errores de ESLint
  2. `npm run type-check` — Sin errores de TypeScript
  3. `npm run test` — Tests pasando
  4. Build exitoso

### `gate-branch-protection`

- **Regla:** Configurar Branch Protection en GitHub:
  - Require status checks before merging
  - Require branches to be up to date
  - Require at least 1 approval (en equipos)

### `gate-bundle-analysis`

- **Patrón opcional:** Reportar tamaño del bundle en PRs:

```yaml
- name: Analyze Bundle
  run: npx @next/bundle-analyzer
```

## 4. Optimización (MEDIO)

### `opt-caching`

- **Regla:** Cachear dependencias para reducir tiempos de CI:

```yaml
- uses: actions/setup-node@v4
  with:
      node-version: "20"
      cache: "npm"
```

### `opt-conditional-runs`

- **Regla:** No ejecutar jobs innecesarios:

```yaml
# Solo correr tests E2E si cambió código relevante
- uses: dorny/paths-filter@v3
  id: filter
  with:
      filters: |
          app:
            - 'src/**'
            - 'app/**'
          docs:
            - 'docs/**'
```

### `opt-parallel-jobs`

- **Regla:** Ejecutar jobs independientes en paralelo:
  - Lint + Type-check → en paralelo
  - Tests unitarios + Tests E2E → en paralelo
  - Deploy → después de que todo pase
