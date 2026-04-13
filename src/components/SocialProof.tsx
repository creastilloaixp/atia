import { motion } from 'framer-motion';
import { Star, TrendingUp, Users, Clock, Target, ChevronRight } from 'lucide-react';

const stats = [
  { icon: TrendingUp, value: "24.8%", label: "ROI Promedio por Flip", sublabel: "Últimos 12 meses", color: "text-emerald-400" },
  { icon: Users, value: "127", label: "Inversores Activos", sublabel: "En 3 ciudades", color: "text-tb-accent" },
  { icon: Clock, value: "4.2", label: "Meses Promedio", sublabel: "Del cierre al exit", color: "text-amber-400" },
  { icon: Target, value: "94.7%", label: "Precisión del Avalúo", sublabel: "vs. precio real de venta", color: "text-indigo-400" },
];

const testimonials = [
  {
    name: "Carlos Mendoza",
    role: "Inversor Senior · Monterrey",
    text: "Compré una propiedad distressed en $1.8M que Casto valuó en $2.6M post-reforma. La vendí en $2.52M en 4 meses. El ROI fue del 28.3% neto.",
    metric: "+28.3% ROI",
    metricColor: "text-emerald-400",
    rating: 5
  },
  {
    name: "Ana Gutiérrez",
    role: "Flipper Profesional · CDMX",
    text: "La visualización antes/después cerró 3 deals en una semana. Mis compradores finales ven el potencial antes de la primera visita. Reduje mi ciclo de venta un 40%.",
    metric: "-40% ciclo",
    metricColor: "text-tb-accent",
    rating: 5
  },
  {
    name: "Roberto Castillo",
    role: "Fund Manager · Guadalajara",
    text: "Trinity detectó una zona de plusvalía en Col. Americana que nuestro equipo de 8 analistas había descartado. Entramos a $14k/m², hoy cotiza a $19k/m².",
    metric: "+35.7% zona",
    metricColor: "text-amber-400",
    rating: 5
  }
];

const logos = [
  "Asociación Mexicana de Profesionales Inmobiliarios",
  "Cámara Nacional de la Industria de la Construcción",
  "Real Estate Advisory Board"
];

export function SocialProof() {
  return (
    <section className="py-20 md:py-32 px-6 md:px-12 max-w-7xl mx-auto w-full" aria-label="Resultados y testimonios">
      
      {/* Stats Bar — 4 columns with secondary labels */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="glass-panel-elevated rounded-3xl p-8 md:p-12 mb-20"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div 
                key={idx} 
                className="flex flex-col items-center md:items-start text-center md:text-left"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                    <Icon size={18} className={stat.color.replace('400', '600')} />
                  </div>
                  <p className={`text-3xl md:text-4xl font-light ${stat.color.replace('400', '600')}`}>{stat.value}</p>
                </div>
                <p className="text-gray-500 text-[11px] uppercase tracking-[0.15em] font-bold">{stat.label}</p>
                <p className="text-gray-400 text-[10px] tracking-wide mt-0.5">{stat.sublabel}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <p className="text-tb-accent font-bold tracking-[0.25em] text-[11px] uppercase mb-4">Casos de Éxito Verificados</p>
        <h2 className="text-3xl md:text-5xl font-light tracking-tight mb-4 text-gray-900">
          Números que{' '}
          <span className="text-gradient-emerald">hablan solos</span>
        </h2>
        <p className="text-gray-400 text-base font-light max-w-lg mx-auto">
          Cada testimonio incluye métricas reales verificadas por nuestro equipo de compliance.
        </p>
      </motion.div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {testimonials.map((testimonial, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="glass-panel rounded-2xl p-7 space-y-5 card-hover border-gray-100 hover:border-gray-200 relative overflow-hidden bg-white"
          >
            {/* Metric highlight */}
            <div className="flex items-center justify-between">
              <div className="flex gap-0.5">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} size={12} className="text-amber-500 fill-amber-500" />
                ))}
              </div>
              <span className={`text-sm font-bold ${testimonial.metricColor.replace('400', '600')} bg-gray-50 px-3 py-1 rounded-full border border-gray-100`}>
                {testimonial.metric}
              </span>
            </div>

            {/* Quote */}
            <p className="text-gray-600 font-light leading-relaxed text-[14px]">
              "{testimonial.text}"
            </p>

            {/* Author */}
            <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-sm font-bold text-blue-600 border border-blue-100">
                {testimonial.name.charAt(0)}
              </div>
              <div>
                <p className="text-gray-800 font-medium text-sm">{testimonial.name}</p>
                <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">{testimonial.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Trust Logos Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="text-center"
      >
        <p className="text-white/15 text-[10px] uppercase tracking-[0.25em] font-bold mb-6">Reconocidos por</p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {logos.map((logo, idx) => (
            <span key={idx} className="text-white/15 text-xs font-bold tracking-wide uppercase hover:text-white/30 transition-colors">
              {logo}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex justify-center mt-16"
      >
        <button className="group flex items-center gap-3 text-tb-accent/70 hover:text-tb-accent text-sm font-medium transition-colors">
          Ver todos los casos de éxito
          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>
    </section>
  );
}
