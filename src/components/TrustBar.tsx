import { motion } from 'framer-motion';
import { Users, DollarSign, Star, ShieldCheck, Scale, Clock } from 'lucide-react';

const stats = [
  { icon: Users, value: '2,703+', label: 'Familias atendidas' },
  { icon: DollarSign, value: '$250M+', label: 'MXN liquidados' },
  { icon: Star, value: '4.9/5', label: 'Google Reviews' },
  { icon: Scale, value: '100%', label: 'Ante notario' },
];

const seals = [
  { icon: ShieldCheck, label: '100% Legal' },
  { icon: Scale, label: 'Ante Notario' },
  { icon: DollarSign, label: 'Sin Comisiones' },
  { icon: Clock, label: 'Oferta en 24 hrs' },
];

export function TrustBar() {
  return (
    <section className="py-12 px-6 md:px-12 w-full relative z-10" aria-label="Indicadores de confianza">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Stats Grid — Enhanced Contrast */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="bg-white/80 backdrop-blur-md rounded-[2rem] p-8 md:p-10 border border-slate-200 shadow-xl shadow-slate-200/50"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  className="text-center group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                    <Icon size={20} className="text-amber-600 transition-colors" />
                  </div>
                  <p className="text-3xl md:text-4xl font-black text-slate-900 mb-1 tracking-tighter">{stat.value}</p>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* High-Authority Security Seals */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          {seals.map((seal, idx) => {
            const Icon = seal.icon;
            return (
              <span
                key={idx}
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-slate-900 text-amber-400 text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-slate-200 hover:scale-105 transition-transform"
              >
                <Icon size={14} className="text-amber-500" />
                {seal.label}
              </span>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
