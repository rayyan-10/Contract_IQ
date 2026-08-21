import React, { useState, useCallback } from 'react';
import {
  AlertTriangle, TrendingUp, GitBranch, Play, RotateCcw, Building2,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Select } from '@/components/common/Select';
import { MetricInput } from '@/components/prediction/MetricInput';
import { AnalysisCard } from '@/components/prediction/AnalysisCard';
import { InputProgress } from '@/components/prediction/InputProgress';
import { WorkflowStepper } from '@/components/prediction/WorkflowStepper';
import type { AnalysisType, PredictionInputs } from '@/types/prediction';
import { predictRisk, predictPerformance, findTwinACOs } from '@/services/predictionService';

// ─── Mock ACO IDs (will be fetched from DB later) ─────────────────────────────
// Format: A00001, A00002, ... Only the ID is stored in DB (no name).

const ACO_OPTIONS = [
  { value: '',       label: '— Select an ACO —' },
  { value: 'A00001', label: 'A00001 · Northeast Health Alliance' },
  { value: 'A00002', label: 'A00002 · Midwest Premier Care Network' },
  { value: 'A00003', label: 'A00003 · Gulf Coast Care Network' },
  { value: 'A00004', label: 'A00004 · Mountain West Health Partners' },
  { value: 'A00005', label: 'A00005 · Pacific Coast ACO Alliance' },
];

// ─── Field definitions ────────────────────────────────────────────────────────

interface FieldDef {
  key: keyof PredictionInputs;
  label: string;
  identifier?: string;
  unit?: string;
  helperText: string;
  placeholder?: string;
  allowNegative?: boolean;
}

const FIELDS: FieldDef[] = [
  {
    key: 'n_ab',
    label: 'Number of Beneficiaries',
    identifier: 'N_AB',
    helperText: 'Total assigned beneficiaries for the performance period.',
    placeholder: 'e.g. 12500',
  },
  {
    key: 'previousSavingsRate',
    label: 'Previous Savings Rate',
    unit: '%',
    helperText: 'ACO savings rate from the prior performance year.',
    placeholder: 'e.g. 3.5',
  },
  {
    key: 'previousQualityScore',
    label: 'Previous Quality Score',
    helperText: 'Composite quality score (0–100) from the prior year.',
    placeholder: 'e.g. 84',
  },
  {
    key: 'previousPerformanceGap',
    label: 'Previous Performance Gap',
    unit: '%',
    helperText: 'Gap between actual and benchmark performance. Negative = above benchmark.',
    placeholder: 'e.g. -1.2',
    allowNegative: true,
  },
  {
    key: 'expenditureGrowth',
    label: 'Expenditure Growth',
    unit: '%',
    helperText: 'Year-over-year growth in per-beneficiary expenditure.',
    placeholder: 'e.g. 2.1',
    allowNegative: true,
  },
  {
    key: 'benchmarkGrowth',
    label: 'Benchmark Growth',
    unit: '%',
    helperText: 'CMS-published benchmark expenditure growth rate.',
    placeholder: 'e.g. 3.0',
  },
  {
    key: 'beneficiaryGrowth',
    label: 'Beneficiary Growth',
    unit: '%',
    helperText: 'Percentage change in assigned beneficiary count vs. prior year.',
    placeholder: 'e.g. 1.5',
    allowNegative: true,
  },
  {
    key: 'qualityChange',
    label: 'Quality Change',
    helperText: 'Point change in quality composite score vs. prior year. Can be negative.',
    placeholder: 'e.g. 2',
    allowNegative: true,
  },
];

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(key: keyof PredictionInputs, raw: string, allowNegative = false): string {
  if (raw.trim() === '') return 'This field is required.';
  const n = Number(raw);
  if (isNaN(n)) return 'Must be a valid number.';
  if (!allowNegative && n < 0) return 'Value cannot be negative.';
  if (key === 'n_ab' && (!Number.isInteger(n) || n < 1)) return 'Must be a positive whole number.';
  if (key === 'previousQualityScore' && (n < 0 || n > 100)) return 'Score must be between 0 and 100.';
  return '';
}

// ─── Types ────────────────────────────────────────────────────────────────────

type FieldValues = Record<keyof PredictionInputs, string>;
type FieldErrors = Record<keyof PredictionInputs, string>;

const EMPTY_VALUES: FieldValues = {
  n_ab: '', previousSavingsRate: '', previousQualityScore: '',
  previousPerformanceGap: '', expenditureGrowth: '', benchmarkGrowth: '',
  beneficiaryGrowth: '', qualityChange: '',
};
const EMPTY_ERRORS: FieldErrors = { ...EMPTY_VALUES };

// ─── Analysis type config ─────────────────────────────────────────────────────

const ANALYSIS_OPTIONS: Array<{
  type: AnalysisType;
  icon: React.ReactNode;
  title: string;
  description: string;
}> = [
  {
    type: 'risk',
    icon: <AlertTriangle className="w-5 h-5" />,
    title: 'Risk Prediction',
    description: 'Identify estimated risk level and major contributing factors for this ACO.',
  },
  {
    type: 'performance',
    icon: <TrendingUp className="w-5 h-5" />,
    title: 'Performance Forecast',
    description: 'Estimate future financial and quality performance trends over four quarters.',
  },
  {
    type: 'twin',
    icon: <GitBranch className="w-5 h-5" />,
    title: 'Twin ACO',
    description: 'Identify ACOs with similar performance characteristics for benchmarking.',
  },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export function PredictionsPage() {
  const [selectedAcoId, setSelectedAcoId] = useState('');
  const [values, setValues]       = useState<FieldValues>(EMPTY_VALUES);
  const [errors, setErrors]       = useState<FieldErrors>(EMPTY_ERRORS);
  const [touched, setTouched]     = useState<Set<keyof PredictionInputs>>(new Set());
  const [selectedType, setSelectedType] = useState<AnalysisType | null>(null);
  const [running, setRunning]     = useState(false);
  const [step, setStep]           = useState<'inputs' | 'analysis' | 'result'>('inputs');

  // ── Field change handler ──────────────────────────────────────────────────
  const handleChange = useCallback((key: keyof PredictionInputs, raw: string) => {
    const fieldDef = FIELDS.find(f => f.key === key)!;
    const err = raw.trim() !== '' ? validate(key, raw, fieldDef.allowNegative) : '';
    setValues(prev => ({ ...prev, [key]: raw }));
    setErrors(prev => ({ ...prev, [key]: err }));
    setTouched(prev => new Set(prev).add(key));
  }, []);

  // ── Completion tracking ───────────────────────────────────────────────────
  const completedFields = FIELDS.filter(f => {
    const raw = values[f.key];
    return raw.trim() !== '' && !validate(f.key, raw, f.allowNegative);
  });
  const completedCount = completedFields.length;
  const allComplete    = completedCount === FIELDS.length && selectedAcoId !== '';

  // ── Build validated inputs object ─────────────────────────────────────────
  const buildInputs = (): PredictionInputs => ({
    n_ab:                   Number(values.n_ab),
    previousSavingsRate:    Number(values.previousSavingsRate),
    previousQualityScore:   Number(values.previousQualityScore),
    previousPerformanceGap: Number(values.previousPerformanceGap),
    expenditureGrowth:      Number(values.expenditureGrowth),
    benchmarkGrowth:        Number(values.benchmarkGrowth),
    beneficiaryGrowth:      Number(values.beneficiaryGrowth),
    qualityChange:          Number(values.qualityChange),
  });

  // ── Validate all on attempt to proceed ────────────────────────────────────
  const validateAll = (): boolean => {
    const newErrors = { ...EMPTY_ERRORS };
    let valid = true;
    for (const f of FIELDS) {
      const err = validate(f.key, values[f.key], f.allowNegative);
      newErrors[f.key] = err;
      if (err) valid = false;
    }
    setErrors(newErrors);
    setTouched(new Set(FIELDS.map(f => f.key)));
    return valid;
  };

  // ── Run analysis ──────────────────────────────────────────────────────────
  const handleRunAnalysis = async () => {
    if (!selectedType || !allComplete) return;
    setRunning(true);
    const inputs = buildInputs();
    try {
      if (selectedType === 'risk')        await predictRisk(inputs);
      if (selectedType === 'performance') await predictPerformance(inputs);
      if (selectedType === 'twin')        await findTwinACOs(inputs);
      setStep('result');
    } finally {
      setRunning(false);
    }
  };

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setSelectedAcoId('');
    setValues(EMPTY_VALUES);
    setErrors(EMPTY_ERRORS);
    setTouched(new Set());
    setSelectedType(null);
    setStep('inputs');
  };

  // ── Step state for stepper ────────────────────────────────────────────────
  const stepperSteps = [
    {
      number: '01',
      label: 'Enter Metrics',
      status: (allComplete ? 'completed' : 'active') as 'active' | 'completed' | 'locked',
    },
    {
      number: '02',
      label: 'Select Analysis',
      status: (!allComplete ? 'locked' : selectedType ? 'completed' : 'active') as 'active' | 'completed' | 'locked',
    },
    {
      number: '03',
      label: 'View Prediction',
      status: (step === 'result' ? 'active' : 'locked') as 'active' | 'completed' | 'locked',
    },
  ];

  // ─── Result screen ────────────────────────────────────────────────────────
  if (step === 'result') {
    return (
      <>
        <PageHeader
          title="Prediction & Scenario Analysis"
          subtitle="Analyze ACO performance using financial, quality, expenditure and beneficiary indicators."
          breadcrumb={['CMS Analytics', 'Predictions']}
          actions={
            <Button variant="secondary" size="sm" icon={<RotateCcw className="w-3.5 h-3.5" />} onClick={handleReset}>
              New Analysis
            </Button>
          }
        />
        <Card>
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-50">
              {selectedType === 'risk'        && <AlertTriangle className="w-8 h-8 text-brand-600" />}
              {selectedType === 'performance' && <TrendingUp    className="w-8 h-8 text-brand-600" />}
              {selectedType === 'twin'        && <GitBranch     className="w-8 h-8 text-brand-600" />}
            </div>
            <div>
              <p className="text-base font-semibold text-slate-800">Analysis Complete</p>
              <p className="text-sm text-slate-400 mt-1 max-w-sm">
                {ANALYSIS_OPTIONS.find(a => a.type === selectedType)?.title} results will be displayed here in the next phase.
              </p>
            </div>
            <div className="flex items-center gap-2 mt-2 p-3 rounded-lg bg-slate-50 border border-surface-border text-xs text-slate-500 font-mono max-w-lg w-full text-left">
              <span className="text-slate-300">payload →</span>
              <span className="text-brand-600 truncate">{JSON.stringify({ acoId: selectedAcoId, ...buildInputs() })}</span>
            </div>
            <Button variant="secondary" size="sm" icon={<RotateCcw className="w-3.5 h-3.5" />} onClick={handleReset}>
              Run another analysis
            </Button>
          </div>
        </Card>
      </>
    );
  }

  // ─── Main workflow ────────────────────────────────────────────────────────
  return (
    <>
      <PageHeader
        title="Prediction & Scenario Analysis"
        subtitle="Analyze ACO performance using financial, quality, expenditure and beneficiary indicators."
        breadcrumb={['CMS Analytics', 'Predictions']}
        actions={
          completedCount > 0 && (
            <Button variant="ghost" size="sm" icon={<RotateCcw className="w-3.5 h-3.5" />} onClick={handleReset}>
              Reset
            </Button>
          )
        }
      />

      {/* Workflow stepper */}
      <Card className="mb-5">
        <WorkflowStepper steps={stepperSteps} />
      </Card>

      {/* ── ACO Selector ─────────────────────────────────────────────────── */}
      <Card className="mb-5">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-50 flex-shrink-0">
            <Building2 className="w-5 h-5 text-brand-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-800 mb-0.5">Select ACO for Prediction</h3>
            <p className="text-xs text-slate-400 mb-3">Choose the ACO you want to analyze. The prediction inputs and results will be associated with this ACO ID.</p>
            <div className="max-w-sm">
              <Select
                label="ACO Identifier"
                options={ACO_OPTIONS}
                value={selectedAcoId}
                onChange={e => setSelectedAcoId(e.target.value)}
              />
            </div>
            {selectedAcoId && (
              <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Selected: {selectedAcoId}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* ── STEP 1: Metric inputs ─────────────────────────────────────────── */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              <span className="text-brand-500 font-bold mr-2">01</span>
              ACO Performance Indicators
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Enter all 8 model inputs to unlock analysis options</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <InputProgress completed={completedCount} total={FIELDS.length} />
        </div>

        {/* 2-column input grid */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {FIELDS.map(field => {
              const isTouched  = touched.has(field.key);
              const fieldError = isTouched ? errors[field.key] : '';
              const isComplete = values[field.key].trim() !== '' && !errors[field.key];

              return (
                <MetricInput
                  key={field.key}
                  id={field.key}
                  label={field.label}
                  identifier={field.identifier}
                  unit={field.unit}
                  helperText={field.helperText}
                  placeholder={field.placeholder}
                  allowNegative={field.allowNegative}
                  value={values[field.key]}
                  onChange={val => handleChange(field.key, val)}
                  error={fieldError}
                  completed={isComplete}
                />
              );
            })}
          </div>

          {/* Validate all CTA — only shows if not all complete yet */}
          {!allComplete && completedCount > 0 && (
            <div className="mt-6 pt-5 border-t border-surface-border">
              <Button variant="ghost" size="sm" onClick={validateAll}>
                Check all fields
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* ── STEP 2: Analysis selection ────────────────────────────────────── */}
      <div className="mb-5">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-slate-800">
            <span className={`font-bold mr-2 ${allComplete ? 'text-brand-500' : 'text-slate-300'}`}>02</span>
            Select Analysis Type
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {allComplete
              ? 'Choose the type of prediction you want to run'
              : 'Complete all 8 inputs above to unlock analysis options'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ANALYSIS_OPTIONS.map(opt => (
            <AnalysisCard
              key={opt.type}
              type={opt.type}
              icon={opt.icon}
              title={opt.title}
              description={opt.description}
              locked={!allComplete}
              selected={selectedType === opt.type}
              onSelect={() => setSelectedType(opt.type)}
            />
          ))}
        </div>
      </div>

      {/* ── STEP 3: Run Analysis CTA ──────────────────────────────────────── */}
      {allComplete && selectedType && (
        <div className="flex items-center justify-between p-5 rounded-xl bg-brand-950 border border-brand-800">
          <div>
            <p className="text-sm font-semibold text-white">
              Ready to run{' '}
              <span className="text-brand-300">
                {ANALYSIS_OPTIONS.find(a => a.type === selectedType)?.title}
              </span>
              {' '}for <span className="text-brand-300 font-mono">{selectedAcoId}</span>
            </p>
            <p className="text-xs text-brand-400 mt-0.5">
              All 8/8 inputs are validated and analysis type is selected.
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            loading={running}
            icon={!running ? <Play className="w-4 h-4" /> : undefined}
            onClick={handleRunAnalysis}
            className="bg-brand-500 hover:bg-brand-400 flex-shrink-0"
          >
            {running ? 'Analyzing…' : 'Run Analysis'}
          </Button>
        </div>
      )}

      {/* ── Step 03 locked state ──────────────────────────────────────────── */}
      {(!allComplete || !selectedType) && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-surface-border">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-200 flex-shrink-0">
            <span className="text-xs font-bold text-slate-400">03</span>
          </span>
          <div>
            <p className="text-xs font-semibold text-slate-400">View Prediction — Locked</p>
            <p className="text-xs text-slate-300 mt-0.5">
              {!allComplete
                ? `Complete all inputs (${completedCount}/8 done)${!selectedAcoId ? ', select an ACO,' : ''} then select an analysis type.`
                : 'Select an analysis type above to proceed.'}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
