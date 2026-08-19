import React, { useState, useMemo } from 'react';
import {
  DollarSign, Users, Activity, AlertTriangle, TrendingUp,
  TrendingDown, Filter, X, ChevronDown, ChevronUp, BarChart2,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { KpiCard } from '@/components/common/KpiCard';
import { ChartCard } from '@/components/common/ChartCard';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  LineChart, Line, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ZAxis,
} from 'recharts';
import {
  mockAcos, mockMonthlyTrends, mockPortfolioMonthly,
  type AcoRecord, type Region, type AcoStatus, type RiskLevel,
} from '@/data/mockAcos';
import type { BadgeVariant } from '@/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const C = {
  brand:   '#6366f1', emerald: '#10b981', amber: '#f59e0b',
  red:     '#ef4444', slate:   '#94a3b8', sky:   '#0ea5e9',
  violet:  '#8b5cf6', rose:    '#f43f5e',
};

const ACO_COLORS = [C.brand, C.emerald, C.amber, C.sky, C.violet, C.rose, '#14b8a6', '#f97316'];

const TICK = { fontSize: 11, fill: '#94a3b8' };
const GRID = { strokeDasharray: '3 3', stroke: '#f1f5f9' };
const TIP  = { contentStyle: { fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: 'none' } };

const STATUS_VARIANT: Record<AcoStatus, BadgeVariant> = {
  'on-track': 'success', exceeded: 'info', 'at-risk': 'warning', 'under-review': 'danger',
};

const RISK_VARIANT: Record<RiskLevel, BadgeVariant> = {
  low: 'success', medium: 'warning', high: 'danger', critical: 'danger',
};

type ViewTab = 'portfolio' | 'comparison' | 'monthly';

// ─── Sub-components ───────────────────────────────────────────────────────────

function AcoSelectChip({ aco, selected, onToggle }: {
  aco: AcoRecord; selected: boolean; onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={[
        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all',
        selected
          ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
          : 'bg-white text-slate-600 border-surface-border hover:border-brand-300',
      ].join(' ')}
    >
      <span className={[
        'w-2 h-2 rounded-full flex-shrink-0',
        aco.status === 'exceeded'     ? 'bg-sky-400'     :
        aco.status === 'on-track'     ? 'bg-emerald-400' :
        aco.status === 'at-risk'      ? 'bg-amber-400'   : 'bg-red-400',
      ].join(' ')} />
      {aco.acoId}
      {selected && <X className="w-3 h-3 ml-0.5" />}
    </button>
  );
}

// ─── Portfolio KPIs ───────────────────────────────────────────────────────────

function PortfolioKpis({ acos }: { acos: AcoRecord[] }) {
  const totalBeneficiaries = acos.reduce((s, a) => s + a.beneficiaries, 0);
  const totalSavings       = acos.reduce((s, a) => s + a.savings, 0);
  const avgQuality         = acos.reduce((s, a) => s + a.qualityScore, 0) / acos.length;
  const avgSavingsPct      = acos.reduce((s, a) => s + a.savingsPct, 0) / acos.length;
  const atRisk             = acos.filter(a => a.riskLevel === 'high' || a.riskLevel === 'critical').length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <KpiCard label="Total ACOs"          value={acos.length}                          icon={BarChart2}     trend="neutral" />
      <KpiCard label="Total Beneficiaries" value={totalBeneficiaries.toLocaleString()}  icon={Users}         change={1.8} trend="up" />
      <KpiCard label="Portfolio Savings"   value={'$' + totalSavings.toFixed(1) + 'M'} icon={DollarSign}    change={2.4} trend="up" />
      <KpiCard label="Avg Quality Score"   value={avgQuality.toFixed(1)}                icon={Activity}      change={1.1} trend="up" />
      <KpiCard label="At-Risk ACOs"        value={atRisk + ' / ' + acos.length}         icon={AlertTriangle} trend={atRisk > 2 ? 'down' : 'neutral'} />
    </div>
  );
}

// ─── Portfolio tab ────────────────────────────────────────────────────────────

function PortfolioTab({ acos }: { acos: AcoRecord[] }) {
  const [sortKey, setSortKey] = useState<keyof AcoRecord>('savingsPct');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sorted = useMemo(() =>
    [...acos].sort((a, b) => {
      const av = a[sortKey] as number;
      const bv = b[sortKey] as number;
      return sortDir === 'desc' ? bv - av : av - bv;
    }), [acos, sortKey, sortDir]);

  function toggleSort(key: keyof AcoRecord) {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortKey(key); setSortDir('desc'); }
  }

  const SortIcon = ({ k }: { k: keyof AcoRecord }) =>
    sortKey === k
      ? (sortDir === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)
      : null;

  // Scatter data: quality vs savings
  const scatterData = acos.map(a => ({
    x: a.savingsPct, y: a.qualityScore, z: a.beneficiaries / 1000,
    name: a.acoId, status: a.status,
  }));

  return (
    <div className="flex flex-col gap-5">
      {/* Savings rate + quality scatter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Savings Rate by ACO" subtitle="Current performance year (%)" height={260}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[...acos].sort((a, b) => b.savingsPct - a.savingsPct)}
              margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid {...GRID} />
              <XAxis dataKey="acoId" tick={TICK} tickLine={false} axisLine={false} />
              <YAxis tick={TICK} tickLine={false} axisLine={false} tickFormatter={v => v + '%'} />
              <Tooltip {...TIP} formatter={(v: number) => [v + '%', 'Savings Rate']} />
              <Bar dataKey="savingsPct" radius={[4, 4, 0, 0]} name="Savings Rate">
                {acos.map((a, i) => (
                  <Cell key={a.id} fill={
                    a.savingsPct >= 5 ? C.emerald :
                    a.savingsPct >= 2 ? C.brand   :
                    a.savingsPct >= 0 ? C.amber   : C.red
                  } />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Quality vs Savings" subtitle="Bubble size = beneficiary volume" height={260}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid {...GRID} />
              <XAxis dataKey="x" type="number" name="Savings %" tick={TICK} tickLine={false} axisLine={false} tickFormatter={v => v + '%'} label={{ value: 'Savings %', position: 'insideBottom', offset: -2, fontSize: 10, fill: '#94a3b8' }} />
              <YAxis dataKey="y" type="number" name="Quality" tick={TICK} tickLine={false} axisLine={false} domain={[60, 100]} />
              <ZAxis dataKey="z" range={[40, 400]} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                formatter={(val: number, name: string) => [
                  name === 'x' ? val + '%' : name === 'y' ? val : val + 'K',
                  name === 'x' ? 'Savings' : name === 'y' ? 'Quality' : 'Beneficiaries',
                ]}
              />
              <Scatter data={scatterData} fill={C.brand} fillOpacity={0.7} />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Risk distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <ChartCard title="Risk Distribution" subtitle="ACOs by risk level" height={200}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                { level: 'Low',      count: acos.filter(a => a.riskLevel === 'low').length,      fill: C.emerald },
                { level: 'Medium',   count: acos.filter(a => a.riskLevel === 'medium').length,   fill: C.amber   },
                { level: 'High',     count: acos.filter(a => a.riskLevel === 'high').length,     fill: C.red     },
                { level: 'Critical', count: acos.filter(a => a.riskLevel === 'critical').length, fill: '#7f1d1d' },
              ]}
              margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid {...GRID} />
              <XAxis dataKey="level" tick={TICK} tickLine={false} axisLine={false} />
              <YAxis tick={TICK} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip {...TIP} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} name="ACOs">
                {[C.emerald, C.amber, C.red, '#7f1d1d'].map((fill, i) => (
                  <Cell key={i} fill={fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Status Breakdown" subtitle="Performance vs target" height={200} className="lg:col-span-2">
          <div className="flex items-center gap-3 h-full">
            {(['exceeded', 'on-track', 'at-risk', 'under-review'] as AcoStatus[]).map(s => {
              const count = acos.filter(a => a.status === s).length;
              const pct   = Math.round((count / acos.length) * 100);
              return (
                <div key={s} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-2xl font-bold text-slate-800">{count}</div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: pct + '%',
                        backgroundColor:
                          s === 'exceeded'     ? C.sky     :
                          s === 'on-track'     ? C.emerald :
                          s === 'at-risk'      ? C.amber   : C.red,
                      }}
                    />
                  </div>
                  <Badge variant={STATUS_VARIANT[s]} dot>{s.replace('-', ' ')}</Badge>
                </div>
              );
            })}
          </div>
        </ChartCard>
      </div>

      {/* Sortable ACO table */}
      <Card padding={false}>
        <div className="px-5 py-4 border-b border-surface-border flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">ACO Portfolio — All Records</h3>
            <p className="text-xs text-slate-400 mt-0.5">{acos.length} ACOs · Click column headers to sort</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>ACO</th>
                <th>Region / Track</th>
                <th className="cursor-pointer hover:text-slate-700" onClick={() => toggleSort('beneficiaries')}>
                  <span className="flex items-center gap-1">Beneficiaries <SortIcon k="beneficiaries" /></span>
                </th>
                <th className="cursor-pointer hover:text-slate-700 text-right" onClick={() => toggleSort('savingsPct')}>
                  <span className="flex items-center justify-end gap-1">Savings % <SortIcon k="savingsPct" /></span>
                </th>
                <th className="cursor-pointer hover:text-slate-700 text-right" onClick={() => toggleSort('qualityScore')}>
                  <span className="flex items-center justify-end gap-1">Quality <SortIcon k="qualityScore" /></span>
                </th>
                <th className="cursor-pointer hover:text-slate-700 text-center" onClick={() => toggleSort('riskScore')}>
                  <span className="flex items-center justify-center gap-1">Risk <SortIcon k="riskScore" /></span>
                </th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(aco => (
                <React.Fragment key={aco.id}>
                  <tr
                    className="cursor-pointer"
                    onClick={() => setExpandedId(expandedId === aco.id ? null : aco.id)}
                  >
                    <td>
                      <div className="font-medium text-slate-800 text-xs">{aco.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{aco.acoId}</div>
                    </td>
                    <td>
                      <div className="text-xs text-slate-600">{aco.region}</div>
                      <div className="text-[10px] text-slate-400">{aco.track}</div>
                    </td>
                    <td className="text-slate-700">{aco.beneficiaries.toLocaleString()}</td>
                    <td className="text-right">
                      <span className={['font-semibold text-sm', aco.savingsPct >= 3 ? 'text-emerald-600' : aco.savingsPct >= 0 ? 'text-amber-600' : 'text-red-500'].join(' ')}>
                        {aco.savingsPct >= 0 ? '+' : ''}{aco.savingsPct.toFixed(2)}%
                      </span>
                    </td>
                    <td className="text-right font-semibold text-slate-800">{aco.qualityScore.toFixed(1)}</td>
                    <td className="text-center">
                      <span className={['inline-flex items-center justify-center w-10 h-6 rounded text-xs font-bold',
                        aco.riskScore >= 75 ? 'bg-red-100 text-red-700' :
                        aco.riskScore >= 50 ? 'bg-amber-100 text-amber-700' :
                        aco.riskScore >= 25 ? 'bg-yellow-50 text-yellow-700' :
                        'bg-emerald-50 text-emerald-700',
                      ].join(' ')}>{aco.riskScore}</span>
                    </td>
                    <td><Badge variant={STATUS_VARIANT[aco.status]} dot>{aco.status.replace('-', ' ')}</Badge></td>
                  </tr>
                  {/* Inline expand row */}
                  {expandedId === aco.id && (
                    <tr>
                      <td colSpan={7} className="bg-slate-50 px-5 py-4">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                          {[
                            { label: 'Benchmark', value: '$' + aco.benchmark + 'M' },
                            { label: 'Actual Expenditure', value: '$' + aco.actualExpenditure + 'M' },
                            { label: 'Savings Amount', value: '$' + aco.savings.toFixed(1) + 'M' },
                            { label: 'High-Risk Beneficiaries', value: aco.highRiskBeneficiaries.toLocaleString() },
                            { label: 'Providers', value: aco.providers },
                            { label: 'Performance Year', value: aco.performanceYear },
                            { label: 'Risk Level', value: aco.riskLevel.toUpperCase() },
                            { label: 'Track', value: aco.track },
                          ].map(d => (
                            <div key={d.label} className="bg-white rounded-lg p-3 border border-surface-border">
                              <p className="text-[10px] text-slate-400 uppercase tracking-wide">{d.label}</p>
                              <p className="font-semibold text-slate-800 mt-0.5">{d.value}</p>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── Comparison tab ───────────────────────────────────────────────────────────

function ComparisonTab({ selected }: { selected: AcoRecord[] }) {
  if (selected.length === 0) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <Filter className="w-8 h-8 text-slate-300" />
          <p className="text-sm font-semibold text-slate-500">No ACOs selected</p>
          <p className="text-xs text-slate-400">Use the ACO selector above to choose 2–4 ACOs to compare</p>
        </div>
      </Card>
    );
  }

  // Build comparison bar data
  const metricsData = [
    { metric: 'Savings %',    ...Object.fromEntries(selected.map(a => [a.acoId, a.savingsPct])) },
    { metric: 'Quality',      ...Object.fromEntries(selected.map(a => [a.acoId, a.qualityScore])) },
    { metric: 'Risk Score',   ...Object.fromEntries(selected.map(a => [a.acoId, a.riskScore])) },
  ];

  // Monthly comparison line data
  const monthlyData = (() => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug'];
    return months.map((month, i) => {
      const row: Record<string, number | string> = { month };
      selected.forEach(a => {
        const trend = mockMonthlyTrends[a.id];
        if (trend) row[a.acoId] = trend[i]?.savings ?? 0;
      });
      return row;
    });
  })();

  return (
    <div className="flex flex-col gap-5">
      {/* Side-by-side metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {selected.map((aco, ci) => (
          <div key={aco.id} className="bg-white rounded-xl border-2 border-surface-border p-4" style={{ borderColor: ACO_COLORS[ci] + '40' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: ACO_COLORS[ci] }} />
              <div>
                <p className="text-xs font-semibold text-slate-700 leading-tight">{aco.acoId}</p>
                <p className="text-[10px] text-slate-400 truncate max-w-[100px]">{aco.name}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Savings', value: aco.savingsPct.toFixed(2) + '%' },
                { label: 'Quality', value: aco.qualityScore.toFixed(1) },
                { label: 'Risk',    value: aco.riskScore },
                { label: 'Benes',   value: (aco.beneficiaries / 1000).toFixed(1) + 'K' },
              ].map(m => (
                <div key={m.label}>
                  <p className="text-[10px] text-slate-400">{m.label}</p>
                  <p className="text-sm font-bold text-slate-800">{m.value}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Monthly savings rate comparison */}
      <ChartCard title="Monthly Savings Rate Comparison" subtitle="Selected ACOs — YTD (%)" height={280}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={monthlyData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid {...GRID} />
            <XAxis dataKey="month" tick={TICK} tickLine={false} axisLine={false} />
            <YAxis tick={TICK} tickLine={false} axisLine={false} tickFormatter={v => v + '%'} />
            <Tooltip {...TIP} formatter={(v: number) => [v.toFixed(2) + '%', '']} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {selected.map((a, ci) => (
              <Line
                key={a.id}
                type="monotone"
                dataKey={a.acoId}
                stroke={ACO_COLORS[ci]}
                strokeWidth={2}
                dot={{ r: 3, fill: ACO_COLORS[ci] }}
                name={a.acoId}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Grouped bar comparison */}
      <ChartCard title="Key Metrics Comparison" subtitle="Savings %, Quality Score, Risk Score" height={260}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={metricsData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid {...GRID} />
            <XAxis dataKey="metric" tick={TICK} tickLine={false} axisLine={false} />
            <YAxis tick={TICK} tickLine={false} axisLine={false} />
            <Tooltip {...TIP} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {selected.map((a, ci) => (
              <Bar key={a.id} dataKey={a.acoId} fill={ACO_COLORS[ci]} radius={[3, 3, 0, 0]} barSize={18} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

// ─── Monthly tab ──────────────────────────────────────────────────────────────

function MonthlyTab({ selected }: { selected: AcoRecord[] }) {
  const [metric, setMetric] = useState<'savings' | 'qualityScore' | 'beneficiaries' | 'edVisitRate' | 'readmissionRate'>('savings');

  const METRICS = [
    { key: 'savings',         label: 'Savings Rate %'     },
    { key: 'qualityScore',    label: 'Quality Score'       },
    { key: 'beneficiaries',   label: 'Beneficiaries'       },
    { key: 'edVisitRate',     label: 'ED Visit Rate'       },
    { key: 'readmissionRate', label: 'Readmission Rate %'  },
  ] as const;

  // Decide which ACOs to chart
  const acoPool = selected.length > 0 ? selected : mockAcos;

  // Build monthly line data for chosen metric
  const lineData = (() => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug'];
    return months.map((month, i) => {
      const row: Record<string, number | string> = { month };
      acoPool.forEach(a => {
        const trend = mockMonthlyTrends[a.id];
        if (trend) row[a.acoId] = trend[i]?.[metric] ?? 0;
      });
      return row;
    });
  })();

  // Portfolio aggregate
  const portfolioLine = mockPortfolioMonthly.map(m => ({
    month: m.month,
    value: m[metric],
  }));

  return (
    <div className="flex flex-col gap-5">
      {/* Metric selector */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
        {METRICS.map(m => (
          <button
            key={m.key}
            onClick={() => setMetric(m.key)}
            className={[
              'flex-shrink-0 px-4 py-2 rounded-lg text-xs font-semibold transition-colors',
              metric === m.key ? 'bg-white text-brand-700 shadow-card' : 'text-slate-500 hover:text-slate-700',
            ].join(' ')}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Portfolio aggregate trend */}
      <ChartCard
        title={'Portfolio Monthly — ' + METRICS.find(m => m.key === metric)!.label}
        subtitle="All ACOs aggregate — YTD"
        height={260}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={portfolioLine} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="portGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={C.brand} stopOpacity={0.15} />
                <stop offset="95%" stopColor={C.brand} stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid {...GRID} />
            <XAxis dataKey="month" tick={TICK} tickLine={false} axisLine={false} />
            <YAxis tick={TICK} tickLine={false} axisLine={false} />
            <Tooltip {...TIP} />
            <Area type="monotone" dataKey="value" stroke={C.brand} strokeWidth={2} fill="url(#portGrad)" name="Portfolio" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Per-ACO monthly lines */}
      <ChartCard
        title={selected.length > 0 ? 'Selected ACOs — Monthly ' + METRICS.find(m => m.key === metric)!.label : 'All ACOs — Monthly ' + METRICS.find(m => m.key === metric)!.label}
        subtitle={selected.length > 0 ? selected.map(a => a.acoId).join(', ') : 'Full portfolio'}
        height={300}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={lineData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid {...GRID} />
            <XAxis dataKey="month" tick={TICK} tickLine={false} axisLine={false} />
            <YAxis tick={TICK} tickLine={false} axisLine={false} />
            <Tooltip {...TIP} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {acoPool.map((a, ci) => (
              <Line
                key={a.id}
                type="monotone"
                dataKey={a.acoId}
                stroke={ACO_COLORS[ci % ACO_COLORS.length]}
                strokeWidth={2}
                dot={false}
                name={a.acoId}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Monthly summary table */}
      <Card padding={false}>
        <div className="px-5 py-4 border-b border-surface-border">
          <h3 className="text-sm font-semibold text-slate-800">Monthly Summary Table</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {METRICS.find(m => m.key === metric)!.label} — all 8 months
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>ACO</th>
                {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug'].map(m => (
                  <th key={m} className="text-right">{m}</th>
                ))}
                <th className="text-right">Trend</th>
              </tr>
            </thead>
            <tbody>
              {acoPool.map(aco => {
                const trend = mockMonthlyTrends[aco.id] ?? [];
                const vals  = trend.map(t => t[metric]);
                const first = vals[0] ?? 0;
                const last  = vals[vals.length - 1] ?? 0;
                const up    = last >= first;
                return (
                  <tr key={aco.id}>
                    <td>
                      <span className="font-medium text-slate-800 text-xs">{aco.acoId}</span>
                      <span className="text-[10px] text-slate-400 ml-1.5 hidden sm:inline">{aco.region}</span>
                    </td>
                    {vals.map((v, i) => (
                      <td key={i} className="text-right text-xs tabular-nums text-slate-700">
                        {typeof v === 'number' ? (metric === 'beneficiaries' ? v.toLocaleString() : v.toFixed(metric === 'readmissionRate' || metric === 'savings' ? 2 : 1)) : v}
                      </td>
                    ))}
                    <td className="text-right">
                      {up
                        ? <TrendingUp   className="w-4 h-4 text-emerald-500 ml-auto" />
                        : <TrendingDown className="w-4 h-4 text-red-400 ml-auto"     />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function CmsAnalytics() {
  const [activeTab, setActiveTab]       = useState<ViewTab>('portfolio');
  const [selectedIds, setSelectedIds]   = useState<Set<string>>(new Set());
  const [regionFilter, setRegionFilter] = useState<Region | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<AcoStatus | 'All'>('All');

  // Filtered pool (for portfolio table + selection)
  const filteredAcos = useMemo(() =>
    mockAcos.filter(a =>
      (regionFilter === 'All' || a.region === regionFilter) &&
      (statusFilter === 'All' || a.status === statusFilter)
    ), [regionFilter, statusFilter]);

  const selectedAcos = mockAcos.filter(a => selectedIds.has(a.id));

  function toggleAco(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 6) next.add(id);
      return next;
    });
  }

  const TABS: Array<{ key: ViewTab; label: string }> = [
    { key: 'portfolio',  label: 'Portfolio Overview' },
    { key: 'comparison', label: 'ACO Comparison'     },
    { key: 'monthly',    label: 'Monthly Analysis'   },
  ];

  const REGIONS: Array<Region | 'All'> = ['All', 'Northeast', 'Southeast', 'Midwest', 'Southwest', 'West'];
  const STATUSES: Array<AcoStatus | 'All'> = ['All', 'exceeded', 'on-track', 'at-risk', 'under-review'];

  return (
    <>
      <PageHeader
        title="CMS Analytics"
        subtitle="Portfolio-wide ACO performance analysis — FY2026"
        breadcrumb={['CMS Analytics', 'Analytics']}
        actions={
          <span className="text-xs text-slate-400">
            {filteredAcos.length} of {mockAcos.length} ACOs shown
          </span>
        }
      />

      {/* Filters */}
      <Card className="mb-5">
        <div className="flex flex-wrap items-center gap-4">
          {/* Region */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Region</span>
            <div className="flex gap-1">
              {REGIONS.map(r => (
                <button
                  key={r}
                  onClick={() => setRegionFilter(r)}
                  className={[
                    'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
                    regionFilter === r ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                  ].join(' ')}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          {/* Status */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</span>
            <div className="flex gap-1">
              {STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={[
                    'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
                    statusFilter === s ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                  ].join(' ')}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Portfolio KPIs — always visible */}
      <PortfolioKpis acos={filteredAcos} />

      {/* ACO multi-select chips */}
      <Card className="mb-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide mr-1">
            Select ACOs
          </span>
          <span className="text-xs text-slate-400 mr-2">(up to 6 for comparison)</span>
          {mockAcos.map(aco => (
            <AcoSelectChip
              key={aco.id}
              aco={aco}
              selected={selectedIds.has(aco.id)}
              onToggle={() => toggleAco(aco.id)}
            />
          ))}
          {selectedIds.size > 0 && (
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-xs text-slate-400 hover:text-slate-600 ml-2 flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear all
            </button>
          )}
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-5">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={[
              'flex-1 px-4 py-2 rounded-lg text-xs font-semibold transition-colors',
              activeTab === t.key ? 'bg-white text-brand-700 shadow-card' : 'text-slate-500 hover:text-slate-700',
            ].join(' ')}
          >
            {t.label}
            {t.key === 'comparison' && selectedIds.size > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-brand-600 text-white text-[9px] font-bold">
                {selectedIds.size}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'portfolio'  && <PortfolioTab  acos={filteredAcos} />}
      {activeTab === 'comparison' && <ComparisonTab selected={selectedAcos} />}
      {activeTab === 'monthly'    && <MonthlyTab    selected={selectedAcos} />}
    </>
  );
}
