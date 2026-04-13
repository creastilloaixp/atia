import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { TrendingUp, DollarSign, ArrowRight, ShieldCheck, Loader2, Timer, Hammer, BadgeDollarSign } from 'lucide-react';
import { getFlipperDeals } from '../services/flipperService';
import type { FlipperDeal } from '../services/flipperService';

interface Props {
  onOpenForm?: () => void;
}

export const FlipperOpportunity = ({ onOpenForm }: Props = {}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  
  const [sliderPos, setSliderPos] = useState(50);
  const [deal, setDeal] = useState<FlipperDeal | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const fetchDeal = async () => {
      const deals = await getFlipperDeals();
      if (deals.length > 0) {
        setDeal(deals[0]);
      }
      setLoading(false);
    };
    fetchDeal();
  }, []);

  // Scroll-triggered entrance animations
  useEffect(() => {
    if (!loading && sectionRef.current) {
      const ctx = gsap.context(() => {
        // Title entrance
        if (titleRef.current) {
          gsap.fromTo(titleRef.current, 
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
              scrollTrigger: { trigger: titleRef.current, start: "top 85%" }
            }
          );
        }

        // Slider entrance
        if (containerRef.current) {
          gsap.fromTo(containerRef.current,
            { opacity: 0, scale: 0.96 },
            { opacity: 1, scale: 1, duration: 1, ease: "power3.out",
              scrollTrigger: { trigger: containerRef.current, start: "top 80%" }
            }
          );
        }

        // Metrics panel — staggered entrance
        if (metricsRef.current) {
          gsap.fromTo(metricsRef.current.children, 
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power3.out",
              scrollTrigger: { trigger: metricsRef.current, start: "top 80%" }
            }
          );
        }
      }, sectionRef);

      return () => ctx.revert();
    }
  }, [loading]);

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let x = 0;
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
    } else {
      x = (e as React.MouseEvent).clientX - rect.left;
    }
    const position = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSliderPos(position);
  };

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full glass-panel flex items-center justify-center">
            <Loader2 className="animate-spin text-tb-accent" size={24} />
          </div>
          <div className="absolute inset-0 rounded-full border-t-2 border-tb-accent/30 animate-spin" style={{ animationDuration: '3s' }}></div>
        </div>
        <p className="text-white/30 text-sm font-light tracking-widest uppercase">Analizando mercado...</p>
      </div>
    );
  }

  if (!deal) return null;

  return (
    <section ref={sectionRef} className="py-20 md:py-32 px-6 md:px-12 max-w-7xl mx-auto w-full" aria-label="Oportunidad de inversión">
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
        
        {/* Left Side: Before/After Slider */}
        <div className="w-full lg:w-3/5 space-y-6" ref={titleRef}>
          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-tb-accent font-bold tracking-[0.2em] text-[11px] uppercase">Deal Verificado · ROI {deal.roi}%</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-light leading-[1.1] tracking-tight">
              Esta propiedad{' '}
              <span className="text-gradient-emerald font-medium">vale ${(deal.expected_exit_price / 1000).toFixed(0)}k</span>
              <br />
              <span className="text-white/40 text-2xl md:text-3xl">Hoy la compras por ${(deal.renovation_cost / 1000 * 3).toFixed(0)}k</span>
            </h2>
            <p className="text-white/50 max-w-xl text-base md:text-lg font-light leading-relaxed">
              {deal.location} · Análisis de {new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })} — <span className="text-white/30 italic">Trinity AI · Precisión 94.7%</span>
            </p>
          </div>

          {/* Before/After Slider */}
          <div 
            ref={containerRef}
            className={`relative aspect-video rounded-3xl overflow-hidden border glass-panel-elevated cursor-ew-resize group shadow-2xl ${
              isDragging ? 'border-tb-accent/30' : 'border-white/10'
            }`}
            onMouseMove={handleMouseMove}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onTouchMove={handleMouseMove}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            role="slider"
            aria-label="Deslizar para comparar antes y después de la renovación"
            aria-valuenow={Math.round(sliderPos)}
            aria-valuemin={0}
            aria-valuemax={100}
            tabIndex={0}
          >
            {/* Before Image */}
            <img 
              src={deal.before_image} 
              alt="Propiedad antes de la renovación" 
              className="absolute inset-0 w-full h-full object-cover grayscale-[0.4] brightness-90"
              loading="lazy"
            />
            <div className="absolute top-5 left-5 glass-panel px-4 py-2 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold text-red-400/80 border-red-400/20 bg-red-500/10">
              🏚️ Propiedad Distressed
            </div>

            {/* After Image */}
            <div 
              className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
              style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
            >
              <img 
                src={deal.after_image} 
                alt="Propiedad después de la renovación"
                className="absolute inset-0 w-full h-full object-cover brightness-110 saturate-110"
                loading="lazy"
              />
              <div className="absolute top-5 right-5 glass-panel px-4 py-2 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold bg-emerald-500/20 border-emerald-400/40 text-emerald-400">
                ✨ Post-Renovación · +{deal.roi}% ROI
              </div>
            </div>

            {/* Slider Handle */}
            <div 
              className="absolute top-0 bottom-0 w-[2px] bg-white/80 z-20 pointer-events-none"
              style={{ left: `${sliderPos}%` }}
            >
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white shadow-[0_0_30px_rgba(255,255,255,0.4)] flex items-center justify-center transition-transform ${
                isDragging ? 'scale-110' : 'scale-100'
              }`}>
                <div className="flex gap-[3px]">
                  <div className="w-[2px] h-4 bg-tb-dark/80 rounded-full"></div>
                  <div className="w-[2px] h-4 bg-tb-dark/80 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Instruction */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-[10px] font-bold tracking-[0.3em] uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-700 glass-panel px-5 py-2 rounded-full border-white/10">
              Desliza para transformar
            </div>
          </div>
        </div>

        {/* Right Side: Tactical BI Metrics */}
        <div className="w-full lg:w-2/5 space-y-6 lg:sticky lg:top-32" ref={metricsRef}>
          {/* Main Metrics Panel */}
          <div className="glass-panel-elevated p-8 md:p-10 rounded-[2rem] relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute -right-20 -top-20 w-60 h-60 bg-tb-accent/5 blur-[100px] rounded-full pointer-events-none"></div>
            <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="relative space-y-6">
              {/* Title */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-tb-accent/10 flex items-center justify-center text-tb-accent border border-tb-accent/20">
                  <TrendingUp size={22} />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-medium tracking-tight">Cálculo de Plusvalía</h3>
                  <p className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-bold">Ref: {deal.id}</p>
                </div>
              </div>

              {/* KPI Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* ROI */}
                <div className="bg-white/[0.04] rounded-2xl p-5 border border-white/5 hover:border-emerald-500/20 transition-colors card-hover">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={12} className="text-emerald-400" />
                    <span className="text-white/40 text-[10px] uppercase tracking-widest font-bold">ROI Proyectado</span>
                  </div>
                  <p className="text-3xl font-light text-emerald-400">{deal.roi}%</p>
                  <div className="w-full h-1 bg-white/5 mt-3 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500/60 to-emerald-400/80 rounded-full transition-all duration-1000" style={{ width: `${Math.min(deal.roi * 2, 100)}%` }}></div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-white/[0.04] rounded-2xl p-5 border border-white/5 hover:border-tb-accent/20 transition-colors card-hover">
                  <div className="flex items-center gap-2 mb-2">
                    <Timer size={12} className="text-tb-accent" />
                    <span className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Timeline</span>
                  </div>
                  <p className="text-3xl font-light">{deal.time_estimate}</p>
                </div>

                {/* Renovation Cost */}
                <div className="bg-white/[0.04] rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-colors card-hover">
                  <div className="flex items-center gap-2 mb-2">
                    <Hammer size={12} className="text-amber-400" />
                    <span className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Costo Reforma</span>
                  </div>
                  <p className="text-2xl font-light text-white/90">
                    ${(deal.renovation_cost / 1000).toFixed(0)}k
                  </p>
                </div>

                {/* Exit Price — Highlighted */}
                <div className="bg-tb-accent/[0.06] rounded-2xl p-5 border border-tb-accent/20 hover:border-tb-accent/40 transition-colors card-hover">
                  <div className="flex items-center gap-2 mb-2">
                    <BadgeDollarSign size={12} className="text-tb-accent" />
                    <span className="text-tb-accent text-[10px] uppercase tracking-widest font-bold">Valor Final</span>
                  </div>
                  <p className="text-2xl font-medium text-white">
                    ${(deal.expected_exit_price / 1000).toFixed(0)}k
                  </p>
                </div>
              </div>

              {/* Verification Badge */}
              <div className="flex items-center gap-3 text-xs text-white/50 bg-white/[0.03] p-4 rounded-xl border border-white/5">
                <ShieldCheck size={18} className="text-tb-accent flex-shrink-0" />
                <span>Contrato exclusivo verificado por departamento legal</span>
              </div>

              {/* CTAs */}
              <div className="space-y-3 pt-2">
                <button 
                  onClick={onOpenForm}
                  className="w-full py-5 bg-white text-tb-dark rounded-2xl font-bold flex items-center justify-center gap-3 btn-press shadow-xl hover:shadow-tb-accent/10 transition-all group"
                >
                  <span className="text-base md:text-lg">Reservar esta Oportunidad</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button className="w-full py-4 border border-white/8 rounded-2xl font-medium hover:bg-white/[0.04] transition-all text-white/40 text-sm hover:text-white/70">
                  📄 Descargar Avalúo Completo (PDF Gratuito)
                </button>
              </div>
            </div>
          </div>

          {/* Algorithm Footer */}
          <div className="px-4 flex justify-between items-center text-[9px] text-white/15 font-bold uppercase tracking-[0.2em]">
            <div className="flex items-center gap-2">
              <DollarSign size={10} />
              <span>Price index: Live update</span>
            </div>
            <span>Algoritmo v4.2.1-Trinity</span>
          </div>
        </div>
      </div>
    </section>
  );
};
