import React from 'react';
import { Link } from 'react-router-dom';
import { Users, TrendingUp, Award, BarChart2, DollarSign, AlertTriangle, ArrowRight, Activity } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { KpiCard } from '@/components/common/KpiCard';
import { ChartCard } from '@/components/common/ChartCard';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { useAuth } from '@/context/AuthContext';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';
import type { BadgeVariant } from '@/types';

const TICK = { fontSize: 11, fill: '#8b7355' };
const GRID = { strokeDasharray: '3 3', stroke: '#ede8d0' };
const TIP  = { contentStyle: { fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: 'none' } };

const savingsData = [
  { q: 'Q1 25', actual: 3.1, target: 3.5 },
  { q: 'Q2 25', actual: 3.8, target: 3.5 },
  { q: 'Q3 25', actual: 3.6, target: 3.5 },
  { q: 'Q4 25', actual: 4.2, target: 3.5 },
  { q: 'Q1 26', actual: 4.5, target: 4.0 },
  { q: 'Q2 26', actual: 4.9, target: 4.0 },
];

const expendData = [
  { month: 'Jan', benchmark: 892, actual: 862 },
  { month: 'Feb', benchmark: 891, actual: 858 },
  { month: 'Mar', benchmark: 891, actual: 851 },
  { month: 'Apr', benchmark: 892, actual: 848 },
  { month: 'May', benchmark: 892, actual: 853 },
  { month: 'Jun', benchmark: 893, actual: 849 },
  { month: 'Jul', benchmark: 893, actual: 845 },
  { month: 'Aug', benchmark: 894, actual: 843 },
];

const radarData = [
  { domain: 'Preventive',   score: 91 },
  { domain: 'Chronic Mgmt', score: 85 },
  { domain: 'Safety',       score: 93 },
  { domain: 'Care Coord.',  score: 86 },
  { domain: 'Patient Exp.', score: 83 },
  { domain: 'At-Risk',      score: 81 },
];

const utilData = [
  { month: 'Mar', ed: 328, inpatient: 218, preventive: 74 },
  { month: 'Apr', ed: 319, inpatient: 212, preventive: 76 },
  { month: 'May', ed: 312, inpatient: 208, preventive: 78 },
  { month: 'Jun', ed: 308, inpatient: 204, preventive: 80 },
  { month: 'Jul', ed: 314, inpatient: 206, preventive: 81 },
  { month: 'Aug', ed: 312, inpatient: 201, preventive: 82 },
];

const providers: Array<{ name: string; specialty: string; quality: number; costIndex: number; status: string }> = [
  { name: 'Dr. [Provider A]', specialty: 'Internal Medicine', quality: 94, costIndex: 0.91, status: 'active' },
  { name: 'Dr. [Provider B]', specialty: 'Cardiology',        quality: 88, costIndex: 1.12, status: 'active' },
  { name: 'Dr. [Provider C]', specialty: 'Family Medicine',   quality: 79, costIndex: 0.98, status: 'active' },
  { name: 'Dr. [Provider D]', specialty: 'Endocrinology',     quality: 91, costIndex: 0.95, status: 'active' },
  { name: 'Dr. [Provider E]', specialty: 'Geriatrics',        quality: 86, costIndex: 1.04, status: 'pending' },
];

const statusVariant: Record<string, BadgeVariant> = {
  active: 'success', inactive: 'neutral', pending: 'warning',
};

export function AcoDashboard() {
  const { user } = useAuth();
  const acoName = user?.acoName ?? 'Your ACO';
  const acoId   = user?.acoId   ?? 'ACO-001';

  return (
    <>
      <PageHeader
        title="ACO Dashboard"
        subtitle={acoName + ' · ' + acoId + ' · FY2026 Performance'}
        breadcrumb={['ACO Operations', 'Dashboard']}
        actions={
          <Link to="/aco/analytics" className="flex items-center gap-1.5 text-xs font-semibold text-maroon-900 hover:text-brand-700 bg-brand-50 border border-brand-200 px-3 py-1.5 rounded-lg transition-colors">
            Deep Analytics <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total Providers"    value="312"    change={4.0}  trend="up"      icon={Users}         />
        <KpiCard label="Quality Composite"  value="88.2"   change={2.1}  trend="up"      icon={Award}         />
        <KpiCard label="Shared Savings"     value="$7.8M"  change={5.2}  trend="up"      icon={DollarSign}    />
        <KpiCard label="Savings Rate"       value="4.29%"  change={0.4}  trend="up"      icon={TrendingUp}    />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <ChartCard title="Savings Rate — Quarterly" subtitle="Actual vs target (%)" className="lg:col-span-2" height={250}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={savingsData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid {...GRID} />
              <XAxis dataKey="q" tick={TICK} tickLine={false} axisLine={false} />
              <YAxis tick={TICK} tickLine={false} axisLine={false} tickFormatter={v => v + '%'} />
              <Tooltip {...TIP} formatter={(v: number) => [v + '%', '']} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="target" stroke="#d4c89e" strokeWidth={1.5} strokeDasharray="4 3" dot={false}               name="Target" />
              <Line type="monotone" dataKey="actual" stroke="#3d1515" strokeWidth={2.5} dot={{ r: 4, fill: '#3d1515', strokeWidth: 0 }} name="Actual" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Quality Radar" subtitle="Domain scores — current quarter" height={250}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="domain" tick={{ fontSize: 10, fill: '#8b7355' }} />
              <Radar dataKey="score" stroke="#3d1515" fill="#3d1515" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ChartCard title="Expenditure PMPM" subtitle="Benchmark vs actual YTD ($)" height={220}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={expendData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="acoActualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3d1515" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#3d1515" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid {...GRID} />
              <XAxis dataKey="month" tick={TICK} tickLine={false} axisLine={false} />
              <YAxis tick={TICK} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
              <Tooltip {...TIP} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="benchmark" stroke="#8b7355" strokeWidth={1.5} strokeDasharray="4 3" fill="none"               name="Benchmark" />
              <Area type="monotone" dataKey="actual"    stroke="#3d1515" strokeWidth={2}   fill="url(#acoActualGrad)"                       name="Actual"    />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Utilization Trends" subtitle="ED visits/1K · Inpatient/1K · Preventive %" height={220}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={utilData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid {...GRID} />
              <XAxis dataKey="month" tick={TICK} tickLine={false} axisLine={false} />
              <YAxis tick={TICK} tickLine={false} axisLine={false} />
              <Tooltip {...TIP} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="ed"         fill="#ef4444" radius={[3, 3, 0, 0]} name="ED Visits"    barSize={12} />
              <Bar dataKey="inpatient"  fill="#3d1515" radius={[3, 3, 0, 0]} name="Inpatient"    barSize={12} />
              <Bar dataKey="preventive" fill="#10b981" radius={[3, 3, 0, 0]} name="Preventive %" barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Provider table */}
      <Card padding={false}>
        <div className="px-5 py-4 border-b border-cream-300 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-maroon-900">Provider Performance</h3>
            <p className="text-xs text-maroon-800/40 mt-0.5">Quality score & cost index — current period</p>
          </div>
          <Link to="/aco/providers" className="text-xs text-maroon-900 hover:underline font-medium flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Provider</th>
              <th>Specialty</th>
              <th className="text-center">Quality</th>
              <th className="text-center">Cost Index</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {providers.map(p => (
              <tr key={p.name}>
                <td className="font-medium text-maroon-900">{p.name}</td>
                <td className="text-maroon-800/60 text-xs">{p.specialty}</td>
                <td className="text-center">
                  <span className={`font-bold text-sm ${p.quality >= 90 ? 'text-emerald-600' : p.quality >= 80 ? 'text-maroon-800' : 'text-amber-600'}`}>
                    {p.quality}
                  </span>
                </td>
                <td className="text-center">
                  <span className={`font-bold text-sm ${p.costIndex <= 1 ? 'text-emerald-600' : p.costIndex <= 1.1 ? 'text-amber-600' : 'text-red-500'}`}>
                    {p.costIndex.toFixed(2)}
                  </span>
                </td>
                <td><Badge variant={statusVariant[p.status]} dot>{p.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

