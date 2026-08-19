import React from 'react';
import { DollarSign, Users, TrendingUp, Activity } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { KpiCard } from '@/components/common/KpiCard';
import { ChartCard } from '@/components/common/ChartCard';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend,
} from 'recharts';
import type { BadgeVariant } from '@/types';

const savingsData = [
  { month: 'Jan', benchmark: 4.2, actual: 4.0 },
  { month: 'Feb', benchmark: 4.2, actual: 3.9 },
  { month: 'Mar', benchmark: 4.3, actual: 4.4 },
  { month: 'Apr', benchmark: 4.3, actual: 4.6 },
  { month: 'May', benchmark: 4.4, actual: 4.7 },
  { month: 'Jun', benchmark: 4.4, actual: 4.9 },
  { month: 'Jul', benchmark: 4.5, actual: 4.8 },
  { month: 'Aug', benchmark: 4.5, actual: 5.1 },
];

const qualityData = [
  { measure: 'Diabetes Care', score: 87 },
  { measure: 'Preventive', score: 82 },
  { measure: 'Hypertension', score: 79 },
  { measure: 'Mental Health', score: 74 },
  { measure: 'Care Coord.', score: 91 },
];

const contracts = [
  { name: 'MSSP Track 1B – Northeast', status: 'on-track', savings: '+4.2%' },
  { name: 'Direct Contracting – Midwest', status: 'exceeded', savings: '+6.1%' },
  { name: 'MSSP Track 3 – Southeast', status: 'at-risk', savings: '+1.8%' },
  { name: 'ACO REACH – West Coast', status: 'on-track', savings: '+3.5%' },
];

const statusVariant: Record<string, BadgeVariant> = {
  'on-track': 'success', exceeded: 'info', 'at-risk': 'warning', 'under-review': 'neutral',
};

export function CmsDashboard() {
  return (
    <>
      <PageHeader
        title="CMS Dashboard"
        subtitle="FY2026 — All Contracts Overview"
        breadcrumb={['CMS Analytics', 'Dashboard']}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total Savings" value="$24.7M" change={3.2} trend="up" changeLabel="vs benchmark" icon={DollarSign} />
        <KpiCard label="Assigned Beneficiaries" value="142,380" change={1.8} trend="up" icon={Users} />
        <KpiCard label="Quality Composite" value="84.2%" change={2.1} trend="up" icon={Activity} />
        <KpiCard label="Savings Rate" value="4.9%" change={0.4} trend="up" icon={TrendingUp} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <ChartCard
          title="Savings vs Benchmark"
          subtitle="YTD Monthly — Expenditure PMPM ($K)"
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={savingsData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="benchmark" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 3" fill="none" name="Benchmark" />
              <Area type="monotone" dataKey="actual" stroke="#6366f1" strokeWidth={2} fill="url(#actualGrad)" name="Actual" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Quality Measures" subtitle="Composite Score by Domain">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={qualityData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis dataKey="measure" type="category" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={72} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              <Bar dataKey="score" fill="#6366f1" radius={[0, 4, 4, 0]} name="Score" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Contract table */}
      <Card padding={false}>
        <div className="px-5 py-4 border-b border-surface-border">
          <h3 className="text-sm font-semibold text-slate-800">Active Contracts</h3>
          <p className="text-xs text-slate-400 mt-0.5">Performance vs target — current period</p>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Contract Name</th>
              <th>Status</th>
              <th className="text-right">Savings Rate</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map(c => (
              <tr key={c.name}>
                <td className="font-medium text-slate-800">{c.name}</td>
                <td>
                  <Badge variant={statusVariant[c.status]} dot>
                    {c.status.replace('-', ' ')}
                  </Badge>
                </td>
                <td className="text-right font-semibold text-emerald-600">{c.savings}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
