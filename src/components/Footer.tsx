import { motion } from 'framer-motion';
import { ArrowRight, Shield, Lock, Clock, Zap } from 'lucide-react';
import { AtiaLogo } from './AtiaLogo';

interface Props {
  onOpenForm?: () => void;
}

export function Footer({ onOpenForm }: Props = {}) {
  return (
    <footer className="relative mt-auto border-t border-slate-100" role="contentinfo">
      {/* Final CTA — High Contrast Design */}
      <section className="relative overflow-hidden bg-slate-900 border-b border-white/5" aria-label="Solicitar acceso">
        {/* Background glow for depth */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-amber-500/[0.05] blur-[180px] rounded-full"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto px-6 py-24 md:py-32 text-center relative z-10"
        >
          {/* Urgency Badge — Highly Legible */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] font-black uppercase tracking-[0.3em] text-amber-400 mb-10 shadow-lg shadow-amber-500/5 transition-all"
          >
            <Clock size={14} className="text-amber-500" />
            Cupo Limitado — 14 casos mensuales
          </motion.div>

          <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-8 leading-[0.95] text-white">
            Tu tranquilidad patrimonial{' '}
            <br className="hidden md:block" />
            <span className="text-amber-500">empieza hoy mismo.</span>
          </h2>
          
          <p className="text-slate-400 text-lg md:text-xl font-medium max-w-xl mx-auto mb-14 leading-relaxed tracking-wide">
            Cada día cuenta cuando hay deudas creciendo. Recupera el control de tu vida financiera ahora.
          </p>

          {/* High-Impact CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-10">
            <button 
              onClick={onOpenForm}
              className="group relative inline-flex h-18 items-center justify-center overflow-hidden rounded-[1.5rem] bg-amber-600 px-12 font-black text-white shadow-2xl shadow-amber-600/30 hover:bg-amber-500 transition-all text-lg active:scale-95"
            >
              <Zap size={22} className="mr-3 text-white" />
              <span>Solicitar Análisis GRATIS</span>
              <ArrowRight size={20} className="ml-3 group-hover:translate-x-2 transition-transform" />
            </button>
            <a 
              href="https://wa.me/526674540164?text=Hola%2C%20leí%20su%20página%20y%20me%20gustaría%20hablar%20con%20un%20asesor%20senior."
              target="_blank"
              rel="noopener noreferrer"
              className="h-18 rounded-[1.5rem] px-12 font-black text-white/70 border-2 border-white/10 hover:text-white hover:border-white/30 transition-all flex items-center justify-center uppercase tracking-widest text-[11px] bg-white/5 active:scale-95"
            >
              Asesor Senior WhatsApp
            </a>
          </div>

          {/* Micro trust indicators — Legible and Professional */}
          <div className="flex flex-wrap items-center justify-center gap-10 text-[10px] text-slate-400 uppercase tracking-[0.3em] font-black mt-8">
            <span className="flex items-center gap-2">
              <Lock size={14} className="text-emerald-500" />
              100% Confidencial
            </span>
            <span className="flex items-center gap-2">
              <Shield size={14} className="text-emerald-500" />
              Proceso Notarial
            </span>
            <span className="flex items-center gap-2">
              <Clock size={14} className="text-emerald-500" />
              Respuesta Inmediata
            </span>
          </div>
        </motion.div>
      </section>

      {/* Bottom Footer Section */}
      <div className="bg-slate-50 py-12 px-6 pb-28">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-5">
            <AtiaLogo height={32} showText={false} />
            <div className="h-6 w-[1.5px] bg-slate-200"></div>
            <span className="text-slate-400 text-[10px] uppercase tracking-[0.3em] font-black">
              Inteligencia Inmobiliaria Nacional
            </span>
          </div>

          {/* Legible Legal Links */}
          <div className="flex gap-8 text-slate-600 text-[11px] uppercase tracking-[0.2em] font-black">
            <a href="#" className="hover:text-amber-600 transition-colors" aria-label="Ver Términos y Condiciones">Términos</a>
            <a href="#" className="hover:text-amber-600 transition-colors" aria-label="Ver Política de Privacidad">Privacidad</a>
            <a href="#" className="hover:text-amber-600 transition-colors" aria-label="Información Legal">Legal</a>
          </div>

          {/* Tech/Copyright */}
          <div className="flex flex-col md:items-end gap-3">
             <div className="text-slate-500 text-[10px] uppercase tracking-[0.15em] font-black">
              © 2025 ATIA Inmobiliaria — Voice Bridge Engine v4.3
            </div>
            {onOpenForm && (
              <button 
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('open-admin'));
                }}
                className="text-slate-300 hover:text-amber-600 transition-all text-[8px] uppercase tracking-[0.4em] font-black text-right"
              >
                Mando Visionario (Admin)
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
