import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Phone, Clock, Heart, AlertTriangle, Scale, Home, Calculator } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Props {
  onOpenForm?: () => void;
  onOpenCalculator?: () => void;
}

const painPoints = [
  { icon: AlertTriangle, label: "Asociación Estratégica", desc: "Nos asociamos contigo para salvar tu patrimonio" },
  { icon: Home, label: "Remodelación Premium", desc: "Inyectamos capital para elevar el valor de tu casa" },
  { icon: Scale, label: "Venta Inteligente", desc: "Comercializamos al mejor precio del mercado" },
];

const rotatingPhrases = [
  "Ampliamos cobertura: Monterrey, Guadalajara, Vallarta",
  "Nuevas plazas: Riviera Maya, Morelia, Puebla",
  "Norte del país: Tijuana, Mexicali, Los Cabos",
  "Levantamos capital para remodelar y vender tu propiedad",
];

export function SellerHero({ onOpenForm, onOpenCalculator }: Props) {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex(prev => (prev + 1) % rotatingPhrases.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-24 md:py-32 px-6 md:px-12 overflow-hidden bg-white/40" aria-label="Compramos tu casa">
      {/* Background Orbs — Subtle Warmth */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-amber-500/[0.05] blur-[180px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-orange-500/[0.04] blur-[160px] rounded-full"></div>
      </div>

      {/* Divider line with legible text */}
      <div className="max-w-7xl mx-auto mb-16 relative z-10">
        <div className="flex items-center gap-6">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-2" style={{ color: '#F26722' }}>
            <Heart size={14} style={{ color: '#F26722' }} />
            Soluciones Directas para Propietarios
          </span>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">

          {/* Left: Empathetic Hero Copy */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full lg:w-3/5 space-y-10"
          >
            {/* Live Badge */}
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#FF8A47' }}></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: '#F26722' }}></span>
              </span>
              <span className="text-slate-800 font-black tracking-[0.2em] text-[11px] uppercase px-3 py-1 rounded-lg border"
                    style={{ background: 'rgba(242,103,34,0.08)', borderColor: 'rgba(242,103,34,0.2)' }}>
                Asociación y Remodelación Inmobiliaria
              </span>
            </div>

            {/* Title with High Contrast */}
            <h1 className="text-5xl md:text-6xl lg:text-[5.5rem] font-black leading-[0.9] tracking-tighter text-slate-900">
              Sanamos tu deuda,
              <br />
              <span className="block mt-2" style={{ color: '#F26722' }}>remodelamos y vendemos.</span>
              <span className="text-slate-600 text-2xl md:text-4xl block mt-8 font-light leading-snug max-w-2xl">
                No malvendas. Asociate con Atia: inyectamos capital para elevar el valor de tu casa.
              </span>
            </h1>

            {/* Agitate Paragraph */}
            <p className="text-slate-700 text-lg md:text-xl font-medium leading-relaxed max-w-xl">
              Dejaste de pagar o tienes un embargo? <span className="text-slate-900 font-bold">Participamos contigo:</span> liquidamos adeudos jurídicos, remodelamos arquitectónicamente y vendemos al precio de mercado.
            </p>

            {/* Rotating Data — High Contrast */}
            <div className="h-7 relative overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.p
                  key={phraseIndex}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className="text-sm font-bold tracking-wide flex items-center gap-2"
                  style={{ color: '#d94e0d' }}
                >
                  <ShieldCheck size={16} style={{ color: '#F26722' }} />
                  {rotatingPhrases[phraseIndex]}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* CTAs with defined shadows and colors */}
            <div className="flex flex-col sm:flex-row gap-5 pt-4">
              <button
                onClick={onOpenForm}
                className="group relative inline-flex h-16 items-center justify-center overflow-hidden rounded-2xl
                           px-10 font-bold text-white transition-all text-base active:scale-95 shadow-xl"
                style={{ background: 'linear-gradient(135deg, #F26722, #d94e0d)', boxShadow: '0 16px 32px -8px rgba(242,103,34,0.35)' }}
              >
                <Phone size={20} className="mr-3" />
                <span>Solicitar mi Asociación</span>
              </button>
              
              <button
                onClick={onOpenCalculator}
                className="group relative inline-flex h-16 items-center justify-center overflow-hidden rounded-2xl
                           bg-white border-2 px-10 font-bold transition-all text-base active:scale-95"
                style={{ borderColor: 'rgba(242,103,34,0.25)', color: '#d94e0d' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(242,103,34,0.5)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(242,103,34,0.25)')}
              >
                <Calculator size={20} className="mr-3" />
                <span>Sana tu Deuda</span>
              </button>
            </div>

            {/* High-Legibility Micro-indicators */}
            <div className="flex flex-wrap items-center gap-8 text-[11px] text-slate-600 uppercase font-black tracking-[0.2em] pt-6">
              <span className="flex items-center gap-2" aria-label="Legal: Ante Notario">
                <ShieldCheck size={14} className="text-emerald-500" />
                Ante Notario
              </span>
              <span className="flex items-center gap-2" aria-label="Velocidad: 24 Horas">
                <Clock size={14} className="text-emerald-500" />
                24 Horas
              </span>
              <span className="flex items-center gap-2" aria-label="Confianza: Sin Compromiso">
                <Heart size={14} className="text-emerald-500" />
                Sin Compromiso
              </span>
            </div>
          </motion.div>

          {/* Right: Transparent Matcher UI */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full lg:w-2/5 space-y-8"
          >
            {/* Problem Category Cards */}
            <div className="space-y-4">
              {painPoints.map((point, idx) => {
                const Icon = point.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 + idx * 0.12 }}
                    className="bg-white rounded-3xl p-6 flex items-center gap-5 shadow-sm border border-slate-100 hover:border-amber-500/20 hover:shadow-xl hover:shadow-amber-500/5 transition-all group cursor-default"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-all">
                      <Icon size={24} />
                    </div>
                    <div>
                      <h3 className="text-slate-900 font-bold text-base mb-0.5">{point.label}</h3>
                      <p className="text-slate-600 text-xs font-semibold">{point.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Transparency Tool Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="relative rounded-[3rem] p-10 space-y-8 overflow-hidden bg-slate-900 text-white shadow-2xl"
            >
              {/* ATIA glow */}
              <div className="absolute -right-20 -top-20 w-64 h-64 blur-[100px] rounded-full pointer-events-none"
                   style={{ background: 'radial-gradient(circle, rgba(242,103,34,0.18), transparent)' }} />
              <div className="absolute -left-10 -bottom-10 w-40 h-40 blur-[70px] rounded-full pointer-events-none"
                   style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.1), transparent)' }} />

              <div className="relative">
                <p className="font-bold tracking-[0.3em] text-[10px] uppercase mb-8 text-center py-2 rounded-full border border-white/5 bg-white/5"
                   style={{ color: '#FF8A47' }}>Ejemplo de Transparencia Real</p>

                <div className="space-y-5">
                  <div className="flex justify-between items-center px-2">
                    <span className="text-slate-400 text-sm font-medium">Valor actual de tu propiedad</span>
                    <span className="text-white font-bold text-lg">$1,200,000</span>
                  </div>
                  <div className="h-[1px] bg-white/10"></div>
                  <div className="flex justify-between items-center px-2">
                    <span className="text-slate-400 text-sm font-medium">Adeudos liquidados por Casto</span>
                    <span className="text-rose-400 font-bold text-lg">- $800,000</span>
                  </div>
                  <div className="pt-2">
                    <div className="bg-amber-500 h-1.5 w-full rounded-full overflow-hidden shadow-lg shadow-amber-500/20 animate-pulse"></div>
                  </div>
                  <div className="flex justify-between items-center px-2 pt-4">
                    <span className="text-white font-black text-2xl">Recibes Hoy:</span>
                    <div className="text-right">
                      <span className="text-amber-400 font-black text-4xl block leading-none tracking-tight">$400,000</span>
                      <span className="text-[10px] text-amber-500/60 uppercase tracking-widest font-black mt-2 inline-block">Transferencia Inmediata</span>
                    </div>
                  </div>
                </div>

                <div className="mt-10 bg-white/5 rounded-2xl p-5 border border-white/5 text-center">
                  <p className="text-slate-400 text-[10px] uppercase tracking-[0.25em] font-black leading-relaxed">
                    0 Comisiones • 0 Estrés • 100% Notario
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
