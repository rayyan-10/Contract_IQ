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
    low:      { color: '#10b981', bgClass: 'bg-emerald-50', borderClass: 'border-emerald-200', textClass: 'text-emerald-700', label: 'Low Risk',      ringTrack: '#d1fae5' },
    moderate: { color: '#f5a623', bgClass: 'bg-amber-50',   borderClass: 'border-amber-200',   textClass: 'text-amber-700',   label: 'Moderate Risk', ringTrack: '#fef3c7' },
    high:     { color: '#f97316', bgClass: 'bg-orange-50',  borderClass: 'border-orange-200',  textClass: 'text-orange-700',  label: 'High Risk',     ringTrack: '#ffedd5' },
    critical: { color: '#ef4444', bgClass: 'bg-red-50',     borderClass: 'border-red-200',     textClass: 'text-red-700',     label: 'Critical Risk', ringTrack: '#fee2e2' },
  }[result.riskLevel];

  const pct = result.riskScore / 100;

  return (
    <div className="space-y-5 animate-slide-up">
      {/* ── Grand hero card ───────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-cream-300 overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(61,21,21,0.06)' }}>
        {/* Top accent bar */}
        <div className="h-1.5 w-full" style={{ background: `linear-gradient(to right, ${levelConfig.color}40, ${levelConfig.color})` }} />

        <div className="p-8">
          <div className="flex items-start justify-between gap-8">
            {/* Left content */}
            <div className="flex-1">
              {/* Status badge */}
              <div className="flex items-center gap-3 mb-5">
                <div className={['w-10 h-10 rounded-xl flex items-center justify-center', result.atRisk ? 'bg-red-100' : 'bg-emerald-100'].join(' ')}>
                  {result.atRisk
                    ? <XCircle className="w-5 h-5 text-red-600" />
                    : <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                </div>
                <div>
                  <p className={'text-xl font-bold ' + levelConfig.textClass}>
                    {result.atRisk ? 'AT RISK' : 'NOT AT RISK'}
                  </p>
                  <p className="text-[11px] text-maroon-800/50 uppercase tracking-wider font-semibold mt-0.5">
                    {levelConfig.label} Classification
                  </p>
                </div>
              </div>

              {/* Summary */}
              <p className="text-sm text-maroon-800/70 leading-relaxed mb-5 max-w-lg">{result.summary}</p>

              {/* Metric pills */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xs font-medium text-maroon-800/60 bg-cream-200 px-3.5 py-2 rounded-xl border border-cream-300">
                  ACO: <span className="font-mono font-bold text-maroon-900">{result.acoId}</span>
                </span>
                <span className={['text-xs font-bold px-3.5 py-2 rounded-xl border', levelConfig.bgClass, levelConfig.borderClass, levelConfig.textClass].join(' ')}>
                  {levelConfig.label}
                </span>
                <span className="text-xs font-medium text-maroon-800/60 bg-cream-200 px-3.5 py-2 rounded-xl border border-cream-300">
                  Probability: <span className="font-bold text-maroon-900">{(result.riskProbability * 100).toFixed(1)}%</span>
                </span>
                <span className="text-xs font-medium text-maroon-800/60 bg-cream-200 px-3.5 py-2 rounded-xl border border-cream-300">
                  Score: <span className="font-bold text-maroon-900">{result.riskScore} / 100</span>
                </span>
              </div>
            </div>

            {/* Right: large ring gauge */}
            <div className="flex-shrink-0 hidden md:block">
              <div className="relative" style={{ width: 150, height: 150 }}>
                <svg width="150" height="150" className="-rotate-90">
                  <circle cx="75" cy="75" r="62" fill="none" stroke={levelConfig.ringTrack} strokeWidth="12" />
                  <circle cx="75" cy="75" r="62" fill="none" stroke={levelConfig.color}
                    strokeWidth="12" strokeLinecap="round"
                    strokeDasharray={(pct * 389.6).toString() + ' 389.6'}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-maroon-900">{result.riskScore}</span>
                  <span className="text-[10px] text-maroon-800/40 font-semibold mt-0.5">RISK SCORE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Risk meter bar ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-cream-300 p-6" style={{ boxShadow: '0 1px 4px rgba(61,21,21,0.03)' }}>
        <h4 className="text-sm font-bold text-maroon-900 mb-4">Risk Level Gauge</h4>
        <div className="relative">
          {/* Bar */}
          <div className="flex h-10 rounded-2xl overflow-hidden border border-cream-300">
            <div className="bg-gradient-to-r from-emerald-100 to-emerald-200 flex items-center justify-center" style={{ width: '35%' }}>
              <span className="text-[10px] font-bold text-emerald-700">LOW (0–35)</span>
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
          {/* Marker */}
          <div className="absolute -top-2" style={{ left: result.riskScore + '%', transform: 'translateX(-50%)' }}>
            <div className="flex flex-col items-center">
              <div className="w-5 h-5 rounded-full border-3 border-white shadow-lg" style={{ backgroundColor: levelConfig.color, borderWidth: 3 }} />
              <div className="w-0.5 h-3" style={{ backgroundColor: levelConfig.color }} />
              <span className="mt-1 text-xs font-bold text-maroon-900 bg-cream-200 px-2.5 py-1 rounded-lg border border-cream-300 shadow-sm">
                {result.riskScore}
              </span>
            </div>
          </div>
          {/* Ticks */}
          <div className="flex justify-between mt-2 text-[9px] text-maroon-800/40">
            <span>0</span>
            <span style={{ position: 'absolute', left: '35%', transform: 'translateX(-50%)' }}>35</span>
            <span style={{ position: 'absolute', left: '55%', transform: 'translateX(-50%)' }}>55</span>
            <span style={{ position: 'absolute', left: '75%', transform: 'translateX(-50%)' }}>75</span>
            <span>100</span>
          </div>
        </div>
      </div>

      {/* ── Contributing factors ───────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-cream-300 p-6" style={{ boxShadow: '0 1px 4px rgba(61,21,21,0.03)' }}>
        <h4 className="text-sm font-bold text-maroon-900 mb-5">Contributing Factors</h4>
        <div className="space-y-4">
          {result.contributingFactors.map((f, i) => (
            <div key={f.factor} className="flex items-center gap-4">
              {/* Rank */}
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cream-200 border border-cream-300 flex items-center justify-center text-[10px] font-bold text-maroon-900">
                {i + 1}
              </span>
              {/* Icon */}
              <div className={['w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0',
                f.direction === 'positive' ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100',
              ].join(' ')}>
                {f.direction === 'positive'
                  ? <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                  : <ArrowDownRight className="w-4 h-4 text-red-500" />}
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-maroon-900">{f.factor}</span>
                  <span className={['text-[10px] font-bold uppercase px-2 py-0.5 rounded-full',
                    f.direction === 'positive' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100',
                  ].join(' ')}>
                    {f.direction}
                  </span>
                </div>
                <div className="h-2.5 bg-cream-200 rounded-full overflow-hidden border border-cream-300">
                  <div
                    className={['h-full rounded-full transition-all duration-1000 ease-out',
                      f.direction === 'positive' ? 'bg-emerald-400' : 'bg-red-400',
                    ].join(' ')}
                    style={{ width: Math.min(f.impact * 1.5, 100) + '%' }}
                  />
                </div>
              </div>
              {/* Score */}
              <span className="text-sm font-bold text-maroon-900 w-10 text-right">{f.impact}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Forecast Result ──────────────────────────────────────────────────────────

function ForecastDisplay({ result }: { result: PerformanceForecastResult }) {
  const trendConfig = {
    improving: { color: '#10b981', bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', icon: <TrendingUp className="w-5 h-5" /> },
    stable:    { color: '#f59e0b', bg: 'bg-amber-50',   border: 'border-amber-100',   text: 'text-amber-700',   icon: <Minus className="w-5 h-5" /> },
    declining: { color: '#ef4444', bg: 'bg-red-50',     border: 'border-red-100',     text: 'text-red-700',     icon: <TrendingDown className="w-5 h-5" /> },
  }[result.trend];

  return (
    <div className="space-y-5 animate-slide-up">
      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 text-center">
          <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-2">Projected Savings</p>
          <p className="text-3xl font-bold text-indigo-700 tracking-tight">{result.projectedSavingsRate}%</p>
        </div>
        <div className="bg-sky-50 border border-sky-100 rounded-2xl p-5 text-center">
          <p className="text-[10px] font-bold text-sky-500 uppercase tracking-wider mb-2">Projected Quality</p>
          <p className="text-3xl font-bold text-sky-700 tracking-tight">{result.projectedQualityScore}</p>
        </div>
        <div className={['rounded-2xl border p-5 text-center', trendConfig.bg, trendConfig.border].join(' ')}>
          <p className={'text-[10px] font-bold uppercase tracking-wider mb-2 ' + trendConfig.text}>Trend</p>
          <div className={'flex items-center justify-center gap-2 ' + trendConfig.text}>
            {trendConfig.icon}
            <span className="text-xl font-bold capitalize">{result.trend}</span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <p className="text-sm text-slate-700 leading-relaxed">{result.summary}</p>
        <p className="text-xs text-slate-400 mt-2">ACO: <span className="font-mono font-semibold">{result.acoId}</span></p>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <h4 className="text-sm font-bold text-slate-800 mb-5">Quarterly Forecast Trajectory</h4>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={result.quarters} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid {...GRID} />
              <XAxis dataKey="label" tick={TICK} tickLine={false} axisLine={false} />
              <YAxis tick={TICK} tickLine={false} axisLine={false} />
              <Tooltip {...TIP} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="savings" stroke="#6366f1" strokeWidth={3} dot={{ r: 5, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} name="Savings %" />
              <Line type="monotone" dataKey="quality" stroke="#0ea5e9" strokeWidth={2.5} dot={{ r: 4, fill: '#0ea5e9', strokeWidth: 2, stroke: '#fff' }} name="Quality" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ─── Twin ACO Result ──────────────────────────────────────────────────────────

function TwinDisplay({ result }: { result: TwinAcoResult }) {
  return (
    <div className="space-y-5 animate-slide-up">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
            <GitBranch className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">Twin ACO Matches</p>
            <p className="text-xs text-slate-400">ACO: <span className="font-mono font-semibold">{result.acoId}</span> · {result.matches.length} matches</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">{result.summary}</p>
      </div>

      {/* Similarity chart */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <h4 className="text-sm font-bold text-slate-800 mb-5">Similarity Scores</h4>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={result.matches} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid {...GRID} horizontal={false} />
              <XAxis type="number" domain={[60, 100]} tick={TICK} tickLine={false} axisLine={false} tickFormatter={v => v + '%'} />
              <YAxis dataKey="acoId" type="category" tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'monospace' }} tickLine={false} axisLine={false} width={65} />
              <Tooltip {...TIP} formatter={(v: number) => [v.toFixed(1) + '%', 'Similarity']} />
              <Bar dataKey="similarityScore" radius={[0, 6, 6, 0]} name="Similarity %">
                {result.matches.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? '#8b5cf6' : i === 1 ? '#a78bfa' : '#c4b5fd'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Match cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {result.matches.map((m, i) => (
          <div key={m.acoId} className={[
            'rounded-2xl border p-5 transition-shadow duration-200 hover:shadow-md',
            i === 0 ? 'border-violet-200 bg-violet-50/50' : 'border-slate-100 bg-white',
          ].join(' ')}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800 font-mono">{m.acoId}</span>
              <span className={[
                'text-xs font-bold px-2.5 py-0.5 rounded-full',
                i === 0 ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-600',
              ].join(' ')}>
                {m.similarityScore}%
              </span>
            </div>
            <p className="text-sm font-medium text-slate-700 mb-3 truncate">{m.acoName}</p>
            {m.savingsRate !== 0 && (
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>Savings: <span className="font-bold text-slate-700">{m.savingsRate}%</span></span>
                {m.qualityScore > 0 && <span>Quality: <span className="font-bold text-slate-700">{m.qualityScore}</span></span>}
              </div>
            )}
          </div>
        ))}
      </div>
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
