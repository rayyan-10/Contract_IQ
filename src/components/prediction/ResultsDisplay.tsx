import React from 'react';
import {
  AlertTriangle, TrendingUp, TrendingDown, Minus,
  CheckCircle2, XCircle, GitBranch, ArrowUpRight, ArrowDownRight,
  Shield, Activity,
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell,
} from 'recharts';
import type {
  PredictionResult, RiskPredictionResult,
  PerformanceForecastResult, TwinAcoResult,
} from '@/types/prediction';

const TICK = { fontSize: 11, fill: '#94a3b8' };
const GRID = { strokeDasharray: '3 3', stroke: '#f1f5f9' };
const TIP  = { contentStyle: { fontSize: 12, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' } };

// ─── Score Ring SVG ───────────────────────────────────────────────────────────
function ScoreRing({ score, max = 100, size = 120, strokeWidth = 8, color }: {
  score: number; max?: number; size?: number; strokeWidth?: number; color: string;
}) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(score / max, 1);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
          strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={`${pct * circ} ${circ}`}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-slate-800 tracking-tight">{Math.round(score)}</span>
        <span className="text-[10px] text-slate-400 font-medium">/ {max}</span>
      </div>
    </div>
  );
}

// ─── Risk Result ──────────────────────────────────────────────────────────────

function RiskDisplay({ result }: { result: RiskPredictionResult }) {
  const levelConfig = {
    low:      { color: '#10b981', bgClass: 'bg-emerald-50', borderClass: 'border-emerald-200', textClass: 'text-emerald-700', label: 'Low Risk',      ringTrack: '#d1fae5', gradient: 'from-emerald-400 to-emerald-500' },
    moderate: { color: '#f5a623', bgClass: 'bg-amber-50',   borderClass: 'border-amber-200',   textClass: 'text-amber-700',   label: 'Moderate Risk', ringTrack: '#fef3c7', gradient: 'from-amber-400 to-amber-500' },
    high:     { color: '#f97316', bgClass: 'bg-orange-50',  borderClass: 'border-orange-200',  textClass: 'text-orange-700',  label: 'High Risk',     ringTrack: '#ffedd5', gradient: 'from-orange-400 to-orange-500' },
    critical: { color: '#ef4444', bgClass: 'bg-red-50',     borderClass: 'border-red-200',     textClass: 'text-red-700',     label: 'Critical Risk', ringTrack: '#fee2e2', gradient: 'from-red-500 to-red-600' },
  }[result.riskLevel];

  const pct = result.riskScore / 100;
  const maxImpact = Math.max(...result.contributingFactors.map(f => f.impact), 1);

  return (
    <div className="space-y-6 animate-slide-up">
      {/* ── Hero card ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-cream-300 overflow-hidden" style={{ boxShadow: '0 4px 24px rgba(61,21,21,0.06)' }}>
        <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, ' + levelConfig.color + '30, ' + levelConfig.color + ')' }} />
        <div className="p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Left */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className={['w-11 h-11 rounded-xl flex items-center justify-center border', result.atRisk ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'].join(' ')}>
                {result.atRisk ? <XCircle className="w-6 h-6 text-red-600" /> : <CheckCircle2 className="w-6 h-6 text-emerald-600" />}
              </div>
              <div>
                <p className={'text-xl font-bold ' + levelConfig.textClass}>{result.atRisk ? 'AT RISK' : 'NOT AT RISK'}</p>
                <p className="text-[11px] text-maroon-800/40 uppercase tracking-wider font-semibold">{levelConfig.label}</p>
              </div>
            </div>
            <p className="text-sm text-maroon-800/60 leading-relaxed mb-4 max-w-lg">{result.summary}</p>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs bg-cream-200 text-maroon-900 font-mono font-bold px-3 py-1.5 rounded-lg border border-cream-300">
                {result.acoId}
              </span>
              <span className={['text-xs font-bold px-3 py-1.5 rounded-lg border', levelConfig.bgClass, levelConfig.borderClass, levelConfig.textClass].join(' ')}>
                {levelConfig.label}
              </span>
              <span className="text-xs bg-cream-200 text-maroon-800/60 px-3 py-1.5 rounded-lg border border-cream-300">
                Probability: <span className="font-bold text-maroon-900">{(result.riskProbability * 100).toFixed(1)}%</span>
              </span>
            </div>
          </div>

          {/* Right: Ring */}
          <div className="flex-shrink-0">
            <div className="relative" style={{ width: 140, height: 140 }}>
              <svg width="140" height="140" className="-rotate-90">
                <circle cx="70" cy="70" r="58" fill="none" stroke={levelConfig.ringTrack} strokeWidth="12" />
                <circle cx="70" cy="70" r="58" fill="none" stroke={levelConfig.color}
                  strokeWidth="12" strokeLinecap="round"
                  strokeDasharray={(pct * 364.4).toString() + ' 364.4'}
                  className="transition-all duration-1000 ease-out" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-maroon-900">{result.riskScore}</span>
                <span className="text-[9px] text-maroon-800/30 font-semibold uppercase mt-0.5">Risk Score</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Risk gauge bar ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-cream-300 p-6" style={{ boxShadow: '0 1px 4px rgba(61,21,21,0.03)' }}>
        <h4 className="text-sm font-bold text-maroon-900 mb-5">Risk Level Gauge</h4>
        <div className="relative">
          <div className="flex h-10 rounded-2xl overflow-hidden border border-cream-300">
            <div className="bg-gradient-to-r from-emerald-100 to-emerald-200 flex items-center justify-center" style={{ width: '35%' }}>
              <span className="text-[10px] font-bold text-emerald-700">LOW</span>
            </div>
            <div className="bg-gradient-to-r from-amber-100 to-amber-200 flex items-center justify-center border-x border-cream-300" style={{ width: '20%' }}>
              <span className="text-[10px] font-bold text-amber-700">MOD</span>
            </div>
            <div className="bg-gradient-to-r from-orange-100 to-orange-200 flex items-center justify-center border-r border-cream-300" style={{ width: '20%' }}>
              <span className="text-[10px] font-bold text-orange-700">HIGH</span>
            </div>
            <div className="bg-gradient-to-r from-red-100 to-red-200 flex items-center justify-center" style={{ width: '25%' }}>
              <span className="text-[10px] font-bold text-red-700">CRITICAL</span>
            </div>
          </div>
          <div className="absolute -top-2" style={{ left: result.riskScore + '%', transform: 'translateX(-50%)' }}>
            <div className="flex flex-col items-center">
              <div className="w-5 h-5 rounded-full shadow-lg" style={{ backgroundColor: levelConfig.color, border: '3px solid white' }} />
              <div className="w-0.5 h-2.5" style={{ backgroundColor: levelConfig.color }} />
              <span className="mt-0.5 text-[10px] font-bold text-maroon-900 bg-cream-200 px-2 py-0.5 rounded border border-cream-300">
                {result.riskScore}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Contributing factors — CARD GRID ───────────────────────────── */}
      <div className="bg-white rounded-2xl border border-cream-300 p-6" style={{ boxShadow: '0 1px 4px rgba(61,21,21,0.03)' }}>
        <h4 className="text-sm font-bold text-maroon-900 mb-5">Contributing Factors</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {result.contributingFactors.map((f, i) => {
            const isPos = f.direction === 'positive';
            const barWidth = Math.round((f.impact / maxImpact) * 100);
            return (
              <div key={f.factor}
                className={[
                  'relative rounded-2xl border p-5 overflow-hidden transition-all duration-200 hover:shadow-card-md',
                  isPos ? 'border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white' : 'border-red-200 bg-gradient-to-br from-red-50/50 to-white',
                ].join(' ')}
              >
                {/* Rank badge */}
                <div className={[
                  'absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold',
                  isPos ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600',
                ].join(' ')}>
                  {i + 1}
                </div>

                {/* Direction arrow */}
                <div className={['w-9 h-9 rounded-xl flex items-center justify-center mb-3',
                  isPos ? 'bg-emerald-100 border border-emerald-200' : 'bg-red-100 border border-red-200',
                ].join(' ')}>
                  {isPos ? <ArrowUpRight className="w-5 h-5 text-emerald-600" /> : <ArrowDownRight className="w-5 h-5 text-red-500" />}
                </div>

                {/* Factor name */}
                <p className="text-sm font-bold text-maroon-900 mb-1">{f.factor}</p>
                <p className={['text-[10px] font-bold uppercase tracking-wide mb-3',
                  isPos ? 'text-emerald-600' : 'text-red-500',
                ].join(' ')}>
                  {f.direction} impact
                </p>

                {/* Impact bar */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 bg-cream-200 rounded-full overflow-hidden border border-cream-300">
                    <div className={[
                      'h-full rounded-full transition-all duration-1000 ease-out',
                      isPos ? 'bg-gradient-to-r from-emerald-300 to-emerald-500' : 'bg-gradient-to-r from-red-300 to-red-500',
                    ].join(' ')} style={{ width: barWidth + '%' }} />
                  </div>
                  <span className="text-lg font-bold text-maroon-900 tabular-nums w-10 text-right">{f.impact}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Forecast Result ──────────────────────────────────────────────────────────

function ForecastDisplay({ result }: { result: PerformanceForecastResult }) {
  const trendConfig = {
    improving: { color: '#10b981', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: <TrendingUp className="w-5 h-5" /> },
    stable:    { color: '#f5a623', bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700',   icon: <Minus className="w-5 h-5" /> },
    declining: { color: '#ef4444', bg: 'bg-red-50',     border: 'border-red-200',     text: 'text-red-700',     icon: <TrendingDown className="w-5 h-5" /> },
  }[result.trend];

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Hero KPIs */}
      <div className="bg-white rounded-2xl border border-cream-300 overflow-hidden" style={{ boxShadow: '0 4px 24px rgba(61,21,21,0.06)' }}>
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-300 to-amber-500" />
        <div className="p-8">
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-[10px] font-bold text-maroon-800/40 uppercase tracking-wider mb-2">Projected Savings</p>
              <p className="text-4xl font-bold text-maroon-900 tracking-tight">{result.projectedSavingsRate}%</p>
            </div>
            <div className="text-center border-x border-cream-300 px-4">
              <p className="text-[10px] font-bold text-maroon-800/40 uppercase tracking-wider mb-2">Projected Quality</p>
              <p className="text-4xl font-bold text-maroon-900 tracking-tight">{result.projectedQualityScore}</p>
            </div>
            <div className="text-center">
              <p className={'text-[10px] font-bold uppercase tracking-wider mb-2 ' + trendConfig.text}>Trend</p>
              <div className={'flex items-center justify-center gap-2 ' + trendConfig.text}>
                {trendConfig.icon}
                <span className="text-2xl font-bold capitalize">{result.trend}</span>
              </div>
            </div>
          </div>

          {/* Summary + ACO */}
          <div className="mt-6 pt-5 border-t border-cream-300">
            <p className="text-sm text-maroon-800/70 leading-relaxed">{result.summary}</p>
            <span className="inline-block mt-2 text-xs bg-cream-200 text-maroon-900 font-mono font-bold px-3 py-1 rounded-lg border border-cream-300">
              {result.acoId}
            </span>
          </div>
        </div>
      </div>

      {/* Quarterly trajectory — colored cards with clear labels */}
      <div className="bg-white rounded-2xl border border-cream-300 p-6" style={{ boxShadow: '0 1px 4px rgba(61,21,21,0.03)' }}>
        <h4 className="text-sm font-bold text-maroon-900 mb-2">Quarterly Forecast Trajectory</h4>
        <p className="text-xs text-maroon-800/40 mb-6">Projected savings rate and quality score progression over 4 quarters</p>

        {/* Savings Rate progression */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-3 h-3 rounded-full bg-maroon-900" />
            <p className="text-xs font-bold text-maroon-900 uppercase tracking-wider">Savings Rate</p>
            <span className="text-[10px] text-maroon-800/30 ml-1">— Year-end target: {result.projectedSavingsRate}%</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {result.quarters.map((q, i) => {
              const prev = i > 0 ? result.quarters[i - 1].savings : null;
              const up = prev !== null ? q.savings >= prev : true;
              const isLast = i === result.quarters.length - 1;
              return (
                <div key={q.label} className={[
                  'rounded-2xl p-4 text-center border transition-all',
                  isLast
                    ? 'bg-maroon-900 border-maroon-800 text-white'
                    : 'bg-cream-200/50 border-cream-300',
                ].join(' ')}>
                  <p className={['text-[10px] font-bold uppercase tracking-wider mb-2', isLast ? 'text-amber-400' : 'text-maroon-800/40'].join(' ')}>{q.label}</p>
                  <p className={['text-2xl font-bold tabular-nums', isLast ? 'text-white' : 'text-maroon-900'].join(' ')}>{q.savings.toFixed(2)}%</p>
                  {prev !== null && (
                    <p className={['text-[10px] font-bold mt-1.5',
                      isLast ? (up ? 'text-emerald-300' : 'text-red-300') : (up ? 'text-emerald-600' : 'text-red-500'),
                    ].join(' ')}>
                      {up ? '↑' : '↓'} {Math.abs(q.savings - prev).toFixed(2)} vs {result.quarters[i-1].label}
                    </p>
                  )}
                  {i === 0 && <p className="text-[10px] text-maroon-800/30 mt-1.5">Starting point</p>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Quality Score progression */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-3 h-3 rounded-full bg-amber-400" />
            <p className="text-xs font-bold text-maroon-900 uppercase tracking-wider">Quality Score</p>
            <span className="text-[10px] text-maroon-800/30 ml-1">— Year-end projection: {result.projectedQualityScore}</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {result.quarters.map((q, i) => {
              const prev = i > 0 ? result.quarters[i - 1].quality : null;
              const up = prev !== null ? q.quality >= prev : true;
              const isLast = i === result.quarters.length - 1;
              return (
                <div key={q.label + '-q'} className={[
                  'rounded-2xl p-4 text-center border transition-all',
                  isLast
                    ? 'bg-amber-400 border-amber-500'
                    : 'bg-amber-50/50 border-amber-200/50',
                ].join(' ')}>
                  <p className={['text-[10px] font-bold uppercase tracking-wider mb-2', isLast ? 'text-maroon-900' : 'text-amber-700/60'].join(' ')}>{q.label}</p>
                  <p className={['text-2xl font-bold tabular-nums', isLast ? 'text-maroon-900' : 'text-maroon-900'].join(' ')}>{q.quality.toFixed(1)}</p>
                  {prev !== null && (
                    <p className={['text-[10px] font-bold mt-1.5',
                      isLast ? (up ? 'text-maroon-900/60' : 'text-red-800') : (up ? 'text-emerald-600' : 'text-red-500'),
                    ].join(' ')}>
                      {up ? '↑' : '↓'} {Math.abs(q.quality - prev).toFixed(1)} vs {result.quarters[i-1].label}
                    </p>
                  )}
                  {i === 0 && <p className="text-[10px] text-amber-700/40 mt-1.5">Starting point</p>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Twin ACO Result ──────────────────────────────────────────────────────────

function TwinDisplay({ result }: { result: TwinAcoResult }) {
  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header card */}
      <div className="bg-white rounded-2xl border border-cream-300 overflow-hidden" style={{ boxShadow: '0 4px 24px rgba(61,21,21,0.06)' }}>
        <div className="h-1.5 w-full bg-gradient-to-r from-maroon-900 to-amber-400" />
        <div className="p-6">
          <p className="text-sm font-bold text-maroon-900 mb-1">Twin ACO Matches</p>
          <p className="text-sm text-maroon-800/60 leading-relaxed">{result.summary}</p>
          <span className="inline-block mt-2 text-xs bg-cream-200 text-maroon-900 font-mono font-bold px-3 py-1 rounded-lg border border-cream-300">
            {result.acoId}
          </span>
        </div>
      </div>

      {/* Top match — featured card */}
      {result.matches.length > 0 && (() => {
        const top = result.matches[0];
        return (
          <div className="bg-gradient-to-br from-maroon-900 to-maroon-800 rounded-2xl p-6 text-white" style={{ boxShadow: '0 8px 32px rgba(61,21,21,0.2)' }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-8 h-8 rounded-full bg-amber-400 text-maroon-900 flex items-center justify-center text-sm font-bold">1</span>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Best Match</span>
                </div>
                <p className="text-xl font-bold text-white mb-1">{top.acoName}</p>
                <p className="text-xs text-white/50 font-mono">{top.acoId}</p>
                {top.savingsRate !== 0 && (
                  <div className="flex items-center gap-4 mt-3 text-xs text-white/60">
                    <span>Savings: <span className="font-bold text-amber-300">{top.savingsRate}%</span></span>
                    {top.qualityScore > 0 && <span>Quality: <span className="font-bold text-amber-300">{top.qualityScore}</span></span>}
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="text-5xl font-bold text-amber-400 tracking-tight">{top.similarityScore}%</p>
                <p className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Similarity</p>
              </div>
            </div>
            {/* Full-width bar */}
            <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-400 to-amber-300 rounded-full" style={{ width: top.similarityScore + '%' }} />
            </div>
          </div>
        );
      })()}

      {/* Remaining matches */}
      {result.matches.length > 1 && (
        <div className="bg-white rounded-2xl border border-cream-300 p-6" style={{ boxShadow: '0 1px 4px rgba(61,21,21,0.03)' }}>
          <h4 className="text-sm font-bold text-maroon-900 mb-5">Other Matches</h4>
          <div className="space-y-4">
            {result.matches.slice(1).map((m, i) => {
              const rank = i + 2;
              const barPct = Math.round(m.similarityScore);
              return (
                <div key={m.acoId} className="flex items-center gap-4">
                  {/* Rank */}
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-cream-200 border border-cream-300 flex items-center justify-center text-xs font-bold text-maroon-800/60">
                    {rank}
                  </span>

                  {/* Info + bar */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-maroon-900 truncate">{m.acoName}</p>
                        <p className="text-[10px] text-maroon-800/30 font-mono">{m.acoId}</p>
                      </div>
                      <span className="flex-shrink-0 text-lg font-bold text-maroon-900 tabular-nums ml-3">{m.similarityScore}%</span>
                    </div>
                    <div className="h-2 bg-cream-200 rounded-full overflow-hidden border border-cream-300">
                      <div className="h-full rounded-full bg-maroon-900/40 transition-all duration-700 ease-out" style={{ width: barPct + '%' }} />
                    </div>
                    {m.savingsRate !== 0 && (
                      <p className="text-[10px] text-maroon-800/40 mt-1.5">
                        Savings: <span className="font-semibold text-maroon-800/70">{m.savingsRate}%</span>
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function ResultsDisplay({ result }: { result: PredictionResult }) {
  switch (result.type) {
    case 'risk':        return <RiskDisplay      result={result} />;
    case 'performance': return <ForecastDisplay  result={result} />;
    case 'twin':        return <TwinDisplay      result={result} />;
  }
}
