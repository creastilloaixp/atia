import { useRef, useEffect } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { gsap } from 'gsap';
import { Home, TrendingUp, ShieldCheck, Phone, ArrowRight } from 'lucide-react';

interface Props {
  onSelectAudience: (audience: 'seller' | 'investor') => void;
  campaign: string;
}

export function DualHero({ onSelectAudience, campaign }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  // Auto-detect campaign=deuda → pre-select seller
  useEffect(() => {
    if (campaign === 'deuda' || campaign === 'embargo' || campaign === 'intestado') {
      const timer = setTimeout(() => onSelectAudience('seller'), 600);
      return () => clearTimeout(timer);
    }
  }, [campaign, onSelectAudience]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title clip-path reveal
      gsap.fromTo(
        titleRef.current,
        { y: 50, opacity: 0, clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' },
        { y: 0, opacity: 1, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', duration: 1.2, ease: 'power4.out', delay: 0.3 }
      );

      // Subtitle fade in
      gsap.fromTo(
        subtitleRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.7 }
      );

      // Cards stagger in
      if (cardsRef.current) {
        const cards = cardsRef.current.children;
        gsap.fromTo(
          cards,
          { y: 40, opacity: 0, scale: 0.95 },
          { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out', stagger: 0.15, delay: 1.0 }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden w-full"
      onMouseMove={handleMouseMove}
      aria-label="Bienvenido a CASTO"
    >
      {/* Mesh gradient and pattern background */}
      <div className="absolute inset-0 bg-mesh-gradient opacity-60"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-100 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      {/* Mouse-tracking interactive glow */}
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-40 z-0"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              600px circle at ${mouseX}px ${mouseY}px,
              rgba(56, 189, 248, 0.15),
              transparent 80%
            )
          `,
        }}
      />

      {/* Ambient floating orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <motion.div 
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] left-[5%] w-[500px] h-[500px] bg-amber-500/[0.05] blur-[120px] rounded-full"
        ></motion.div>
        <motion.div 
          animate={{ 
            y: [0, 20, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[10%] right-[5%] w-[600px] h-[600px] bg-blue-500/[0.05] blur-[140px] rounded-full"
        ></motion.div>
      </div>

      {/* Content */}
      <div className="z-10 flex flex-col items-center text-center px-4 max-w-5xl mx-auto pt-24">
        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="inline-flex items-center rounded-full border border-tb-accent/10 bg-tb-accent/5 px-4 py-1.5 text-[10px] font-bold text-tb-accent mb-8 glass-panel shadow-[0_0_20px_rgba(245,158,11,0.05)] uppercase tracking-wider"
        >
          <span className="relative flex h-2 w-2 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tb-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-tb-accent"></span>
          </span>
          Operando en {campaign && campaign !== 'general' ? campaign.toUpperCase() : 'CDMX, EDOMEX y Querétaro'}
        </motion.div>

        {/* Main Title — GSAP clip-path reveal */}
        <h1
          ref={titleRef}
          className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tight text-gray-900 mb-8 leading-[1]"
        >
          Liquidamos tus
          <br />
          <span className="text-tb-accent">deudas hoy</span>
        </h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="text-lg md:text-xl text-gray-500 max-w-2xl mb-16 font-light leading-relaxed"
        >
          Ya sea que necesites vender tu propiedad rápido o busques la siguiente gran oportunidad de inversión,
          <span className="text-gray-700 font-medium"> tenemos la solución exacta para ti.</span>
        </p>

        {/* Dual Path Cards */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
          {/* Seller Path */}
          <motion.button
            onClick={() => onSelectAudience('seller')}
            whileHover={{ scale: 1.02, translateY: -8 }}
            whileTap={{ scale: 0.98 }}
            className="group relative overflow-hidden rounded-[2.5rem] p-10 text-left cursor-pointer transition-all duration-500
              bg-white border border-gray-100 hover:border-amber-500/30
              shadow-sm hover:shadow-2xl hover:shadow-amber-500/10"
          >
            {/* Glossy overlay effect */}
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white to-transparent opacity-80 z-0"></div>
            {/* Animated Glow on hover */}
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/0 via-amber-200/20 to-amber-500/0 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-1000"></div>

            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6 group-hover:bg-amber-500/20 transition-colors">
                <Home size={28} className="text-amber-600" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-3">
                Sana tu Deuda
                <ArrowRight size={20} className="text-tb-accent group-hover:translate-x-1 transition-all" />
              </h2>

              <p className="text-gray-500 text-sm font-light leading-relaxed mb-6">
                Deuda hipotecaria, embargo, herencia, divorcio o simplemente quieres vender rápido.
                Te hacemos una oferta en 24 horas.
              </p>

              <div className="flex flex-wrap gap-2">
                {['Sin comisiones', 'Ante notario', '24 hrs'].map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400/80 text-[11px] font-bold uppercase tracking-wider">
                    <ShieldCheck size={10} />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.button>

          {/* Investor Path */}
          <motion.button
            onClick={() => onSelectAudience('investor')}
            whileHover={{ scale: 1.02, translateY: -8 }}
            whileTap={{ scale: 0.98 }}
            className="group relative overflow-hidden rounded-[2.5rem] p-10 text-left cursor-pointer transition-all duration-500
              bg-white border border-gray-100 hover:border-blue-500/30
              shadow-sm hover:shadow-2xl hover:shadow-blue-500/10"
          >
            {/* Glossy overlay effect */}
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white to-transparent opacity-80 z-0"></div>
            {/* Animated Glow on hover */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/0 via-blue-200/20 to-blue-500/0 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-1000"></div>

            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                <TrendingUp size={28} className="text-blue-600" />
              </div>

              <h2 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center gap-3">
                Quiero Invertir
                <ArrowRight size={20} className="text-blue-500/30 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </h2>

              <p className="text-gray-500 text-sm font-light leading-relaxed mb-6">
                Encuentra oportunidades de flipping con IA. Análisis predictivo de ROI, plusvalía y ciclo de inversión
                en tiempo real.
              </p>

              <div className="flex flex-wrap gap-2">
                {['ROI 24.8%', 'IA Predictiva', '1,200+/día'].map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-tb-accent/80 text-[11px] font-bold uppercase tracking-wider">
                    <TrendingUp size={10} />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.button>
        </div>

        {/* Trust micro-indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="flex flex-wrap items-center justify-center gap-6 mt-12 mb-8 text-[10px] text-gray-400 uppercase tracking-[0.15em] font-bold"
        >
          <span className="flex items-center gap-1.5">
            <Phone size={10} className="text-gray-300" />
            (55) 1234-5678
          </span>
          <span className="w-1 h-1 rounded-full bg-gray-200"></span>
          <span>+2,703 familias atendidas</span>
          <span className="w-1 h-1 rounded-full bg-gray-200"></span>
          <span className="text-amber-600">4.9/5 en Google</span>
        </motion.div>
      </div>
    </section>
  );
}
