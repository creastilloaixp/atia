import { motion } from 'framer-motion';
import { Search, Eye, BarChart3, Rocket, ArrowDown } from 'lucide-react';

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Define tu Inversión",
    description: "Indica tu presupuesto, zona y ROI objetivo. Trinity analiza 1,200+ propiedades en tiempo real.",
    accent: "from-tb-accent/20 to-blue-500/20",
    detail: "< 3 segundos"
  },
  {
    number: "02",
    icon: Eye,
    title: "Visualiza el Potencial",
    description: "Nuestro motor de IA genera la transformación completa: diseño, costos y timeline de obra.",
    accent: "from-indigo-500/20 to-purple-500/20", 
    detail: "Antes / Después en IA"
  },
  {
    number: "03",
    icon: BarChart3,
    title: "Analiza los Números",
    description: "ROI proyectado, costo de reforma, valor de salida y comparables de mercado validados.",
    accent: "from-emerald-500/20 to-teal-500/20",
    detail: "Precisión del 94.7%"
  },
  {
    number: "04",
    icon: Rocket,
    title: "Ejecuta con Confianza",
    description: "Contrato verificado, asesor dedicado y seguimiento de obra incluido en la plataforma.",
    accent: "from-amber-500/20 to-orange-500/20",
    detail: "Acompañamiento 360°"
  }
];

export function HowItWorks() {
  return (
    <section className="py-20 md:py-32 px-6 md:px-12 max-w-7xl mx-auto w-full" aria-label="Cómo funciona">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="text-center mb-20"
      >
        <p className="text-tb-accent font-bold tracking-[0.25em] text-[11px] uppercase mb-4">Proceso Optimizado</p>
        <h2 className="text-3xl md:text-5xl font-light tracking-tight mb-4">
          De la <span className="text-gradient">Búsqueda</span> a la{' '}
          <span className="text-gradient-emerald">Rentabilidad</span>
        </h2>
        <p className="text-white/35 text-lg font-light max-w-xl mx-auto">
          4 pasos. Sin fricción. Sin sorpresas.
        </p>
      </motion.div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: idx * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="relative group"
            >
              {/* Connector Arrow (between cards) */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-20 text-white/10">
                  <ArrowDown size={16} className="rotate-[-90deg]" />
                </div>
              )}

              <div className="glass-panel rounded-2xl p-7 h-full space-y-5 card-hover border-white/5 hover:border-white/10 relative overflow-hidden">
                {/* Background Gradient */}
                <div className={`absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br ${step.accent} blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`}></div>
                
                {/* Step Number */}
                <div className="flex items-center justify-between relative">
                  <span className="text-white/8 text-5xl font-bold leading-none">{step.number}</span>
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/8 flex items-center justify-center group-hover:border-tb-accent/30 transition-colors">
                    <Icon size={22} className="text-white/50 group-hover:text-tb-accent transition-colors" />
                  </div>
                </div>

                {/* Content */}
                <div className="relative">
                  <h3 className="text-lg font-medium text-white/90 mb-2 tracking-tight">{step.title}</h3>
                  <p className="text-white/40 text-sm font-light leading-relaxed">{step.description}</p>
                </div>

                {/* Detail Badge */}
                <div className="relative">
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-tb-accent/60 bg-tb-accent/5 px-3 py-1.5 rounded-full border border-tb-accent/10">
                    {step.detail}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
