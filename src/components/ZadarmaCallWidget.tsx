import { motion, AnimatePresence } from 'framer-motion';
import { Phone, X, Clock, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Props {
  onCallAdvisor: (phone?: string) => void;
  isCalling?: boolean;
}

export function ZadarmaCallWidget({ onCallAdvisor, isCalling = false }: Props) {
  const [showWidget, setShowWidget] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setShowWidget(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleCall = () => {
    const clean = phoneInput.replace(/\D/g, '');
    if (clean.length < 10) {
      setError('Ingresa un numero valido de 10 digitos');
      return;
    }
    setError('');
    // Send only the clean digits. Let the backend handle regional prefixing if needed,
    // to avoid double prefix issues like 5252...
    onCallAdvisor(clean);
  };

  if (!showWidget) return null;

  return (
    <AnimatePresence>
      <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-4 md:bottom-24 left-3 md:left-6 z-[85] max-w-[260px] md:max-w-xs"
        >
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-none blur-lg opacity-40 animate-pulse"></div>

            <div className="relative bg-[#F5F5F5] p-3.5 md:p-5 border-l-4 border-amber-600 shadow-2xl backdrop-blur-xl rounded-none">
              <button
                onClick={() => setShowWidget(false)}
                aria-label="Cerrar ventana de llamada"
                className="absolute -top-2 -right-2 w-6 h-6 bg-slate-900 rounded-none flex items-center justify-center text-slate-400 hover:text-white transition-colors shadow-lg"
              >
                <X size={12} />
              </button>

              {/* Badge */}
              <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-none text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                  <Zap size={10} />
                  Disponible Ahora
                </span>
                <span className="flex items-center gap-1 text-[10px] text-slate-500 uppercase tracking-tighter">
                  <Clock size={10} />
                  Respondemos en minutos
                </span>
              </div>

              {/* Title */}
              <h3 className="text-slate-900 font-bold text-lg md:text-2xl leading-tight mb-2 md:mb-3 tracking-tighter uppercase">
                ¿Tu propiedad tiene{' '}
                <span className="text-amber-600">deuda o embargo?</span>
              </h3>

              {/* Description */}
              <p className="text-slate-600 text-[11px] md:text-sm mb-3 md:mb-4 border-l-2 border-slate-300 pl-3">
                Asesoría legal <strong className="text-slate-900">ahora mismo</strong>. Sin costo.
              </p>

              {/* Phone input */}
              <div className="mb-3">
                <div className="flex items-center bg-white border border-slate-300 rounded-none overflow-hidden focus-within:border-amber-600 transition-colors shadow-inner">
                  <span className="px-3 text-slate-500 text-sm font-bold border-r border-slate-200">+52</span>
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => { setPhoneInput(e.target.value); setError(''); }}
                    placeholder="Tu celular (10 dígitos)"
                    aria-label="Ingresa tu número de celular de 10 dígitos"
                    className="flex-1 bg-transparent text-slate-900 text-sm py-3 pr-3 outline-none placeholder-slate-400 font-medium"
                    maxLength={15}
                  />
                </div>
                {error && <p className="text-red-600 text-[10px] mt-1 pl-1 font-bold italic uppercase">{error}</p>}
              </div>

              {/* CTA Button */}
              <button
                id="zadarma-trigger"
                onClick={handleCall}
                disabled={isCalling || !phoneInput.trim()}
                className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 hover:bg-black disabled:opacity-70 disabled:cursor-wait rounded-none font-black text-white uppercase tracking-widest transition-all transform hover:translate-x-1 active:translate-x-0 shadow-xl border-b-4 border-amber-600"
              >
                {isCalling ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-none animate-spin" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <Phone size={18} />
                    Recibir Llamada Ahora
                  </>
                )}
              </button>

              {/* Trust */}
              <p className="text-center text-[9px] text-slate-400 mt-4 uppercase tracking-widest font-medium">
                +2,700 familias atendidas · Proceso 100% legal
              </p>
            </div>
          </div>
        </motion.div>
    </AnimatePresence>
  );
}
