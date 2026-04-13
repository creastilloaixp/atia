import { motion } from 'framer-motion';
import {
  Building2, Zap, Droplets, Receipt,
  Landmark, Wrench, ShieldCheck, ArrowRight, Calculator
} from 'lucide-react';

const debtTypes = [
  {
    icon: Building2,
    title: 'Hipoteca Bancaria',
    desc: 'Liquidamos tu adeudo directamente con el banco. Tu recibes la diferencia.',
    examples: 'Bancomer, Santander, Banorte, HSBC',
  },
  {
    icon: Landmark,
    title: 'Infonavit / Fovissste',
    desc: 'Pagamos tu credito Infonavit o Fovissste como parte de la compra.',
    examples: 'Crédito tradicional, Cofinavit, Apoyo Infonavit',
  },
  {
    icon: Receipt,
    title: 'Predial Rezagado',
    desc: '¿Años de predial atrasado? Nosotros cubrimos todos los adeudos al municipio.',
    examples: '1 año, 3 años, 5+ años de atraso',
  },
  {
    icon: Zap,
    title: 'Adeudos de Luz',
    desc: 'Recibos acumulados, cortes o suspensiones de CFE. Todo lo resolvemos.',
    examples: 'CFE convencional, tarifa DAC, reconexión',
  },
  {
    icon: Droplets,
    title: 'Adeudos de Agua',
    desc: 'Recibos de agua atrasados de meses o años. Lo liquidamos por ti.',
    examples: 'JAPAC, SIAPA, SACMEX y organismos locales',
  },
  {
    icon: Wrench,
    title: 'Mantenimiento / Cuotas',
    desc: 'Cuotas de condominio, mantenimiento o cualquier otro adeudo asociado.',
    examples: 'HOA, cuotas condominales, servicios comunes',
  },
];

interface Props {
  onOpenForm?: () => void;
  onOpenCalculator?: () => void;
}

export function DebtTypes({ onOpenForm, onOpenCalculator }: Props) {
  return (
    <section className="py-20 md:py-28 px-6 md:px-12 max-w-7xl mx-auto w-full relative z-10" aria-label="Tipos de deudas que aceptamos">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <p className="text-amber-600 font-bold tracking-[0.3em] text-[11px] uppercase mb-4">No Importa Tu Adeudo</p>
        <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 text-slate-900 leading-tight">
          Liquidamos{' '}
          <span className="text-amber-600">todas tus deudas</span>
        </h2>
        <p className="text-slate-500 text-lg font-medium max-w-xl mx-auto leading-relaxed">
          Compramos tu casa y como parte de la operación, liquidamos cualquier tipo de adeudo que tenga tu propiedad.
        </p>
      </motion.div>

      {/* Debt Types Grid — Redesigned for Legibility */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {debtTypes.map((debt, idx) => {
          const Icon = debt.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-[2rem] p-7 space-y-5 shadow-sm border-2 border-slate-100 hover:border-amber-500/20 hover:shadow-2xl hover:shadow-amber-500/5 transition-all group relative overflow-hidden"
            >
              <div className="relative flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-all">
                  <Icon size={26} className="text-amber-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-slate-900 font-black text-lg group-hover:text-amber-700 transition-colors">{debt.title}</h3>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed">{debt.desc}</p>
                  <p className="text-amber-600/70 text-[10px] uppercase tracking-[0.15em] font-black pt-2 bg-amber-500/5 px-2 py-1 rounded-md w-fit border border-amber-500/10">{debt.examples}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom CTA — High Contrast Design */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-slate-900 rounded-[3rem] p-10 md:p-14 text-center relative overflow-hidden shadow-2xl shadow-slate-200"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.05] to-orange-500/[0.03] pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <ShieldCheck size={18} className="text-amber-400" />
            <p className="text-amber-400 font-black tracking-[0.3em] text-[11px] uppercase">Diagnóstico Legal Inmediato</p>
          </div>
          <h3 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tighter">
            ¿Tu deuda no aparece aquí?{' '}
            <br />
            <span className="text-amber-400">También la resolvemos.</span>
          </h3>
          <p className="text-slate-400 text-base md:text-lg font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
            Cada caso es único. Cuéntanos tu situación y te decimos exactamente cómo podemos ayudarte. Sin costo, sin compromiso y ante notario.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <button
              onClick={onOpenForm}
              className="group inline-flex h-16 items-center justify-center overflow-hidden rounded-[1.5rem] bg-amber-600 px-10 font-bold text-white shadow-xl shadow-amber-600/20 hover:bg-amber-500 transition-all text-base"
            >
              Solicitar Diagnóstico GRATIS
              <ArrowRight size={20} className="ml-3 group-hover:translate-x-2 transition-transform" />
            </button>
            <button
              onClick={onOpenCalculator}
              className="group inline-flex h-16 items-center justify-center overflow-hidden rounded-[1.5rem] bg-white/5 border border-white/20 px-10 font-bold text-white hover:bg-white/10 transition-all text-base"
            >
              <Calculator size={20} className="mr-3 text-amber-400" />
              Sana tu Deuda
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
