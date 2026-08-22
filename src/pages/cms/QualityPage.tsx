import React, { useState } from 'react';
import {
  Activity, Search, RotateCcw, CheckCircle2,
  AlertTriangle, TrendingUp, Award,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Select } from '@/components/common/Select';
import { predictQuality, type QualityPredictionResponse } from '@/services/qualityService';
import { AgentAnalysisSection } from '@/components/prediction/AgentAnalysisSection';

// ─── Options ──────────────────────────────────────────────────────────────────

const ACO_OPTIONS = [
  { value: '',       label: '— Select an ACO —' },
  { value: 'A00001', label: 'A00001 · Northeast Health Alliance' },
  { value: 'A00002', label: 'A00002 · Midwest Premier Care Network' },
  { value: 'A00003', label: 'A00003 · Gulf Coast Care Network' },
  { value: 'A00004', label: 'A00004 · Mountain West Health Partners' },
  { value: 'A00005', label: 'A00005 · Pacific Coast ACO Alliance' },
];

const YEAR_OPTIONS = [
  { value: '',     label: '— Select year —' },
  { value: '2016', label: '2016' },
  { value: '2017', label: '2017' },
  { value: '2018', label: '2018' },
  { value: '2019', label: '2019' },
  { value: '2020', label: '2020' },
  { value: '2021', label: '2021' },
  { value: '2022', label: '2022' },
  { value: '2023', label: '2023' },
];

// ─── Band styling ─────────────────────────────────────────────────────────────

function getBandStyle(band: string) {
  switch (band) {
    case 'HIGH':
      return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: <Award className="w-6 h-6 text-emerald-600" />, label: 'High Quality' };
    case 'MODERATE':
      return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: <TrendingUp className="w-6 h-6 text-amber-600" />, label: 'Moderate Quality' };
    default:
      return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: <AlertTriangle className="w-6 h-6 text-red-600" />, label: 'Low Quality' };
  }
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function QualityPage() {
  const [acoId, setAcoId]     = useState('');
  const [year, setYear]       = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [result, setResult]   = useState<QualityPredictionResponse | null>(null);

  const canSubmit = acoId !== '' && year !== '';

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await predictQuality({ acoId, year: parseInt(year, 10) });
      setResult(res);
    } catch (err) {
      setError('Failed to get prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAcoId('');
    setYear('');
    setResult(null);
    setError('');
  };

  return (
    <>
      <PageHeader
        title="Quality Score Prediction"
        subtitle="Predict next-year composite quality score for an ACO based on historical data."
        breadcrumb={['CMS Analytics', 'Quality']}
        actions={
          result && (
            <Button variant="ghost" size="sm" icon={<RotateCcw className="w-3.5 h-3.5" />} onClick={handleReset}>
              New Prediction
            </Button>
          )
        }
      />

      {/* Input section */}
      <Card className="mb-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-50 flex-shrink-0">
            <Activity className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-maroon-900">Quality Model Inputs</h3>
            <p className="text-xs text-maroon-800/40 mt-0.5">
              Select an ACO ID and a year. The model predicts the quality composite score for the following year.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <Select
            label="ACO Identifier"
            options={ACO_OPTIONS}
            value={acoId}
            onChange={e => { setAcoId(e.target.value); setResult(null); setError(''); }}
          />
          <Select
            label="Year (T)"
            options={YEAR_OPTIONS}
            value={year}
            onChange={e => { setYear(e.target.value); setResult(null); setError(''); }}
          />
          <Button
            variant="primary"
            size="lg"
            loading={loading}
            disabled={!canSubmit}
            icon={!loading ? <Search className="w-4 h-4" /> : undefined}
            onClick={handleSubmit}
            className="justify-center"
          >
            {loading ? 'Predicting…' : 'Predict Quality'}
          </Button>
        </div>

        {error && (
          <div className="flex items-center gap-2 mt-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5">
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {acoId && year && !result && !loading && (
          <p className="text-xs text-maroon-800/40 mt-3 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Ready: Predict quality for <span className="font-mono font-semibold text-maroon-800/70">{acoId}</span> using year <span className="font-semibold text-maroon-800/70">{year}</span> data
          </p>
        )}
      </Card>

      {/* Results section */}
      {result && (
        <div className="space-y-5 animate-slide-up">
          {/* ── Hero result card ──────────────────────────────────────── */}
          {(() => {
            const style = getBandStyle(result.qualityBand);
            const score = result.predictedQualityScore;
            const ringColor = result.qualityBand === 'HIGH' ? '#10b981' : result.qualityBand === 'MODERATE' ? '#f5a623' : '#ef4444';

            return (
              <div className="bg-white rounded-2xl border border-cream-300 p-8" style={{ boxShadow: '0 2px 12px rgba(61,21,21,0.05)' }}>
                <div className="flex items-center justify-between gap-6">
                  {/* Left: score + details */}
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-maroon-800/50 uppercase tracking-[0.15em] mb-2">Predicted Quality Score</p>
                    <p className="text-5xl font-bold text-maroon-900 tracking-tight mb-4">{score.toFixed(2)}</p>

                    {/* Band badge + meta */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className={['inline-flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-sm', style.bg, style.border, style.text].join(' ')}>
                        {style.icon}
                        {style.label}
                      </span>
                      <span className="text-xs text-maroon-800/60 bg-cream-200 px-3 py-1.5 rounded-lg font-medium">
                        ACO: <span className="font-mono font-bold text-maroon-900">{result.acoId}</span>
                      </span>
                      <span className="text-xs text-maroon-800/60 bg-cream-200 px-3 py-1.5 rounded-lg font-medium">
                        Year: <span className="font-bold text-maroon-900">{result.year}</span> → <span className="font-bold text-maroon-900">{result.year + 1}</span>
                      </span>
                    </div>
                  </div>

                  {/* Right: ring gauge */}
                  <div className="flex-shrink-0">
                    <div className="relative" style={{ width: 130, height: 130 }}>
                      <svg width="130" height="130" className="-rotate-90">
                        <circle cx="65" cy="65" r="54" fill="none" stroke="#ede8d0" strokeWidth="10" />
                        <circle cx="65" cy="65" r="54" fill="none" stroke={ringColor}
                          strokeWidth="10" strokeLinecap="round"
                          strokeDasharray={((score / 100) * 339.3).toString() + ' 339.3'}
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-maroon-900">{Math.round(score)}</span>
                        <span className="text-[10px] text-maroon-800/40 font-medium">/ 100</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ── Interpretation card ───────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-cream-300 p-6" style={{ boxShadow: '0 1px 4px rgba(61,21,21,0.03)' }}>
            <h4 className="text-sm font-bold text-maroon-900 mb-3">Interpretation</h4>
            <div className="text-sm text-maroon-800/80 leading-relaxed space-y-2">
              {result.qualityBand === 'HIGH' && (
                <p>This ACO is predicted to achieve a <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">HIGH quality score (≥90)</span> for the next performance year. Strong quality performance supports maximum shared savings eligibility.</p>
              )}
              {result.qualityBand === 'MODERATE' && (
                <p>This ACO is predicted to achieve a <span className="font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">MODERATE quality score (75–90)</span> for the next performance year. Quality is above minimum threshold but has room for improvement. Targeted interventions in weaker domains could elevate to HIGH band.</p>
              )}
              {result.qualityBand === 'LOW' && (
                <p>This ACO is predicted to fall into the <span className="font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded">LOW quality band (&lt;75)</span> for the next performance year. This may affect shared savings eligibility. Immediate quality improvement interventions are recommended.</p>
              )}
              <p className="text-xs text-maroon-800/40 pt-2 border-t border-cream-200 mt-3">
                Model: Ridge Regression Pipeline · R² = 83.38% · MAE ≈ 2.46 pts
              </p>
            </div>
          </div>

          {/* ── Quality Band Scale (FIXED positioning) ────────────────── */}
          <div className="bg-white rounded-2xl border border-cream-300 p-6" style={{ boxShadow: '0 1px 4px rgba(61,21,21,0.03)' }}>
            <h4 className="text-sm font-bold text-maroon-900 mb-5">Quality Band Scale</h4>

            {/* Scale bar */}
            <div className="relative">
              <div className="flex h-12 rounded-2xl overflow-hidden border border-cream-300">
                {/* LOW: 0-75 = 75% width */}
                <div className="bg-gradient-to-r from-red-100 to-red-200 flex items-center justify-center" style={{ width: '75%' }}>
                  <span className="text-xs font-bold text-red-700">LOW (&lt;75)</span>
                </div>
                {/* MODERATE: 75-90 = 15% width */}
                <div className="bg-gradient-to-r from-amber-100 to-amber-200 flex items-center justify-center border-x border-cream-300" style={{ width: '15%' }}>
                  <span className="text-[10px] font-bold text-amber-700">MOD</span>
                </div>
                {/* HIGH: 90-100 = 10% width */}
                <div className="bg-gradient-to-r from-emerald-100 to-emerald-200 flex items-center justify-center" style={{ width: '10%' }}>
                  <span className="text-[10px] font-bold text-emerald-700">HIGH</span>
                </div>
              </div>

              {/* Tick marks */}
              <div className="flex justify-between mt-1 px-0.5">
                <span className="text-[9px] text-maroon-800/40">0</span>
                <span className="text-[9px] text-maroon-800/40" style={{ position: 'absolute', left: '75%', transform: 'translateX(-50%)' }}>75</span>
                <span className="text-[9px] text-maroon-800/40" style={{ position: 'absolute', left: '90%', transform: 'translateX(-50%)' }}>90</span>
                <span className="text-[9px] text-maroon-800/40">100</span>
              </div>

              {/* Marker — CORRECT position: score/100 * 100% of bar width */}
              <div className="absolute -top-2" style={{ left: Math.min(result.predictedQualityScore, 100) + '%', transform: 'translateX(-50%)' }}>
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 rounded-full bg-maroon-900 border-2 border-white shadow-md" />
                  <div className="w-0.5 h-3 bg-maroon-900" />
                  <span className="mt-1 text-xs font-bold text-maroon-900 bg-cream-200 px-2.5 py-1 rounded-lg border border-cream-300 shadow-sm whitespace-nowrap">
                    {result.predictedQualityScore.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Legend below */}
            <div className="flex items-center gap-4 mt-8 pt-4 border-t border-cream-200">
              {[
                { label: 'LOW (<75)', color: 'bg-red-400' },
                { label: 'MODERATE (75–90)', color: 'bg-amber-400' },
                { label: 'HIGH (≥90)', color: 'bg-emerald-400' },
              ].map(l => (
                <span key={l.label} className="flex items-center gap-1.5 text-[11px] text-maroon-800/60">
                  <span className={'w-2.5 h-2.5 rounded-full ' + l.color} />
                  {l.label}
                </span>
              ))}
            </div>
          </div>

          {/* Agent Analysis */}
          <AgentAnalysisSection inputId={result.inputId} variant="quality" />

          {/* Raw payload (debug) */}
          <details className="mt-2">
            <summary className="text-xs text-maroon-800/40 cursor-pointer hover:text-maroon-800/60">Show API response</summary>
            <pre className="mt-2 p-3 rounded-lg bg-cream-100 border border-cream-300 text-xs text-maroon-800/60 font-mono overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </>
  );
}

