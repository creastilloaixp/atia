import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const BeforeAfterReveal: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const afterImageRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      // Configuramos la animación ScrollTrigger para el clip-path
      gsap.to(afterImageRef.current, {
        clipPath: 'inset(0% 0% 0% 0%)',
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'center center',
          end: '+=100%', // Se pinea por el 100% del alto de la ventana
          scrub: 1, // Sincronizado suavemente con el scroll (scrub: 1 repite retardo de 1 segundo aprox)
          pin: true, // Fija el elemento en pantalla
        },
      });
    }, containerRef); // El scope de gsap.context

    return () => ctx.revert(); // Evitamos memory leaks al desmontar el componente
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-screen overflow-hidden bg-zinc-900 flex flex-col items-center justify-center p-4"
    >
      <div className="relative w-full max-w-6xl aspect-video rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10">
        
        {/* Imagen del ANTES (Casa devaluada/ruinas) */}
        <div className="absolute inset-0 w-full h-full bg-zinc-800">
          <img 
            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
            alt="Casa Antes" 
            className="w-full h-full object-cover grayscale opacity-80"
          />
          <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            Antes (Caos)
          </div>
        </div>

        {/* Imagen del DESPUÉS (Casa remodelada) con clip-path */}
        <div 
          ref={afterImageRef}
          className="absolute inset-0 w-full h-full z-10"
          style={{ clipPath: 'inset(0% 100% 0% 0%)' }} // Empieza totalmente oculta hacia la derecha
        >
          <img 
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
            alt="Casa Después" 
            className="w-full h-full object-cover"
          />
          {/* UI feedback */}
          <div className="absolute bottom-6 left-6 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-white font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400"></span>
            Después (Orden)
          </div>
          
          {/* Línea incandescente para marcar la revelación */}
          <div className="absolute top-0 right-0 h-full w-[2px] bg-white shadow-[0_0_20px_4px_rgba(255,255,255,0.7)] z-20"></div>
        </div>

      </div>

      <p className="mt-8 text-white/50 animate-pulse tracking-widest text-sm uppercase">
        Sigue haciendo scroll
      </p>
    </div>
  );
};

export default BeforeAfterReveal;
