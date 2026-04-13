import { motion } from 'framer-motion';
import { Home, HelpCircle, Layers, MessageSquare, Phone } from 'lucide-react';
import { useState } from 'react';

type Audience = 'seller' | 'admin';

interface Props {
  audience: Audience;
}

const sellerItems = [
  { icon: Home, label: 'Inicio', action: 'top' },
  { icon: HelpCircle, label: 'Mi Situación', action: 'diagnostic' },
  { icon: Layers, label: 'Propiedades', action: 'properties' },
  { icon: MessageSquare, label: 'Análisis IA', action: 'form' },
  { icon: Phone, label: 'Llamar Asesor', action: 'call' },
];

export function AnimatedDock({ audience }: Props) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (audience === 'admin') return null;

  const items = sellerItems;

  return (
    <nav className="fixed bottom-3 md:bottom-6 left-1/2 -translate-x-1/2 z-50" aria-label="Menú rápido">
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2, type: 'spring', stiffness: 180, damping: 20 }}
        className="bg-[#050505]/90 backdrop-blur-xl flex items-center justify-center gap-3 px-5 py-3 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10"
      >
        {items.map((item, index) => {
          const Icon = item.icon;
          const isHovered = hoveredIndex === index;

          return (
            <motion.button
              key={`seller-${index}`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="relative cursor-pointer group flex items-center justify-center w-11 h-11 rounded-full hover:bg-white/10 transition-colors"
              animate={{
                scale: isHovered ? 1.3 : hoveredIndex !== null && Math.abs(hoveredIndex - index) === 1 ? 1.1 : 1,
                y: isHovered ? -8 : 0
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              aria-label={item.label}
              onClick={() => {
                // Logic to scroll or open components
                if (item.action === 'top') window.scrollTo({ top: 0, behavior: 'smooth' });
                if (item.action === 'call') document.getElementById('zadarma-trigger')?.click();
              }}
            >
              <Icon size={18} className={isHovered ? "text-tb-accent" : "text-white"} />

              {/* Tooltip */}
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute -top-10 px-3 py-1.5 bg-tb-dark border border-white/10 rounded-lg text-[10px] font-bold text-white shadow-xl whitespace-nowrap tracking-wider uppercase"
                >
                  {item.label}
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </motion.div>
    </nav>
  );
}
