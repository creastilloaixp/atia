import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Sparkles, Brain, Database, Search } from 'lucide-react';
import { intelligentSearch, type SearchResponse } from '../services/geminiSearchService';
import { SearchResultCard } from './SearchResultCard';

interface Props {
  isSearching: boolean;
  query: string;
  onOpenForm?: () => void;
}

const thinkingSteps = [
  { icon: Search, text: "Interpretando tu búsqueda con NLP...", duration: 800 },
  { icon: Database, text: "Escaneando 1,200+ propiedades...", duration: 1200 },
  { icon: Brain, text: "Calculando ROI y riesgo para cada match...", duration: 1500 },
  { icon: Sparkles, text: "Generando análisis de inversión...", duration: 1000 },
];

export function PropertyResults({ isSearching, query, onOpenForm }: Props) {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lastQuery = useRef('');

  useEffect(() => {
    if (!isSearching || !query || query === lastQuery.current) return;
    lastQuery.current = query;

    let stepTimer: ReturnType<typeof setTimeout>;
    let step = 0;

    const advanceStep = () => {
      if (step < thinkingSteps.length - 1) {
        step++;
        setCurrentStep(step);
        stepTimer = setTimeout(advanceStep, thinkingSteps[step].duration);
      }
    };

    const runSearch = async () => {
      setLoading(true);
      setError(null);
      setResponse(null);
      setCurrentStep(0);

      // Start thinking animation
      stepTimer = setTimeout(advanceStep, thinkingSteps[0].duration);

      try {
        const result = await intelligentSearch(query);
        setResponse(result);
      } catch (err) {
        setError('Error al procesar la búsqueda. Intenta de nuevo.');
      } finally {
        clearTimeout(stepTimer);
        setLoading(false);
      }
    };

    runSearch();
    return () => clearTimeout(stepTimer);
  }, [isSearching, query]);

  if (!isSearching) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      className="w-full max-w-6xl mx-auto px-4 pb-24 flex-1 flex flex-col"
    >
      <div className="glass-panel bg-[#0a0a0a]/90 rounded-t-[40px] border border-b-0 border-white/5 p-6 md:p-10 flex-1 relative overflow-hidden shadow-2xl pb-32">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-tb-accent/5 blur-[120px] rounded-full pointer-events-none -translate-y-1/2"></div>

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 mb-8 relative z-10 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-light text-white mb-2 tracking-tight">
              {loading ? 'Trinity AI Analizando...' : response ? 'Resultados Inteligentes' : 'Búsqueda'}
            </h2>
            {response && (
              <p className="text-white/40 text-xs tracking-widest uppercase font-semibold">
                {response.total_found} {response.total_found === 1 ? 'propiedad encontrada' : 'propiedades encontradas'} · Query: "{query}"
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {response && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-md text-xs font-bold tracking-widest text-emerald-400 uppercase">
                {response.total_found} Matches
              </div>
            )}
            {loading && (
              <div className="bg-tb-accent/10 border border-tb-accent/20 px-4 py-1.5 rounded-md text-xs font-bold tracking-widest text-tb-accent uppercase animate-pulse">
                Procesando...
              </div>
            )}
          </div>
        </header>

        {/* Loading State — Thinking Steps */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-16 relative z-10"
            >
              {/* Brain animation */}
              <div className="relative mb-10">
                <div className="w-20 h-20 rounded-full glass-panel-elevated flex items-center justify-center">
                  <Brain className="text-tb-accent" size={32} />
                </div>
                <div className="absolute inset-0 rounded-full border-t-2 border-tb-accent/40 animate-spin" style={{ animationDuration: '2s' }}></div>
                <div className="absolute -inset-3 rounded-full border border-tb-accent/10 animate-ping" style={{ animationDuration: '3s' }}></div>
              </div>

              {/* Steps progress */}
              <div className="space-y-4 w-full max-w-sm">
                {thinkingSteps.map((step, idx) => {
                  const Icon = step.icon;
                  const isActive = idx === currentStep;
                  const isDone = idx < currentStep;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: isDone || isActive ? 1 : 0.3, x: 0 }}
                      transition={{ delay: idx * 0.15 }}
                      className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                        isActive ? 'bg-tb-accent/5 border border-tb-accent/20' : 'border border-transparent'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                        isDone ? 'bg-emerald-500/20 text-emerald-400' :
                        isActive ? 'bg-tb-accent/20 text-tb-accent' : 'bg-white/5 text-white/20'
                      }`}>
                        {isDone ? (
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          <Icon size={14} className={isActive ? 'animate-pulse' : ''} />
                        )}
                      </div>
                      <span className={`text-sm font-light ${
                        isActive ? 'text-white/80' : isDone ? 'text-white/50' : 'text-white/20'
                      }`}>
                        {step.text}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Error State */}
          {!loading && error && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 text-center relative z-10"
            >
              <p className="text-red-400/80 text-lg mb-4">{error}</p>
              <p className="text-white/30 text-sm">Verifica tu conexión e intenta de nuevo.</p>
            </motion.div>
          )}

          {/* Results */}
          {!loading && response && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8 relative z-10"
            >
              {/* Query Understanding Card */}
              <div className="bg-gradient-to-r from-tb-accent/[0.04] to-indigo-500/[0.04] rounded-2xl p-5 border border-tb-accent/10">
                <div className="flex items-center gap-2 mb-3">
                  <Brain size={14} className="text-tb-accent" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-tb-accent/70">Interpretación de Trinity AI</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-white/30 text-[10px] uppercase tracking-wider font-bold mb-1">Intención</p>
                    <p className="text-white/70 font-light">{typeof response.query_understanding.intent === 'string' ? response.query_understanding.intent : JSON.stringify(response.query_understanding.intent)}</p>
                  </div>
                  <div>
                    <p className="text-white/30 text-[10px] uppercase tracking-wider font-bold mb-1">Filtros Detectados</p>
                    <p className="text-white/70 font-light">{typeof response.query_understanding.filters_detected === 'string' ? response.query_understanding.filters_detected : JSON.stringify(response.query_understanding.filters_detected)}</p>
                  </div>
                  <div>
                    <p className="text-white/30 text-[10px] uppercase tracking-wider font-bold mb-1">Estrategia</p>
                    <p className="text-white/70 font-light">{typeof response.query_understanding.search_strategy === 'string' ? response.query_understanding.search_strategy : JSON.stringify(response.query_understanding.search_strategy)}</p>
                  </div>
                </div>
              </div>

              {/* Results Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {response.results.map((result, idx) => (
                  <SearchResultCard key={result.property.id} result={result} index={idx} onOpenForm={onOpenForm} />
                ))}
              </div>

              {/* Market Insight */}
              {response.market_insight && (
                <div className="glass-panel rounded-2xl p-6 border-white/5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={14} className="text-amber-400" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-400/70">Insight de Mercado</span>
                  </div>
                  <p className="text-white/50 text-sm font-light leading-relaxed">{response.market_insight}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
