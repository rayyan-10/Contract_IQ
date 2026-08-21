import React from 'react';
import {
  AlertTriangle, TrendingUp, TrendingDown, Minus,
  CheckCircle2, XCircle, GitBranch, Users,
  BarChart2, Activity, Shield, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import type {
  PredictionResult, RiskPredictionResult,
  PerformanceForecastResult, TwinAcoResult,
} from '@/types/prediction';

const TICK = { fontSize: 11, fill: '#94a3b8' };
const GRID = { strokeDasharray: '3 3', stroke: '#f1f5f9' };
const TIP  = { contentStyle: { fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: 'none' } };

// ─── Risk Result ──────────────────────────────────────────────────────────────

function RiskDisplay({ result }: { result: RiskPredictionResult }) {
  const levelColor = {
    low:      { bg: 'bg-emerald-50',  border: 'border-emerald-200', text: 'text-emerald-700', ring: 'ring-emerald-500' },
    moderate: { bg: 'bg-amber-50',    border: 'border-amber-200',   text: 'text-amber-700',   ring: 'ring-amber-500'   },
    high:     { bg: 'bg-orange-50',   border: 'border-orange-200',  text: 'text-orange-700',  ring: 'ring-orange-500'  },
    critical: { bg: 'bg-red-50',      border: 'border-red-200',     text: 'text-red-700',     ring: 'ring-red-500'     },
  }[result.riskLevel];

  return (
    <div className="space-y-4">
      {/* Main score card */}
      <div className={['rounded-2xl border-2 p-6', levelColor.bg, levelColor.border].join(' ')}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={['w-12 h-12 rounded-xl flex items-center justify-center', result.atRisk ? 'bg-red-100' : 'bg-emerald-100'].join(' ')}>
              {result.atRisk ? <XCircle className="w-6 h-6 text-red-600" /> : <CheckCircle2 className="w-6 h-6 text-emerald-600" />}
            </div>
            <div>
              <p className="text-lg font-bold text-slate-800">
                {result.atRisk ? 'AT RISK' : 'LOW RISK'}
              </p>
              <p className="text-xs text-slate-500">ACO: {result.acoId}</p>
            </div>
          </div>
          {/* Score ring */}
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="#e2e8f0" strokeWidth="6" />
              <circle cx="40" cy="40" r="34" fill="none" stroke={result.riskScore >= 55 ? '#ef4444' : result.riskScore >= 35 ? '#f59e0b' : '#10b981'}
                strokeWidth="6" strokeLinecap="round"
                strokeDasharray={`${(result.riskScore / 100) * 213.6} 213.6`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={['text-xl font-bold', levelColor.text].join(' ')}>{result.riskScore}</span>
              <span className="text-[9px] text-slate-400">/ 100</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/80 border border-white">
            <Shield className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-600">Risk Level:</span>
            <span className={['font-bold uppercase', levelColor.text].join(' ')}>{result.riskLevel}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/80 border border-white">
            <Activity className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-600">Probability:</span>
            <span className="font-bold text-slate-800">{(result.riskProbability * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <Card>
        <p className="text-sm text-slate-700 leading-relaxed">{result.summary}</p>
      </Card>

      {/* Contributing factors */}
      <Card>
        <h4 className="text-sm font-semibold text-slate-800 mb-4">Contributing Factors</h4>
        <div className="space-y-3">
          {result.contributingFactors.map(f => (
            <div key={f.factor} className="flex items-center gap-3">
              <div className={['w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0',
                f.direction === 'positive' ? 'bg-emerald-50' : 'bg-red-50',
              ].join(' ')}>
                {f.direction === 'positive'
                  ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                  : <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-slate-700">{f.factor}</span>
                  <Badge variant={f.direction === 'positive' ? 'success' : 'danger'} dot>
                    {f.direction}
                  </Badge>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={['h-full rounded-full transition-all duration-500',
                      f.direction === 'positive' ? 'bg-emerald-500' : 'bg-red-400',
                    ].join(' ')}
                    style={{ width: Math.min(f.impact, 100) + '%' }}
                  />
                </div>
              </div>
              <span className="text-xs font-bold text-slate-600 w-10 text-right">{f.impact}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Forecast Result ──────────────────────────────────────────────────────────

function ForecastDisplay({ result }: { result: PerformanceForecastResult }) {
  const trendIcon = result.trend === 'improving' ? <TrendingUp className="w-4 h-4 text-emerald-600" />
    : result.trend === 'declining' ? <TrendingDown className="w-4 h-4 text-red-500" />
    : <Minus className="w-4 h-4 text-slate-400" />;

  const trendColor = result.trend === 'improving' ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
    : result.trend === 'declining' ? 'text-red-600 bg-red-50 border-red-200'
    : 'text-slate-600 bg-slate-50 border-slate-200';

  return (
    <div className="space-y-4">
      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center">
          <p className="text-xs text-indigo-600 font-semibold mb-1">Projected Savings</p>
          <p className="text-2xl font-bold text-indigo-700">{result.projectedSavingsRate}%</p>
        </div>
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 text-center">
          <p className="text-xs text-sky-600 font-semibold mb-1">Projected Quality</p>
          <p className="text-2xl font-bold text-sky-700">{result.projectedQualityScore}</p>
        </div>
        <div className={['rounded-xl border p-4 text-center', trendColor].join(' ')}>
          <p className="text-xs font-semibold mb-1">Trend</p>
          <div className="flex items-center justify-center gap-1.5">
            {trendIcon}
            <p className="text-lg font-bold capitalize">{result.trend}</p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <Card>
        <p className="text-sm text-slate-700 leading-relaxed">{result.summary}</p>
        <p className="text-xs text-slate-400 mt-2">ACO: {result.acoId}</p>
      </Card>

      {/* Quarter chart */}
      <Card>
        <h4 className="text-sm font-semibold text-slate-800 mb-4">Quarterly Projections</h4>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={result.quarters} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid {...GRID} />
              <XAxis dataKey="label" tick={TICK} tickLine={false} axisLine={false} />
              <YAxis tick={TICK} tickLine={false} axisLine={false} />
              <Tooltip {...TIP} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="savings" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4, fill: '#6366f1' }} name="Savings %" />
              <Line type="monotone" dataKey="quality" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3, fill: '#0ea5e9' }} name="Quality" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

// ─── Twin ACO Result ──────────────────────────────────────────────────────────

function TwinDisplay({ result }: { result: TwinAcoResult }) {
  return (
    <div className="space-y-4">
      {/* Summary */}
      <Card>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
            <GitBranch className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Twin ACO Matches</p>
            <p className="text-xs text-slate-400">ACO: {result.acoId} · {result.matches.length} matches found</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">{result.summary}</p>
      </Card>

      {/* Similarity chart */}
      <Card>
        <h4 className="text-sm font-semibold text-slate-800 mb-4">Similarity Scores</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={result.matches} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid {...GRID} horizontal={false} />
              <XAxis type="number" domain={[80, 100]} tick={TICK} tickLine={false} axisLine={false} tickFormatter={v => v + '%'} />
              <YAxis dataKey="acoId" type="category" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={60} />
              <Tooltip {...TIP} formatter={(v: number) => [v + '%', 'Similarity']} />
              <Bar dataKey="similarityScore" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Similarity %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Match cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {result.matches.map((m, i) => (
          <div key={m.acoId} className={[
            'rounded-xl border p-4',
            i === 0 ? 'border-violet-200 bg-violet-50' : 'border-surface-border bg-white',
          ].join(' ')}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 font-mono">{m.acoId}</span>
              <Badge variant={i === 0 ? 'info' : 'neutral'}>{m.similarityScore}%</Badge>
            </div>
            <p className="text-xs font-medium text-slate-700 mb-2 truncate">{m.acoName}</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: 'Savings', value: m.savingsRate + '%' },
                { label: 'Quality', value: String(m.qualityScore) },
                { label: 'Benes',   value: m.beneficiaries.toLocaleString() },
              ].map(kv => (
                <div key={kv.label}>
                  <p className="text-[9px] text-slate-400 uppercase">{kv.label}</p>
                  <p className="text-xs font-bold text-slate-700">{kv.value}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main dispatcher ──────────────────────────────────────────────────────────

export function ResultsDisplay({ result }: { result: PredictionResult }) {
  switch (result.type) {
    case 'risk':        return <RiskDisplay      result={result} />;
    case 'performance': return <ForecastDisplay  result={result} />;
    case 'twin':        return <TwinDisplay      result={result} />;
  }
}
