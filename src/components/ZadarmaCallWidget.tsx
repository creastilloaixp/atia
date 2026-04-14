import { motion, AnimatePresence } from 'framer-motion';
import { Phone, X, PhoneCall } from 'lucide-react';
import { useState } from 'react';

interface Props {
  onCallAdvisor: (phone?: string) => void;
  isCalling?: boolean;
}

export function ZadarmaCallWidget({ onCallAdvisor, isCalling = false }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [error, setError] = useState('');

  const handleCall = () => {
    const clean = phoneInput.replace(/\D/g, '');
    if (clean.length < 10) {
      setError('Mínimo 10 dígitos');
      return;
    }
    setError('');
    onCallAdvisor(clean);
  };

  return (
    <div className="fixed bottom-[5.5rem] md:bottom-28 right-4 md:right-6 z-[85] flex flex-col items-end gap-3">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="bg-white p-5 rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-slate-100 max-w-[260px] mr-1"
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-900">
                Llamada Inmediata
              </h4>
              <button 
                onClick={() => setIsExpanded(false)} 
                className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
            
            <p className="text-[11px] text-slate-500 mb-4 leading-relaxed font-medium">
              Ingresa tu teléfono y un asesor se pondrá en contacto contigo en los próximos <strong className="text-slate-900">segundos</strong>.
            </p>

            <div className="space-y-3">
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:border-atia/50 transition-colors shadow-sm">
                <span className="pl-4 pr-3 text-slate-400 font-bold text-sm border-r border-slate-200">+52</span>
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => { setPhoneInput(e.target.value); setError(''); }}
                  placeholder="Ej: 55 1234 5678"
                  className="flex-1 bg-transparent py-3.5 px-3 text-sm font-black outline-none text-slate-900 placeholder:text-slate-300 placeholder:font-medium"
                  maxLength={15}
                />
              </div>
              {error && <p className="text-rose-500 text-[10px] font-black tracking-widest uppercase pl-1">{error}</p>}
              
              <button
                onClick={handleCall}
                disabled={isCalling || !phoneInput.trim()}
                className="w-full h-12 bg-slate-900 hover:bg-black text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all flex justify-center items-center gap-2 shadow-xl shadow-slate-900/20 disabled:opacity-50 disabled:shadow-none"
              >
                {isCalling ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enlazando...
                  </span>
                ) : (
                  <>
                    <PhoneCall size={14} /> Solicitar Llamada
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isExpanded && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsExpanded(true)}
            className="w-14 h-14 rounded-full bg-slate-900 hover:bg-black flex items-center justify-center text-white shadow-[0_8px_20px_rgba(15,23,42,0.3)] transition-all relative group"
            aria-label="Abrir asistente de llamadas"
          >
            <Phone size={22} className="relative z-10" />
            <span className="absolute inset-0 rounded-full bg-slate-900 animate-ping opacity-20"></span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
