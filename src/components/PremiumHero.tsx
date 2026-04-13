import { useRef, useEffect } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { gsap } from 'gsap';

export function PremiumHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  useEffect(() => {
    // GSAP animations for entering
    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleRef.current,
        { y: 50, opacity: 0, clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' },
        { y: 0, opacity: 1, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', duration: 1.2, ease: 'power4.out', delay: 0.2 }
      );
      
      gsap.fromTo(
        subtitleRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.6 }
      );
    }, containerRef);

    return () => ctx.revert(); // Cleanup GSAP
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden bg-[#050505] w-full"
      onMouseMove={handleMouseMove}
    >
      {/* Background Glow attached to mouse using framer-motion */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-20 transition duration-300 group-hover:opacity-100"
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
      
      <div className="z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto">
        <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-medium text-tb-accent mb-8 glass-panel animate-fade-in shadow-[0_0_20px_rgba(56,189,248,0.15)]">
          <span className="flex h-2 w-2 rounded-full bg-tb-accent mr-2 animate-pulse-slow"></span>
          Sistema Inmobiliario Antigravity
        </div>
        
        <h1 
          ref={titleRef}
          className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-6"
        >
          Transformando la Experiencia <br className="hidden md:block"/>
          <span className="text-gradient">Inmobiliaria Premium</span>
        </h1>
        
        <p 
          ref={subtitleRef}
          className="text-lg md:text-xl text-tb-light/70 max-w-2xl mb-10"
        >
          Diseño revolucionario usando glassmorphism, físicas avanzadas y el poder de Framer Motion + GSAP para convertir usuarios en compradores.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md bg-white px-8 font-medium text-black focus:outline-none focus:ring-2 focus:ring-tb-accent focus:ring-offset-2 focus:ring-offset-black"
          >
            <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
              <div className="relative h-full w-8 bg-white/20" />
            </div>
            Explorar Proyecto
          </motion.button>
          
          <button className="glass-input h-12 rounded-md px-8 font-medium text-white hover:bg-white/10 transition-colors btn-press">
            Agendar Demo
          </button>
        </div>
      </div>
      
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
    </div>
  );
}
