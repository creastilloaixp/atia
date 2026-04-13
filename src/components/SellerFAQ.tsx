import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
     question: "¿Puedo vender mi casa si todavía la debo al Infonavit o Fovissste?",
     answer: "Sí. Nosotros liquidamos tu deuda hipotecaria directamente con el banco o Infonavit como parte de la compra. Tú recibes la diferencia entre el valor de la propiedad y la deuda pendiente. No necesitas tener el saldo liquidado antes de contactarnos."
  },
  {
    question: "¿Cuánto tiempo tarda el proceso de venta?",
    answer: "El proceso completo tarda entre 7 y 15 días. Recibes tu oferta en menos de 24 horas tras contactarnos y cerramos ante notario público. En casos legales complejos (embargo, intestado), nosotros nos encargamos de toda la gestión legal."
  },
  {
    question: "¿Compran casas con proceso de embargo?",
    answer: "Sí. Negociamos directamente con los acreedores para levantar el embargo y realizamos la compra. Nuestro equipo legal especializado se encarga de todo. Tú no necesitas contratar abogados externos ni pagar honorarios adicionales."
  },
  {
    question: "¿Cobran alguna comisión o hay costos ocultos?",
    answer: "No cobramos comisión. A diferencia de un agente (3-6%), nosotros cubrimos todos los gastos: notariales, legales y de escrituración. El monto que te ofrecemos es exactamente lo que recibes en tu cuenta."
  },
  {
    question: "¿Cómo sé que el proceso es legal y seguro?",
    answer: "Todo el proceso se formaliza ante el Notario Público de tu elección. Contamos con más de 2,700 operaciones exitosas y calificación de 4.9/5. Nunca te pediremos dinero por adelantado ni firmas fuera de una notaría."
  },
  {
    question: "¿Qué pasa si heredé una casa y no hay testamento?",
    answer: "Te ayudamos con el trámite de sucesión intestamentaria sin costo inicial. Si los herederos están de acuerdo en la venta, nosotros gestionamos la parte legal para que puedan recibir su dinero de forma inmediata."
  }
];

function FAQItem({ faq, index }: { faq: typeof faqs[0]; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className={`border-b border-slate-100 last:border-0 transition-all ${isOpen ? 'bg-amber-50/30' : ''}`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-6 px-4 text-left group cursor-pointer"
        aria-expanded={isOpen}
      >
        <span className={`text-lg font-bold pr-8 transition-colors ${isOpen ? 'text-amber-700' : 'text-slate-800'}`}>
          {faq.question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            isOpen ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'
          }`}
        >
          <ChevronDown size={18} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="text-slate-600 text-base font-medium leading-relaxed pb-8 px-5 max-w-3xl">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function SellerFAQ() {
  return (
    <section className="py-20 md:py-28 px-6 md:px-12 max-w-5xl mx-auto w-full relative z-10" aria-label="Preguntas frecuentes">
      
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="text-center mb-20"
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <HelpCircle size={18} className="text-amber-600" />
          <p className="text-amber-600 font-black tracking-[0.3em] text-[11px] uppercase">Centro de Ayuda Legal</p>
        </div>
        <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 text-slate-900 leading-tight">
          Resolvemos tus <span className="text-amber-600">dudas</span>
        </h2>
        <p className="text-slate-500 text-lg font-medium max-w-xl mx-auto leading-relaxed">
          Transparencia total desde el primer contacto. Conoce por qué somos la opción más segura en México.
        </p>
      </motion.div>

      {/* FAQ Accordion — Clean and Legible */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8 }}
        className="bg-white rounded-[3rem] p-4 md:p-8 border-2 border-slate-100 shadow-2xl shadow-slate-200/50"
      >
        {faqs.map((faq, idx) => (
          <FAQItem key={idx} faq={faq} index={idx} />
        ))}
      </motion.div>

      {/* Confidence Footer */}
      <div className="mt-16 text-center">
        <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-6 border-b border-slate-100 pb-6 inline-block">¿Aún tienes dudas?</p>
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <a
            href="https://wa.me/526674540164"
            className="inline-flex items-center gap-3 text-slate-900 font-black text-lg hover:text-amber-600 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <ShieldCheck size={20} />
            </div>
            Hablar con un asesor senior
          </a>
        </div>
      </div>
    </section>
  );
}
