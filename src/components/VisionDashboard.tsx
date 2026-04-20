import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AtiaLogo } from './AtiaLogo';
import {
  Phone, BarChart3, Zap, Search, MessageSquare,
  ShieldCheck, MapPin, AlertCircle, CheckCircle2,
  Copy, Sparkles, X, Home, Users, ChevronRight,
  Send, Eye, ArrowUpRight, Target, Handshake, Inbox,
  RefreshCw, ExternalLink, Bookmark, Signal, Bot, Clock
} from 'lucide-react';
import {
  getStatusConfig, getPlatformConfig, getTimeAgo, getSpeedToLeadClass,
  calculateKPIs, generateWhatsAppMessage,
  type CorretajeLead, type ExternalProperty, type BrokerInfo, type Platform
} from '../data/corretajeData';
import { fetchDashboardData, createManualLead, createManualProperty, createManualBroker } from '../services/corretajeService';

interface Props {
  onBack: () => void;
}

type Tab = 'overview' | 'pipeline' | 'inventory' | 'brokers';

// ============================================
// KPI ICON RESOLVER
// ============================================
function KpiIcon({ name, className }: { name: string; className?: string }) {
  const icons: Record<string, React.ReactNode> = {
    inbox: <Inbox className={className} />,
    target: <Target className={className} />,
    handshake: <Handshake className={className} />,
    shield: <ShieldCheck className={className} />,
    zap: <Zap className={className} />,
    check: <CheckCircle2 className={className} />,
  };
  return <>{icons[name] || <BarChart3 className={className} />}</>;
}

// ============================================
// MAIN VISION DASHBOARD
// ============================================
export function VisionDashboard({ onBack }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [selectedLead, setSelectedLead] = useState<CorretajeLead | null>(null);
  const [generatedScript, setGeneratedScript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);
  
  // Real Data State
  const [leads, setLeads] = useState<CorretajeLead[]>([]);
  const [properties, setProperties] = useState<ExternalProperty[]>([]);
  const [brokers, setBrokers] = useState<BrokerInfo[]>([]);
  const [_isLoadingData, setIsLoadingData] = useState(true);

  const [platformFilter, setPlatformFilter] = useState<Platform | 'all'>('all');
  const [showBrokerDetail, setShowBrokerDetail] = useState<BrokerInfo | null>(null);

  // Manual Creation State
  const [showAddLead, setShowAddLead] = useState(false);
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [showAddBroker, setShowAddBroker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScraping, setIsScraping] = useState(false);

  // Form State
  const [leadForm, setLeadForm] = useState({ clientName: '', phone: '', operationType: 'Compra', propertyType: 'Casa', budgetDisplay: '', budgetMax: '', sector: '', details: '', category: 'B' });
  const [propForm, setPropForm] = useState({ source: 'Externa', propertyType: 'Casa', operationType: 'Venta', priceValue: '', sector: '', bedrooms: '', bathrooms: '', notes: '' });
  const [brokerForm, setBrokerForm] = useState({ name: '', phone: '', isAISIN: false, sharesCommission: true, company: '' });

  const loadData = useCallback(async () => {
    setIsLoadingData(true);
    const data = await fetchDashboardData();
    setLeads(data.leads);
    setProperties(data.properties);
    setBrokers(data.brokers);
    setIsLoadingData(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const kpis = useMemo(() =>
    calculateKPIs(leads, properties, brokers),
    [leads, properties, brokers]
  );

  const filteredProperties = useMemo(() => {
    let props = properties;
    if (platformFilter !== 'all') {
      if (platformFilter === 'Gemas') {
        props = props.filter(p => p.isGem);
      } else {
        props = props.filter(p => p.source === platformFilter);
      }
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      props = props.filter(p =>
        p.sector.toLowerCase().includes(q) ||
        p.propertyType.toLowerCase().includes(q) ||
        p.broker.name.toLowerCase().includes(q) ||
        p.price.toLowerCase().includes(q)
      );
    }
    return props;
  }, [platformFilter, searchQuery, properties]);

  const generateAIScript = useCallback((lead: CorretajeLead) => {
    setIsGenerating(true);
    setTimeout(() => {
      const matchingProps = properties.filter(p => p.matchesLeadId === lead.id);
      const propSummary = matchingProps.length > 0
        ? `Tengo ${matchingProps.length} opción${matchingProps.length > 1 ? 'es' : ''} que encaja${matchingProps.length > 1 ? 'n' : ''}: ${matchingProps.map(p => `${p.propertyType} en ${p.sector} a ${p.price}`).join(', ')}.`
        : 'Estoy buscando opciones que se ajusten a tus necesidades.';

      const scripts: Record<string, string> = {
        A: `¡Hola ${lead.client.split(' ')[0]}! Soy de Atia Inmobiliaria. ${propSummary} ${matchingProps.some(p => p.broker.isAISIN) ? 'Una de ellas es con colega certificado AISIN.' : ''} ¿Te envío las fichas por aquí o agendamos una visita?`,
        B: `Hola ${lead.client.split(' ')[0]}, un gusto. Respecto a tu solicitud de ${lead.propertyType} en ${lead.sector}, ${propSummary} ¿Te marco 5 minutos para platicar los detalles?`,
        C: `Buenas tardes ${lead.client.split(' ')[0]}. Estamos analizando opciones para tu solicitud. En breve un asesor de nuestro equipo te contactará con las opciones disponibles.`,
      };
      setGeneratedScript(scripts[lead.category]);
      setIsGenerating(false);
    }, 1500);
  }, []);

  const copyToClipboard = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessage(id);
    setTimeout(() => setCopiedMessage(null), 2000);
  }, []);

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'pipeline', label: 'Pipeline', count: leads.length },
    { id: 'inventory', label: 'Inventario', count: properties.length },
    { id: 'brokers', label: 'Asesores', count: brokers.length },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#000000] font-sans relative overflow-y-auto">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 pt-20 lg:pt-24 pb-6 lg:pb-10">

        {/* ========== HEADER ========== */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-6 mb-1">
              <AtiaLogo height={56} showText={true} />
              <div className="h-10 w-[2px] bg-[#FF6600]/20 hidden lg:block" />
              <div>
                <p className="text-[10px] font-black tracking-[0.4em] text-[#FF6600] uppercase">Intelligence Hub v6.0</p>
                <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-[#000000] leading-none">Gestión Patrimonial</h1>
              </div>
            </div>
            <p className="text-slate-400 font-bold mt-2 uppercase text-[9px] tracking-[0.2em] flex items-center gap-2 pl-2">
              <ShieldCheck size={12} className="text-[#FF6600]" /> Unidad de Inteligencia Inmobiliaria · Monterrey | GDL | Riviera Maya
            </p>
          </motion.div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            {/* Tab Bar */}
            <div className="flex bg-white p-1 rounded-none border-2 border-slate-200 flex-1 lg:flex-initial shadow-sm">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 lg:px-5 py-2.5 rounded-none text-[10px] font-black uppercase tracking-[0.15em] transition-all flex items-center gap-1.5 ${
                    activeTab === tab.id
                      ? 'bg-[#FF6600] text-white'
                      : 'text-slate-500 hover:text-[#FF6600]'
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className={`px-2 py-0.5 text-[9px] ${
                      activeTab === tab.id ? 'bg-white/20' : 'bg-slate-100 text-slate-400'
                    }`}>{tab.count}</span>
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={onBack}
              className="px-4 h-10 rounded-xl bg-white border border-slate-200 text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 shadow-sm hover:border-red-300 hover:text-red-500 transition-all shrink-0"
            >
              Salir
            </button>
          </div>
        </header>

        {/* ========== TAB CONTENT ========== */}
        <AnimatePresence mode="wait">
          {/* ============ OVERVIEW TAB ============ */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              {/* KPI Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
                {kpis.map((kpi, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="bg-white p-6 lg:p-8 rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-9 h-9 rounded-xl bg-slate-900/5 flex items-center justify-center group-hover:bg-tb-accent/10 transition-colors">
                        <KpiIcon name={kpi.icon} className="w-4 h-4 text-slate-400 group-hover:text-tb-accent transition-colors" />
                      </div>
                      <span className={`text-[10px] font-black tracking-wider ${kpi.trendUp ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {kpi.trend}
                      </span>
                    </div>
                    <p className="type-kpi text-3xl lg:text-4xl text-slate-900 mb-1">{kpi.value}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em]">{kpi.label}</p>
                    <p className="text-[8px] text-slate-300 mt-2 uppercase tracking-wider">↳ {kpi.sub}</p>
                  </motion.div>
                ))}
              </div>

              {/* Quick Pipeline + Platform Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Recent Leads */}
                <div className="lg:col-span-3 bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b-2 border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <Signal size={16} className="text-[#FF6600]" />
                      <h3 className="text-[11px] font-black text-[#000000] uppercase tracking-[0.2em]">Monitor de Flujo de Capital</h3>
                    </div>
                    <button onClick={() => setActiveTab('pipeline')} className="text-[10px] font-black text-[#FF6600] uppercase tracking-wider flex items-center gap-1 hover:underline">
                      Ver Control Total <ArrowUpRight size={14} />
                    </button>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {leads.slice(0, 4).map((lead: CorretajeLead) => {
                      const statusConfig = getStatusConfig(lead.status);
                      const speed = getSpeedToLeadClass(lead.receivedAt);
                      return (
                        <div key={lead.id} className="p-4 lg:p-5 flex items-center gap-4 hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => { setActiveTab('pipeline'); }}>
                          {/* Category badge */}
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                            lead.category === 'A' ? 'bg-emerald-500 text-white' : lead.category === 'B' ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {lead.category}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="font-black text-sm text-slate-900 truncate">{lead.client}</p>
                              <span className={`text-[8px] font-black px-2 py-0.5 rounded-md ${statusConfig.bg} ${statusConfig.color}`}>
                                {statusConfig.label}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold truncate">
                              {lead.operationType} · {lead.propertyType} · {lead.budget} · {lead.sector}
                            </p>
                          </div>

                          {/* Options progress */}
                          <div className="hidden sm:flex flex-col items-center gap-1 shrink-0">
                            <div className="flex gap-0.5">
                              {Array.from({ length: lead.optionsTarget }).map((_, i) => (
                                <div key={i} className={`w-2.5 h-2.5 rounded-full ${i < lead.optionsFound ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                              ))}
                            </div>
                            <span className="text-[8px] font-bold text-slate-300">{lead.optionsFound}/{lead.optionsTarget}</span>
                          </div>

                          {/* Speed to lead */}
                          <div className={`text-[10px] font-black shrink-0 ${speed.color}`}>
                            {speed.label}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Platform Distribution */}
                <div className="lg:col-span-2 bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-50">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <BarChart3 size={16} className="text-amber-500" /> Propiedades por Plataforma
                    </h3>
                  </div>
                  <div className="p-6 space-y-4">
                    {(['WhatsApp', 'Wiggot', 'Lamudi', 'Tokko', 'Facebook'] as Platform[]).map(platform => {
                      const count = properties.filter(p => p.source === platform).length;
                      const cfg = getPlatformConfig(platform);
                      const pct = properties.length > 0 ? Math.round((count / properties.length) * 100) : 0;
                      return (
                        <div key={platform}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className={`text-[10px] font-black uppercase tracking-wider ${cfg.color}`}>{platform}</span>
                            <span className="text-[10px] font-black text-slate-400">{count} prop · {pct}%</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${platform === 'WhatsApp' ? 'bg-emerald-500' : platform === 'Wiggot' ? 'bg-blue-500' : platform === 'Lamudi' ? 'bg-purple-500' : platform === 'Tokko' ? 'bg-orange-500' : 'bg-indigo-500'}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, delay: 0.3 }}
                            />
                          </div>
                        </div>
                      );
                    })}

                    {/* Broker Summary */}
                    <div className="mt-6 pt-6 border-t border-slate-100">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-emerald-50 p-4 rounded-xl text-center">
                          <p className="type-kpi text-2xl text-emerald-600">{brokers.filter(b => b.isAISIN).length}</p>
                          <p className="text-[8px] font-black text-emerald-500 uppercase tracking-wider mt-1">AISIN ✓</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-xl text-center">
                          <p className="type-kpi text-2xl text-red-500">{brokers.filter(b => b.sharesCommission === false).length}</p>
                          <p className="text-[8px] font-black text-red-400 uppercase tracking-wider mt-1">No Comparten</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ============ PIPELINE TAB ============ */}
          {activeTab === 'pipeline' && (
            <motion.div key="pipeline" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} transition={{ duration: 0.3 }}>
              {/* Toolbar */}
              <div className="bg-white p-4 lg:p-6 rounded-none border-2 border-slate-200 shadow-sm mb-6 flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-none bg-[#000000] text-white flex items-center justify-center shadow-lg shrink-0">
                     <Target size={22} className="text-[#FF6600]" />
                   </div>
                   <div>
                     <h3 className="text-lg font-black text-[#000000] leading-none uppercase tracking-tight">Pipeline Estratégico</h3>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Gestión de Prospectos de Alta Filtración</p>
                   </div>
                 </div>
                 <button onClick={() => setShowAddLead(true)} className="h-11 px-6 bg-[#FF6600] text-white rounded-none font-black uppercase text-[10px] tracking-[0.15em] hover:bg-[#e05a00] transition-all flex items-center justify-center gap-2 shadow-sm">
                    <Sparkles size={14} /> Registrar Nuevo Lead
                 </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {leads.map((lead, idx) => {
                  const statusConfig = getStatusConfig(lead.status);
                  const speed = getSpeedToLeadClass(lead.receivedAt);
                  const matchingProps = properties.filter(p => p.matchesLeadId === lead.id);

                  return (
                    <motion.div
                      key={lead.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all overflow-hidden"
                    >
                      {/* Card Header */}
                      <div className="p-6 lg:p-8 border-b border-slate-50">
                        <div className="flex justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${
                              lead.category === 'A' ? 'bg-emerald-500 text-white' : lead.category === 'B' ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-600'
                            }`}>
                              {lead.category}
                            </div>
                            <div>
                              <span className={`text-[9px] font-black tracking-wider ${speed.color}`}>
                                {speed.critical && <AlertCircle size={10} className="inline mr-1" />}
                                {getTimeAgo(lead.receivedAt)} ago · {speed.label}
                              </span>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${statusConfig.bg} ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </div>

                        <h3 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight mb-1">{lead.client}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                          <MapPin size={11} /> {lead.sector}
                        </p>

                        {/* Property details */}
                        <div className="flex flex-wrap gap-2 mt-4">
                          <span className="px-3 py-1 bg-slate-50 rounded-lg text-[9px] font-bold text-slate-600">{lead.operationType}</span>
                          <span className="px-3 py-1 bg-slate-50 rounded-lg text-[9px] font-bold text-slate-600">{lead.propertyType}</span>
                          <span className="px-3 py-1 bg-amber-50 rounded-lg text-[9px] font-bold text-amber-600">{lead.budget}</span>
                          {lead.paymentMethod && (
                            <span className="px-3 py-1 bg-sky-50 rounded-lg text-[9px] font-bold text-sky-600">{lead.paymentMethod}</span>
                          )}
                        </div>
                      </div>

                      {/* Options Progress */}
                      <div className="px-6 lg:px-8 py-4 border-b border-slate-50 bg-slate-50/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Opciones Encontradas</span>
                          <span className={`text-[10px] font-black ${lead.optionsFound >= lead.optionsTarget ? 'text-emerald-500' : 'text-amber-500'}`}>
                            {lead.optionsFound} / {lead.optionsTarget}
                          </span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${lead.optionsFound >= lead.optionsTarget ? 'bg-emerald-500' : 'bg-amber-400'}`}
                            style={{ width: `${Math.min(100, (lead.optionsFound / lead.optionsTarget) * 100)}%` }}
                          />
                        </div>
                        {/* Matched properties */}
                        {matchingProps.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {matchingProps.map(p => {
                              const cfg = getPlatformConfig(p.source);
                              return (
                                <span key={p.id} className={`px-2 py-0.5 rounded text-[8px] font-black ${cfg.bg} ${cfg.color} flex items-center gap-1`}>
                                  {p.source} · {p.price}
                                  {p.matchScore && <span className="opacity-60">({p.matchScore}%)</span>}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="p-6 lg:p-8 space-y-3">
                        {/* WhatsApp Message Copy / Broadcast */}
                        <button
                          onClick={() => copyToClipboard(lead.whatsappMessage || generateWhatsAppMessage(lead), lead.id + '-wa')}
                          className={`w-full h-12 rounded-xl flex items-center justify-center gap-2 font-black uppercase text-[9px] tracking-wider transition-all text-sm shadow-sm ${
                            copiedMessage === lead.id + '-wa'
                              ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                              : 'bg-[#25D366] text-white hover:bg-[#20bd5a] border border-transparent'
                          }`}
                        >
                          {copiedMessage === lead.id + '-wa' ? (
                            <><CheckCircle2 size={14} /> ¡Copiado al Portapapeles!</>
                          ) : (
                            <><MessageSquare size={14} /> Generar Broadcast WhatsApp</>
                          )}
                        </button>

                        {/* AI Script */}
                        <button
                          onClick={() => { setSelectedLead(lead); generateAIScript(lead); }}
                          className="w-full h-12 bg-slate-900 rounded-xl flex items-center justify-center gap-2 text-white font-black uppercase text-[9px] tracking-wider hover:bg-tb-accent hover:shadow-lg hover:shadow-tb-accent/20 transition-all active:scale-[0.98]"
                        >
                          <Sparkles size={14} className="text-amber-400" /> Generar Script AI
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ============ INVENTORY TAB ============ */}
          {activeTab === 'inventory' && (
            <motion.div key="inventory" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              {/* Toolbar */}
              <div className="bg-white p-4 lg:p-6 rounded-[1.5rem] border border-slate-100 shadow-sm mb-6 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
                    <Home size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 leading-none">Escáner de Inventario</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Cruza tus Leads con redes de corretaje</p>
                      <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                      <p className="text-[9px] font-black text-emerald-500 uppercase tracking-wider flex items-center gap-1">
                        <Clock size={8} /> Sincronizado: Hoy
                      </p>
                    </div>
                  </div>
                </div>

                {/* Scrape Data Button */}
                <button 
                  disabled={isScraping}
                  onClick={async () => {
                    setIsScraping(true);
                    try {
                      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/corretaje-scraper`, { method: 'POST' });
                      const d = await res.json();
                      alert(`✅ ${d.message}`);
                      if (d.data) {
                        const newProps = d.data.map((p: { broker?: any; source?: string }) => ({
                          ...p,
                          broker: p.broker || { name: 'Automated Scraper', company: p.source || 'Portal', isAISIN: false }
                        }));
                        setProperties((prev: Array<any>) => [...newProps, ...prev]);
                        setPlatformFilter('all'); // Cambiar a todas para ver los nuevos
                      }
                    } catch (e) {
                      alert('❌ Error al escanear portales');
                    }
                    setIsScraping(false);
                  }} 
                  className="h-10 px-4 bg-slate-900 disabled:opacity-60 text-white rounded-xl font-black uppercase text-[9px] tracking-wider hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shrink-0"
                >
                   <Bot size={14} className={isScraping ? "animate-pulse text-amber-500" : "text-amber-500"} /> 
                   {isScraping ? 'Escaneando...' : 'Auto-Scrape'}
                </button>

                {/* Add Property Button */}
                <button onClick={() => setShowAddProperty(true)} className="h-10 px-4 bg-emerald-500 text-white rounded-xl font-black uppercase text-[9px] tracking-wider hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shrink-0">
                   <Home size={14} /> + Inmueble
                </button>

                {/* Platform Filter */}
                <div className="flex gap-1.5 flex-wrap">
                  {(['all', 'Gemas', 'WhatsApp', 'Wiggot', 'Lamudi', 'Tokko', 'Facebook'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setPlatformFilter(p)}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                        platformFilter === p
                          ? p === 'Gemas' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-slate-900 text-white'
                          : p === 'Gemas' ? 'bg-amber-50 border border-amber-200 text-amber-600 hover:bg-amber-100' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                      }`}
                    >
                      {p === 'Gemas' && <Zap size={10} />}
                      {p === 'all' ? 'Todas' : p}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div className="relative lg:w-72">
                  <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    type="text"
                    placeholder="Buscar sector, precio..."
                    className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-10 outline-none focus:border-amber-500 transition-all font-bold text-xs"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Property Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProperties.map((prop, idx) => {
                  const platformCfg = getPlatformConfig(prop.source);
                  const matchedLead = leads.find(l => l.id === prop.matchesLeadId);

                  return (
                    <motion.div
                      key={prop.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      className={`bg-white rounded-[1.5rem] border shadow-sm hover:shadow-lg transition-all flex flex-col group relative ${
                        prop.isGem ? 'border-amber-400 bg-gradient-to-br from-white to-amber-50/30' : 
                        prop.status === 'rejected' ? 'border-red-100 opacity-60' : 'border-slate-100 hover:border-amber-200'
                      }`}
                    >
                      {/* AI Intelligence Ribbon */}
                      {prop.isGem && (
                         <div className="absolute -top-2 -right-2 z-10">
                            <motion.div 
                              initial={{ scale: 0 }} 
                              animate={{ scale: 1 }} 
                              className="bg-amber-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter flex items-center gap-1 shadow-lg border-2 border-white"
                            >
                              <Sparkles size={10} /> {Math.abs(prop.marketDeviation || 0)}% Bajo Mercado
                            </motion.div>
                         </div>
                      )}
                      {/* Property Image Header */}
                      <div className="relative h-48 w-full overflow-hidden rounded-t-[1.5rem] bg-slate-100 group">
                        {prop.imageUrl ? (
                          <img 
                            src={prop.imageUrl} 
                            alt={prop.sector}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=800';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-50">
                            <Home size={32} className="text-slate-200" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      <div className="p-6 flex-1">
                        {/* Top badges */}
                        <div className="flex justify-between items-start mb-4">
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${platformCfg.bg} ${platformCfg.color}`}>
                            {prop.source}
                            {prop.isGem && " · GEM"}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {prop.matchesLeadId && (
                              <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg text-[8px] font-black uppercase flex items-center gap-1">
                                <Zap size={9} /> Match {prop.matchScore}%
                              </span>
                            )}
                            {prop.status === 'rejected' && (
                              <span className="bg-red-50 text-red-500 px-2 py-1 rounded-lg text-[8px] font-black uppercase">Rechazado</span>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-[12px] font-black text-slate-900 flex items-center gap-1">
                            {prop.propertyType} 
                            {prop.externalLink && <ArrowUpRight size={10} className="text-slate-400 group-hover:text-amber-500 transition-colors" />}
                          </h4>
                          <Bookmark size={14} className="text-slate-200 hover:text-amber-500 cursor-pointer transition-colors" />
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-4">
                          <MapPin size={10} /> {prop.sector}
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <div className="bg-slate-50 p-3 rounded-xl text-center">
                            <p className="text-[7px] font-black text-slate-300 uppercase">Precio</p>
                            <p className="text-sm font-black text-slate-800">{prop.price}</p>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl text-center">
                            <p className="text-[7px] font-black text-slate-300 uppercase">Comisión</p>
                            <p className="text-sm font-black text-amber-600">{prop.commission || '—'}</p>
                          </div>
                        </div>

                        {prop.bedrooms && (
                          <div className="flex gap-3 text-[10px] text-slate-600 font-bold">
                            {prop.bedrooms && <span>{prop.bedrooms} Rec</span>}
                            {prop.bathrooms && <span>· {prop.bathrooms} Baños</span>}
                          </div>
                        )}

                        {/* Matched Lead indicator */}
                        {matchedLead && (
                          <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                            <p className="text-[8px] font-black text-emerald-600 uppercase tracking-wider mb-1">Coincide con Lead</p>
                            <p className="text-xs font-bold text-emerald-700">{matchedLead.client} — {matchedLead.budget}</p>
                          </div>
                        )}
                      </div>

                      <div className="p-6 pt-0 space-y-3">
                        <button
                          onClick={() => setShowBrokerDetail(prop.broker)}
                          className="w-full flex items-center gap-3 p-3 rounded-none bg-slate-50 border border-slate-100 hover:border-[#FF6600]/30 transition-all cursor-pointer"
                        >
                          <div className={`w-10 h-10 rounded-none flex items-center justify-center text-xs font-black ${
                            prop.broker.isAISIN ? 'bg-[#FF6600] text-white' : 'bg-slate-200 text-slate-500'
                          }`}>
                            {prop.broker.isAISIN ? <ShieldCheck size={18} /> : <Users size={18} />}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-[10px] font-black text-slate-900 uppercase">{showBrokerDetail?.name || prop.broker.name}</p>
                            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">{showBrokerDetail?.company || prop.broker.company || 'Independiente'}</p>
                          </div>
                          <ChevronRight size={14} className="text-slate-300" />
                        </button>

                        {prop.status !== 'rejected' && (
                          <button 
                            onClick={() => {
                              if (prop.externalLink) {
                                window.open(prop.externalLink, '_blank');
                              } else {
                                setShowBrokerDetail(prop.broker);
                              }
                            }}
                            className="w-full h-11 bg-[#000000] text-white rounded-none font-black uppercase text-[10px] tracking-[0.15em] hover:bg-[#FF6600] transition-all flex items-center justify-center gap-2"
                          >
                            <ExternalLink size={14} /> {prop.externalLink ? 'Análisis Externo' : 'Contactar Centro'}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              {/* AI Intelligence Status Footer */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-12 p-8 rounded-none bg-white border-2 border-slate-200 border-l-8 border-l-[#FF6600] text-[#000000] relative overflow-hidden group"
              >
                <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-none bg-[#FF6600] flex items-center justify-center text-white shadow-xl relative">
                       <Bot size={32} />
                       <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-none bg-[#FF6600]/10 text-[#FF6600] text-[9px] font-black uppercase tracking-widest border border-[#FF6600]/30">Motor IA Activo</span>
                        <span className="text-emerald-500 text-[9px] font-black flex items-center gap-1 uppercase tracking-wider"><Signal size={10} /> Enlace Satelital Activo</span>
                      </div>
                      <h3 className="text-xl font-black uppercase tracking-tight mb-1 text-[#000000]">Inteligencia Atia Inmobiliaria</h3>
                      <p className="text-[11px] text-slate-600 max-w-md leading-relaxed font-bold">
                        Nuestro núcleo de automatización cruza datos de <span className="text-[#FF6600]">Wiggot, Lamudi y Tokko</span> cada 15 minutes mediante Python para detectar oportunidades críticas.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={() => {
                        const icon = document.getElementById('ai-pulse-icon');
                        if(icon) icon.classList.add('animate-spin');
                        setTimeout(() => { if(icon) icon.classList.remove('animate-spin'); }, 2000);
                      }}
                      className="h-12 px-8 bg-[#000000] text-white rounded-none font-black uppercase text-[10px] tracking-[0.2em] hover:bg-[#FF6600] transition-all flex items-center gap-3"
                    >
                      <RefreshCw id="ai-pulse-icon" size={18} /> Sincronizar Capas
                    </button>
                    <div className="h-12 px-6 bg-slate-100 rounded-none border-2 border-slate-200 flex flex-col justify-center">
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Oportunidades Hoy</p>
                      <p className="text-lg font-black text-[#FF6600]">12 Unidades</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* ============ BROKERS TAB ============ */}
          {activeTab === 'brokers' && (
            <motion.div key="brokers" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              {/* Summary cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Total Asesores', value: brokers.length, color: 'bg-slate-900', textColor: 'text-white' },
                  { label: 'AISIN Verificados', value: brokers.filter(b => b.isAISIN).length, color: 'bg-emerald-500', textColor: 'text-white' },
                  { label: 'Comparten Comisión', value: brokers.filter(b => b.sharesCommission).length, color: 'bg-tb-accent', textColor: 'text-white' },
                  { label: 'No Comparten', value: brokers.filter(b => b.sharesCommission === false).length, color: 'bg-red-500', textColor: 'text-white' },
                ].map((card, idx) => (
                  <div key={idx} className={`${card.color} ${card.textColor} p-6 rounded-2xl`}>
                    <p className="type-kpi text-3xl mb-1">{card.value}</p>
                    <p className="text-[9px] font-black uppercase tracking-wider opacity-70">{card.label}</p>
                  </div>
                ))}
              </div>

              {/* Broker Table */}
              <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Users size={16} className="text-amber-500" /> Base de Asesores
                    </h3>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mt-1">Guía Corretaje · Registro Centralizado</span>
                  </div>
                  <button onClick={() => setShowAddBroker(true)} className="h-10 px-4 bg-slate-900 text-white rounded-xl font-black uppercase text-[9px] tracking-wider hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shrink-0">
                     <Users size={14} /> + Asesor Rápido
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100">
                        {['Asesor', 'Empresa', 'AISIN', 'Comisión', 'Propiedades', 'Estado', 'Acciones'].map(h => (
                          <th key={h} className="px-6 py-4 text-left text-[8px] font-black text-slate-400 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {brokers.map(broker => (
                        <tr key={broker.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${
                                broker.isAISIN ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                              }`}>
                                {broker.name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-xs font-black text-slate-900">{broker.name}</p>
                                <p className="text-[9px] text-slate-400">{broker.phone}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-[10px] font-bold text-slate-600">{broker.company || '—'}</td>
                          <td className="px-6 py-4">
                            {broker.isAISIN ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md text-[9px] font-black">
                                <ShieldCheck size={10} /> Sí
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold text-slate-400">No</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {broker.sharesCommission === true ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md text-[9px] font-black">
                                <CheckCircle2 size={10} /> Comparte
                              </span>
                            ) : broker.sharesCommission === false ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-500 rounded-md text-[9px] font-black">
                                <X size={10} /> No
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold text-amber-500">Pendiente</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="type-kpi text-lg text-slate-700">{broker.totalProperties}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider ${
                              broker.status === 'aisin_verified' ? 'bg-emerald-50 text-emerald-600' :
                              broker.status === 'shares_commission' ? 'bg-sky-50 text-sky-600' :
                              broker.status === 'no_commission' ? 'bg-red-50 text-red-500' :
                              'bg-amber-50 text-amber-600'
                            }`}>
                              {broker.status === 'aisin_verified' ? 'Verificado' :
                               broker.status === 'shares_commission' ? 'Comparte' :
                               broker.status === 'no_commission' ? 'No Comparte' : 'Pendiente'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 flex items-center justify-center transition-colors" title="Llamar">
                                <Phone size={13} />
                              </button>
                              <button className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-sky-50 text-slate-400 hover:text-sky-600 flex items-center justify-center transition-colors" title="WhatsApp">
                                <MessageSquare size={13} />
                              </button>
                              <button
                                onClick={() => setShowBrokerDetail(broker)}
                                className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-amber-50 text-slate-400 hover:text-amber-600 flex items-center justify-center transition-colors"
                                title="Ver Detalle"
                              >
                                <Eye size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Legend */}
                <div className="p-4 border-t border-slate-50 flex items-center gap-4 text-[8px] font-bold text-slate-300 uppercase tracking-wider">
                  <span className="flex items-center gap-1"><ShieldCheck size={10} className="text-emerald-400" /> AISIN = Asociación Inmobiliaria de Sinaloa</span>
                  <span>·  Fuente: Guía de Corretaje Atia Inmobiliaria</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========== AI SCRIPT MODAL ========== */}
        <AnimatePresence>
          {selectedLead && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
              onClick={() => setSelectedLead(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 10 }}
                className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 flex justify-between items-center text-white">
                  <div>
                    <h4 className="text-xl font-black tracking-tight">{selectedLead.client}</h4>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-tb-accent flex items-center gap-2 mt-1">
                      <Sparkles size={11} /> Script Estratégico AI · Cat {selectedLead.category}
                    </p>
                  </div>
                  <button onClick={() => setSelectedLead(null)} className="opacity-40 hover:opacity-100 transition-opacity">
                    <X size={22} />
                  </button>
                </div>

                {/* Context */}
                <div className="p-8 space-y-6">
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-2">Contexto del Lead</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-white rounded text-[9px] font-bold text-slate-600 border border-slate-200">{selectedLead.operationType}</span>
                      <span className="px-2 py-1 bg-white rounded text-[9px] font-bold text-slate-600 border border-slate-200">{selectedLead.propertyType}</span>
                      <span className="px-2 py-1 bg-amber-50 rounded text-[9px] font-bold text-amber-600 border border-amber-200">{selectedLead.budget}</span>
                      <span className="px-2 py-1 bg-white rounded text-[9px] font-bold text-slate-600 border border-slate-200">{selectedLead.sector}</span>
                    </div>
                  </div>

                  {/* AI Script Output */}
                  <div className="bg-slate-50 p-6 rounded-xl relative min-h-[120px] flex items-center justify-center border border-slate-100">
                    {isGenerating ? (
                      <div className="flex flex-col items-center gap-3">
                        <RefreshCw size={24} className="text-tb-accent animate-spin" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Generando script personalizado...</p>
                      </div>
                    ) : (
                      <div className="w-full">
                        <p className="text-[8px] font-black text-emerald-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <CheckCircle2 size={10} /> Script Generado
                        </p>
                        <p className="text-sm text-slate-700 font-medium leading-relaxed">"{generatedScript}"</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => copyToClipboard(generatedScript, 'script')}
                      className={`h-12 rounded-xl flex items-center justify-center gap-2 font-black uppercase text-[9px] tracking-wider transition-all ${
                        copiedMessage === 'script' ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      {copiedMessage === 'script' ? <><CheckCircle2 size={14} /> Copiado</> : <><Copy size={14} /> Copiar</>}
                    </button>
                    <button
                      onClick={() => {
                        const phone = '526672376768';
                        const text = encodeURIComponent(generatedScript);
                        window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
                      }}
                      className="h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center gap-2 font-black uppercase text-[9px] tracking-wider hover:bg-emerald-700 transition-all"
                    >
                      <Send size={14} /> Enviar WhatsApp
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========== BROKER DETAIL MODAL ========== */}
        <AnimatePresence>
          {showBrokerDetail && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
              onClick={() => setShowBrokerDetail(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 10 }}
                className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                <div className={`p-8 ${showBrokerDetail.isAISIN ? 'bg-emerald-600' : 'bg-slate-800'} text-white`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.3em] mb-2 opacity-60">
                        {showBrokerDetail.isAISIN ? '✓ AISIN VERIFICADO' : 'ASESOR EXTERNO'}
                      </p>
                      <h4 className="text-2xl font-black tracking-tight">{showBrokerDetail.name}</h4>
                      <p className="text-sm opacity-70 mt-1">{showBrokerDetail.company || 'Independiente'}</p>
                    </div>
                    <button onClick={() => setShowBrokerDetail(null)} className="opacity-40 hover:opacity-100">
                      <X size={22} />
                    </button>
                  </div>
                </div>

                <div className="p-8 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-4 rounded-xl text-center">
                      <p className="type-kpi text-2xl text-slate-900">{showBrokerDetail.totalProperties}</p>
                      <p className="text-[8px] font-black text-slate-400 uppercase mt-1">Propiedades</p>
                    </div>
                    <div className={`p-4 rounded-xl text-center ${
                      showBrokerDetail.sharesCommission ? 'bg-emerald-50' : showBrokerDetail.sharesCommission === false ? 'bg-red-50' : 'bg-amber-50'
                    }`}>
                      <p className={`type-kpi text-2xl ${
                        showBrokerDetail.sharesCommission ? 'text-emerald-600' : showBrokerDetail.sharesCommission === false ? 'text-red-500' : 'text-amber-500'
                      }`}>
                        {showBrokerDetail.sharesCommission ? 'Sí' : showBrokerDetail.sharesCommission === false ? 'No' : '?'}
                      </p>
                      <p className="text-[8px] font-black text-slate-400 uppercase mt-1">Comparte Com.</p>
                    </div>
                  </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                        <Phone size={14} className="text-slate-400" />
                        <span className="text-sm font-bold text-slate-700">
                          {showBrokerDetail.phone === 'Ver en Portal' ? 'Disponible en enlace externo' : showBrokerDetail.phone}
                        </span>
                      </div>
                      {showBrokerDetail.email && (
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                          <MessageSquare size={14} className="text-slate-400" />
                          <span className="text-sm font-bold text-slate-700">{showBrokerDetail.email}</span>
                        </div>
                      )}
                    </div>

                  {showBrokerDetail.notes && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                      <p className="text-[8px] font-black text-amber-600 uppercase tracking-wider mb-1">Nota</p>
                      <p className="text-xs text-amber-700">{showBrokerDetail.notes}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <a
                      href={`tel:${showBrokerDetail.phone}`}
                      className="h-11 bg-slate-900 text-white rounded-xl flex items-center justify-center gap-2 font-black uppercase text-[9px] tracking-wider hover:bg-slate-700 transition-all"
                    >
                      <Phone size={13} /> Llamar
                    </a>
                    <a
                      href={`https://wa.me/52${showBrokerDetail.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-11 bg-emerald-600 text-white rounded-xl flex items-center justify-center gap-2 font-black uppercase text-[9px] tracking-wider hover:bg-emerald-700 transition-all"
                    >
                      <MessageSquare size={13} /> WhatsApp
                    </a>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========== ADD LEAD MODAL ========== */}
        <AnimatePresence>
          {showAddLead && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm" onClick={() => !isSubmitting && setShowAddLead(false)}>
              <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }} className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
                   <h4 className="text-lg font-black tracking-tight">Registrar Nuevo Prospecto</h4>
                   <button onClick={() => !isSubmitting && setShowAddLead(false)} className="opacity-40 hover:opacity-100"><X size={20} /></button>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">Nombre Cliente</label>
                       <input type="text" className="w-full h-10 px-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:border-amber-500" value={leadForm.clientName} onChange={e => setLeadForm(f=>({...f, clientName: e.target.value}))} />
                     </div>
                     <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">Teléfono</label>
                       <input type="text" className="w-full h-10 px-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:border-amber-500" value={leadForm.phone} onChange={e => setLeadForm(f=>({...f, phone: e.target.value}))} />
                     </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">Operación</label>
                       <select className="w-full h-10 px-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:border-amber-500" value={leadForm.operationType} onChange={e => setLeadForm(f=>({...f, operationType: e.target.value}))}><option>Compra</option><option>Venta</option><option>Renta</option></select>
                     </div>
                     <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">Inmueble</label>
                       <select className="w-full h-10 px-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:border-amber-500" value={leadForm.propertyType} onChange={e => setLeadForm(f=>({...f, propertyType: e.target.value}))}><option>Casa</option><option>Departamento</option><option>Terreno</option><option>Local Comercial</option><option>Oficina</option><option>Bodega</option></select>
                     </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">Presup. Aprox (ej. $3M)</label>
                       <input type="text" className="w-full h-10 px-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:border-amber-500" value={leadForm.budgetDisplay} onChange={e => setLeadForm(f=>({...f, budgetDisplay: e.target.value}))} />
                     </div>
                     <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">Monto Max (MXN)</label>
                       <input type="number" className="w-full h-10 px-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:border-amber-500" value={leadForm.budgetMax} onChange={e => setLeadForm(f=>({...f, budgetMax: e.target.value}))} />
                     </div>
                   </div>
                   <div>
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">Sector / Zona</label>
                     <input type="text" className="w-full h-10 px-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:border-amber-500" value={leadForm.sector} onChange={e => setLeadForm(f=>({...f, sector: e.target.value}))} />
                   </div>
                   <div>
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">Categoría (A urgente, C genérico)</label>
                       <select className="w-full h-10 px-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:border-amber-500" value={leadForm.category} onChange={e => setLeadForm(f=>({...f, category: e.target.value}))}><option>A</option><option>B</option><option>C</option></select>
                   </div>
                </div>
                <div className="p-6 bg-slate-50 flex justify-end gap-3 rounded-b-[2rem]">
                   <button disabled={isSubmitting} onClick={() => setShowAddLead(false)} className="px-5 h-11 text-[9px] font-black uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors">Cancelar</button>
                   <button disabled={isSubmitting} onClick={async () => {
                     setIsSubmitting(true);
                     await createManualLead(leadForm);
                     await loadData();
                     setIsSubmitting(false);
                     setShowAddLead(false);
                     setLeadForm({ clientName: '', phone: '', operationType: 'Compra', propertyType: 'Casa', budgetDisplay: '', budgetMax: '', sector: '', details: '', category: 'B' });
                   }} className="px-5 h-11 bg-tb-accent text-white rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all">
                     {isSubmitting ? 'Guardando...' : 'Registrar Lead'}
                   </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========== ADD PROPERTY MODAL ========== */}
        <AnimatePresence>
          {showAddProperty && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm" onClick={() => !isSubmitting && setShowAddProperty(false)}>
              <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }} className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="bg-emerald-600 p-6 flex justify-between items-center text-white">
                   <h4 className="text-lg font-black tracking-tight">Vincular Nuevo Inmueble</h4>
                   <button onClick={() => !isSubmitting && setShowAddProperty(false)} className="opacity-40 hover:opacity-100"><X size={20} /></button>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">Plataforma Origen</label>
                       <select className="w-full h-10 px-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500" value={propForm.source} onChange={e => setPropForm(f=>({...f, source: e.target.value}))}><option>Externa</option><option>WhatsApp</option><option>Wiggot</option><option>Lamudi</option><option>Facebook</option><option>Tokko</option></select>
                     </div>
                     <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">Tipo Inmueble</label>
                       <select className="w-full h-10 px-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500" value={propForm.propertyType} onChange={e => setPropForm(f=>({...f, propertyType: e.target.value}))}><option>Casa</option><option>Departamento</option><option>Terreno</option><option>Local Comercial</option></select>
                     </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">Operación</label>
                       <select className="w-full h-10 px-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500" value={propForm.operationType} onChange={e => setPropForm(f=>({...f, operationType: e.target.value}))}><option>Venta</option><option>Renta</option></select>
                     </div>
                     <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">Precio Valor Numérico</label>
                       <input type="number" className="w-full h-10 px-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500" value={propForm.priceValue} onChange={e => setPropForm(f=>({...f, priceValue: e.target.value}))} />
                     </div>
                   </div>
                   <div>
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">Sector / Zona / Colonia</label>
                     <input type="text" className="w-full h-10 px-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500" value={propForm.sector} onChange={e => setPropForm(f=>({...f, sector: e.target.value}))} />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">Recámaras</label>
                       <input type="number" className="w-full h-10 px-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500" value={propForm.bedrooms} onChange={e => setPropForm(f=>({...f, bedrooms: e.target.value}))} />
                     </div>
                     <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">Baños</label>
                       <input type="number" className="w-full h-10 px-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500" value={propForm.bathrooms} onChange={e => setPropForm(f=>({...f, bathrooms: e.target.value}))} />
                     </div>
                   </div>
                   <div>
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">Notas del Asesor / Link Externo</label>
                     <textarea className="w-full h-20 p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 resize-none" value={propForm.notes} onChange={e => setPropForm(f=>({...f, notes: e.target.value}))} />
                   </div>
                </div>
                <div className="p-6 bg-slate-50 flex justify-end gap-3 rounded-b-[2rem]">
                   <button disabled={isSubmitting} onClick={() => setShowAddProperty(false)} className="px-5 h-11 text-[9px] font-black uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors">Cancelar</button>
                   <button disabled={isSubmitting} onClick={async () => {
                     setIsSubmitting(true);
                     await createManualProperty(propForm);
                     await loadData();
                     setIsSubmitting(false);
                     setShowAddProperty(false);
                     setPropForm({ source: 'Externa', propertyType: 'Casa', operationType: 'Venta', priceValue: '', sector: '', bedrooms: '', bathrooms: '', notes: '' });
                   }} className="px-5 h-11 bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all">
                     {isSubmitting ? 'Guardando...' : 'Crear Inmueble'}
                   </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========== ADD BROKER MODAL ========== */}
        <AnimatePresence>
          {showAddBroker && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm" onClick={() => !isSubmitting && setShowAddBroker(false)}>
              <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }} className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
                   <h4 className="text-lg font-black tracking-tight flex items-center gap-2"><Users size={18} className="text-amber-500" /> Registrar Asesor Externo</h4>
                   <button onClick={() => !isSubmitting && setShowAddBroker(false)} className="opacity-40 hover:opacity-100"><X size={20} /></button>
                </div>
                <div className="p-6 space-y-4">
                   <div>
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">Nombre del Asesor</label>
                     <input type="text" placeholder="Ej. Juan Pérez" className="w-full h-10 px-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:border-amber-500" value={brokerForm.name} onChange={e => setBrokerForm(f=>({...f, name: e.target.value}))} />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">Teléfono (WhatsApp)</label>
                       <input type="text" placeholder="667..." className="w-full h-10 px-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:border-amber-500" value={brokerForm.phone} onChange={e => setBrokerForm(f=>({...f, phone: e.target.value}))} />
                     </div>
                     <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">Inmobiliaria / Empresa</label>
                       <input type="text" placeholder="Independiente, KW..." className="w-full h-10 px-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:border-amber-500" value={brokerForm.company} onChange={e => setBrokerForm(f=>({...f, company: e.target.value}))} />
                     </div>
                   </div>
                   <div className="flex gap-4 pt-2">
                     <label className="flex items-center gap-2 cursor-pointer">
                       <input type="checkbox" className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 border-slate-300" checked={brokerForm.sharesCommission} onChange={e => setBrokerForm(f=>({...f, sharesCommission: e.target.checked}))} />
                       <span className="text-xs font-bold text-slate-700">Comparte Comisión</span>
                     </label>
                     <label className="flex items-center gap-2 cursor-pointer">
                       <input type="checkbox" className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 border-slate-300" checked={brokerForm.isAISIN} onChange={e => setBrokerForm(f=>({...f, isAISIN: e.target.checked}))} />
                       <span className="text-xs font-bold text-slate-700">Asociado AISIN</span>
                     </label>
                   </div>
                </div>
                <div className="p-6 bg-slate-50 flex justify-end gap-3 rounded-b-[2rem]">
                   <button disabled={isSubmitting} onClick={() => setShowAddBroker(false)} className="px-5 h-11 text-[9px] font-black uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors">Cancelar</button>
                   <button disabled={isSubmitting || !brokerForm.name || !brokerForm.phone} onClick={async () => {
                     setIsSubmitting(true);
                     await createManualBroker(brokerForm);
                     await loadData();
                     setIsSubmitting(false);
                     setShowAddBroker(false);
                     setBrokerForm({ name: '', phone: '', isAISIN: false, sharesCommission: true, company: '' });
                   }} className="px-5 h-11 bg-slate-900 disabled:opacity-50 text-white rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-2 hover:bg-slate-800 transition-all">
                     {isSubmitting ? 'Guardando...' : 'Registrar Asesor'}
                   </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
