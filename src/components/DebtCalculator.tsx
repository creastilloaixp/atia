import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Calculator, Building2, Receipt, 
  Zap, Droplets, User, Users, 
  ArrowRight, Landmark, BadgeCheck 
} from 'lucide-react';
import { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function DebtCalculator({ isOpen, onClose }: Props) {
  const [data, setData] = useState({
    marketValue: '1200000',
    mortgage: '450000',
    propertyTax: '25000',
    electric: '4500',
    water: '3200',
    ownerType: 'unico' as 'unico' | 'copropietario'
  });

  const [showResult, setShowResult] = useState(true);

  const calculate = () => {
    setShowResult(true);
  };

  const totalDebts = Number(data.mortgage) + Number(data.propertyTax) + Number(data.electric) + Number(data.water);
  // Estimated offer: 75% - 85% of market value
  const estimatedOffer = Number(data.marketValue) * 0.82;
  const netLiquidity = estimatedOffer - totalDebts;

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Hola! Usé la calculadora Casto "Sana tu Deuda".\n\n` +
      `🏠 Valor Propiedad: $${Number(data.marketValue).toLocaleString()}\n` +
      `💰 Deuda Total: $${totalDebts.toLocaleString()}\n` +
      `👥 Propietario: ${data.ownerType === 'unico' ? 'Único' : 'Copropietario'}\n\n` +
      `Me gustaría una validación formal.`
    );
    window.open(`https://wa.me/526674540164?text=${message}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#050505]/95 backdrop-blur-xl"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-[#0a0a0a]/90 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]"
        >
          {/* Header */}
          <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <Calculator size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white tracking-tight">
                  Calculadora <span className="text-amber-500 font-bold">Sana tu Deuda</span>
                </h2>
                <div className="flex items-center gap-3">
                  <p className="text-slate-400 text-xs uppercase tracking-widest font-bold mt-1">Simulación de Liquidez Inmediata</p>
                  <span className="mt-1 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[8px] font-bold uppercase">Ejemplo Activo</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setData({
                    marketValue: '',
                    mortgage: '',
                    propertyTax: '',
                    electric: '',
                    water: '',
                    ownerType: 'unico'
                  });
                  setShowResult(false);
                }}
                className="text-[10px] uppercase tracking-widest font-bold text-slate-400 hover:text-amber-500 transition-colors mr-4"
              >
                Limpiar Datos
              </button>
              <button 
                onClick={onClose}
                className="p-3 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="p-8 lg:p-12 overflow-y-auto max-h-[75vh]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              
              {/* Left Column: Inputs */}
              <div className="space-y-8">
                {/* Proprietary Type */}
                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold ml-1">Modalidad de Propiedad</label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setData(d => ({ ...d, ownerType: 'unico' }))}
                      className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl border transition-all ${
                        data.ownerType === 'unico' 
                        ? 'bg-amber-500/10 border-amber-500/50 text-amber-500 font-bold shadow-sm' 
                        : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <User size={18} />
                      <span className="text-sm">Único Propietario</span>
                    </button>
                    <button
                      onClick={() => setData(d => ({ ...d, ownerType: 'copropietario' }))}
                      className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl border transition-all ${
                        data.ownerType === 'copropietario' 
                        ? 'bg-amber-500/10 border-amber-500/50 text-amber-500 font-bold shadow-sm' 
                        : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <Users size={18} />
                      <span className="text-sm">Copropietario</span>
                    </button>
                  </div>
                </div>

                {/* Main Debt Inputs */}
                <div className="grid grid-cols-1 gap-6">
                  {/* Property Value */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-bold ml-1 flex items-center gap-2">
                      <Landmark size={12} className="text-amber-500" /> Valor Estimado Propiedad
                    </label>
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                      <input 
                        type="number"
                        placeholder="Ej. 1,500,000"
                        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-10 text-white placeholder:text-slate-600 focus:bg-white/10 focus:border-amber-500/40 outline-none transition-all shadow-sm"
                        value={data.marketValue}
                        onChange={e => setData(d => ({ ...d, marketValue: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Other Debts Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold ml-1 flex items-center gap-2">
                        <Building2 size={12} /> Hipoteca / Banco
                      </label>
                      <input 
                        type="number"
                        placeholder="Deuda"
                        className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-5 text-white placeholder:text-slate-600 focus:bg-white/10 focus:border-amber-500/40 outline-none transition-all text-sm shadow-sm"
                        value={data.mortgage}
                        onChange={e => setData(d => ({ ...d, mortgage: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold ml-1 flex items-center gap-2">
                        <Receipt size={12} /> Adeudo Predial
                      </label>
                      <input 
                        type="number"
                        placeholder="Deuda"
                        className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-5 text-white placeholder:text-slate-600 focus:bg-white/10 focus:border-amber-500/40 outline-none transition-all text-sm shadow-sm"
                        value={data.propertyTax}
                        onChange={e => setData(d => ({ ...d, propertyTax: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold ml-1 flex items-center gap-2">
                        <Zap size={12} /> Adeudos Luz (CFE)
                      </label>
                      <input 
                        type="number"
                        placeholder="Deuda"
                        className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-5 text-white placeholder:text-slate-600 focus:bg-white/10 focus:border-amber-500/40 outline-none transition-all text-sm shadow-sm"
                        value={data.electric}
                        onChange={e => setData(d => ({ ...d, electric: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold ml-1 flex items-center gap-2">
                        <Droplets size={12} /> Adeudos Agua
                      </label>
                      <input 
                        type="number"
                        placeholder="Deuda"
                        className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-5 text-white placeholder:text-slate-600 focus:bg-white/10 focus:border-amber-500/40 outline-none transition-all text-sm shadow-sm"
                        value={data.water}
                        onChange={e => setData(d => ({ ...d, water: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={calculate}
                  disabled={!data.marketValue}
                  className="w-full h-14 bg-gradient-to-r from-amber-600 to-amber-500 rounded-2xl font-bold text-white shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 transition-all flex items-center justify-center gap-3 group mt-8 disabled:opacity-30 disabled:hover:shadow-none"
                >
                  Calcular Sana tu Deuda
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </button>
              </div>

              {/* Right Column: Visualization */}
              <div className="relative">
                <AnimatePresence mode="wait">
                  {!showResult ? (
                    <motion.div 
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-white/5 rounded-[2rem] p-10 border border-white/10 flex flex-col items-center justify-center text-center space-y-6 min-h-[400px]"
                    >
                      <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center text-slate-400 shadow-sm">
                        <Calculator size={40} />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-slate-300 tracking-tight">Estamos listos para analizar</h3>
                        <p className="text-slate-400 text-sm max-w-[220px] mx-auto leading-relaxed">
                          Ingresa el valor estimado de tu propiedad y tus adeudos para ver el flujo neto.
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="result"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white/5 rounded-[2.5rem] p-8 lg:p-10 border border-white/10 shadow-2xl min-h-[400px] flex flex-col relative overflow-hidden"
                    >
                      {/* Decorative elements for the dark result card */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full -mr-16 -mt-16"></div>
                      
                      <div className="space-y-8 flex-1 relative z-10">
                        <div className="flex items-center gap-3">
                          <BadgeCheck className="text-emerald-400" size={20} />
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400/80">Resultados Preliminares</span>
                        </div>

                        <div className="space-y-6">
                          <div className="flex justify-between items-end border-b border-white/10 pb-4">
                            <span className="text-slate-400 text-sm font-light">Liquidez Bruta de Compra:</span>
                            <span className="text-white font-medium text-xl">${estimatedOffer.toLocaleString()}</span>
                          </div>
                          
                          <div className="flex justify-between items-end border-b border-white/10 pb-4">
                            <span className="text-slate-400 text-sm font-light">Total de Deudas Liquidadas:</span>
                            <span className="text-red-400 font-medium text-xl">- ${totalDebts.toLocaleString()}</span>
                          </div>

                          <div className="pt-6 text-center">
                            <p className="text-[11px] uppercase tracking-widest text-amber-500 font-bold mb-2">Liquidez Directa a tu Favor</p>
                            <h4 className="text-5xl font-light text-white tracking-tight mb-2">
                              ${netLiquidity > 0 ? netLiquidity.toLocaleString() : 'En Revisión'}
                            </h4>
                            <p className="text-slate-400 text-[9px] leading-relaxed max-w-[280px] mx-auto">
                              *Casto paga tus deudas al notario y tú recibes el excedente de forma inmediata el día de la firma.
                            </p>
                          </div>
                        </div>

                        {data.ownerType === 'copropietario' && (
                          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex gap-3 items-start">
                            <div className="p-2 bg-white/10 rounded-lg text-emerald-400">
                              <Users size={14} />
                            </div>
                            <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                              Nota Especial: Al haber copropietarios, calcularemos la división proporcional de excedentes y coordinaremos las firmas conjuntas para su seguridad.
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="mt-8 space-y-3 relative z-10">
                        <button 
                          onClick={handleWhatsApp}
                          className="w-full h-14 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl font-bold text-emerald-400 shadow-xl hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-3"
                        >
                          Validar estos números por WhatsApp
                        </button>
                        <button 
                          onClick={() => setShowResult(false)}
                          className="w-full text-slate-500 hover:text-slate-300 text-[10px] uppercase font-bold tracking-widest transition-colors py-2"
                        >
                          Reiniciar Cálculo
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
