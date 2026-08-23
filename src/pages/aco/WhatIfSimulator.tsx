import React, { useState, useEffect } from 'react';
import {
  Search, AlertTriangle, Shield, Sliders,
  ArrowRight, RotateCcw, CheckCircle2, XCircle, Minus,
  TrendingDown, TrendingUp, Zap, Target, Save, Sparkles,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Select } from '@/components/common/Select';
import {
  lookupProvider, getSimulationConfig, runSimulation,
  type ProviderLookupResponse, type SimulationConfigResponse,
  type SimulationResponse, type RiskTier,
} from '@/services/providerRiskService';

// ─── Local storage key ────────────────────────────────────────────────────────
const HISTORY_KEY = 'contractiq_whatif_history';

export interface WhatIfHistoryItem {
  id: string;
  timestamp: string;
  providerId: string;
  year: number;
  originalTier: RiskTier;
  simulatedTier: RiskTier;
  riskChange: 'improved' | 'worsened' | 'unchanged';
  modifications: Record<string, { original: number; modified: number; change: number }>;
  providerType: string;
  specialty: string;
  acoId: string;
}

export function getWhatIfHistory(): WhatIfHistoryItem[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch { return []; }
}

function saveToHistory(item: WhatIfHistoryItem) {
  const history = getWhatIfHistory();
  history.unshift(item);
  if (history.length > 50) history.pop();
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function tierColor(tier: RiskTier) {
  return tier === 'HIGH'   ? { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', ring: '#ef4444', gradient: 'from-red-500 to-red-600', lightBg: 'bg-red-50/80' }
       : tier === 'MEDIUM' ? { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', ring: '#f5a623', gradient: 'from-amber-400 to-amber-500', lightBg: 'bg-amber-50/80' }
       : { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', ring: '#10b981', gradient: 'from-emerald-400 to-emerald-500', lightBg: 'bg-emerald-50/80' };
}

function tierLabel(tier: RiskTier) {
  return tier === 'HIGH' ? 'High' : tier === 'MEDIUM' ? 'Medium' : 'Low';
}

function RiskRing({ tier, size = 130 }: { tier: RiskTier; size?: number }) {
  const tc = tierColor(tier);
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const pct = tier === 'HIGH' ? 0.85 : tier === 'MEDIUM' ? 0.6 : 0.3;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#ede8d0" strokeWidth="10" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={tc.ring}
          strokeWidth="10" strokeLinecap="round"
          strokeDasharray={(pct * circ).toString() + ' ' + circ.toString()}
          className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={'text-xl font-bold ' + tc.text}>{tierLabel(tier)}</span>
        <span className="text-[9px] text-maroon-800/40 font-semibold uppercase mt-0.5">Risk</span>
      </div>
    </div>
  );
}

const YEAR_OPTIONS = [
  { value: '', label: '— Year —' },
  { value: '2021', label: '2021' },
  { value: '2022', label: '2022' },
  { value: '2023', label: '2023' },
  { value: '2024', label: '2024' },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export function WhatIfSimulator() {
  const [providerId, setProviderId] = useState('');
  const [year, setYear]             = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError]     = useState('');
  const [lookupResult, setLookupResult]   = useState<ProviderLookupResponse | null>(null);

  const [config, setConfig]           = useState<SimulationConfigResponse | null>(null);
  const [showSimulator, setShowSimulator] = useState(false);
  const [sliderValues, setSliderValues]   = useState<Record<string, number>>({});
  const [simLoading, setSimLoading]       = useState(false);
  const [simError, setSimError]           = useState('');
  const [simResult, setSimResult]         = useState<SimulationResponse | null>(null);
  const [saved, setSaved]                 = useState(false);

  const [configLoading, setConfigLoading] = useState(false);

  const handleOpenSimulator = async () => {
    setShowSimulator(true);
    if (!config) {
      setConfigLoading(true);
      try {
        const c = await getSimulationConfig();
        setConfig(c);
      } catch (err) {
        setSimError('Failed to load simulator config.');
      } finally {
        setConfigLoading(false);
      }
    }
  };

  const handleLookup = async () => {
    if (!providerId.trim() || !year) return;
    setLookupLoading(true);
    setLookupError('');
    setLookupResult(null);
    setShowSimulator(false);
    setSimResult(null);
    setSaved(false);
    try {
      const res = await lookupProvider({ provider_id: providerId.trim(), performance_year: parseInt(year) });
      setLookupResult(res);
      if (res.current_metrics) setSliderValues({ ...res.current_metrics });
    } catch (err) {
      setLookupError(err instanceof Error ? err.message : 'Lookup failed');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSimulate = async () => {
    if (!lookupResult) return;
    setSimLoading(true);
    setSimError('');
    setSimResult(null);
    setSaved(false);

    const mods: Record<string, number> = {};
    const orig = lookupResult.current_metrics as Record<string, number>;
    for (const [key, val] of Object.entries(sliderValues)) {
      if (orig[key] !== undefined && Math.abs(val - orig[key]) > 0.01) mods[key] = val;
    }

    if (Object.keys(mods).length === 0) {
      setSimError('Adjust at least one slider to simulate.');
      setSimLoading(false);
      return;
    }

    try {
      const res = await runSimulation({
        provider_id: lookupResult.provider_id,
        performance_year: lookupResult.performance_year,
        modifications: mods,
      });
      setSimResult(res);
    } catch (err) {
      setSimError(err instanceof Error ? err.message : 'Simulation failed');
    } finally {
      setSimLoading(false);
    }
  };

  const handleSaveReport = () => {
    if (!simResult || !lookupResult) return;
    const item: WhatIfHistoryItem = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      timestamp: new Date().toISOString(),
      providerId: lookupResult.provider_id,
      year: lookupResult.performance_year,
      originalTier: simResult.original.risk_tier,
      simulatedTier: simResult.modified.risk_tier,
      riskChange: simResult.risk_change,
      modifications: simResult.modifications_applied,
      providerType: lookupResult.provider_type,
      specialty: lookupResult.specialty,
      acoId: lookupResult.aco_id,
    };
    saveToHistory(item);
    setSaved(true);
  };

  const handleReset = () => {
    setProviderId(''); setYear(''); setLookupResult(null);
    setShowSimulator(false); setSimResult(null);
    setLookupError(''); setSimError(''); setSaved(false);
  };

  return (
    <>
      <PageHeader
        title="What-If Simulator"
        actions={
          lookupResult && (
            <Button variant="ghost" size="sm" icon={<RotateCcw className="w-3.5 h-3.5" />} onClick={handleReset}>
              New Lookup
            </Button>
          )
        }
      />

      {/* ═══ SECTION 1: Input ═══════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-cream-300 p-6 mb-5" style={{ boxShadow: '0 2px 12px rgba(61,21,21,0.04)' }}>
        <div className="flex items-start gap-4 mb-6">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-maroon-900">Provider Risk Assessment</h3>
            <p className="text-xs text-maroon-800/40 mt-0.5">Enter a Provider ID and performance year to assess risk.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-maroon-800/50 uppercase tracking-wider mb-2">Provider ID</label>
            <input
              type="text"
              placeholder="PRV_SYN_ACO_XXXXXX_XXXXXX"
              value={providerId}
              onChange={e => { setProviderId(e.target.value); setLookupError(''); }}
              className="w-full rounded-xl border border-cream-300 bg-cream-100 px-4 py-3 text-sm text-maroon-900 placeholder:text-maroon-800/25 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 focus:bg-white transition-all font-mono"
            />
          </div>
          <Select label="Performance Year" options={YEAR_OPTIONS} value={year} onChange={e => setYear(e.target.value)} />
          <Button variant="primary" size="lg" loading={lookupLoading} disabled={!providerId.trim() || !year}
            icon={!lookupLoading ? <Search className="w-4 h-4" /> : undefined}
            onClick={handleLookup} className="justify-center">
            {lookupLoading ? 'Looking up…' : 'Assess Risk'}
          </Button>
        </div>

        {lookupError && (
          <div className="flex items-center gap-2 mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-xs text-red-600 font-medium">{lookupError}</p>
          </div>
        )}
      </div>

      {/* ═══ SECTION 2: Risk Result ═══════════════════════════════════════ */}
      {lookupResult && (
        <div className="space-y-5 animate-slide-up">
          {(() => {
            const tc = tierColor(lookupResult.predicted_risk_tier);
            return (
              <div className="bg-white rounded-2xl border border-cream-300 overflow-hidden" style={{ boxShadow: '0 4px 24px rgba(61,21,21,0.05)' }}>
                <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${tc.ring}30, ${tc.ring})` }} />
                <div className="p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className={['inline-flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-sm mb-5', tc.bg, tc.border, tc.text].join(' ')}>
                      {lookupResult.predicted_risk_tier === 'HIGH' && <XCircle className="w-4 h-4" />}
                      {lookupResult.predicted_risk_tier === 'MEDIUM' && <AlertTriangle className="w-4 h-4" />}
                      {lookupResult.predicted_risk_tier === 'LOW' && <CheckCircle2 className="w-4 h-4" />}
                      {lookupResult.predicted_risk_tier} RISK
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        { label: 'Provider ID', value: lookupResult.provider_id },
                        { label: 'ACO', value: lookupResult.aco_id },
                        { label: 'Year', value: lookupResult.performance_year },
                        { label: 'Type', value: lookupResult.provider_type },
                        { label: 'Specialty', value: lookupResult.specialty },
                        { label: 'Beneficiaries', value: lookupResult.beneficiary_count.toLocaleString() },
                      ].map(d => (
                        <div key={d.label} className="bg-cream-100 rounded-xl px-3.5 py-2.5 border border-cream-300/80">
                          <p className="text-[9px] text-maroon-800/35 uppercase tracking-wider font-semibold">{d.label}</p>
                          <p className="text-xs font-bold text-maroon-900 mt-0.5 truncate font-mono">{d.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <RiskRing tier={lookupResult.predicted_risk_tier} size={130} />
                  </div>
                </div>

                {lookupResult.show_simulator && !showSimulator && (
                  <div className="px-8 pb-7 flex justify-center">
                    <button
                      onClick={handleOpenSimulator}
                      className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-maroon-900 font-bold text-sm shadow-lg shadow-amber-300/30 hover:shadow-amber-400/40 hover:from-amber-300 hover:to-amber-400 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                    >
                      <Sliders className="w-4 h-4" />
                      Open What-If Simulator
                    </button>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ═══ SECTION 3: Sliders ════════════════════════════════════════ */}
          {showSimulator && (
            <div className="bg-white rounded-2xl border border-cream-300 overflow-hidden animate-slide-up" style={{ boxShadow: '0 4px 24px rgba(61,21,21,0.05)' }}>
              <div className="h-1 w-full bg-gradient-to-r from-maroon-900 via-amber-400 to-maroon-900" />
              <div className="p-7">
                <div className="flex items-center gap-3 mb-7">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-maroon-900 to-maroon-800 flex items-center justify-center shadow-md">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-maroon-900">Scenario Builder</h3>
                    <p className="text-xs text-maroon-800/40">Drag sliders to simulate how metric changes affect provider risk</p>
                  </div>
                </div>

                {configLoading && (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="w-8 h-8 rounded-full border-[3px] border-amber-200 border-t-amber-500 animate-spin" />
                    <span className="text-sm text-maroon-800/40 font-medium">Loading scenario builder…</span>
                  </div>
                )}

                {!configLoading && config && config.metrics && config.metrics.length > 0 && (
                  <>
                    <div className="space-y-4">
                      {config.metrics.map((metric, idx) => {
                        const val = sliderValues[metric.field] ?? (lookupResult?.current_metrics as Record<string, number>)?.[metric.field] ?? 0;
                        const orig = (lookupResult?.current_metrics as Record<string, number>)?.[metric.field] ?? 0;
                        const changed = Math.abs(val - orig) > 0.01;
                        const changeVal = val - orig;
                        const pctOfRange = Math.max(0, Math.min(100, ((val - metric.min) / (metric.max - metric.min)) * 100));
                        return (
                          <div key={metric.field} className={[
                            'group rounded-2xl border p-5 transition-all duration-300',
                            changed
                              ? 'border-amber-300/80 bg-gradient-to-br from-amber-50/60 via-white to-amber-50/30 shadow-card'
                              : 'border-cream-300 bg-white hover:border-cream-400 hover:shadow-sm',
                          ].join(' ')}>
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className={['w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors',
                                  changed ? 'bg-amber-400 text-maroon-900' : 'bg-cream-200 text-maroon-800/40 border border-cream-300 group-hover:bg-cream-300',
                                ].join(' ')}>
                                  {idx + 1}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-maroon-900 leading-tight">{metric.label}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[9px] font-bold text-amber-600 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-200/60">
                                      {metric.impact_pct}% model impact
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right px-3 py-1.5 rounded-lg bg-cream-100 border border-cream-300">
                                  <p className="text-[8px] text-maroon-800/30 uppercase tracking-wider leading-none mb-0.5">Current</p>
                                  <p className="text-sm font-mono font-bold text-maroon-900 leading-none">{orig.toFixed(1)}</p>
                                </div>
                                {changed && (
                                  <>
                                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                                    <div className="text-right px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200">
                                      <p className="text-[8px] text-amber-600 uppercase tracking-wider leading-none mb-0.5 font-bold">New</p>
                                      <p className="text-sm font-mono font-bold text-amber-700 leading-none">{val.toFixed(1)}</p>
                                    </div>
                                    <span className={['text-[11px] font-bold px-2 py-1 rounded-lg',
                                      changeVal > 0 ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200',
                                    ].join(' ')}>
                                      {changeVal > 0 ? '↑' : '↓'} {Math.abs(changeVal).toFixed(1)}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Slider */}
                            <div className="relative h-3 group/slider">
                              <div className="absolute inset-0 h-3 bg-cream-200/80 rounded-full border border-cream-300 overflow-hidden">
                                <div className={['h-full rounded-full transition-all duration-150',
                                  changed ? 'bg-gradient-to-r from-amber-300 to-amber-500' : 'bg-maroon-900/15',
                                ].join(' ')} style={{ width: pctOfRange + '%' }} />
                              </div>
                              <input
                                type="range"
                                min={metric.min}
                                max={metric.max}
                                step={Math.abs(metric.max - metric.min) > 1000 ? 10 : 0.1}
                                value={val}
                                onChange={e => setSliderValues(prev => ({ ...prev, [metric.field]: parseFloat(e.target.value) }))}
                                className="absolute inset-0 w-full h-3 opacity-0 cursor-pointer z-10"
                              />
                              <div className="absolute top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-150"
                                style={{ left: `calc(${pctOfRange}% - 8px)` }}>
                                <div className={['w-4 h-4 rounded-full border-[3px] shadow-md transition-all',
                                  changed ? 'bg-amber-400 border-white shadow-amber-300/50' : 'bg-white border-cream-400',
                                ].join(' ')} />
                              </div>
                            </div>
                            <div className="flex justify-between text-[9px] text-maroon-800/20 mt-1.5 font-mono px-0.5">
                              <span>{metric.min}</span>
                              <span>{metric.max}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Action */}
                    <div className="mt-8 pt-6 border-t border-cream-300 flex flex-col items-center gap-4">
                      <button onClick={() => { if (lookupResult) setSliderValues({ ...lookupResult.current_metrics }); }}
                        className="text-xs text-maroon-800/35 hover:text-maroon-900 font-medium transition-colors underline underline-offset-2 decoration-maroon-800/15 hover:decoration-maroon-800/50">
                        Reset all to original values
                      </button>
                      <button
                        onClick={handleSimulate}
                        disabled={simLoading}
                        className="flex items-center gap-2.5 px-10 py-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-maroon-900 font-bold text-sm shadow-lg shadow-amber-300/30 hover:shadow-amber-400/50 hover:from-amber-300 hover:to-amber-400 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                      >
                        {simLoading ? (
                          <><div className="w-4 h-4 rounded-full border-2 border-maroon-900/30 border-t-maroon-900 animate-spin" /> Simulating…</>
                        ) : (
                          <><Zap className="w-4.5 h-4.5" /> Run Simulation</>
                        )}
                      </button>
                    </div>
                  </>
                )}

                {!configLoading && (!config || !config.metrics || config.metrics.length === 0) && (
                  <div className="text-center py-10">
                    <p className="text-xs text-red-500">Failed to load simulation metrics.</p>
                  </div>
                )}

                {simError && (
                  <div className="flex items-center gap-2 mt-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-xs text-red-600 font-medium">{simError}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ SECTION 4: Simulation Result ═════════════════════════════ */}
          {simResult && (
            <div className="bg-white rounded-2xl border border-cream-300 overflow-hidden animate-slide-up" style={{ boxShadow: '0 4px 24px rgba(61,21,21,0.05)' }}>
              <div className="h-1.5 w-full bg-gradient-to-r from-maroon-900 via-amber-400 to-maroon-900" />
              <div className="p-8">
                {/* Header with save */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-maroon-900 to-maroon-800 flex items-center justify-center shadow-md">
                      <Target className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-maroon-900">Simulation Result</h3>
                      <p className="text-xs text-maroon-800/40">Impact analysis of your modifications</p>
                    </div>
                  </div>
                  <button
                    onClick={handleSaveReport}
                    disabled={saved}
                    className={['flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all',
                      saved
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                        : 'bg-cream-100 text-maroon-800/60 border border-cream-300 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 hover:-translate-y-0.5',
                    ].join(' ')}
                  >
                    {saved ? <><CheckCircle2 className="w-3.5 h-3.5" /> Saved to Reports</> : <><Save className="w-3.5 h-3.5" /> Save to Reports</>}
                  </button>
                </div>

                {/* Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                  {(() => {
                    const tc = tierColor(simResult.original.risk_tier);
                    return (
                      <div className={['rounded-2xl border-2 p-6 flex flex-col items-center transition-all', tc.border, tc.lightBg].join(' ')}>
                        <p className="text-[10px] font-bold text-maroon-800/40 uppercase tracking-wider mb-3">Original</p>
                        <RiskRing tier={simResult.original.risk_tier} size={100} />
                      </div>
                    );
                  })()}

                  <div className="flex flex-col items-center justify-center">
                    <div className={[
                      'flex flex-col items-center gap-2.5 px-6 py-5 rounded-2xl border-2 transition-all',
                      simResult.risk_change === 'improved'  ? 'bg-emerald-50/80 border-emerald-300' :
                      simResult.risk_change === 'worsened'  ? 'bg-red-50/80 border-red-300' :
                                                              'bg-cream-200/50 border-cream-400',
                    ].join(' ')}>
                      {simResult.risk_change === 'improved' && (
                        <><TrendingDown className="w-7 h-7 text-emerald-500" /><span className="text-sm font-bold text-emerald-700">Risk Improved</span></>
                      )}
                      {simResult.risk_change === 'worsened' && (
                        <><TrendingUp className="w-7 h-7 text-red-500" /><span className="text-sm font-bold text-red-700">Risk Worsened</span></>
                      )}
                      {simResult.risk_change === 'unchanged' && (
                        <><Minus className="w-7 h-7 text-maroon-800/30" /><span className="text-sm font-bold text-maroon-800/50">Unchanged</span></>
                      )}
                    </div>
                  </div>

                  {(() => {
                    const tc = tierColor(simResult.modified.risk_tier);
                    return (
                      <div className={['rounded-2xl border-2 p-6 flex flex-col items-center transition-all', tc.border, tc.lightBg].join(' ')}>
                        <p className="text-[10px] font-bold text-maroon-800/40 uppercase tracking-wider mb-3">Simulated</p>
                        <RiskRing tier={simResult.modified.risk_tier} size={100} />
                      </div>
                    );
                  })()}
                </div>

                {/* Modifications */}
                <div className="rounded-2xl border border-cream-300 overflow-hidden">
                  <div className="px-5 py-3.5 bg-gradient-to-r from-cream-200/80 to-cream-100 border-b border-cream-300">
                    <p className="text-xs font-bold text-maroon-900">Metric Changes</p>
                  </div>
                  <div className="divide-y divide-cream-200">
                    {Object.entries(simResult.modifications_applied).map(([key, val]) => {
                      const isUp = val.change > 0;
                      const isDown = val.change < 0;
                      return (
                        <div key={key} className="flex items-center justify-between px-5 py-4 hover:bg-cream-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={['w-8 h-8 rounded-lg flex items-center justify-center',
                              isUp ? 'bg-red-50 border border-red-200' : isDown ? 'bg-emerald-50 border border-emerald-200' : 'bg-cream-200 border border-cream-300',
                            ].join(' ')}>
                              {isUp ? <TrendingUp className="w-3.5 h-3.5 text-red-500" /> :
                               isDown ? <TrendingDown className="w-3.5 h-3.5 text-emerald-500" /> :
                               <Minus className="w-3.5 h-3.5 text-maroon-800/30" />}
                            </div>
                            <span className="text-sm font-semibold text-maroon-900">
                              {config?.metrics.find(m => m.field === key)?.label ?? key}
                            </span>
                          </div>
                          <div className="flex items-center gap-5">
                            <span className="text-sm font-mono text-maroon-800/50">{val.original.toFixed(1)}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-maroon-800/15" />
                            <span className="text-sm font-mono font-bold text-maroon-900">{val.modified.toFixed(1)}</span>
                            <span className={['text-xs font-bold px-2.5 py-1 rounded-lg min-w-[56px] text-center',
                              isUp ? 'bg-red-50 text-red-600 border border-red-200' :
                              isDown ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                              'bg-cream-200 text-maroon-800/40 border border-cream-300',
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
          )}
        </div>
      )}
    </>
  );
}
