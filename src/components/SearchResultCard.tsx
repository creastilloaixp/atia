import { motion } from 'framer-motion';
import { MapPin, BedDouble, Bath, Square, TrendingUp, Timer, AlertTriangle, ShieldCheck, ChevronRight, Sparkles } from 'lucide-react';
import type { SearchResult } from '../services/geminiSearchService';

interface Props {
  result: SearchResult;
  index: number;
  onOpenForm?: () => void;
}

const riskColors = {
  bajo: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
  medio: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400' },
  alto: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400' },
};

const situationLabels: Record<string, { label: string; color: string }> = {
  distressed: { label: 'Distressed', color: 'text-red-400 border-red-400/20 bg-red-500/10' },
  intestada: { label: 'Intestada', color: 'text-purple-400 border-purple-400/20 bg-purple-500/10' },
  embargo: { label: 'Embargo', color: 'text-orange-400 border-orange-400/20 bg-orange-500/10' },
  remate: { label: 'Remate Bancario', color: 'text-red-400 border-red-400/20 bg-red-500/10' },
  remodelacion: { label: 'Remodelación', color: 'text-blue-400 border-blue-400/20 bg-blue-500/10' },
  oportunidad: { label: 'Oportunidad', color: 'text-emerald-400 border-emerald-400/20 bg-emerald-500/10' },
};

function formatPrice(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}k`;
  return `$${n}`;
}

export function SearchResultCard({ result, index, onOpenForm }: Props) {
  const { property: p, match_score, analysis, recommendation } = result;
  const risk = riskColors[p.risk_level];
  const situation = situationLabels[p.situation] || situationLabels.oportunidad;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="glass-panel-elevated rounded-2xl overflow-hidden card-hover border-white/5 hover:border-tb-accent/20 group"
    >
      {/* Header: Match Score + Situation + Risk */}
      <div className="flex items-center justify-between p-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          {/* Match Score Circle */}
          <div className="relative w-11 h-11">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={match_score >= 90 ? '#34d399' : match_score >= 75 ? '#38bdf8' : '#fbbf24'}
                strokeWidth="3"
                strokeDasharray={`${match_score}, 100`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white/80">
              {match_score}
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">Match Score</p>
            <p className="text-xs text-white/60">{p.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold uppercase tracking-[0.1em] px-2.5 py-1 rounded-full border ${situation.color}`}>
            {situation.label}
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-[0.1em] px-2.5 py-1 rounded-full border ${risk.bg} ${risk.border} ${risk.text}`}>
            Riesgo {p.risk_level}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 md:p-6 space-y-5">
        {/* Title + Location */}
        <div>
          <h3 className="text-lg md:text-xl font-medium text-white/90 tracking-tight leading-tight mb-2">{p.title}</h3>
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <MapPin size={14} className="text-tb-accent flex-shrink-0" />
            {p.location}
          </div>
        </div>

        {/* KPI Grid — 4 metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp size={10} className="text-emerald-400" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-white/35">ROI</span>
            </div>
            <p className="text-xl font-light text-emerald-400">{p.roi}%</p>
          </div>

          <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
            <div className="flex items-center gap-1.5 mb-1">
              <Timer size={10} className="text-tb-accent" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-white/35">Timeline</span>
            </div>
            <p className="text-xl font-light text-white/80">{p.time_estimate}</p>
          </div>

          <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
            <div className="flex items-center gap-1.5 mb-1">
              <AlertTriangle size={10} className="text-amber-400" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-white/35">Descuento</span>
            </div>
            <p className="text-xl font-light text-amber-400">{p.discount_pct}%</p>
          </div>

          <div className="bg-tb-accent/[0.06] rounded-xl p-3 border border-tb-accent/15">
            <div className="flex items-center gap-1.5 mb-1">
              <ShieldCheck size={10} className="text-tb-accent" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-tb-accent/60">Exit Price</span>
            </div>
            <p className="text-xl font-medium text-white">{formatPrice(p.expected_exit_price)}</p>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="flex items-center gap-3 text-sm bg-white/[0.02] rounded-xl px-4 py-3 border border-white/5">
          <span className="text-white/50">Compra: <span className="text-white font-medium">{formatPrice(p.current_price)}</span></span>
          <span className="text-white/15">+</span>
          <span className="text-white/50">Reno: <span className="text-white font-medium">{formatPrice(p.renovation_cost)}</span></span>
          <span className="text-white/15">=</span>
          <span className="text-white/50">Inversión: <span className="text-tb-accent font-medium">{formatPrice(p.current_price + p.renovation_cost)}</span></span>
        </div>

        {/* Property Specs */}
        {p.property_type !== 'terreno' && (
          <div className="flex items-center gap-5 text-white/40 text-xs">
            <span className="flex items-center gap-1.5"><BedDouble size={14} /> {p.bedrooms} Rec</span>
            <span className="flex items-center gap-1.5"><Bath size={14} /> {p.bathrooms} Baños</span>
            <span className="flex items-center gap-1.5"><Square size={14} /> {p.sqm_construction}m²</span>
            <span className="text-white/20">|</span>
            <span className="text-white/30">${p.price_per_sqm.toLocaleString()}/m²</span>
          </div>
        )}

        {/* AI Analysis */}
        <div className="bg-gradient-to-r from-tb-accent/[0.04] to-indigo-500/[0.04] rounded-xl p-4 border border-tb-accent/10 space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={12} className="text-tb-accent" />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-tb-accent/70">Análisis Trinity AI</span>
          </div>
          <p className="text-white/50 text-sm font-light leading-relaxed">{analysis}</p>
          {recommendation && (
            <p className="text-tb-accent/70 text-xs font-medium mt-1">{recommendation}</p>
          )}
        </div>

        {/* Legal Status */}
        <div className="flex items-start gap-2 text-xs text-white/30">
          <ShieldCheck size={14} className="text-white/20 mt-0.5 flex-shrink-0" />
          <span className="font-light">{p.legal_status}</span>
        </div>

        {/* CTA */}
        <button
          onClick={onOpenForm}
          className="w-full py-4 bg-white text-tb-dark rounded-xl font-bold flex items-center justify-center gap-2 btn-press hover:shadow-lg hover:shadow-tb-accent/10 transition-all group/btn text-sm"
        >
          <span>Ver Análisis Completo</span>
          <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}
