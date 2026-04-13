import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import {
  AlertTriangle, Scale, Home, Zap,
  ShieldCheck, ArrowRight, CheckCircle2, MapPin,
  Clock, Loader2, Sparkles, ChevronLeft, TrendingDown
} from 'lucide-react';
import { submitLead } from '../lib/leads';

interface Props {
  onOpenForm: () => void;
  onOpenCalculator?: () => void;
  campaign?: string;
}

const situations = [
  { id: 'deuda',     icon: AlertTriangle, label: 'Debo al Infonavit / Banco', desc: 'Deuda hipotecaria activa', color: 'amber' },
  { id: 'embargo',   icon: Scale,         label: 'Mi casa tiene embargo',      desc: 'Juicio o proceso legal',  color: 'red'   },
  { id: 'intestado', icon: Home,          label: 'Herencia sin testamento',    desc: 'Regularización notarial', color: 'purple'},
  { id: 'rapido',    icon: Zap,           label: 'Solo quiero vender rápido',  desc: 'Oferta directa en 24h',  color: 'green' },
];

const locations = [
  { id: 'sinaloa',    label: 'Culiacán / Sinaloa',          icon: MapPin },
  { id: 'mazatlan',   label: 'Mazatlán',                     icon: MapPin },
  { id: 'monterrey',  label: 'Monterrey',                    icon: MapPin },
  { id: 'puebla',     label: 'Puebla',                       icon: MapPin },
  { id: 'morelia',    label: 'Morelia',                      icon: MapPin },
  { id: 'riveramaya', label: 'Playa del Carmen / Tulum',    icon: MapPin },
  { id: 'cdmx',       label: 'CDMX',                         icon: MapPin },
  { id: 'edomex',     label: 'Estado de México',             icon: MapPin },
  { id: 'sonora',     label: 'Sonora',                       icon: MapPin },
  { id: 'otro',       label: 'Otra ciudad',                  icon: MapPin },
];

const urgencies = [
  { id: 'inmediato', label: 'Menos de 7 días', icon: Clock, desc: 'Cierre express — máxima prioridad' },
  { id: 'mes',       label: '1 a 4 semanas',   icon: Clock, desc: 'Venta ágil — proceso estándar'    },
  { id: 'sin_prisa', label: 'Más de 1 mes',    icon: Clock, desc: 'Planificación — sin presión'      },
];

// ─── Animated Counter Hook ──────────────────────────────────────────────────
function useAnimatedNumber(target: number, duration = 1.2) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.floor(v).toLocaleString('es-MX'));
  
  useEffect(() => {
    const controls = animate(count, target, { duration, ease: 'easeOut' });
    return controls.stop;
  }, [target, duration, count]);

  return rounded;
}

// ─── Live Preview Panel ──────────────────────────────────────────────────────
function LivePreview({ marketValue, debts }: { marketValue: string; debts: string }) {
  const mv = Number(marketValue) || 0;
  const db = Number(debts) || 0;
  const oferta = Math.max(0, Math.round(mv * 0.82));
  const liquida = db;
  const recibes = Math.max(0, oferta - liquida);

  const animOferta  = useAnimatedNumber(oferta);
  const animLiquida = useAnimatedNumber(liquida);
  const animRecibes = useAnimatedNumber(recibes);

  const pct = mv > 0 ? Math.min(100, Math.round((recibes / mv) * 100)) : 0;
  const hasData = mv > 0;

  return (
    <div className="bg-slate-900 rounded-[2.5rem] m-1.5 p-10 flex flex-col justify-center text-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-56 h-56 bg-atia-500/10 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-sky-500/10 blur-[60px] rounded-full pointer-events-none" />

      <p className="text-atia-400 font-black tracking-[0.3em] text-[10px] uppercase mb-8 relative z-10 
                    bg-white/5 py-2 rounded-full border border-white/5 inline-block mx-auto px-6">
        Estimación de Sanación
      </p>

      <div className="space-y-5 relative z-10">
        {/* Row: Oferta */}
        <div className="flex items-center justify-between px-2">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Oferta Directa ATIA</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 border border-white/10 px-2 py-0.5 rounded-lg">~82% valor</span>
            <span className="text-white font-bold text-sm">
              {hasData ? <motion.span>{animOferta}</motion.span> : '---'}
            </span>
          </div>
        </div>

        {/* Row: Adeudos */}
        <div className="flex items-center justify-between px-2">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <TrendingDown size={12} className="text-rose-400" />
            Liquidación incluida
          </span>
          <span className="text-rose-400 font-bold text-sm">
            {hasData && db > 0 ? <><span className="text-slate-500">-</span> <motion.span>{animLiquida}</motion.span></> : <span className="text-emerald-400 text-xs border border-emerald-400/20 px-2 py-1 rounded-lg">Incluida ✓</span>}
          </span>
        </div>

        {/* Divider + progress */}
        {hasData && (
          <div className="space-y-2 pt-2 pb-1">
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-atia-500 to-atia-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            </div>
            <p className="text-[9px] text-slate-500 uppercase tracking-wider text-right">{pct}% de retorno neto</p>
          </div>
        )}

        <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Big number */}
        <div className="space-y-1 pt-2">
          <p className="text-[11px] text-atia-400/80 uppercase tracking-[0.2em] font-black">Recibirías hoy aprox.</p>
          <p className="text-5xl font-black text-white tracking-tighter leading-none">
            {hasData ? (
              <motion.span
                key={recibes}
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                $<motion.span>{animRecibes}</motion.span>
              </motion.span>
            ) : (
              <span className="text-slate-600 text-2xl">Ingresa el valor de tu casa →</span>
            )}
          </p>
          {hasData && (
            <p className="text-[9px] text-slate-600 uppercase tracking-widest mt-2 font-bold">
              * Sujeto a verificación notarial y técnica
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function SellerDiagnostic({ onOpenCalculator: _onOpenCalculator, campaign }: Props) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    situation: '',
    location: '',
    urgency: '',
    name: '',
    phone: '',
    marketValue: '',
    debts: '',
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (campaign) {
      const cityMatch = locations.find(l =>
        l.id === campaign.toLowerCase() ||
        campaign.toLowerCase().includes(l.id)
      );
      if (cityMatch) setData(prev => ({ ...prev, location: cityMatch.id }));
    }
  }, [campaign]);

  const handleSelect = (field: string, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
    if (step < 3) {
      setTimeout(() => setStep(step + 1), 300);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handleCalculatorNext = () => {
    setIsAnalyzing(true);
    setTimeout(() => { setIsAnalyzing(false); setStep(5); }, 2000);
  };

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await submitLead({
      name: data.name,
      phone: data.phone,
      city: locations.find(l => l.id === data.location)?.label || 'CDMX',
      metadata: {
        situation: data.situation,
        urgency: data.urgency,
        marketValue: data.marketValue,
        debts: data.debts,
        campaign: campaign || 'general'
      }
    });
    if (result.success) setIsSubmitted(true);
    setIsSubmitting(false);
  };

  const progress = (step / 5) * 100;

  return (
    <section
      ref={sectionRef}
      className="py-20 md:py-32 px-6 overflow-hidden relative z-20 bg-hero-gradient"
      id="diagnostico"
    >
      {/* Decorative noise texture for premium feel */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }}
      />

      <div className="max-w-4xl mx-auto relative">

        {/* ── Header ── */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <ShieldCheck size={16} className="text-emerald-500" />
            <p className="text-slate-700 font-black tracking-[0.3em] text-[11px] uppercase">
              Diagnóstico Legal Gratuito y Seguro
            </p>
          </motion.div>

          {/* Progress bar — ATIA branded */}
          <div className="relative h-2 w-72 bg-slate-100 mx-auto rounded-full overflow-hidden mb-10 shadow-inner border border-slate-200">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ background: 'linear-gradient(90deg, #F26722, #FF8A47)' }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
            {/* Shimmer effect on progress bar */}
            <motion.div
              className="absolute inset-y-0 w-12 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              animate={{ left: ['0%', '100%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
              style={{ left: '-48px' }}
            />
          </div>

          <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 text-slate-900 leading-tight">
            {step === 1 && <><span className="text-slate-500">¿Cuál es tu</span>{' '}<span className="text-gradient-atia">situación</span>?</>}
            {step === 2 && <><span className="text-slate-500">¿Dónde está</span>{' '}<span className="text-gradient-atia">tu propiedad</span>?</>}
            {step === 3 && <><span className="text-slate-500">¿Qué tan pronto</span>{' '}<span className="text-gradient-atia">buscas solución</span>?</>}
            {step === 4 && <><span className="text-slate-500">Calculando tu</span>{' '}<span className="text-gradient-atia">Liquidez Real</span></>}
            {step === 5 && <><span className="text-slate-500">Análisis de</span>{' '}<span className="text-emerald-600">Sanación</span></>}
          </h2>

          <div className="flex justify-center">
            {data.location ? (
              <span className="bg-atia-50 text-atia-700 px-4 py-1.5 rounded-full text-[11px] font-black tracking-widest uppercase border border-atia-200/60">
                Especialistas en {locations.find(l => l.id === data.location)?.label}
              </span>
            ) : (
              <span className="text-slate-500 text-[11px] font-black tracking-widest uppercase">
                Cobertura Nacional Certificada
              </span>
            )}
          </div>
        </div>

        {/* ── Diagnostic Steps ── */}
        <div className="min-h-[450px] relative">
          <AnimatePresence mode="wait">

            {/* Step 1: Situation */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {situations.map((s, i) => (
                  <motion.button
                    key={s.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    onClick={() => handleSelect('situation', s.id)}
                    className="flex items-center gap-5 p-6 rounded-[2rem] bg-white border-2 border-slate-100
                               hover:border-atia-300 hover:bg-atia-50/40 hover:shadow-xl hover:shadow-atia-500/8
                               transition-all group text-left shadow-sm shadow-slate-200/60 active:scale-[0.98]"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center
                                    group-hover:bg-atia-500 group-hover:text-white transition-all border border-slate-100 shrink-0">
                      <s.icon size={24} className="text-slate-400 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <span className="text-lg font-bold text-slate-800 block group-hover:text-atia-700 transition-colors leading-tight">
                        {s.label}
                      </span>
                      <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                        {s.desc}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            )}

            {/* Step 2: Location */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {locations.map((l, i) => (
                  <motion.button
                    key={l.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => handleSelect('location', l.id)}
                    className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all group text-left active:scale-[0.98] ${
                      data.location === l.id
                        ? 'bg-slate-900 border-slate-900 shadow-xl shadow-slate-900/20'
                        : 'bg-white border-slate-100 hover:border-atia-300/60 hover:bg-atia-50/30'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                       data.location === l.id
                         ? 'bg-atia-500 text-white'
                         : 'bg-slate-50 text-slate-400 group-hover:bg-atia-100 group-hover:text-atia-600'
                    }`}>
                      <l.icon size={18} />
                    </div>
                    <span className={`text-sm font-bold ${data.location === l.id ? 'text-white' : 'text-slate-700 group-hover:text-slate-900'}`}>
                      {l.label}
                    </span>
                  </motion.button>
                ))}
                <button
                  onClick={() => setStep(1)}
                  className="md:col-span-full flex items-center justify-center gap-2 text-slate-400
                             hover:text-slate-700 transition-colors pt-6 text-[11px] font-black uppercase tracking-widest"
                >
                  <ChevronLeft size={14} /> Regresar
                </button>
              </motion.div>
            )}

            {/* Step 3: Urgency */}
            {step === 3 && !isAnalyzing && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 gap-4 max-w-xl mx-auto"
              >
                {urgencies.map((u, i) => (
                  <motion.button
                    key={u.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => handleSelect('urgency', u.id)}
                    className="flex items-center justify-between p-7 rounded-[2.5rem] bg-white border-2 border-slate-100
                               hover:border-atia-300 hover:bg-atia-50/30 transition-all group shadow-sm active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-[1.5rem] bg-slate-50 flex items-center justify-center
                                      group-hover:bg-atia-500 group-hover:text-white transition-all">
                        <u.icon size={26} className="text-slate-400 group-hover:text-white" />
                      </div>
                      <div className="text-left">
                        <p className="text-xl font-black text-slate-800 group-hover:text-atia-700 transition-colors">{u.label}</p>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">{u.desc}</p>
                      </div>
                    </div>
                    <ArrowRight size={22} className="text-slate-200 group-hover:text-atia-500 group-hover:translate-x-1.5 transition-all" />
                  </motion.button>
                ))}
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center justify-center gap-2 text-slate-400 hover:text-slate-700
                             transition-colors pt-8 text-[11px] font-black uppercase tracking-widest"
                >
                  <ChevronLeft size={14} /> Regresar al mapa
                </button>
              </motion.div>
            )}

            {/* Analyzing State */}
            {isAnalyzing && (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center space-y-8 py-16"
              >
                <div className="relative">
                  <div className="absolute inset-0 blur-3xl rounded-full scale-150 animate-pulse"
                       style={{ background: 'radial-gradient(circle, rgba(242,103,34,0.2), transparent)' }} />
                  <Loader2 size={72} className="text-atia-500 animate-spin relative z-10" />
                  <Sparkles size={28} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-atia-400/50 animate-ping" />
                </div>
                <div className="text-center">
                  <h3 className="text-3xl font-black text-slate-900 mb-3">Analizando estrategia legal...</h3>
                  <p className="text-slate-500 text-sm tracking-[0.1em] uppercase font-bold">
                    Validando procedencia de {data.situation} en{' '}
                    {locations.find(l => l.id === data.location)?.label}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 4: Calculator — with Live Animated Preview */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="max-w-4xl mx-auto"
              >
                <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl shadow-slate-200/60 overflow-hidden">
                  <div className="grid grid-cols-1 lg:grid-cols-2">
                    {/* Left: Inputs */}
                    <div className="p-10 md:p-14 space-y-8">
                      {/* Market value */}
                      <div className="space-y-3">
                        <label className="text-[11px] uppercase tracking-[0.2em] text-slate-600 font-black ml-1 block">
                          Valor aprox. de tu casa
                        </label>
                        <div className="relative group">
                          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-2xl
                                           group-focus-within:text-atia-500 transition-colors">$</span>
                          <input
                            type="number"
                            placeholder="Ej. 1,500,000"
                            className="w-full h-18 rounded-2xl bg-slate-50 border-2 border-slate-100 px-12
                                       text-slate-900 placeholder:text-slate-300 outline-none
                                       focus:border-atia-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(242,103,34,0.1)]
                                       transition-all font-black text-2xl"
                            value={data.marketValue}
                            onChange={e => setData(prev => ({ ...prev, marketValue: e.target.value }))}
                          />
                        </div>
                      </div>

                      {/* Debts */}
                      <div className="space-y-3">
                        <label className="text-[11px] uppercase tracking-[0.2em] text-slate-600 font-black ml-1 block">
                          Adeudos Totales <span className="text-slate-400 normal-case font-medium">(opcional)</span>
                        </label>
                        <div className="relative group">
                          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-2xl
                                           group-focus-within:text-atia-500 transition-colors">$</span>
                          <input
                            type="number"
                            placeholder="Ej. 600,000"
                            className="w-full h-18 rounded-2xl bg-slate-50 border-2 border-slate-100 px-12
                                       text-slate-900 placeholder:text-slate-300 outline-none
                                       focus:border-atia-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(242,103,34,0.1)]
                                       transition-all font-black text-2xl"
                            value={data.debts}
                            onChange={e => setData(prev => ({ ...prev, debts: e.target.value }))}
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleCalculatorNext}
                        disabled={!data.marketValue}
                        className="w-full h-16 rounded-2xl font-bold text-white transition-all flex items-center
                                   justify-center gap-4 disabled:opacity-25 shadow-xl group"
                        style={{ background: !data.marketValue ? '#94a3b8' : 'linear-gradient(135deg, #F26722, #d94e0d)' }}
                      >
                        <span className="text-lg">Analizar Mi Liquidez</span>
                        <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
                      </button>

                      <p className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-wider">
                        🔒 Sin compromiso · Estimación confidencial
                      </p>
                    </div>

                    {/* Right: Live Animated Preview */}
                    <LivePreview marketValue={data.marketValue} debts={data.debts} />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 5: Final form */}
            {step === 5 && !isSubmitted && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-lg mx-auto"
              >
                <div className="bg-white p-12 rounded-[3rem] border border-slate-100 text-center relative overflow-hidden
                                shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)]">
                  {/* ATIA glow at top */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 blur-[60px] rounded-full pointer-events-none opacity-60"
                       style={{ background: 'radial-gradient(circle, rgba(242,103,34,0.2), transparent)' }} />

                  <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-7 relative"
                       style={{ background: 'rgba(242,103,34,0.1)', border: '1px solid rgba(242,103,34,0.2)' }}>
                    <Sparkles size={30} style={{ color: '#F26722' }} />
                  </div>

                  <h3 className="text-4xl font-black mb-3 text-slate-900 tracking-tight">¡Estrategia Confirmada!</h3>
                  <p className="text-slate-600 text-base mb-10 leading-relaxed font-medium px-4">
                    Hemos resuelto casos de{' '}
                    <span className="font-bold" style={{ color: '#F26722' }}>{data.situation.toUpperCase()}</span>{' '}
                    en{' '}
                    <span className="font-bold" style={{ color: '#F26722' }}>
                      {locations.find(l => l.id === data.location)?.label}
                    </span>{' '}
                    exitosamente.
                  </p>

                  <form onSubmit={handleSubmitLead} className="space-y-4 text-left">
                    <input
                      required
                      type="text"
                      placeholder="Tu nombre completo"
                      className="w-full h-16 rounded-2xl px-6 bg-slate-50 border-2 border-slate-100
                                 text-slate-900 placeholder:text-slate-400 outline-none
                                 focus:border-atia-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(242,103,34,0.08)]
                                 transition-all font-bold text-base"
                      value={data.name}
                      onChange={e => setData(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <input
                      required
                      type="tel"
                      placeholder="WhatsApp (10 dígitos)"
                      className="w-full h-16 rounded-2xl px-6 bg-slate-50 border-2 border-slate-100
                                 text-slate-900 placeholder:text-slate-400 outline-none
                                 focus:border-atia-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(242,103,34,0.08)]
                                 transition-all font-bold text-base"
                      value={data.phone}
                      onChange={e => setData(prev => ({ ...prev, phone: e.target.value }))}
                    />

                    <button
                      type="submit"
                      disabled={isSubmitting || !data.name || !data.phone}
                      className="w-full h-16 rounded-2xl font-black text-white transition-all flex items-center
                                 justify-center gap-3 group mt-4 disabled:opacity-50 text-lg tracking-tight shadow-xl"
                      style={{ background: 'linear-gradient(135deg, #059669, #047857)' }}
                    >
                      {isSubmitting ? (
                        <Loader2 size={28} className="animate-spin" />
                      ) : (
                        <>
                          <ShieldCheck size={22} />
                          Obtener Respuesta Legal
                          <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
                        </>
                      )}
                    </button>

                    <p className="text-[10px] text-slate-400 text-center pt-4 font-bold uppercase tracking-widest leading-relaxed">
                      🔐 Datos protegidos · Sin costo de gestoría · 100% Confidencial
                    </p>
                  </form>
                </div>
              </motion.div>
            )}

            {/* Success */}
            {isSubmitted && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
              >
                <div className="w-28 h-28 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10
                                border-2 border-emerald-100 shadow-xl shadow-emerald-500/10">
                  <CheckCircle2 size={52} className="text-emerald-500" />
                </div>
                <h3 className="text-5xl font-black mb-5 text-slate-900 tracking-tighter">¡Análisis en camino!</h3>
                <p className="text-slate-600 text-xl max-w-sm mx-auto mb-12 leading-relaxed font-medium">
                  Un especialista legal revisará tu caso. Recibirás respuesta vía WhatsApp en menos de 5 minutos.
                </p>
                <a
                  href={`https://wa.me/526674540164?text=Hola%2C%20acabo%20de%20completar%20el%20diagn%C3%B3stico.%20Mi%20nombre%20es%20${data.name}%20y%20mi%20situaci%C3%B3n%20es%20${data.situation}`}
                  className="inline-flex h-20 items-center justify-center px-14 rounded-[1.8rem] bg-slate-900 font-bold
                             text-white hover:bg-emerald-600 transition-all gap-5 shadow-2xl shadow-slate-400 group active:scale-[0.98]"
                >
                  <svg viewBox="0 0 24 24" className="w-7 h-7 fill-emerald-400">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span className="text-lg">Priorizar por WhatsApp</span>
                </a>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
