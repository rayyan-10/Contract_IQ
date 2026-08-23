import React from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Users, TrendingUp, Activity, ArrowRight, AlertTriangle, BarChart2 } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { KpiCard } from '@/components/common/KpiCard';
import { ChartCard } from '@/components/common/ChartCard';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend, LineChart, Line,
} from 'recharts';
import type { BadgeVariant } from '@/types';

const TICK = { fontSize: 11, fill: '#8b7355' };
const GRID = { strokeDasharray: '3 3', stroke: '#ede8d0' };
const TIP  = { contentStyle: { fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: 'none' } };

const savingsData = [
  { month: 'Jan', benchmark: 892, actual: 862, savings: 3.4 },
  { month: 'Feb', benchmark: 891, actual: 856, savings: 3.9 },
  { month: 'Mar', benchmark: 893, actual: 852, savings: 4.6 },
  { month: 'Apr', benchmark: 892, actual: 848, savings: 4.9 },
  { month: 'May', benchmark: 894, actual: 849, savings: 5.0 },
  { month: 'Jun', benchmark: 893, actual: 845, savings: 5.4 },
  { month: 'Jul', benchmark: 895, actual: 844, savings: 5.7 },
  { month: 'Aug', benchmark: 894, actual: 843, savings: 5.7 },
];

const qualityData = [
  { measure: 'Diabetes Care',  score: 87, benchmark: 82 },
  { measure: 'Preventive',     score: 91, benchmark: 85 },
  { measure: 'Hypertension',   score: 79, benchmark: 78 },
  { measure: 'Mental Health',  score: 74, benchmark: 72 },
  { measure: 'Care Coord.',    score: 86, benchmark: 81 },
];

const riskTrend = [
  { month: 'Mar', critical: 2, high: 5, medium: 8 },
  { month: 'Apr', critical: 2, high: 5, medium: 7 },
  { month: 'May', critical: 1, high: 4, medium: 7 },
  { month: 'Jun', critical: 1, high: 4, medium: 6 },
  { month: 'Jul', critical: 1, high: 3, medium: 6 },
  { month: 'Aug', critical: 1, high: 3, medium: 5 },
];

const contracts: Array<{ name: string; track: string; region: string; status: string; savings: string; quality: number }> = [
  { name: 'Northeast Health Alliance',   track: 'Track 1B', region: 'Northeast', status: 'on-track',     savings: '+4.2%', quality: 88 },
  { name: 'Midwest Premier Network',     track: 'Track 3',  region: 'Midwest',   status: 'exceeded',     savings: '+6.8%', quality: 91 },
  { name: 'Gulf Coast Care Network',     track: 'Track 1A', region: 'Southeast', status: 'at-risk',      savings: '+1.6%', quality: 75 },
  { name: 'Mountain West Partners',      track: 'REACH',    region: 'Southwest', status: 'exceeded',     savings: '+6.4%', quality: 90 },
  { name: 'Appalachian Community ACO',   track: 'Track 1A', region: 'Southeast', status: 'under-review', savings: '-2.9%', quality: 69 },
];

const statusVariant: Record<string, BadgeVariant> = {
  'on-track': 'success', exceeded: 'info', 'at-risk': 'warning', 'under-review': 'danger',
};

export function CmsDashboard() {
  const atRisk = contracts.filter(c => c.status === 'at-risk' || c.status === 'under-review').length;

  return (
    <>
      <PageHeader
        title="Overview"
        subtitle="FY2026 Performance"
        actions={
          <Link to="/cms/analytics" className="flex items-center gap-1.5 text-xs font-semibold text-maroon-900 hover:text-maroon-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg transition-colors">
            Full Analytics <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Portfolio Savings"      value="$74.5M"   change={3.2} trend="up"      changeLabel="vs prior year" icon={DollarSign}  accent="emerald"  />
        <KpiCard label="Assigned Beneficiaries" value="214,390"  change={1.8} trend="up"      icon={Users}              accent="amber"    />
        <KpiCard label="Quality Composite"      value="84.2"     change={2.1} trend="up"      icon={Activity}           accent="maroon"   />
        <KpiCard label="At-Risk ACOs"           value={atRisk + ' / ' + contracts.length} trend={atRisk > 1 ? 'down' : 'neutral'} icon={AlertTriangle} accent="red" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <ChartCard title="Expenditure PMPM vs Benchmark" subtitle="Portfolio aggregate — YTD ($)" className="lg:col-span-2" height={260} accent="maroon">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={savingsData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3d1515" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3d1515" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid {...GRID} />
              <XAxis dataKey="month" tick={TICK} tickLine={false} axisLine={false} />
              <YAxis tick={TICK} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
              <Tooltip {...TIP} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="benchmark" stroke="#8b7355" strokeWidth={1.5} strokeDasharray="4 3" fill="none"            name="Benchmark" />
              <Area type="monotone" dataKey="actual"    stroke="#3d1515" strokeWidth={2}   fill="url(#actualGrad)"                       name="Actual"    />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Quality by Domain" subtitle="Score vs benchmark" height={260} accent="amber">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={qualityData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid {...GRID} horizontal={false} />
              <XAxis type="number" domain={[60, 100]} tick={TICK} tickLine={false} axisLine={false} />
              <YAxis dataKey="measure" type="category" tick={{ fontSize: 10, fill: '#8b7355' }} tickLine={false} axisLine={false} width={78} />
              <Tooltip {...TIP} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="benchmark" fill="#e2e8f0" radius={[0, 3, 3, 0]} name="Benchmark" barSize={7} />
              <Bar dataKey="score"     fill="#3d1515" radius={[0, 3, 3, 0]} name="Score"     barSize={7} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <ChartCard title="Portfolio Savings Rate" subtitle="Monthly trend — all ACOs (%)" height={220} accent="emerald">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={savingsData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid {...GRID} />
              <XAxis dataKey="month" tick={TICK} tickLine={false} axisLine={false} />
              <YAxis tick={TICK} tickLine={false} axisLine={false} tickFormatter={v => v + '%'} />
              <Tooltip {...TIP} formatter={(v: number) => [v + '%', 'Savings Rate']} />
              <Line type="monotone" dataKey="savings" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3, fill: '#10b981' }} name="Savings %" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="ACO Risk Distribution" subtitle="Count by risk level — 6 months" className="lg:col-span-2" height={220} accent="maroon">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={riskTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid {...GRID} />
              <XAxis dataKey="month" tick={TICK} tickLine={false} axisLine={false} />
              <YAxis tick={TICK} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip {...TIP} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="medium"   stackId="a" fill="#f59e0b" name="Medium"   radius={[0, 0, 0, 0]} />
              <Bar dataKey="high"     stackId="a" fill="#ef4444" name="High"     />
              <Bar dataKey="critical" stackId="a" fill="#7f1d1d" name="Critical" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Contracts table */}
      <Card padding={false}>
        <div className="px-5 py-4 border-b border-cream-300 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-maroon-900">Active Contracts</h3>
            <p className="text-xs text-maroon-800/40 mt-0.5">Performance snapshot — current performance year</p>
          </div>
          <Link to="/cms/analytics" className="text-xs text-maroon-900 hover:underline font-medium flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Contract / ACO</th>
              <th>Track</th>
              <th>Region</th>
              <th className="text-center">Quality</th>
              <th className="text-right">Savings</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map(c => (
              <tr key={c.name}>
                <td className="font-medium text-maroon-900">{c.name}</td>
                <td className="text-maroon-800/60 text-xs">{c.track}</td>
                <td className="text-maroon-800/60 text-xs">{c.region}</td>
                <td className="text-center font-semibold text-maroon-800">{c.quality}</td>
                <td className={`text-right font-bold text-sm ${parseFloat(c.savings) >= 3 ? 'text-emerald-600' : parseFloat(c.savings) >= 0 ? 'text-amber-600' : 'text-red-500'}`}>
                  {c.savings}
                </td>
                <td><Badge variant={statusVariant[c.status]} dot>{c.status.replace('-', ' ')}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

