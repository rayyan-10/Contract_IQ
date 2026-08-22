/**
 * predictionService — Calls POST /predictions/run with JWT auth.
 * Returns { result, inputId } so the frontend can use inputId for agent analysis.
 */

import type {
  PredictionInputs,
  RiskPredictionResult,
  PerformanceForecastResult,
  TwinAcoResult,
  PredictionResult,
} from '@/types/prediction';
import { getAuthHeaders } from './tokenService';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const r2    = (n: number) => Math.round(n * 100) / 100;

export interface PredictionResponse {
  result: PredictionResult;
  inputId: string | null;  // from backend response.input_id
}

function buildPayload(acoId: string, analysisType: string, inputs: PredictionInputs) {
  return {
    aco_id: acoId,
    analysis_type: analysisType,
    n_ab: inputs.n_ab,
    previous_savings_rate: inputs.previousSavingsRate,
    previous_quality_score: inputs.previousQualityScore,
    previous_performance_gap: inputs.previousPerformanceGap,
    expenditure_growth: inputs.expenditureGrowth,
    benchmark_growth: inputs.benchmarkGrowth,
    beneficiary_growth: inputs.beneficiaryGrowth,
    quality_change: inputs.qualityChange,
  };
}

async function callApi(acoId: string, analysisType: string, inputs: PredictionInputs): Promise<Record<string, unknown>> {
  const res = await fetch(API_BASE + '/predictions/run', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(buildPayload(acoId, analysisType, inputs)),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error('API ' + res.status + ': ' + text);
  }
  return res.json();
}

// ─── Risk ─────────────────────────────────────────────────────────────────────

export async function predictRisk(acoId: string, inputs: PredictionInputs): Promise<PredictionResponse> {
  try {
    const data = await callApi(acoId, 'risk', inputs);
    const inputId = String(data.input_id ?? '');
    const pred = (data.prediction ?? data) as Record<string, unknown>;

    const probPct = Number(pred.risk_probability_pct ?? 0);
    const prob    = Number(pred.risk_probability ?? probPct / 100);
    const score   = Math.round(probPct);
    const atRisk  = Number(pred.prediction ?? 0) === 1 || prob >= 0.23;
    const riskLevel = String(pred.risk_level ?? 'LOW').toLowerCase() as 'low' | 'moderate' | 'high' | 'critical';

    const result: RiskPredictionResult = {
      type: 'risk', acoId, atRisk,
      riskProbability: r2(prob),
      riskLevel: (['low','moderate','high','critical'].includes(riskLevel) ? riskLevel : score >= 55 ? 'high' : score >= 35 ? 'moderate' : 'low') as RiskPredictionResult['riskLevel'],
      riskScore: score,
      contributingFactors: buildMockFactors(inputs),
      summary: String(pred.risk_label ?? (atRisk ? 'AT-RISK' : 'NON-RISK')) + ' — Risk probability: ' + probPct.toFixed(2) + '% (threshold: ' + String(pred.threshold ?? 23) + '%).',
    };
    return { result, inputId: inputId || null };
  } catch (err) {
    console.warn('Risk API error, using mock:', err);
    return { result: mockRisk(acoId, inputs), inputId: null };
  }
}

// ─── Forecast ─────────────────────────────────────────────────────────────────

export async function predictPerformance(acoId: string, inputs: PredictionInputs): Promise<PredictionResponse> {
  try {
    const data = await callApi(acoId, 'forecast', inputs);
    const inputId = String(data.input_id ?? '');
    const pred = (data.prediction ?? data) as Record<string, unknown>;

    const savingsRatePct = Number(pred.forecasted_savings_rate_pct ?? 0);
    const category       = String(pred.savings_category ?? 'MODERATE SAVINGS');
    const direction      = String(pred.savings_direction ?? 'POSITIVE');
    const modelR2        = Number(pred.model_r2_pct ?? 88.82);
    const trend = direction === 'POSITIVE'
      ? (savingsRatePct > inputs.previousSavingsRate + 0.5 ? 'improving' : 'stable')
      : 'declining';

    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'].map((label, i) => ({
      label,
      savings: r2(inputs.previousSavingsRate + (savingsRatePct - inputs.previousSavingsRate) * ((i + 1) / 4)),
      quality: r2(inputs.previousQualityScore + inputs.qualityChange * ((i + 1) / 4)),
    }));

    const result: PerformanceForecastResult = {
      type: 'performance', acoId,
      projectedSavingsRate: r2(savingsRatePct),
      projectedQualityScore: r2(inputs.previousQualityScore + inputs.qualityChange),
      trend, quarters,
      summary: category + ' — Forecasted savings rate: ' + savingsRatePct.toFixed(2) + '%. Direction: ' + direction + '. (Model R2: ' + modelR2.toFixed(2) + '%)',
    };
    return { result, inputId: inputId || null };
  } catch (err) {
    console.warn('Forecast API error, using mock:', err);
    return { result: mockForecast(acoId, inputs), inputId: null };
  }
}

// ─── Twin ─────────────────────────────────────────────────────────────────────

export async function findTwinACOs(acoId: string, inputs: PredictionInputs): Promise<PredictionResponse> {
  try {
    const data = await callApi(acoId, 'twin', inputs);
    const inputId = String(data.input_id ?? '');
    const pred = (data.prediction ?? data) as Record<string, unknown>;

    const rawTwins = Array.isArray(pred.twins) ? pred.twins : [];
    const matches = rawTwins.slice(0, 5).map((t: Record<string, unknown>) => ({
      acoId:           String(t.twin_aco_id ?? ''),
      acoName:         String(t.twin_aco_name ?? 'Unknown'),
      similarityScore: r2(Number(t.similarity_score ?? 90)),
      savingsRate:     r2(Number(t.twin_savings_rate_pct ?? 0)),
      qualityScore:    0,
      beneficiaries:   0,
    }));

    const avgSavings    = Number(pred.top5_avg_savings_rate_pct ?? 0);
    const outperformers = Number(pred.outperformer_count ?? 0);
    const outRate       = Number(pred.outperformer_rate ?? 0);

    const result: TwinAcoResult = {
      type: 'twin', acoId, matches,
      summary: matches.length + ' twin ACOs found. Avg savings: ' + avgSavings.toFixed(2) + '%. ' + outperformers + ' outperformers (' + (outRate * 100).toFixed(0) + '% rate).',
    };
    return { result, inputId: inputId || null };
  } catch (err) {
    console.warn('Twin API error, using mock:', err);
    return { result: mockTwin(acoId, inputs), inputId: null };
  }
}

// ─── Mocks ────────────────────────────────────────────────────────────────────

function buildMockFactors(inputs: PredictionInputs) {
  return [
    { factor: 'Expenditure Growth',       impact: r2(Math.abs(inputs.expenditureGrowth * 1.5)),      direction: (inputs.expenditureGrowth > 3 ? 'negative' : 'positive') as 'positive' | 'negative' },
    { factor: 'Performance Gap',          impact: r2(Math.abs(inputs.previousPerformanceGap * 2)),   direction: (inputs.previousPerformanceGap > 0 ? 'negative' : 'positive') as 'positive' | 'negative' },
    { factor: 'Savings Rate',             impact: r2(Math.abs(inputs.previousSavingsRate * 3)),      direction: (inputs.previousSavingsRate >= 2 ? 'positive' : 'negative') as 'positive' | 'negative' },
    { factor: 'Quality Change',           impact: r2(Math.abs(inputs.qualityChange * 0.5)),          direction: (inputs.qualityChange >= 0 ? 'positive' : 'negative') as 'positive' | 'negative' },
    { factor: 'Beneficiary Volume',       impact: r2(inputs.n_ab / 5000),                           direction: (inputs.n_ab >= 8000 ? 'positive' : 'negative') as 'positive' | 'negative' },
  ].sort((a, b) => b.impact - a.impact);
}

function mockRisk(acoId: string, inputs: PredictionInputs): RiskPredictionResult {
  const raw = 50 - inputs.previousSavingsRate * 3 + inputs.previousPerformanceGap * 2 + inputs.expenditureGrowth * 1.5;
  const score = clamp(Math.round(raw), 0, 100);
  const riskLevel = score >= 75 ? 'critical' : score >= 55 ? 'high' : score >= 35 ? 'moderate' : 'low';
  return { type: 'risk', acoId, atRisk: score >= 35, riskProbability: r2(score / 100), riskLevel, riskScore: score, contributingFactors: buildMockFactors(inputs), summary: 'Mock: ' + riskLevel.toUpperCase() + ' risk (score: ' + score + ').' };
}

function mockForecast(acoId: string, inputs: PredictionInputs): PerformanceForecastResult {
  const delta = inputs.benchmarkGrowth - inputs.expenditureGrowth;
  const projected = r2(inputs.previousSavingsRate + delta * 0.8);
  const trend = projected > inputs.previousSavingsRate + 0.5 ? 'improving' : projected < inputs.previousSavingsRate - 0.5 ? 'declining' : 'stable';
  return { type: 'performance', acoId, projectedSavingsRate: projected, projectedQualityScore: r2(clamp(inputs.previousQualityScore + inputs.qualityChange, 0, 100)), trend, quarters: ['Q1','Q2','Q3','Q4'].map((label, i) => ({ label, savings: r2(inputs.previousSavingsRate + (projected - inputs.previousSavingsRate) * ((i+1)/4)), quality: r2(inputs.previousQualityScore + inputs.qualityChange * ((i+1)/4)) })), summary: 'Mock: Projected savings ' + projected + '%.' };
}

function mockTwin(acoId: string, inputs: PredictionInputs): TwinAcoResult {
  const matches = [{ acoId: 'A04937', acoName: 'Colorado Health ACO' }, { acoId: 'A02184', acoName: 'Michigan Value Network' }, { acoId: 'A01567', acoName: 'Texas Care Alliance' }, { acoId: 'A03891', acoName: 'Ohio Premier ACO' }, { acoId: 'A00412', acoName: 'Virginia Health Partners' }].map((m, i) => ({ ...m, similarityScore: r2(97 - i * 6), savingsRate: r2(inputs.previousSavingsRate + (i % 2 === 0 ? 0.3 : -0.5)), qualityScore: 0, beneficiaries: 0 }));
  return { type: 'twin', acoId, matches, summary: 'Mock: 5 twin ACOs found.' };
}
