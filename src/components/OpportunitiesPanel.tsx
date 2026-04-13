import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';

interface Opportunity {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  tools: string[];
  timestamp: string;
}

const opportunities: Opportunity[] = [
  {
    id: '1',
    title: 'Landing Pages Animadas con IA',
    description: 'Hero sections animados con Nano Banana para mostrar propiedades con fondoanimado. Transiciones suaves tipo AntiGravity.',
    priority: 'high',
    tools: ['AntiGravity', 'Nano Banana', 'GSAP'],
    timestamp: '0:00 - 9:49'
  },
  {
    id: '2',
    title: 'Generación de Imágenes IA',
    description: 'Generar renders de propiedades mejorados con IA. Comparación ChatGPT vs Nano Banana para assets gratuitos.',
    priority: 'high',
    tools: ['Nano Banana', 'ChatGPT', 'Cling 3.0'],
    timestamp: '2:08 - 2:54'
  },
  {
    id: '3',
    title: 'Iconos 3D Personalizados',
    description: 'Crear iconos 3D para tipos de propiedad: Villa, Departamento, Terreno, Casa. Usar Nano Banana para generarlos.',
    priority: 'medium',
    tools: ['Nano Banana', 'Dribbble'],
    timestamp: '17:19 - 22:24'
  },
  {
    id: '4',
    title: 'Videos Virales de Propiedades',
    description: 'Grabar pantalla mostrando propiedades animadas y publicar en X/Twitter. Estrategia de posts virales.',
    priority: 'high',
    tools: ['CleanShot', 'Shots.com'],
    timestamp: '24:54 - 30:35'
  },
  {
    id: '5',
    title: 'Freelancing para Otros Inmobiliarios',
    description: 'Ofrecer servicios de diseño web animado a otras inmobiliarias via Upwork. Perfil con Loom videos.',
    priority: 'medium',
    tools: ['Upwork', 'Loom'],
    timestamp: '25:06 - 29:50'
  },
  {
    id: '6',
    title: 'Automatización de Descripciones',
    description: 'Usar Gemini para generar descripciones de propiedades automáticamente. Google AI Studio + AntiGravity.',
    priority: 'medium',
    tools: ['Gemini', 'Google AI Studio'],
    timestamp: '4:05 - 9:49'
  }
];

export function OpportunitiesPanel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo('.opp-card', 
        { opacity: 0, y: 60, scale: 0.95 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out'
        }
      );

      gsap.to('.opp-card', {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
        },
        y: -10,
        duration: 0.3,
        stagger: 0.1,
        ease: 'power2.inOut'
      });
    }, containerRef.current);

    return () => ctx.revert();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 border-red-500/40 text-red-400';
      case 'medium': return 'bg-amber-500/20 border-amber-500/40 text-amber-400';
      case 'low': return 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400';
      default: return 'bg-slate-500/20 border-slate-500/40 text-slate-400';
    }
  };

  return (
    <section ref={containerRef} className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-tb-accent/10 border border-tb-accent/30 text-tb-accent text-xs font-bold tracking-[0.2em] uppercase mb-4">
          <span className="w-2 h-2 rounded-full bg-tb-accent animate-pulse"></span>
          Análisis de Tendencias
        </span>
        <h2 className="text-4xl md:text-5xl font-light text-slate-900 mb-4">
          <span className="font-bold">Áreas de Oportunidad</span>
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto text-lg">
          6 oportunidades identificadas del video "AntiGravity X Nano Banana" para Casto Inmobiliaria
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {opportunities.map((opp, index) => (
          <motion.div
            key={opp.id}
            ref={(el) => { if (el) cardsRef.current[index] = el; }}
            className="opp-card group relative p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/30 shadow-lg hover:shadow-xl transition-all duration-500 cursor-pointer overflow-hidden"
            onClick={() => setSelectedId(selectedId === opp.id ? null : opp.id)}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-tb-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${getPriorityColor(opp.priority)}`}>
                  {opp.priority}
                </span>
                <span className="text-xs text-slate-400 font-mono">{opp.timestamp}</span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-tb-accent transition-colors">
                {opp.title}
              </h3>

              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                {opp.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {opp.tools.map((tool) => (
                  <span 
                    key={tool}
                    className="px-2 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-medium"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            <motion.div
              className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-tb-accent to-indigo-500"
              initial={{ scaleX: 0 }}
              whileHover={{ scaleX: 1 }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="mt-12 text-center"
      >
        <p className="text-slate-500 text-sm mb-4">
          🎯 <span className="font-semibold">Video:</span> AntiGravity X Nano Banana - 120K vistas
        </p>
        <a
          href="https://www.youtube.com/watch?v=wU8diwt99-s"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors"
        >
          Ver Video Original
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 10h4m-4 4h4m-4 4h4m-6 4h.01M9 16h.01" />
          </svg>
        </a>
      </motion.div>
    </section>
  );
}
