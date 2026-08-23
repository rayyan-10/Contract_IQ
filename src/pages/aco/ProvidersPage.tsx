import React, { useState, useMemo } from 'react';
import { Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import type { BadgeVariant } from '@/types';

// ─── Mock provider data ───────────────────────────────────────────────────────

interface Provider {
  id: string;
  name: string;
  specialty: string;
  type: 'Physician' | 'Hospital' | 'Clinic' | 'Group';
  qualityScore: number;
  costIndex: number;
  beneficiaries: number;
  riskTier: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'active' | 'inactive' | 'pending';
}

const PROVIDERS: Provider[] = [
  { id: 'PRV_001', name: 'Sunrise Valley Medical Center', specialty: 'Internal Medicine', type: 'Hospital', qualityScore: 94, costIndex: 0.91, beneficiaries: 620, riskTier: 'LOW', status: 'active' },
  { id: 'PRV_002', name: 'Dr. Rachel Greenwood',          specialty: 'Cardiology',        type: 'Physician', qualityScore: 88, costIndex: 1.12, beneficiaries: 340, riskTier: 'MEDIUM', status: 'active' },
  { id: 'PRV_003', name: 'Lakeside Family Clinic',        specialty: 'Family Medicine',   type: 'Clinic',    qualityScore: 79, costIndex: 0.98, beneficiaries: 510, riskTier: 'MEDIUM', status: 'active' },
  { id: 'PRV_004', name: 'Dr. Marcus Chen',               specialty: 'Endocrinology',     type: 'Physician', qualityScore: 91, costIndex: 0.95, beneficiaries: 280, riskTier: 'LOW', status: 'active' },
  { id: 'PRV_005', name: 'Evergreen Geriatrics Group',    specialty: 'Geriatrics',        type: 'Group',     qualityScore: 86, costIndex: 1.04, beneficiaries: 420, riskTier: 'LOW', status: 'pending' },
  { id: 'PRV_006', name: 'Mountain View Orthopedics',     specialty: 'Orthopedics',       type: 'Clinic',    qualityScore: 72, costIndex: 1.22, beneficiaries: 195, riskTier: 'HIGH', status: 'active' },
  { id: 'PRV_007', name: 'Dr. Sarah Patel',               specialty: 'Pulmonology',       type: 'Physician', qualityScore: 83, costIndex: 1.08, beneficiaries: 310, riskTier: 'MEDIUM', status: 'active' },
  { id: 'PRV_008', name: 'ClearView Physician Network',   specialty: 'Multi-Specialty',   type: 'Group',     qualityScore: 90, costIndex: 0.93, beneficiaries: 870, riskTier: 'LOW', status: 'active' },
  { id: 'PRV_009', name: 'Harbor Health Clinic',          specialty: 'Primary Care',      type: 'Clinic',    qualityScore: 76, costIndex: 1.15, beneficiaries: 445, riskTier: 'HIGH', status: 'active' },
  { id: 'PRV_010', name: 'Dr. James Okafor',             specialty: 'Nephrology',        type: 'Physician', qualityScore: 85, costIndex: 1.01, beneficiaries: 220, riskTier: 'LOW', status: 'inactive' },
  { id: 'PRV_011', name: 'Northside Behavioral Health',   specialty: 'Psychiatry',        type: 'Clinic',    qualityScore: 81, costIndex: 0.97, beneficiaries: 360, riskTier: 'MEDIUM', status: 'active' },
  { id: 'PRV_012', name: 'Valley Surgical Associates',    specialty: 'General Surgery',   type: 'Group',     qualityScore: 87, costIndex: 1.18, beneficiaries: 155, riskTier: 'MEDIUM', status: 'active' },
];

const STATUS_VARIANT: Record<string, BadgeVariant> = { active: 'success', inactive: 'neutral', pending: 'warning' };
const RISK_VARIANT: Record<string, BadgeVariant> = { LOW: 'success', MEDIUM: 'warning', HIGH: 'danger' };

// ─── Main Page ────────────────────────────────────────────────────────────────

export function ProvidersPage() {
  const [search, setSearch]         = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortKey, setSortKey]       = useState<keyof Provider>('qualityScore');
  const [sortDir, setSortDir]       = useState<'asc' | 'desc'>('desc');

  const filtered = useMemo(() =>
    PROVIDERS
      .filter(p => {
        if (riskFilter !== 'all' && p.riskTier !== riskFilter) return false;
        if (typeFilter !== 'all' && p.type !== typeFilter) return false;
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.specialty.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        const av = a[sortKey]; const bv = b[sortKey];
        if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'desc' ? bv - av : av - bv;
        return sortDir === 'desc' ? String(bv).localeCompare(String(av)) : String(av).localeCompare(String(bv));
      })
  , [search, riskFilter, typeFilter, sortKey, sortDir]);

  function toggleSort(key: keyof Provider) {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortKey(key); setSortDir('desc'); }
  }

  const SortIcon = ({ k }: { k: keyof Provider }) =>
    sortKey === k ? (sortDir === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />) : null;

  return (
    <>
      <PageHeader title="Providers" subtitle={filtered.length + ' of ' + PROVIDERS.length + ' providers'} />

      {/* Filters */}
      <Card className="mb-5">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-maroon-800/30 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search provider name, specialty, ID…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 text-xs rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-maroon-900 placeholder:text-maroon-800/30 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all"
            />
          </div>

          {/* Risk filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-maroon-800/40" />
            <span className="text-[10px] font-bold text-maroon-800/40 uppercase tracking-wider">Risk</span>
            <div className="flex gap-1">
              {[
                { key: 'all', label: 'All' },
                { key: 'LOW', label: 'Low', dot: 'bg-emerald-500' },
                { key: 'MEDIUM', label: 'Medium', dot: 'bg-amber-500' },
                { key: 'HIGH', label: 'High', dot: 'bg-red-500' },
              ].map(f => (
                <button key={f.key} onClick={() => setRiskFilter(f.key)}
                  className={['flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all',
                    riskFilter === f.key ? 'bg-maroon-900 text-white' : 'bg-cream-200 text-maroon-800/60 hover:bg-cream-300',
                  ].join(' ')}>
                  {f.dot && <span className={'w-2 h-2 rounded-full ' + f.dot} />}
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Type filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-maroon-800/40 uppercase tracking-wider">Type</span>
            <div className="flex gap-1">
              {['all', 'Physician', 'Hospital', 'Clinic', 'Group'].map(t => (
                <button key={t} onClick={() => setTypeFilter(t)}
                  className={['px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all',
                    typeFilter === t ? 'bg-maroon-900 text-white' : 'bg-cream-200 text-maroon-800/60 hover:bg-cream-300',
                  ].join(' ')}>
                  {t === 'all' ? 'All' : t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Provider</th>
                <th>Specialty</th>
                <th>Type</th>
                <th className="cursor-pointer hover:text-maroon-800 text-center" onClick={() => toggleSort('qualityScore')}>
                  <span className="flex items-center justify-center gap-1">Quality <SortIcon k="qualityScore" /></span>
                </th>
                <th className="cursor-pointer hover:text-maroon-800 text-center" onClick={() => toggleSort('costIndex')}>
                  <span className="flex items-center justify-center gap-1">Cost Index <SortIcon k="costIndex" /></span>
                </th>
                <th className="cursor-pointer hover:text-maroon-800 text-right" onClick={() => toggleSort('beneficiaries')}>
                  <span className="flex items-center justify-end gap-1">Beneficiaries <SortIcon k="beneficiaries" /></span>
                </th>
                <th>Risk</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <p className="font-semibold text-maroon-900 text-xs">{p.name}</p>
                    <p className="text-[10px] text-maroon-800/30 font-mono">{p.id}</p>
                  </td>
                  <td className="text-xs text-maroon-800/70">{p.specialty}</td>
                  <td><span className="text-[10px] font-semibold text-maroon-800/50 bg-cream-200 px-2 py-0.5 rounded-full border border-cream-300">{p.type}</span></td>
                  <td className="text-center">
                    <span className={['font-bold text-sm', p.qualityScore >= 90 ? 'text-emerald-600' : p.qualityScore >= 80 ? 'text-maroon-900' : 'text-amber-600'].join(' ')}>
                      {p.qualityScore}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className={['font-bold text-sm', p.costIndex <= 1 ? 'text-emerald-600' : p.costIndex <= 1.1 ? 'text-amber-600' : 'text-red-500'].join(' ')}>
                      {p.costIndex.toFixed(2)}
                    </span>
                  </td>
                  <td className="text-right font-semibold text-maroon-900 text-sm">{p.beneficiaries.toLocaleString()}</td>
                  <td><Badge variant={RISK_VARIANT[p.riskTier]} dot>{p.riskTier}</Badge></td>
                  <td><Badge variant={STATUS_VARIANT[p.status]} dot>{p.status}</Badge></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-8 text-sm text-maroon-800/40">No providers match your filters</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
