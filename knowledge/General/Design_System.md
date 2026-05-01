# ATIA Inmobiliaria — Brand Design System

## 1. Identidad de Marca

### Nombre
**ATIA** — Atia Inmobiliaria (anteriormente "Casto Inmobiliaria")

### Tagline
"Tu patrimonio, nuestra prioridad"

### Logotipo
- Archivo fuente: `LOGO ATIA_Mesa de trabajo 1.ai` (Adobe Illustrator)
- Variantes: fondo claro y fondo oscuro
- Uso: siempre mantener proporciones, zona de respeto mínima = alto del logo

### Valores de Marca
- **Profesionalismo** — Imagen premium tipo KW / RE/MAX
- **Velocidad** — Speed to lead < 5 minutos
- **Confianza** — Proceso ante Notario Público, transparencia total
- **Tecnología** — IA conversacional, CRM inteligente, automatización

---

## 2. Paleta de Colores

### Colores Primarios
| Color | Hex | Uso |
|-------|-----|-----|
| 🟠 ATIA Orange | `#F26722` | Color principal de marca, CTAs, acentos |
| 🟠 ATIA Light | `#FF8A47` | Hover states, gradientes |
| 🟠 ATIA Dark | `#C94E0F` | Bordes, texto sobre fondo claro |

### Colores Secundarios
| Color | Hex | Uso |
|-------|-----|-----|
| 🔵 TB Blue | `#002F6C` | Headers, texto corporativo |
| ⚫ TB Dark | `#0F172A` | Fondos oscuros, dark mode |
| ⚪ TB Light | `#FFFFFF` | Fondos claros, tarjetas |
| 🟡 TB Accent | `#F59E0B` | Badges, alertas, destacados |
| 🔵 TB Sky | `#38BDF8` | Links, iconos informativos |

### Modo Claro (Landing Principal)
- Fondo: `#FFFFFF`
- Texto: `#0F172A`
- Acentos: `#F26722`

### Modo Oscuro (CRM / Analytics / Opcional)
- Fondo general: `#0F172A`
- Fondo Overlays/Modals: `#050505`/95 con `backdrop-blur-xl`
- Superficies: `#0a0a0a`/90 con `backdrop-blur-3xl`
- Texto: `#FFFFFF`
- Acentos: `#F26722` / `#F59E0B`
- Glassmorphism UI: `bg-white/5` con border `border-white/10` y shadows pronunciados `shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]`
- Gradientes Premium: `linear-gradient(135deg, #F26722, #d94e0d)`

### Modo Claro Principal (Landing & Sana tu Deuda)
- Fondo general: `#FFFFFF` (o blurs sobre `bg-white/40`)
- Modals/Tarjetas: `bg-white` con `border-slate-100` y `shadow-sm` (hasta `shadow-xl`)
- Esquinas: Ultra-redondeadas (`rounded-[2.5rem]` o `rounded-3xl`)
- Texto Principal: `#0F172A` / `#1E293B`
- Micro-textos: `text-slate-500`
- Controles/Inputs: `bg-white border-slate-200`

---

## 3. Tipografía

### Fuentes Principales
- **Headlines**: Montserrat Bold / Poppins Bold
- **Body Text**: Open Sans / Inter
- **UI/Datos**: Inter (monospace para números)

### Jerarquía
- H1: 48px / Bold / Tracking tight
- H2: 36px / Bold
- H3: 24px / Semibold
- Body: 16px / Regular
- Caption: 14px / Regular / Color muted

---

## 4. Tono de Voz — Adriana IA

### Personalidad
Adriana es la asistente virtual de ATIA. Su tono es:
- **Cálido y profesional** — No robótico, no informal
- **Empático** — Entiende que comprar/vender es una decisión emocional
- **Directo** — Va al punto, ofrece opciones claras (1,2,3)
- **Proactivo** — Siempre cierra con siguiente paso o pregunta

### Reglas de Comunicación
1. Siempre saluda con nombre si lo tiene
2. Usa emojis con moderación (máx 2-3 por mensaje)
3. Mensajes cortos (máx 3 párrafos)
4. Siempre ofrece opciones cuando sea posible
5. Nunca da precios exactos — agenda cita para eso
6. Responde en español mexicano natural
7. Cierra cada interacción con una pregunta o CTA

### Ejemplos de Tono
- ✅ "Hola Carlos 👋 Con gusto te ayudo. ¿Buscas comprar o rentar?"
- ✅ "Perfecto, tengo opciones que te van a encantar 🏡"
- ❌ "Estimado usuario, su solicitud ha sido recibida"
- ❌ "jajaja q onda bro te mando las fotos"

---

## 5. Diseño Visual — Landing Page

### Estilo
- Inspiración: KW (profesionalismo) + RE/MAX (alcance) + Carlos Muñoz (urgencia elegante)
- Minimalista poderoso
- Fotos de propiedades premium
- Ciudad moderna como backdrop

### Componentes Clave
- **Hero Section**: Headline fuerte + CTA naranja + imagen de fondo
- **Social Proof**: Contadores animados (propiedades, clientes, años)
- **Formulario Embudo**: Multi-step con scoring automático
- **WhatsApp Flotante**: Siempre visible, esquina inferior derecha
- **Glassmorphism Cards**: Para servicios y testimonios

### Animaciones
- `fadeIn` — Aparición suave (0.6s)
- `slideUp` — Entrada desde abajo (0.6s)
- `float` — Flotación suave (6s loop)
- `shimmer` — Efecto brillo en CTAs
- `pulse-slow` — Pulsación sutil en WhatsApp button

---

## 6. Stack Técnico

### Frontend
| Tecnología | Uso |
|-----------|-----|
| React + Vite | Landing page y CRM |
| TailwindCSS 4 | Estilos y diseño responsive |
| GSAP / Motion | Animaciones de scroll |
| Vercel | Hosting y deploys automáticos |

### Backend
| Tecnología | Uso |
|-----------|-----|
| Supabase | Base de datos, auth, edge functions |
| PostgreSQL + pgvector | Datos + embeddings 3072d |
| Edge Functions (Deno) | API, webhooks, lógica de negocio |
| Gemini 2.5 Flash | IA conversacional (Adriana) |

### Integraciones
| Servicio | Uso |
|---------|-----|
| Evolution API (Baileys) | WhatsApp Business |
| Zadarma | Llamadas VoIP automáticas |
| GitHub Webhooks | Sync de knowledge base |
| Google Calendar (pendiente) | Agendamiento de citas |

### Repositorios
- **Principal**: `github.com/creastilloaixp/atia`
- **Landing deploy**: Vercel (auto-deploy desde `main`)

---

## 7. Estructura del Proyecto

```
CastoProject/
├── src/              ← React components (landing + CRM)
├── crm/              ← CRM standalone
├── supabase/
│   ├── functions/    ← Edge Functions (Adriana, leads, copilot)
│   └── migrations/   ← Database schema
├── knowledge/        ← Base de conocimiento (Obsidian → Supabase)
│   ├── Ventas/
│   ├── Rentas/
│   ├── Inversiones/
│   ├── Valuacion/
│   └── General/
├── public/           ← Assets estáticos
└── api/              ← Vercel API routes
```

---

## 8. Métricas Clave (KPIs)

| Métrica | Objetivo |
|---------|----------|
| Speed to Lead | < 5 minutos |
| Tasa de respuesta WhatsApp | > 80% |
| Citas agendadas / lead | > 30% |
| Costo por cita | Tracking por ciudad |
| NPS del cliente | > 8.5 |
