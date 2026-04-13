import { motion } from 'framer-motion';
import { Star, Quote, ShieldCheck } from 'lucide-react';

const testimonials = [
  {
    name: "Maria Gonzalez",
    city: "Monterrey, NL",
    situation: "Hipoteca vencida + Predial",
    quote: "Debia 3 anos de hipoteca y pensaba que iba a perder todo. El banco ya me habia mandado la demanda. Casto compro mi casa, liquido mi deuda y me entrego $180,000 de diferencia en 10 dias. Me quitaron un peso enorme de encima.",
    amount: "$180,000",
    time: "10 dias",
    avatar: "MG",
    gradient: "from-amber-500/20 to-orange-500/20",
  },
  {
    name: "Roberto Martinez",
    city: "Guadalajara, JAL",
    situation: "Infonavit + Servicios atrasados",
    quote: "El proceso fue mas facil de lo que imagine. Yo no sabia que podia vender una casa que todavia debia al Infonavit. Ellos se encargaron de todo: liquidaron la deuda, pagaron el predial atrasado y cerramos ante notario en 12 dias.",
    amount: "$230,000",
    time: "12 dias",
    avatar: "RM",
    gradient: "from-indigo-500/20 to-purple-500/20",
  },
  {
    name: "Ana Rodriguez",
    city: "CDMX",
    situation: "Casa intestada + Predial",
    quote: "Heredamos una casa con mi hermano pero no habia testamento. Llevabamos 2 anos sin poder hacer nada, acumulando deudas de predial. Casto nos ayudo con el tramite legal y compro la propiedad. En 2 semanas resolvimos lo que no pudimos en anos.",
    amount: "$320,000",
    time: "15 dias",
    avatar: "AR",
    gradient: "from-emerald-500/20 to-teal-500/20",
  },
];

const stats = [
  { value: "2,703+", label: "Familias ayudadas" },
  { value: "$250M+", label: "Deudas liquidadas" },
  { value: "4.9/5", label: "Calificacion Google" },
  { value: "10 dias", label: "Tiempo promedio" },
];

export function SellerTestimonials() {
  return (
    <section className="py-20 md:py-28 px-6 md:px-12 max-w-7xl mx-auto w-full relative z-10" aria-label="Testimonios de vendedores">

      {/* Stats Bar — High Contrast Layout */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-10 md:p-12 mb-20 border border-slate-200 shadow-2xl shadow-slate-200/50"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col items-center text-center"
            >
              <p className="text-3xl md:text-5xl font-black text-amber-600 mb-2 tracking-tighter">{stat.value}</p>
              <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em] font-black">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="text-center mb-20"
      >
        <p className="text-amber-600 font-bold tracking-[0.3em] text-[11px] uppercase mb-4">Historias Reales de Vendedores</p>
        <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 text-slate-900 leading-tight">
          Ellos ya{' '}
          <span className="text-amber-600 underline decoration-amber-200">recuperaron su tranquilidad</span>
        </h2>
        <p className="text-slate-500 text-lg font-medium max-w-lg mx-auto">
          Casos reales de éxito donde la legalidad y la rapidez salvaron el patrimonio familiar.
        </p>
      </motion.div>

      {/* Testimonials Grid — Redesigned for Reading */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {testimonials.map((t, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-[2.5rem] p-8 space-y-7 shadow-sm border-2 border-slate-100 hover:border-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/5 transition-all relative overflow-hidden group"
          >
            {/* Top: Stars + Situation Badge */}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className="text-amber-500 fill-amber-500" />
                ))}
              </div>
              <span className="text-[9px] font-black uppercase tracking-[0.1em] text-amber-700 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
                {t.situation}
              </span>
            </div>

            {/* Quote with high contrast */}
            <div className="relative z-10">
              <Quote size={28} className="text-slate-100 absolute -top-2 -left-2 z-0" />
              <p className="text-slate-700 font-medium leading-relaxed text-[15px] pl-6 relative z-10 italic">
                "{t.quote}"
              </p>
            </div>

            {/* Result Metrics — Clean and Bold */}
            <div className="flex items-center gap-4 py-5 border-t border-b border-slate-50 relative z-10">
              <div className="flex-1 text-center">
                <p className="text-slate-900 text-xl font-black">{t.amount}</p>
                <p className="text-slate-400 text-[9px] uppercase tracking-[0.2em] font-black mt-1">Recuperado</p>
              </div>
              <div className="w-[1.5px] h-10 bg-slate-100"></div>
              <div className="flex-1 text-center">
                <p className="text-emerald-600 text-xl font-black">{t.time}</p>
                <p className="text-slate-400 text-[9px] uppercase tracking-[0.2em] font-black mt-1">Liquidado</p>
              </div>
            </div>

            {/* Author — Clearer Avatars */}
            <div className="flex items-center gap-4 relative z-10">
              <div className={`w-12 h-12 rounded-[1.2rem] bg-gradient-to-br ${t.gradient} flex items-center justify-center text-base font-black text-white shadow-lg border border-white/20`}>
                {t.avatar}
              </div>
              <div>
                <p className="text-slate-900 font-black text-[15px]">{t.name}</p>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{t.city}</p>
              </div>
            </div>

            {/* Subtle background glow */}
            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-amber-500/5 blur-[50px] rounded-full group-hover:bg-amber-500/10 transition-colors"></div>
          </motion.div>
        ))}
      </div>

      {/* Strong Verification note */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="flex items-center justify-center gap-3 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] bg-slate-50 py-3 rounded-full border border-slate-100 max-w-2xl mx-auto"
      >
        <ShieldCheck size={14} className="text-emerald-500" />
        <span>Testimonios verificados ante notario y con autorización legal</span>
      </motion.div>
    </section>
  );
}
