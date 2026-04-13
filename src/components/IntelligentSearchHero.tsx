import { motion, AnimatePresence } from 'framer-motion';
import { Search, Mic, Sparkles, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Props {
  isSearching: boolean;
  setIsSearching: (val: boolean) => void;
  onSearch?: (query: string) => void;
  campaign?: string;
}

// Dynamic greeting based on time of day
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

// Rotating subtitles for dynamic feel
const rotatingPhrases = [
  "Propiedades con +20% de plusvalía potencial",
  "Análisis de inversión en tiempo real",
  "Detección automática de oportunidades ocultas",
  "ROI proyectado con precisión algorítmica"
];

export function IntelligentSearchHero({ isSearching, setIsSearching, onSearch, campaign = 'general' }: Props) {
  const [inputValue, setInputValue] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);

  const handleSearch = (query?: string) => {
    const q = query || inputValue;
    if (!q.trim()) return;
    setIsSearching(true);
    onSearch?.(q.trim());
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex(prev => (prev + 1) % rotatingPhrases.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const chips = [
    { label: "Alta Plusvalía · Zona Norte (+22%)", icon: "📈" },
    { label: "Flip Rápido · ROI > 30%", icon: "⚡" },
    { label: "Penthouse · Privacidad Absoluta", icon: "🏙️" },
    { label: "Terreno Inversión · $280/m²", icon: "💎" },
    { label: "Casa Distressed · Bajo Mercado", icon: "🏚️" }
  ];

  const contentMap: Record<string, { badge: string, headline: React.ReactNode, subtitle: string }> = {
    general: {
      badge: "Plataforma de Flipping Inteligente",
      headline: (
        <>
          Encuentra la inversión.{' '}
          <br className="hidden md:block"/>
          Visualiza el resultado.{' '}
          <br className="hidden md:block"/>
          <span className="text-gradient font-normal">Multiplica tu capital.</span>
        </>
      ),
      subtitle: "IA que analiza 1,200+ propiedades diarias para detectar oportunidades que el mercado aún no ve."
    },
    remodelacion: {
      badge: "Remodelación Estratégica",
      headline: (
        <>
          Renueva más rápido.{' '}
          <br className="hidden md:block"/>
          Vende más caro.{' '}
          <br className="hidden md:block"/>
          <span className="text-gradient font-normal">Encuentra tu próximo flip.</span>
        </>
      ),
      subtitle: "El motor predictivo que te dice exactamente en qué zona remodelar para maximizar tu ganancia."
    },
    deuda: {
      badge: "Inversión en Deuda (NPL)",
      headline: (
        <>
          Compra con descuento.{' '}
          <br className="hidden md:block"/>
          Liquida deuda rápido.{' '}
          <br className="hidden md:block"/>
          <span className="text-gradient font-normal">Oportunidades únicas.</span>
        </>
      ),
      subtitle: "Detectamos propiedades distress, subastas y deuda asegurada con hasta un 40% debajo del valor comercial."
    }
  };

  const content = contentMap[campaign] || contentMap['general'];

  return (
    <section aria-label="Búsqueda inteligente de propiedades">
      <motion.div 
        layout
        className={`flex flex-col items-center justify-center w-full max-w-5xl mx-auto px-4 ${isSearching ? 'pt-28 pb-12' : 'min-h-[90vh] pt-16'}`}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div layout className="text-center w-full mt-10">
          {/* Dynamic Greeting */}
          <motion.p 
            layout="position"
            className="text-tb-light/40 tracking-[0.3em] text-[11px] font-semibold mb-8 uppercase flex items-center justify-center gap-3"
          >
            <span className="w-8 h-[1px] bg-white/20"></span>
            {getGreeting()}, inversor
            <span className="w-8 h-[1px] bg-white/20"></span>
          </motion.p>
          
          {/* Main Headline — [Emoción] + [Beneficio concreto] + [Diferenciador] */}
          <motion.h1 
            layout="position"
            className={`font-light text-tb-light leading-[1.05] transition-all duration-700 ${
              isSearching 
                ? 'text-2xl md:text-3xl' 
                : 'text-4xl md:text-6xl lg:text-[4.5rem] mb-6'
            }`}
          >
            {!isSearching && (
              <motion.span 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="block text-tb-accent/80 text-base md:text-lg font-semibold tracking-[0.3em] uppercase mb-8"
              >
                <Sparkles className="inline w-4 h-4 mr-2 mb-0.5" />
                {content.badge}
              </motion.span>
            )}
            {content.headline}
          </motion.h1>

          {/* Subheadline + Rotating Phrase */}
          <AnimatePresence>
            {!isSearching && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="max-w-2xl mx-auto mb-14"
              >
                <p className="text-white/40 text-lg md:text-xl font-light leading-relaxed mb-6">
                  {content.subtitle}
                </p>
                
                {/* Rotating social proof line */}
                <div className="h-6 relative overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={phraseIndex}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.4 }}
                      className="text-tb-accent/70 text-sm font-medium tracking-wide flex items-center justify-center gap-2"
                    >
                      <Zap size={14} className="text-tb-accent" />
                      {rotatingPhrases[phraseIndex]}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search Input */}
          <motion.div 
            layout 
            className={`relative max-w-2xl mx-auto w-full group transition-all duration-700 ${isSearching ? 'mt-4' : 'mt-2'}`}
          >
            <div className="absolute inset-0 rounded-full bg-tb-accent/5 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
            <input
              id="search-input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              placeholder='Ej: "Zona norte, presupuesto $2M, ROI mínimo 20%"'
              className="relative w-full bg-[#0a0a0a]/80 border border-white/10 rounded-full px-8 py-5 text-lg text-white placeholder-white/25 focus:outline-none focus:border-tb-accent/30 focus:bg-white/[0.06] transition-all shadow-2xl backdrop-blur-xl"
              aria-label="Buscar propiedades para inversión"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button 
                className="p-2.5 text-white/40 hover:text-white/70 transition-colors cursor-pointer rounded-full hover:bg-white/5"
                aria-label="Búsqueda por voz"
              >
                <Mic size={18} />
              </button>
              <button
                onClick={() => handleSearch()}
                className="p-3.5 bg-white text-tb-dark rounded-full hover:scale-105 transition-transform btn-press cursor-pointer shadow-lg"
                aria-label="Buscar"
              >
                <Search size={18} />
              </button>
            </div>
          </motion.div>

          {/* Suggestion Chips — More specific, data-driven */}
          <AnimatePresence mode="wait">
            {!isSearching && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-wrap items-center justify-center gap-2.5 mt-10"
              >
                {chips.map((chip, idx) => (
                  <button 
                    key={idx}
                    onClick={() => {
                      setInputValue(chip.label);
                      handleSearch(chip.label);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/6 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/15 transition-all text-[13px] text-tb-light/50 hover:text-tb-light/90 cursor-pointer btn-press backdrop-blur-sm"
                  >
                    <span>{chip.icon}</span>
                    {chip.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Trust Indicators */}
          <AnimatePresence>
            {!isSearching && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-center gap-6 mt-10 text-[10px] text-white/20 uppercase tracking-[0.2em] font-bold"
              >
                <span>🔒 Datos Encriptados</span>
                <span className="w-1 h-1 rounded-full bg-white/10"></span>
                <span>⚡ Análisis en 3 seg</span>
                <span className="w-1 h-1 rounded-full bg-white/10"></span>
                <span>🛡️ Sin Costo Inicial</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </section>
  );
}
