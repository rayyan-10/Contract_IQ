import React, { useState, useEffect } from 'react';
import {
  FileText, ChevronRight, TrendingUp, TrendingDown, Minus,
  Trash2, Clock, Shield, X, ArrowRight,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { getWhatIfHistory, type WhatIfHistoryItem, type RiskTier } from './WhatIfSimulator';

function tierColor(tier: RiskTier) {
  return tier === 'HIGH'   ? { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', ring: '#ef4444', dot: 'bg-red-500' }
       : tier === 'MEDIUM' ? { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', ring: '#f5a623', dot: 'bg-amber-500' }
       : { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', ring: '#10b981', dot: 'bg-emerald-500' };
}

function tierLabel(tier: RiskTier) {
  return tier === 'HIGH' ? 'High' : tier === 'MEDIUM' ? 'Medium' : 'Low';
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' at ' +
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function MiniRing({ tier, size = 48 }: { tier: RiskTier; size?: number }) {
  const tc = tierColor(tier);
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const pct = tier === 'HIGH' ? 0.85 : tier === 'MEDIUM' ? 0.6 : 0.3;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#ede8d0" strokeWidth="5" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={tc.ring}
          strokeWidth="5" strokeLinecap="round"
          strokeDasharray={(pct * circ).toString() + ' ' + circ.toString()} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={'text-[9px] font-bold ' + tc.text}>{tierLabel(tier)}</span>
      </div>
    </div>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function ReportDetail({ item, onClose }: { item: WhatIfHistoryItem; onClose: () => void }) {
  const origTc = tierColor(item.originalTier);
  const simTc = tierColor(item.simulatedTier);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-maroon-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-cream-300 w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-card-lg animate-scale-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-cream-300 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-maroon-900 to-maroon-800 flex items-center justify-center">
              <FileText className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-maroon-900">Simulation Report</p>
              <p className="text-[10px] text-maroon-800/40 font-mono">{item.providerId}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-maroon-800/40 hover:text-maroon-900 hover:bg-cream-200 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Meta */}
          <div className="flex items-center gap-2 text-xs text-maroon-800/40">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatDate(item.timestamp)}</span>
          </div>

          {/* Provider info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Provider ID', value: item.providerId },
              { label: 'ACO', value: item.acoId },
              { label: 'Year', value: item.year },
              { label: 'Specialty', value: item.specialty },
            ].map(d => (
              <div key={d.label} className="bg-cream-100 rounded-xl px-3 py-2.5 border border-cream-300">
                <p className="text-[9px] text-maroon-800/35 uppercase tracking-wider font-semibold">{d.label}</p>
                <p className="text-xs font-bold text-maroon-900 mt-0.5 truncate font-mono">{d.value}</p>
              </div>
            ))}
          </div>

          {/* Comparison */}
          <div className="grid grid-cols-3 gap-4">
            <div className={['rounded-2xl border-2 p-5 flex flex-col items-center', origTc.border, origTc.bg].join(' ')}>
              <p className="text-[9px] font-bold text-maroon-800/40 uppercase tracking-wider mb-2">Original</p>
              <MiniRing tier={item.originalTier} size={64} />
              <p className={'text-sm font-bold mt-2 ' + origTc.text}>{item.originalTier}</p>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className={[
                'flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border',
                item.riskChange === 'improved' ? 'bg-emerald-50 border-emerald-200' :
                item.riskChange === 'worsened' ? 'bg-red-50 border-red-200' :
                'bg-cream-200 border-cream-300',
              ].join(' ')}>
                {item.riskChange === 'improved' && <TrendingDown className="w-5 h-5 text-emerald-500" />}
                {item.riskChange === 'worsened' && <TrendingUp className="w-5 h-5 text-red-500" />}
                {item.riskChange === 'unchanged' && <Minus className="w-5 h-5 text-maroon-800/30" />}
                <span className={['text-[10px] font-bold capitalize',
                  item.riskChange === 'improved' ? 'text-emerald-700' :
                  item.riskChange === 'worsened' ? 'text-red-700' : 'text-maroon-800/50',
                ].join(' ')}>{item.riskChange}</span>
              </div>
            </div>

            <div className={['rounded-2xl border-2 p-5 flex flex-col items-center', simTc.border, simTc.bg].join(' ')}>
              <p className="text-[9px] font-bold text-maroon-800/40 uppercase tracking-wider mb-2">Simulated</p>
              <MiniRing tier={item.simulatedTier} size={64} />
              <p className={'text-sm font-bold mt-2 ' + simTc.text}>{item.simulatedTier}</p>
            </div>
          </div>

          {/* Modifications */}
          <div className="rounded-2xl border border-cream-300 overflow-hidden">
            <div className="px-5 py-3 bg-cream-100 border-b border-cream-300">
              <p className="text-xs font-bold text-maroon-900">Metric Changes</p>
            </div>
            <div className="divide-y divide-cream-200">
              {Object.entries(item.modifications).map(([key, val]) => {
                const isUp = val.change > 0;
                const isDown = val.change < 0;
                return (
                  <div key={key} className="flex items-center justify-between px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className={['w-6 h-6 rounded-md flex items-center justify-center',
                        isUp ? 'bg-red-50 border border-red-200' : isDown ? 'bg-emerald-50 border border-emerald-200' : 'bg-cream-200 border border-cream-300',
                      ].join(' ')}>
                        {isUp ? <TrendingUp className="w-3 h-3 text-red-500" /> :
                         isDown ? <TrendingDown className="w-3 h-3 text-emerald-500" /> :
                         <Minus className="w-3 h-3 text-maroon-800/30" />}
                      </div>
                      <span className="text-xs font-semibold text-maroon-900">{key.replace(/_/g, ' ').replace(/\bvs\b/g, 'vs').replace(/\b\w/g, c => c.toUpperCase())}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="font-mono text-maroon-800/50">{val.original.toFixed(1)}</span>
                      <ArrowRight className="w-3 h-3 text-maroon-800/15" />
                      <span className="font-mono font-bold text-maroon-900">{val.modified.toFixed(1)}</span>
                      <span className={['font-bold px-2 py-0.5 rounded-md',
                        isUp ? 'bg-red-50 text-red-600 border border-red-200' :
                        isDown ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                        'bg-cream-200 text-maroon-800/40',
                      ].join(' ')}>
                        {val.change >= 0 ? '+' : ''}{val.change.toFixed(1)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Reports Page ────────────────────────────────────────────────────────

export function ReportsPage() {
  const [history, setHistory] = useState<WhatIfHistoryItem[]>([]);
  const [selected, setSelected] = useState<WhatIfHistoryItem | null>(null);

  useEffect(() => {
    setHistory(getWhatIfHistory());
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem('contractiq_whatif_history', JSON.stringify(updated));
  };

  return (
    <>
      <PageHeader title="Reports" />

      {history.length === 0 ? (
        <div className="bg-white rounded-2xl border border-cream-300 p-12 flex flex-col items-center justify-center text-center" style={{ boxShadow: '0 2px 8px rgba(61,21,21,0.03)' }}>
          <div className="w-16 h-16 rounded-2xl bg-cream-200 border border-cream-300 flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-maroon-800/20" />
          </div>
          <p className="text-sm font-bold text-maroon-900 mb-1">No Reports Yet</p>
          <p className="text-xs text-maroon-800/40 max-w-xs leading-relaxed">
            Run a What-If simulation and save the result to see it here. Reports are stored locally for quick access.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-maroon-800/40 mb-4">{history.length} simulation report{history.length !== 1 ? 's' : ''} saved</p>

          {history.map(item => {
            const origTc = tierColor(item.originalTier);
            const simTc = tierColor(item.simulatedTier);
            const modCount = Object.keys(item.modifications).length;
            return (
              <div
                key={item.id}
                onClick={() => setSelected(item)}
                className="group bg-white rounded-2xl border border-cream-300 p-5 cursor-pointer transition-all duration-200 hover:border-amber-300 hover:shadow-card-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-card"
                style={{ boxShadow: '0 2px 8px rgba(61,21,21,0.03)' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Doc icon */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cream-200 to-cream-300 border border-cream-300 flex items-center justify-center group-hover:from-amber-50 group-hover:to-amber-100 group-hover:border-amber-200 transition-all">
                      <FileText className="w-5 h-5 text-maroon-800/30 group-hover:text-amber-600 transition-colors" />
                    </div>

                    {/* Details */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold text-maroon-900 group-hover:text-amber-800 transition-colors">{item.providerId}</p>
                        <span className="text-[9px] font-bold text-maroon-800/30 bg-cream-200 px-2 py-0.5 rounded-full border border-cream-300">{item.year}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-maroon-800/40">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(item.timestamp)}
                        </span>
                        <span>•</span>
                        <span>{item.specialty}</span>
                        <span>•</span>
                        <span>{modCount} metric{modCount !== 1 ? 's' : ''} modified</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Risk transition */}
                    <div className="hidden md:flex items-center gap-2">
                      <span className={['text-xs font-bold px-2.5 py-1 rounded-lg border', origTc.bg, origTc.border, origTc.text].join(' ')}>
                        {item.originalTier}
                      </span>
                      <span className={[
                        'text-xs font-bold',
                        item.riskChange === 'improved' ? 'text-emerald-500' :
                        item.riskChange === 'worsened' ? 'text-red-500' : 'text-maroon-800/30',
                      ].join(' ')}>→</span>
                      <span className={['text-xs font-bold px-2.5 py-1 rounded-lg border', simTc.bg, simTc.border, simTc.text].join(' ')}>
                        {item.simulatedTier}
                      </span>
                    </div>

                    {/* Change badge */}
                    <div className={[
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold',
                      item.riskChange === 'improved' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                      item.riskChange === 'worsened' ? 'bg-red-50 border-red-200 text-red-700' :
                      'bg-cream-200 border-cream-300 text-maroon-800/50',
                    ].join(' ')}>
                      {item.riskChange === 'improved' && <TrendingDown className="w-3 h-3" />}
                      {item.riskChange === 'worsened' && <TrendingUp className="w-3 h-3" />}
                      {item.riskChange === 'unchanged' && <Minus className="w-3 h-3" />}
                      <span className="capitalize">{item.riskChange}</span>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className="p-2 rounded-lg text-maroon-800/20 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                      aria-label="Delete report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Chevron */}
                    <ChevronRight className="w-4 h-4 text-maroon-800/20 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      {selected && <ReportDetail item={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
