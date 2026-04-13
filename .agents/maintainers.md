# Pro-Trinity — Agent Maintainers & Safety Protocol

## Multi-Agent Safety Rules

These rules apply to ALL agents (Claude, Gemini, or any LLM) operating on this
codebase. Violations compromise concurrent work safety.

### Git Safety (CRITICAL)

1. **NEVER** create, apply, or drop `git stash`
2. **NEVER** create, remove, or modify `git worktree` unless explicitly requested
3. **NEVER** switch branches unless the user explicitly asks
4. **NEVER** use `git reset --hard`, `git clean -f`, or `git checkout .` without
   confirmation
5. **Scope commits** to your own changes only — do not stage unrelated files
6. When you see unrecognized files or uncommitted changes, **leave them alone**
   and continue your task
7. **NEVER** force-push to `main`
8. **NEVER** skip hooks (`--no-verify`) unless explicitly told to

### Skill Invocation Policy

| Skill Type | User Invocable | Model Auto-Trigger | Notes |
|------------|---------------|-------------------|-------|
| Security audit (`owasp-*`, `mcp6-*`) | Yes | Yes | Always available |
| Code patterns (`react-*`, `zustand-*`) | Yes | Yes | Trigger on matching code |
| Domain skills (`tactical-bi-*`, `video-*`) | Yes | No | Only on explicit request |
| Infrastructure (`github-actions-*`, `csp-*`) | Yes | No | Only on explicit request |
| Design review (`web-design-*`, `a11y-*`) | Yes | Yes | Trigger on UI code review |

### File Ownership

| Path | Owner | Notes |
|------|-------|-------|
| `supabase/migrations/` | DBA / Security | Require careful review |
| `services/authService.ts` | Security | Auth flow changes need audit |
| `hooks/useTrinity.ts` | AI Core | Gemini integration — critical |
| `contexts/` | Architecture | State management — wide impact |
| `.agents/skills/` | Platform | Skill definitions |
| `.github/workflows/` | DevOps | CI/CD pipeline |

### AI Contribution Standards

1. AI-generated changes are first-class contributions
2. Disclose AI assistance in commit messages with
   `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>` or equivalent
3. State testing level in PR descriptions (unit, integration, manual)
4. Include the prompts or reasoning that led to architectural decisions

### Concurrency Protocol

When multiple agents operate simultaneously:

1. **Check `git status` before staging** — only stage files you modified
2. **Never assume you're the only agent** — another may have written files
3. **Use atomic operations** — read, modify, write in quick succession
4. **Avoid long-held locks** — don't leave files in a half-written state

### Code Standards

| Rule | Standard |
|------|----------|
| Max file size | ~500-700 LOC (split if larger) |
| Language | TypeScript strict, no `any` |
| Formatting | Prettier (project config) |
| Imports | Absolute paths from `@/` when configured |
| Comments | Only for non-obvious logic |
| Product name | "Pro-Trinity" (display), "pro-trinity" (paths/config) |
| Skill names | lowercase-with-hyphens, max 64 chars |

### Sensitive Data Policy

1. **NEVER** commit real API keys, passwords, or tokens
2. **NEVER** commit real phone numbers, RFC numbers, or personal data
3. Use obviously fake placeholders in docs/tests/examples
4. `.env` files must be in `.gitignore`
5. Supabase `service_role` key must NEVER appear in client code

## Skill Format Standard (v2)

All skills under `.agents/skills/` must follow this enhanced format:

```yaml
---
name: skill-name                    # Required: lowercase-with-hyphens, max 64
description: "What + When trigger"  # Required: triggers LLM activation
version: "1.0.0"                    # Required: semver
metadata:
  author: pro-trinity               # Required: author
  emoji: "icon"                     # Optional: display icon
  language: es | en                 # Optional: primary language
  always: false                     # Optional: always in prompt
  primaryEnv: "ENV_VAR"             # Optional: main env var
  requires:                         # Optional: runtime requirements
    env: ["SUPABASE_URL"]
    bins: ["gh"]
    config: ["services.cfdi"]
  invocation:                       # Optional: invocation control
    userInvocable: true
    disableModelInvocation: false
  tags: ["security", "react"]       # Optional: discovery tags
---
```

### Required Sections in SKILL.md Body

1. **When to Use** — Clear triggers for activation
2. **When NOT to Use** — Prevent false activations
3. **Rules/Instructions** — The actual skill content
4. **References** — Links to relevant project files
