import { motion } from 'framer-motion';
import { MessageCircle, FileSearch, Landmark, ArrowDown, CheckCircle2, HandCoins, PartyPopper } from 'lucide-react';

const steps = [
  {
    number: "01",
    icon: MessageCircle,
    title: "Nos cuentas tu historia",
    description: "Llamanos, escribenos por WhatsApp o llena el formulario. Sin presion, sin juicios. Solo queremos entender tu situacion y como ayudarte.",
    detail: "Respuesta en < 2 horas",
    accent: "from-amber-500/20 to-orange-500/20",
    accentBorder: "group-hover:border-amber-500/30",
  },
  {
    number: "02",
    icon: FileSearch,
    title: "Analizamos tus adeudo y situacion",
    description: "Evaluamos el valor real de tu propiedad, revisamos el estado legal de tus documentos y el total de adeudos. Te damos una oferta justa y transparente.",
    detail: "Oferta en 24 horas",
    accent: "from-orange-500/20 to-red-500/20",
    accentBorder: "group-hover:border-orange-500/30",
  },
  {
    number: "03",
    icon: HandCoins,
    title: "Liquidamos tus deudas",
    description: "Como parte de la compra, nosotros pagamos directamente al banco, Infonavit, CFE, agua, predial y cualquier otro adeudo. Tu no gestionas nada.",
    detail: "Nosotros nos encargamos",
    accent: "from-indigo-500/20 to-purple-500/20",
    accentBorder: "group-hover:border-indigo-500/30",
  },
  {
    number: "04",
    icon: Landmark,
    title: "Cerramos ante notario",
    description: "La compra se formaliza ante notario publico de tu confianza. Total transparencia. Nosotros cubrimos todos los gastos notariales y de escrituracion.",
    detail: "100% legal y seguro",
    accent: "from-blue-500/20 to-cyan-500/20",
    accentBorder: "group-hover:border-blue-500/30",
  },
  {
    number: "05",
    icon: PartyPopper,
    title: "Recibes tu dinero y tranquilidad",
    description: "Te transferimos la diferencia entre el valor de tu casa y los adeudos liquidados. Sin comisiones, sin sorpresas. Recuperas tu paz financiera.",
    detail: "7 a 15 dias total",
    accent: "from-emerald-500/20 to-teal-500/20",
    accentBorder: "group-hover:border-emerald-500/30",
  },
];

const guarantees = [
  "Sin comisiones de agente",
  "Sin reparaciones necesarias",
  "Nosotros cubrimos gastos notariales",
  "Liquidamos la deuda por ti",
  "Proceso ante notario de tu confianza",
  "Si no te convence, sin obligacion",
];

export function SellerProcess() {
  return (
    <section className="py-20 md:py-28 px-6 md:px-12 max-w-7xl mx-auto w-full" aria-label="Proceso de venta">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="text-center mb-20"
      >
        <p className="text-amber-600 font-bold tracking-[0.25em] text-[11px] uppercase mb-4">Proceso Simple y Transparente</p>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-slate-900 leading-tight">
          5 pasos para{' '}
          <span className="text-amber-600">recuperar tu tranquilidad</span>
        </h2>
        <p className="text-slate-500 text-lg font-light max-w-xl mx-auto leading-relaxed">
          Sin trámites largos. Sin sorpresas. Sin costos ocultos. Una solución real para problemas inmobiliarios complejos.
        </p>
      </motion.div>

      {/* Steps — Vertical timeline on mobile, horizontal on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-4 mb-20">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="relative group"
            >
              {/* Connector Arrow */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-20 text-slate-200">
                  <ArrowDown size={14} className="rotate-[-90deg]" />
                </div>
              )}

              <div className={`bg-white/80 backdrop-blur-sm rounded-[2rem] p-8 h-full space-y-6 shadow-sm hover:shadow-xl hover:shadow-amber-500/5 transition-all border border-slate-100 ${step.accentBorder} relative overflow-hidden group`}>
                {/* Background Gradient Detail */}
                <div className={`absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br ${step.accent} blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`}></div>

                {/* Step Number + Icon */}
                <div className="flex items-center justify-between relative">
                  <span className="text-slate-100 text-6xl font-bold leading-none select-none">{step.number}</span>
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/20 transition-all">
                    <Icon size={24} className="text-amber-600" />
                  </div>
                </div>

                {/* Content */}
                <div className="relative">
                  <h3 className="text-lg font-bold text-slate-900 mb-3 tracking-tight leading-tight">{step.title}</h3>
                  <p className="text-slate-500 text-[13px] font-medium leading-relaxed">{step.description}</p>
                </div>

                {/* Detail Badge */}
                <div className="relative pt-2">
                  <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-amber-700 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20 block w-fit">
                    {step.detail}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Guarantees Box — High Contrast Dark Design */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="bg-slate-900 rounded-[3rem] p-10 md:p-14 relative overflow-hidden shadow-2xl shadow-slate-200"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
        <p className="text-amber-400 font-bold tracking-[0.3em] text-[10px] uppercase mb-10 text-center">Nuestra Garantia Blindada para Vendedores</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-8 relative z-10">
          {guarantees.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className="flex items-center gap-4 group"
            >
              <div className="w-10 h-10 rounded-[1rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-lg shadow-emerald-500/5">
                <CheckCircle2 size={18} />
              </div>
              <span className="text-slate-100 text-sm font-semibold tracking-wide">{item}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
