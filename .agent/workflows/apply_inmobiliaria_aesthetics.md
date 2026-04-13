---
description: Apply the Inmobiliaria visual aesthetics (glassmorphism, animations, dark theme) to a project
---

# Inmobiliaria Aesthetics Setup Workflow

This workflow sets up the premium, dark-themed, glassmorphic visual aesthetics
originally designed for the Inmobiliaria project. This includes configuring
Tailwind CSS and implementing a rich global CSS styling foundation.

## 1. Configure Tailwind CSS

Update `tailwind.config.js` to include the global colors, fonts, and custom
animations. Ensure the `content` array matches your project structure.

```javascript
/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Montserrat", "sans-serif"],
            },
            colors: {
                tb: {
                    blue: "#002F6C",
                    dark: "#050505",
                    light: "#F8FAFC",
                    accent: "#38BDF8",
                },
            },
            animation: {
                "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                "fade-in": "fadeIn 0.3s ease-out",
                "fade-out": "fadeOut 0.3s ease-out",
                "slide-up": "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                "slide-down": "slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                "scale-in": "scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                "toast-in": "toastIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                "toast-out": "toastOut 0.3s ease-in forwards",
                "bounce-subtle":
                    "bounceSubtle 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                fadeOut: {
                    "0%": { opacity: "1" },
                    "100%": { opacity: "0" },
                },
                slideUp: {
                    "0%": { opacity: "0", transform: "translateY(20px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                slideDown: {
                    "0%": { opacity: "0", transform: "translateY(-20px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                scaleIn: {
                    "0%": { opacity: "0", transform: "scale(0.95)" },
                    "100%": { opacity: "1", transform: "scale(1)" },
                },
                toastIn: {
                    "0%": {
                        opacity: "0",
                        transform: "translateY(100%) scale(0.9)",
                    },
                    "100%": {
                        opacity: "1",
                        transform: "translateY(0) scale(1)",
                    },
                },
                toastOut: {
                    "0%": { opacity: "1", transform: "translateY(0) scale(1)" },
                    "100%": {
                        opacity: "0",
                        transform: "translateY(100%) scale(0.9)",
                    },
                },
                bounceSubtle: {
                    "0%": { transform: "scale(1)" },
                    "50%": { transform: "scale(0.95)" },
                    "100%": { transform: "scale(1)" },
                },
            },
        },
    },
    plugins: [],
};
```

## 2. Set Up Global Styling and Utilities

Update `src/index.css` (or your main global stylesheet) with the glassmorphism
foundations, custom scrollbars, typography smoothing, and CSS animations.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

.no-scrollbar::-webkit-scrollbar {
    display: none;
}
.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

body {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #050505; /* Dark theme base */
    color: #f8fafc;
}

/* Glassmorphism Classes */
.glass-panel {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px border-white/10;
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.8);
}

.glass-input {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
}
.glass-input:focus {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    outline: none;
}

/* Skeleton Shimmer Animation */
@keyframes shimmer {
    0% {
        transform: translateX(-100%);
    }
    100% {
        transform: translateX(100%);
    }
}
.skeleton-shimmer {
    animation: shimmer 1.5s ease-in-out infinite;
}

/* Button Micro-interactions */
.btn-press {
    transition:
        transform 0.15s cubic-bezier(0.16, 1, 0.3, 1),
        box-shadow 0.15s ease-out,
        background-color 0.15s ease-out;
}
.btn-press:hover {
    transform: translateY(-1px);
}
.btn-press:active {
    transform: translateY(0) scale(0.98);
}

/* Interactive Card Hover */
.card-hover {
    transition:
        transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
        box-shadow 0.3s ease-out,
        border-color 0.3s ease-out;
}
.card-hover:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.5);
}

/* Glow Effect */
.glow-accent {
    box-shadow: 0 0 20px rgba(56, 189, 248, 0.15);
    transition: box-shadow 0.3s ease-out;
}
.glow-accent:hover {
    box-shadow: 0 0 30px rgba(56, 189, 248, 0.25);
}

/* Gradient Text */
.text-gradient {
    background: linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #f472b6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}
```

## 3. Guiding Principles

- **Vibrant & Dark**: Always use `#050505` (`tb-dark`) as the background.
- **Glassmorphism**: Use `.glass-panel` for containers to make them pop and feel
  premium.
- **Animations**: Prefer micro-animations (e.g., `btn-press`, `card-hover`) for
  user hover states to make the interface alive.
