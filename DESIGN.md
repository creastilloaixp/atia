# ATIA Inmobiliaria — Agent-Friendly Design System

This `DESIGN.md` file serves as the primary design truth for ATIA Inmobiliaria, formatted as an agent-friendly markdown system (compatible with Stitch and Antigravity design agents) to guide AI-native "vibe design" generation, UI iteration, and component extraction.

## 1. Vibe & Core Identity
* **Brand Name:** ATIA (Atia Inmobiliaria, formerly "Casto Inmobiliaria")
* **Tagline:** "Tu patrimonio, nuestra prioridad"
* **Vibe:** Premium, trustworthy, aggressive yet elegant (Keller Williams meets Carlos Muñoz). The UI must feel incredibly fast (Speed to Lead < 5 min), clean, and optimized for high-conversion real estate flipping and captation. 
* **Aesthetic Keywords:** Glassmorphism, Deep Contrast, High-Fidelity, Sleek, Corporate, Modern, Dynamic Animations.

## 2. Design Tokens

### Color Palette
Use these precise Hex values for all styling:

*   **Primary Brand:**
    *   `--color-atia` (Primary/CTAs): `#F26722`
    *   `--color-atia-light` (Hover/Gradients): `#FF8A47`
    *   `--color-atia-dark` (Borders/Text on light): `#C94E0F`
*   **Secondary & Backgrounds:**
    *   `--color-tb-blue` (Headers): `#002F6C`
    *   `--color-tb-dark` (Dark Mode Backgrounds): `#0F172A`
    *   `--color-tb-light` (Light Mode Backgrounds): `#FFFFFF`
    *   `--color-tb-accent` (Alerts/Badges): `#F59E0B`
    *   `--color-tb-sky` (Links/Icons): `#38BDF8`

### Typography
*   **Headings:** Montserrat (Bold) or Poppins (Bold) - used for authority.
    *   H1: 48px, Tight tracking.
    *   H2: 36px.
*   **Body & UI:** Open Sans or Inter.
    *   Body: 16px, Regular.
    *   Data/Numbers: Inter (Monospace styling where appropriate).

## 3. UI Patterns & Components

### The "Glassmorphism" Treatment
*   Used heavily in the CRM Dashboard and dark mode elements.
*   **Implementation:** `background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.1);`

### Buttons & CTAs
*   **Primary CTA:** Solid background (`--color-atia`), rounded corners (e.g., `rounded-lg` or `rounded-full`), bold text. Must include a subtle hover effect (scale up 1.05 or background shift to `--color-atia-light`).
*   **WhatsApp Floating Button:** Always present on landing pages, bottom-right. Must use a slow pulse animation (`animate-pulse-slow`).

### Landing Page Structure (The Funnel)
*   **Hero:** Full-bleed dark image or cinematic video background. High contrast white text. Single, high-contrast primary CTA.
*   **Forms:** Multi-step "Funnel" layout. One question at a time. Big, tappable option cards instead of small radio buttons. 

## 4. Animations & Micro-Interactions
The UI must feel alive but professional. Rely on CSS/Tailwind keyframes:
*   `fadeIn` (0.6s ease) — For page loads.
*   `slideUp` (0.6s ease) — For form steps appearing.
*   `float` (6s infinite) — For decorative elements or floating badges.
*   `shimmer` — Continuous highlight sweep over Primary CTAs to draw the eye.

## 5. Adriana AI - Tone of Voice
When designing conversational interfaces (chatbots, AI copilots):
*   **Role:** ATIA's virtual assistant.
*   **Tone:** Warm, professional, direct, empathetic. 
*   **Format:** Short messages, 1-3 paragraphs max. Bulleted or numbered lists for choices.
*   **Emojis:** 2-3 maximum per message to maintain corporate elegance.

## 6. Development Stack
*   **Frontend:** React (Vite), Tailwind CSS v4, GSAP (Scroll-driven animations).
*   **Backend:** Supabase (Postgres, Edge Functions).
*   **AI Models:** Gemini 2.5 Flash for conversational intelligence and UI generation context.

*Agent Instruction:* When applying this design system, prioritize the *vibe* of urgency and premium real estate trust. Do not deviate from the ATIA Orange (`#F26722`) for primary actions. Use Dark Mode (`#0F172A`) for all internal tools and CRM interfaces to reduce eye strain and maintain a modern aesthetic.
