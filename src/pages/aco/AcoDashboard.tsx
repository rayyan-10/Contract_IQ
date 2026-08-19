import React from 'react';
import { Users, TrendingUp, Award, BarChart2 } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { KpiCard } from '@/components/common/KpiCard';
import { ChartCard } from '@/components/common/ChartCard';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';
import type { BadgeVariant } from '@/types';

const performanceData = [
  { q: 'Q1 2025', actual: 3.1, target: 3.5 },
  { q: 'Q2 2025', actual: 3.8, target: 3.5 },
  { q: 'Q3 2025', actual: 3.6, target: 3.5 },
  { q: 'Q4 2025', actual: 4.2, target: 3.5 },
  { q: 'Q1 2026', actual: 4.5, target: 4.0 },
  { q: 'Q2 2026', actual: 4.9, target: 4.0 },
];

const radarData = [
  { domain: 'Preventive', score: 88 },
  { domain: 'Chronic Mgmt', score: 74 },
  { domain: 'Patient Safety', score: 91 },
  { domain: 'Care Coord.', score: 82 },
  { domain: 'Patient Exp.', score: 78 },
  { domain: 'Utilization', score: 85 },
];

const providers = [
  { name: 'Dr. [Name A]', specialty: 'Internal Medicine', qualityScore: 94, costIndex: 0.91, status: 'active' },
  { name: 'Dr. [Name B]', specialty: 'Cardiology',        qualityScore: 88, costIndex: 1.12, status: 'active' },
  { name: 'Dr. [Name C]', specialty: 'Family Medicine',   qualityScore: 79, costIndex: 0.98, status: 'active' },
  { name: 'Dr. [Name D]', specialty: 'Endocrinology',     qualityScore: 91, costIndex: 0.95, status: 'active' },
];

const statusVariant: Record<string, BadgeVariant> = {
  active: 'success', inactive: 'neutral', pending: 'warning',
};

export function AcoDashboard() {
  return (
    <>
      <PageHeader
        title="ACO Dashboard"
        subtitle="Performance Overview — Current Period"
        breadcrumb={['ACO Operations', 'Dashboard']}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total Providers" value="312" change={4.0} trend="up" icon={Users} />
        <KpiCard label="Avg Quality Score" value="86.4" change={1.9} trend="up" icon={Award} />
        <KpiCard label="Cost Savings" value="$8.3M" change={5.2} trend="up" icon={TrendingUp} />
        <KpiCard label="Shared Savings %" value="52%" change={2.0} trend="up" icon={BarChart2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <ChartCard title="Savings Rate Trend" subtitle="Quarterly — Actual vs Target (%)" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="q" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              <Line type="monotone" dataKey="target" stroke="#cbd5e1" strokeWidth={1.5} strokeDasharray="4 3" dot={false} name="Target" />
              <Line type="monotone" dataKey="actual" stroke="#6366f1" strokeWidth={2} dot={{ r: 3, fill: '#6366f1' }} name="Actual" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Quality Domains" subtitle="Composite Score Radar">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="domain" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <Card padding={false}>
        <div className="px-5 py-4 border-b border-surface-border">
          <h3 className="text-sm font-semibold text-slate-800">Top Providers</h3>
          <p className="text-xs text-slate-400 mt-0.5">Quality & cost performance</p>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Provider</th>
              <th>Specialty</th>
              <th className="text-center">Quality Score</th>
              <th className="text-center">Cost Index</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {providers.map(p => (
              <tr key={p.name}>
                <td className="font-medium text-slate-800">{p.name}</td>
                <td className="text-slate-500">{p.specialty}</td>
                <td className="text-center font-semibold text-slate-800">{p.qualityScore}</td>
                <td className={`text-center font-semibold ${p.costIndex <= 1 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {p.costIndex.toFixed(2)}
                </td>
                <td>
                  <Badge variant={statusVariant[p.status]} dot>{p.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
