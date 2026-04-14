import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  LineChart, Home, Percent, 
  Calculator, CheckCircle2, AlertCircle,
  ArrowRight, Wallet
} from 'lucide-react';

interface CalculationResult {
  totalProjectCost: number;
  netProfit: number;
  roi: number; // Cash on Cash ROI
  isGoodDeal: boolean;
  maxAllowableOffer: number;
  cashOut: number; // Total cash invested out of pocket
  totalHoldingCosts: number;
  financingCosts: number;
}

export function FlippingCalculator() {
  // --- CLONED STATE FROM MINIWEBTOOL & ATIA BRANDING ---
  
  // Property Details
  const [purchasePrice, setPurchasePrice] = useState<number>(2500000);
  const [repairCosts, setRepairCosts] = useState<number>(450000);
  const [arv, setArv] = useState<number>(4200000);
  const [holdingPeriod, setHoldingPeriod] = useState<number>(6);
  
  // Closing Costs & Commissions
  const [buyingCostsPct, setBuyingCostsPct] = useState<number>(2);
  const [sellingCostsPct, setSellingCostsPct] = useState<number>(3);
  const [agentCommissionPct, setAgentCommissionPct] = useState<number>(6);
  
  // Financing Section
  const [isFinancing, setIsFinancing] = useState(false);
  const [ltv, setLtv] = useState<number>(80);
  const [interestRate, setInterestRate] = useState<number>(12);
  const [points, setPoints] = useState<number>(2);

  // Detailed Monthly Holding Costs
  const [taxes, setTaxes] = useState<number>(850);
  const [insurance, setInsurance] = useState<number>(1200);
  const [utilities, setUtilities] = useState<number>(1500);
  const [hoa, setHoa] = useState<number>(0);
  const [others, setOthers] = useState<number>(500);

  const [results, setResults] = useState<CalculationResult | null>(null);

  useEffect(() => {
    // 1. Closing Costs
    const buyCosts = purchasePrice * (buyingCostsPct / 100);
    const sellCosts = arv * (sellingCostsPct / 100);
    const commission = arv * (agentCommissionPct / 100);

    // 2. Holding Costs Calculation
    const monthlyHolding = taxes + insurance + utilities + hoa + others;
    const totalHolding = monthlyHolding * holdingPeriod;

    // 3. Financing Logic
    let financingCosts = 0;
    let loanAmount = 0;
    let downPayment = purchasePrice;

    if (isFinancing) {
      // Typically Financing covers Purchase Price + (sometimes repairs)
      // Here we assume LTV of the Purchase + repairs as per many hard money lenders
      loanAmount = (purchasePrice + repairCosts) * (ltv / 100);
      downPayment = (purchasePrice + repairCosts) - loanAmount;
      
      const pointsCost = loanAmount * (points / 100);
      const monthlyInterest = (loanAmount * (interestRate / 100)) / 12;
      financingCosts = pointsCost + (monthlyInterest * holdingPeriod);
    }

    // 4. Totals & Profit
    const totalCost = purchasePrice + repairCosts + buyCosts + sellCosts + commission + totalHolding + financingCosts;
    const netProfit = arv - totalCost;
    
    // Cash on Cash ROI logic
    // Cash invested: DownPayment (or full purchase if not fin) + repairs (if not fin) + buyCosts + points + totalHolding
    const initialCash = (isFinancing ? downPayment : (purchasePrice + repairCosts)) + buyCosts + (isFinancing ? (loanAmount * points / 100) : 0) + totalHolding;
    
    const roi = initialCash > 0 ? (netProfit / initialCash) * 100 : 0;

    // 5. The 70% Rule Limit
    const mao = (arv * 0.70) - repairCosts;

    setResults({
      totalProjectCost: totalCost,
      netProfit: netProfit,
      roi: roi,
      isGoodDeal: purchasePrice <= mao,
      maxAllowableOffer: mao,
      cashOut: initialCash,
      totalHoldingCosts: totalHolding,
      financingCosts: financingCosts
    });
  }, [
    purchasePrice, repairCosts, arv, holdingPeriod, buyingCostsPct, sellingCostsPct, 
    agentCommissionPct, isFinancing, ltv, interestRate, points, taxes, insurance, 
    utilities, hoa, others
  ]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(val);

  return (
    <section className="py-24 px-6 bg-[#FCFBF9]" id="calculadora-flip">
      <div className="max-w-6xl mx-auto">
        
        {/* Header - Brand First */}
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-atia/10 px-4 py-1.5 rounded-full mb-6 border border-atia/20"
          >
            <Calculator size={14} className="text-atia" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-atia">Atia Investor Engine</span>
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 mb-6">
            Calculadora de <span className="text-gradient-atia">Flipping Pro</span>
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto font-medium">
            Herramienta avanzada de análisis financiero para inversores inmobiliarios. 
            Basada en la arquitectura de MiniWebtool con el poder estético de Atia.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Inputs Section - Cloned and Organized */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* 1. Property Details */}
            <InputCard title="Detalles de la Propiedad" icon={<Home size={18} />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputGroup label="Precio de Compra" value={purchasePrice} onChange={setPurchasePrice} icon="$" />
                <InputGroup label="Presupuesto Obra" value={repairCosts} onChange={setRepairCosts} icon="$" />
                <InputGroup label="Precio Venta (ARV)" value={arv} onChange={setArv} icon="$" />
                <InputGroup label="Tiempo (Meses)" value={holdingPeriod} onChange={setHoldingPeriod} />
              </div>
            </InputCard>

            {/* 2. Closing & Commission */}
            <InputCard title="Costos de Cierre y Comisión" icon={<Percent size={18} />}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputGroup label="Cierre Compra %" value={buyingCostsPct} onChange={setBuyingCostsPct} suffix="%" />
                <InputGroup label="Cierre Venta %" value={sellingCostsPct} onChange={setSellingCostsPct} suffix="%" />
                <InputGroup label="Comisión Agente %" value={agentCommissionPct} onChange={setAgentCommissionPct} suffix="%" />
              </div>
            </InputCard>

            {/* 3. Financing Toggles */}
            <InputCard 
              title="Financiamiento" 
              icon={<Wallet size={18} />}
              action={
                <button 
                  onClick={() => setIsFinancing(!isFinancing)}
                  className={`px-5 py-2 rounded-full text-[10px] font-black transition-all border-2 ${isFinancing ? 'bg-atia border-atia text-white shadow-lg shadow-atia/20' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                >
                  {isFinancing ? 'USAR APALANCAMIENTO' : 'TODO EN EFECTIVO'}
                </button>
              }
            >
              <AnimatePresence>
                {isFinancing ? (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                    <InputGroup label="LTV (Préstamo %)" value={ltv} onChange={setLtv} suffix="%" />
                    <InputGroup label="Interés Anual" value={interestRate} onChange={setInterestRate} suffix="%" />
                    <InputGroup label="Puntos Orig." value={points} onChange={setPoints} />
                  </motion.div>
                ) : (
                  <div className="py-4 px-6 bg-slate-50 rounded-2xl text-center">
                    <p className="text-xs font-bold text-slate-400 italic">Estrategia "All Cash": El capital propio cubre el 100% de la operación.</p>
                  </div>
                )}
              </AnimatePresence>
            </InputCard>

            {/* 4. Holding Costs Breakdown */}
            <InputCard title="Gastos Mensuales de Retención" icon={<LineChart size={18} />}>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <InputGroup label="Predial" value={taxes} onChange={setTaxes} size="sm" />
                <InputGroup label="Seguros" value={insurance} onChange={setInsurance} size="sm" />
                <InputGroup label="Servicios" value={utilities} onChange={setUtilities} size="sm" />
                <InputGroup label="Mantenimiento" value={hoa} onChange={setHoa} size="sm" />
                <InputGroup label="Otros" value={others} onChange={setOthers} size="sm" />
              </div>
            </InputCard>
          </div>

          {/* Results Sidebar - Premium Aesthetic */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
            <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-atia-900/20">
              {/* Glow effects */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-atia/10 blur-[100px] rounded-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 blur-[60px] rounded-full pointer-events-none" />

              <div className="relative z-10 space-y-10">
                
                {/* Net Profit Core ROI */}
                <div className="text-center space-y-2">
                  <p className="text-atia font-black tracking-[0.4em] text-[10px] uppercase">Ganancia Neta Final</p>
                  <motion.p 
                    key={results?.netProfit}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`text-6xl font-black tracking-tighter ${results && results.netProfit < 300000 ? 'text-rose-400' : 'text-white'}`}
                  >
                    {results ? formatCurrency(results.netProfit) : '$0'}
                  </motion.p>
                  <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
                    <Percent size={14} className="text-emerald-400" />
                    <span className="text-sm font-black text-emerald-400">{results?.roi.toFixed(1)}% ROI Efectivo</span>
                  </div>
                </div>

                {/* Financial Breakdown */}
                <div className="space-y-4 pt-6 border-t border-white/5">
                  <ResultItem label="Inversión Inicial de Bolsillo" value={formatCurrency(results?.cashOut || 0)} color="text-atia" bold />
                  <ResultItem label="Costo Total de Retención" value={formatCurrency(results?.totalHoldingCosts || 0)} />
                  {isFinancing && <ResultItem label="Costo de Financiamiento" value={formatCurrency(results?.financingCosts || 0)} />}
                  <ResultItem label="Costo Final Proyecto" value={formatCurrency(results?.totalProjectCost || 0)} />
                </div>

                {/* Deal Analysis Flag */}
                <div className={`p-6 rounded-[2.5rem] border-2 transition-all duration-500 ${
                  results?.isGoodDeal 
                    ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.05)]' 
                    : 'bg-rose-500/10 border-rose-500/30'
                }`}>
                  <div className="flex items-center gap-4 mb-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${results?.isGoodDeal ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                      {results?.isGoodDeal ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                    </div>
                    <h4 className="font-black text-xs uppercase tracking-widest leading-none">
                      {results?.isGoodDeal ? 'Negocio Saludable' : 'Riesgo Crítico'}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                    {results?.isGoodDeal 
                      ? 'Tu oferta está dentro de los márgenes institucionales (Regla del 70%).' 
                      : 'El margen es demasiado estrecho para absorber imprevistos de mercado.'}
                  </p>
                </div>

                {/* Action CTA */}
                <button className="w-full h-16 bg-atia hover:bg-atia-light text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl transition-all shadow-xl shadow-atia/20 group flex items-center justify-center gap-3">
                  Validar Análisis Atia
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- SUB-COMPONENTS ---

function InputCard({ title, icon, children, action }: { title: string, icon: any, children: React.ReactNode, action?: React.ReactNode }) {
  return (
    <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-atia/5 flex items-center justify-center text-atia group-hover:bg-atia group-hover:text-white transition-all duration-300">
            {icon}
          </div>
          <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-900">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function InputGroup({ 
  label, 
  value, 
  onChange, 
  icon, 
  suffix, 
  size = 'md' 
}: { 
  label: string, 
  value: number, 
  onChange: (val: number) => void, 
  icon?: string, 
  suffix?: string, 
  size?: 'sm' | 'md'
}) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
      <div className="relative">
        {icon && <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-xl">{icon}</span>}
        <input 
          type="number" 
          value={value} 
          onChange={e => onChange(Number(e.target.value))}
          className={`w-full bg-slate-50 border-2 border-slate-50 rounded-2xl font-black text-slate-900 outline-none focus:border-atia/40 focus:bg-white transition-all ${icon ? 'pl-11' : 'px-5'} ${size === 'sm' ? 'py-3 text-sm' : 'py-5 text-xl'}`}
        />
        {suffix && <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 font-black text-xs uppercase">{suffix}</span>}
      </div>
    </div>
  );
}

function ResultItem({ 
  label, 
  value, 
  bold, 
  color = "text-slate-300" 
}: { 
  label: string, 
  value: string, 
  bold?: boolean, 
  color?: string 
}) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">{label}</span>
      <span className={`${bold ? 'text-xl font-black' : 'text-sm font-bold'} ${color} tracking-tight`}>{value}</span>
    </div>
  );
}
