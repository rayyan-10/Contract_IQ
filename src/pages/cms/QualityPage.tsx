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
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-50 flex-shrink-0">
            <Activity className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Quality Model Inputs</h3>
            <p className="text-xs text-slate-400 mt-0.5">
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
          <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            Ready: Predict quality for <span className="font-mono font-semibold text-slate-600">{acoId}</span> using year <span className="font-semibold text-slate-600">{year}</span> data
          </p>
        )}
      </Card>

      {/* Results section */}
      {result && (
        <div className="space-y-4">
          {/* Main result card */}
          {(() => {
            const style = getBandStyle(result.qualityBand);
            return (
              <div className={['rounded-2xl border-2 p-6', style.bg, style.border].join(' ')}>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div className={['w-14 h-14 rounded-xl flex items-center justify-center', style.bg].join(' ')}>
                      {style.icon}
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Predicted Quality Score</p>
                      <p className="text-4xl font-bold text-slate-800 mt-1">{result.predictedQualityScore.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Score ring */}
                  <div className="relative w-24 h-24">
                    <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                      <circle cx="48" cy="48" r="40" fill="none" stroke="#e2e8f0" strokeWidth="7" />
                      <circle cx="48" cy="48" r="40" fill="none"
                        stroke={result.qualityBand === 'HIGH' ? '#10b981' : result.qualityBand === 'MODERATE' ? '#f59e0b' : '#ef4444'}
                        strokeWidth="7" strokeLinecap="round"
                        strokeDasharray={((result.predictedQualityScore / 100) * 251.3).toString() + ' 251.3'}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={['text-2xl font-bold', style.text].join(' ')}>
                        {Math.round(result.predictedQualityScore)}
                      </span>
                      <span className="text-[9px] text-slate-400">/ 100</span>
                    </div>
                  </div>
                </div>

                {/* Band badge + details */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className={['inline-flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-sm', style.bg, style.border, style.text].join(' ')}>
                    <CheckCircle2 className="w-4 h-4" />
                    {style.label} ({result.qualityBand})
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200">
                    ACO: <span className="font-mono font-semibold text-slate-700">{result.acoId}</span>
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200">
                    Base Year: <span className="font-semibold text-slate-700">{result.year}</span>
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200">
                    Predicts: <span className="font-semibold text-slate-700">{result.year + 1}</span>
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Interpretation card */}
          <Card>
            <h4 className="text-sm font-semibold text-slate-800 mb-3">Interpretation</h4>
            <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
              {result.qualityBand === 'HIGH' && (
                <p>This ACO is predicted to achieve a <span className="font-semibold text-emerald-700">HIGH quality score (≥90)</span> for the next performance year. Strong quality performance supports maximum shared savings eligibility and positions the ACO above national benchmarks.</p>
              )}
              {result.qualityBand === 'MODERATE' && (
                <p>This ACO is predicted to achieve a <span className="font-semibold text-amber-700">MODERATE quality score (75–90)</span> for the next performance year. Quality is above the minimum threshold but has room for improvement. Targeted interventions in weaker domains could elevate to HIGH band.</p>
              )}
              {result.qualityBand === 'LOW' && (
                <p>This ACO is predicted to fall into the <span className="font-semibold text-red-700">LOW quality band (&lt;75)</span> for the next performance year. This may affect shared savings eligibility. Immediate quality improvement interventions are recommended across chronic care management and preventive care domains.</p>
              )}
              <p className="text-slate-400 mt-2">
                Model: Ridge Regression Pipeline · R² = 83.38% · MAE ≈ 2.46 pts · Training: Synthetic ACO data (24,000 rows)
              </p>
            </div>
          </Card>

          {/* Band scale visual */}
          <Card>
            <h4 className="text-sm font-semibold text-slate-800 mb-4">Quality Band Scale</h4>
            <div className="relative h-8 rounded-full overflow-hidden flex">
              <div className="flex-1 bg-red-200 flex items-center justify-center">
                <span className="text-[10px] font-bold text-red-700">LOW (&lt;75)</span>
              </div>
              <div className="flex-1 bg-amber-200 flex items-center justify-center">
                <span className="text-[10px] font-bold text-amber-700">MODERATE (75–90)</span>
              </div>
              <div className="flex-1 bg-emerald-200 flex items-center justify-center">
                <span className="text-[10px] font-bold text-emerald-700">HIGH (≥90)</span>
              </div>
            </div>
            {/* Marker */}
            <div className="relative mt-2">
              <div
                className="absolute -top-1 w-0.5 h-4 bg-slate-800 rounded-full"
                style={{ left: Math.min(result.predictedQualityScore, 100) + '%' }}
              />
              <div
                className="absolute top-4 -translate-x-1/2 text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded"
                style={{ left: Math.min(result.predictedQualityScore, 100) + '%' }}
              >
                {result.predictedQualityScore.toFixed(1)}
              </div>
            </div>
          </Card>

          {/* Raw payload (debug) */}
          <details className="mt-2">
            <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600">Show API response</summary>
            <pre className="mt-2 p-3 rounded-lg bg-slate-50 border border-surface-border text-xs text-slate-500 font-mono overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </>
  );
}
