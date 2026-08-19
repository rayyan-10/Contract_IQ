import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getAcoProfile } from '@/data/mockAcoData';
import { PageHeader } from '@/components/common/PageHeader';
import { KpiCard } from '@/components/common/KpiCard';
import { ChartCard } from '@/components/common/ChartCard';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  DollarSign, Activity, BarChart2, AlertTriangle,
  TrendingUp, TrendingDown, Users,
} from 'lucide-react';
import type { BadgeVariant } from '@/types';

// ─── Section type ─────────────────────────────────────────────────────────────

type Section = 'financial' | 'quality' | 'utilization' | 'risk' | 'cost';

const SECTIONS: Array<{ key: Section; label: string; icon: React.ReactNode }> = [
  { key: 'financial',   label: 'Financial',    icon: <DollarSign    className="w-3.5 h-3.5" /> },
  { key: 'quality',     label: 'Quality',      icon: <Activity      className="w-3.5 h-3.5" /> },
  { key: 'utilization', label: 'Utilization',  icon: <BarChart2     className="w-3.5 h-3.5" /> },
  { key: 'risk',        label: 'Risk',         icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  { key: 'cost',        label: 'Cost Drivers', icon: <TrendingUp    className="w-3.5 h-3.5" /> },
];

// ─── Chart constants ──────────────────────────────────────────────────────────

const C = {
  brand:   '#6366f1',
  emerald: '#10b981',
  amber:   '#f59e0b',
  red:     '#ef4444',
  slate:   '#94a3b8',
  sky:     '#0ea5e9',
  violet:  '#8b5cf6',
};

const TICK = { fontSize: 11, fill: '#94a3b8' };
const GRID = { strokeDasharray: '3 3', stroke: '#f1f5f9' };
const TIP  = {
  contentStyle: { fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: 'none' },
  cursor: { stroke: '#e2e8f0' },
};

const PIE_COLORS = [C.emerald, C.brand, C.amber, C.red];

// ─── Section: Financial ───────────────────────────────────────────────────────

function FinancialSection({ data }: { data: ReturnType<typeof getAcoProfile> }) {
  const { financial } = data;
  const s = financial.summary;

  return (
    <div className="flex flex-col gap-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard label="Savings Rate"      value={s.savingsRate + '%'}  change={0.4}  trend="up"   icon={TrendingUp}   />
        <KpiCard label="Shared Savings"    value={'$' + s.sharedSavings + 'M'} change={1.2} trend="up" icon={DollarSign} />
        <KpiCard label="Performance Gap"   value={s.performanceGap + '%'} change={0.8} trend="up"   icon={BarChart2}    />
        <KpiCard label="Benchmark PMPM"    value={'$' + s.benchmarkPMPM} trend="neutral" icon={Activity} />
        <KpiCard label="Actual PMPM"       value={'$' + s.actualPMPM}    change={1.1}  trend="up"   icon={DollarSign}   />
        <KpiCard label="Min Loss Rate"     value={s.minLossRate + '%'}   trend="neutral" icon={AlertTriangle} />
      </div>

      {/* Monthly benchmark vs actual */}
      <ChartCard title="Monthly Expenditure PMPM" subtitle="Benchmark vs Actual — YTD ($)" height={280}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={financial.monthly} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={C.brand} stopOpacity={0.15} />
                <stop offset="95%" stopColor={C.brand} stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid {...GRID} />
            <XAxis dataKey="month" tick={TICK} tickLine={false} axisLine={false} />
            <YAxis tick={TICK} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
            <Tooltip {...TIP} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="benchmark" stroke={C.slate}  strokeWidth={1.5} strokeDasharray="4 3" fill="none"            name="Benchmark" />
            <Area type="monotone" dataKey="actual"    stroke={C.brand}  strokeWidth={2}   fill="url(#actualGrad)"                       name="Actual"    />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

// ─── Section: Quality ─────────────────────────────────────────────────────────

function QualitySection({ data }: { data: ReturnType<typeof getAcoProfile> }) {
  const { quality } = data;

  return (
    <div className="flex flex-col gap-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Composite Score"  value={quality.compositeScore}  change={quality.compositeChange} trend="up" icon={Activity} />
        <KpiCard label="Preventive Care"  value={quality.domains[0].score + '%'} trend="up"     icon={Activity}      />
        <KpiCard label="Patient Safety"   value={quality.domains[2].score + '%'} trend="up"     icon={Activity}      />
        <KpiCard label="Care Coord."      value={quality.domains[3].score + '%'} trend="up"     icon={Activity}      />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Domain scores vs benchmark */}
        <ChartCard title="Quality Domains" subtitle="Score vs Benchmark" height={280}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={quality.domains} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid {...GRID} horizontal={false} />
              <XAxis type="number" domain={[60, 100]} tick={TICK} tickLine={false} axisLine={false} />
              <YAxis dataKey="domain" type="category" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={110} />
              <Tooltip {...TIP} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="benchmark" fill={C.slate}  radius={[0, 3, 3, 0]} name="Benchmark" barSize={8} />
              <Bar dataKey="score"     fill={C.brand}  radius={[0, 3, 3, 0]} name="Score"     barSize={8} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Quarterly trend radar */}
        <ChartCard title="Quality Radar" subtitle="Latest quarter — domain breakdown" height={280}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart
              data={[
                { domain: 'Preventive',  score: quality.domains[0].score },
                { domain: 'Chronic',     score: quality.domains[1].score },
                { domain: 'Safety',      score: quality.domains[2].score },
                { domain: 'Care Coord.', score: quality.domains[3].score },
                { domain: 'Patient Exp', score: quality.domains[4].score },
                { domain: 'At-Risk',     score: quality.domains[5].score },
              ]}
              margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
            >
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="domain" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Radar dataKey="score" stroke={C.brand} fill={C.brand} fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Quarterly composite trend */}
      <ChartCard title="Quarterly Quality Trend" subtitle="Composite & domain scores over time" height={260}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={quality.quarterly} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid {...GRID} />
            <XAxis dataKey="quarter" tick={TICK} tickLine={false} axisLine={false} />
            <YAxis tick={TICK} tickLine={false} axisLine={false} domain={[75, 100]} />
            <Tooltip {...TIP} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="composite"  stroke={C.brand}   strokeWidth={2.5} dot={{ r: 3 }} name="Composite"    />
            <Line type="monotone" dataKey="preventive" stroke={C.emerald} strokeWidth={1.5} dot={false}    name="Preventive"   />
            <Line type="monotone" dataKey="chronic"    stroke={C.amber}   strokeWidth={1.5} dot={false}    name="Chronic Mgmt" />
            <Line type="monotone" dataKey="patientExp" stroke={C.sky}     strokeWidth={1.5} dot={false}    name="Patient Exp"  />
            <Line type="monotone" dataKey="careCoord"  stroke={C.violet}  strokeWidth={1.5} dot={false}    name="Care Coord"   />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

// ─── Section: Utilization ─────────────────────────────────────────────────────

function UtilizationSection({ data }: { data: ReturnType<typeof getAcoProfile> }) {
  const { utilization } = data;

  const variantFor = (rate: number, benchmark: number, higherIsBetter = false): BadgeVariant => {
    const better = higherIsBetter ? rate >= benchmark : rate <= benchmark;
    return better ? 'success' : 'warning';
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Metrics table */}
      <Card padding={false}>
        <div className="px-5 py-4 border-b border-surface-border">
          <h3 className="text-sm font-semibold text-slate-800">Key Utilization Metrics</h3>
          <p className="text-xs text-slate-400 mt-0.5">Rate vs. national benchmark</p>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th className="text-right">ACO Rate</th>
              <th className="text-right">Benchmark</th>
              <th className="text-right">Unit</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {utilization.metrics.map(m => {
              const higherIsBetter = m.category === 'Preventive Visits';
              const v = variantFor(m.rate, m.benchmark, higherIsBetter);
              const better = higherIsBetter ? m.rate >= m.benchmark : m.rate <= m.benchmark;
              return (
                <tr key={m.category}>
                  <td className="font-medium text-slate-800">{m.category}</td>
                  <td className="text-right font-semibold text-slate-800">{m.rate}</td>
                  <td className="text-right text-slate-500">{m.benchmark}</td>
                  <td className="text-right text-slate-400 text-xs">{m.unit}</td>
                  <td>
                    <Badge variant={v} dot>
                      {better ? 'Better' : 'Above avg'}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* Monthly trend */}
      <ChartCard title="Monthly Utilization Trend" subtitle="ED visits & inpatient days YTD" height={260}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={utilization.monthly} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid {...GRID} />
            <XAxis dataKey="month" tick={TICK} tickLine={false} axisLine={false} />
            <YAxis tick={TICK} tickLine={false} axisLine={false} />
            <Tooltip {...TIP} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="edVisits"         stroke={C.red}     strokeWidth={2} dot={{ r: 3 }} name="ED Visits"        />
            <Line type="monotone" dataKey="inpatientDays"    stroke={C.brand}   strokeWidth={2} dot={{ r: 3 }} name="Inpatient Days"   />
            <Line type="monotone" dataKey="preventiveVisits" stroke={C.emerald} strokeWidth={2} dot={{ r: 3 }} name="Preventive Visits"/>
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

// ─── Section: Risk ────────────────────────────────────────────────────────────

function RiskSection({ data }: { data: ReturnType<typeof getAcoProfile> }) {
  const { risk } = data;

  return (
    <div className="flex flex-col gap-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard label="Avg RAF Score"     value={risk.avgRafScore}   change={0.05} trend="up"   icon={Activity}      />
        <KpiCard label="High Risk Count"   value={risk.highRiskCount.toLocaleString()} change={0.5} trend="down" icon={AlertTriangle} />
        <KpiCard label="High Risk %"       value={risk.highRiskPct + '%'}  change={0.3}  trend="down" icon={Users}         />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Risk band donut */}
        <ChartCard title="Risk Stratification" subtitle="Beneficiaries by risk band" height={260}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={risk.bands}
                dataKey="count"
                nameKey="band"
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={100}
                paddingAngle={3}
                label={({ band, pct }) => band + ' ' + pct + '%'}
                labelLine={false}
              >
                {risk.bands.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                formatter={(val: number) => val.toLocaleString()}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* RAF trend */}
        <ChartCard title="RAF Score Trend" subtitle="Monthly average RAF & high-risk count" height={260}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={risk.monthly} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid {...GRID} />
              <XAxis dataKey="month" tick={TICK} tickLine={false} axisLine={false} />
              <YAxis yAxisId="raf"  tick={TICK} tickLine={false} axisLine={false} domain={[1.1, 1.3]} />
              <YAxis yAxisId="cnt"  tick={TICK} tickLine={false} axisLine={false} orientation="right" />
              <Tooltip {...TIP} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line yAxisId="raf" type="monotone" dataKey="avgRaf"        stroke={C.brand}  strokeWidth={2} dot={{ r: 3 }} name="Avg RAF"         />
              <Line yAxisId="cnt" type="monotone" dataKey="highRiskCount" stroke={C.red}    strokeWidth={2} dot={false}    name="High Risk Count"  />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Risk band detail table */}
      <Card padding={false}>
        <div className="px-5 py-4 border-b border-surface-border">
          <h3 className="text-sm font-semibold text-slate-800">Risk Band Detail</h3>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Band</th>
              <th className="text-right">Count</th>
              <th className="text-right">% of Pop.</th>
              <th className="text-right">Avg RAF</th>
            </tr>
          </thead>
          <tbody>
            {risk.bands.map((b, i) => (
              <tr key={b.band}>
                <td>
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i] }} />
                    <span className="font-medium text-slate-800">{b.band}</span>
                  </span>
                </td>
                <td className="text-right font-semibold text-slate-800">{b.count.toLocaleString()}</td>
                <td className="text-right text-slate-600">{b.pct}%</td>
                <td className="text-right text-slate-600">{b.avgRaf}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ─── Section: Cost Drivers ────────────────────────────────────────────────────

function CostSection({ data }: { data: ReturnType<typeof getAcoProfile> }) {
  const { cost } = data;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Cost breakdown bar */}
        <ChartCard title="Expenditure by Category" subtitle={'Total $' + cost.totalExpenditure + 'M — current period'} height={280}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cost.drivers} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid {...GRID} horizontal={false} />
              <XAxis type="number" tick={TICK} tickLine={false} axisLine={false} tickFormatter={v => '$' + v + 'M'} />
              <YAxis dataKey="category" type="category" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={110} />
              <Tooltip {...TIP} formatter={(v: number) => ['$' + v + 'M', 'Expenditure']} />
              <Bar dataKey="amount" fill={C.brand} radius={[0, 4, 4, 0]} name="Amount ($M)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Cost % pie */}
        <ChartCard title="Cost Distribution" subtitle="Share of total expenditure" height={280}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={cost.drivers}
                dataKey="pct"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={100}
                paddingAngle={2}
              >
                {cost.drivers.map((_, i) => (
                  <Cell key={i} fill={[C.brand, C.sky, C.emerald, C.violet, C.amber, C.slate][i % 6]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} formatter={(v: number) => v + '%'} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* YoY table */}
      <Card padding={false}>
        <div className="px-5 py-4 border-b border-surface-border">
          <h3 className="text-sm font-semibold text-slate-800">Year-over-Year Change by Category</h3>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Category</th>
              <th className="text-right">Amount</th>
              <th className="text-right">% of Total</th>
              <th className="text-right">YoY Change</th>
            </tr>
          </thead>
          <tbody>
            {cost.drivers.map(d => (
              <tr key={d.category}>
                <td className="font-medium text-slate-800">{d.category}</td>
                <td className="text-right font-semibold text-slate-800">${d.amount}M</td>
                <td className="text-right text-slate-500">{d.pct}%</td>
                <td className="text-right">
                  <span className={[
                    'flex items-center justify-end gap-1 font-semibold text-xs',
                    d.yoyChange < 0 ? 'text-emerald-600' : 'text-red-500',
                  ].join(' ')}>
                    {d.yoyChange < 0
                      ? <TrendingDown className="w-3.5 h-3.5" />
                      : <TrendingUp   className="w-3.5 h-3.5" />}
                    {Math.abs(d.yoyChange)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function AcoAnalytics() {
  const { user } = useAuth();
  const acoId    = user?.acoId ?? 'ACO-001';
  const data     = getAcoProfile(acoId);
  const profile  = data.profile;

  const [activeSection, setActiveSection] = useState<Section>('financial');

  return (
    <>
      <PageHeader
        title="Analytics"
        subtitle={profile.acoName + ' — ' + profile.trackType}
        breadcrumb={['ACO Operations', 'Analytics']}
        actions={
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-medium text-slate-600">PY {profile.performanceYear}</span>
            <span>·</span>
            <span>{profile.totalBeneficiaries.toLocaleString()} beneficiaries</span>
            <span>·</span>
            <span>{profile.totalProviders} providers</span>
          </div>
        }
      />

      {/* Section tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-5 overflow-x-auto">
        {SECTIONS.map(s => (
          <button
            key={s.key}
            onClick={() => setActiveSection(s.key)}
            className={[
              'flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors duration-150',
              activeSection === s.key
                ? 'bg-white text-brand-700 shadow-card'
                : 'text-slate-500 hover:text-slate-700',
            ].join(' ')}
          >
            {s.icon}
            {s.label}
          </button>
        ))}
      </div>

      {/* Section content */}
      {activeSection === 'financial'   && <FinancialSection   data={data} />}
      {activeSection === 'quality'     && <QualitySection     data={data} />}
      {activeSection === 'utilization' && <UtilizationSection data={data} />}
      {activeSection === 'risk'        && <RiskSection        data={data} />}
      {activeSection === 'cost'        && <CostSection        data={data} />}
    </>
  );
}
