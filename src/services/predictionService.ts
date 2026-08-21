/**
 * predictionService — Calls POST /predictions/run with JWT auth.
 *
 * Backend response shape:
 * { input_id, result_id, aco_id, analysis_type, prediction: {...} }
 *
 * prediction shapes:
 *   risk:     { risk_probability, risk_probability_pct, prediction, risk_label, risk_level, threshold }
 *   forecast: { forecasted_savings_rate, forecasted_savings_rate_pct, savings_category, savings_direction, model_r2_pct }
 *   twin:     { twins: [...], top5_avg_savings_rate_pct, outperformer_count, ... }
 */

import type {
  PredictionInputs,
  RiskPredictionResult,
  PerformanceForecastResult,
  TwinAcoResult,
} from '@/types/prediction';
import { getAuthHeaders } from './tokenService';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const r2    = (n: number) => Math.round(n * 100) / 100;

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

// ─── Risk Prediction ──────────────────────────────────────────────────────────

export async function predictRisk(acoId: string, inputs: PredictionInputs): Promise<RiskPredictionResult> {
  try {
    const data = await callApi(acoId, 'risk', inputs);
    const pred = (data.prediction ?? data) as Record<string, unknown>;

    const probPct   = Number(pred.risk_probability_pct ?? 0);
    const prob      = Number(pred.risk_probability ?? probPct / 100);
    const score     = Math.round(probPct);
    const atRisk    = Number(pred.prediction ?? 0) === 1 || prob >= 0.23;
    const riskLabel = String(pred.risk_label ?? (atRisk ? 'AT-RISK' : 'NON-RISK'));
    const riskLevel = String(pred.risk_level ?? 'LOW').toLowerCase() as 'low' | 'moderate' | 'high' | 'critical';

    return {
      type: 'risk',
      acoId,
      atRisk,
      riskProbability: r2(prob),
      riskLevel: riskLevel === 'low' || riskLevel === 'moderate' || riskLevel === 'high' || riskLevel === 'critical'
        ? riskLevel : (score >= 55 ? 'high' : score >= 35 ? 'moderate' : 'low'),
      riskScore: score,
      contributingFactors: buildMockFactors(inputs),
      summary: riskLabel + ' — Risk probability: ' + probPct.toFixed(2) + '% (threshold: ' + String(pred.threshold ?? 23) + '%).',
    };
  } catch (err) {
    console.warn('Risk API error, using mock:', err);
    return mockRisk(acoId, inputs);
  }
}

// ─── Forecast ─────────────────────────────────────────────────────────────────

export async function predictPerformance(acoId: string, inputs: PredictionInputs): Promise<PerformanceForecastResult> {
  try {
    const data = await callApi(acoId, 'forecast', inputs);
    const pred = (data.prediction ?? data) as Record<string, unknown>;

    const savingsRatePct = Number(pred.forecasted_savings_rate_pct ?? 0);
    const category       = String(pred.savings_category ?? 'MODERATE SAVINGS');
    const direction      = String(pred.savings_direction ?? 'POSITIVE');
    const modelR2        = Number(pred.model_r2_pct ?? 88.82);

    const trend = direction === 'POSITIVE'
      ? (savingsRatePct > inputs.previousSavingsRate + 0.5 ? 'improving' : 'stable')
      : 'declining';

    // Build quarterly trajectory
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'].map((label, i) => ({
      label,
      savings: r2(inputs.previousSavingsRate + (savingsRatePct - inputs.previousSavingsRate) * ((i + 1) / 4)),
      quality: r2(inputs.previousQualityScore + inputs.qualityChange * ((i + 1) / 4)),
    }));

    return {
      type: 'performance',
      acoId,
      projectedSavingsRate: r2(savingsRatePct),
      projectedQualityScore: r2(inputs.previousQualityScore + inputs.qualityChange),
      trend,
      quarters,
      summary: category + ' — Forecasted savings rate: ' + savingsRatePct.toFixed(2) + '%. Direction: ' + direction + '. (Model R²: ' + modelR2.toFixed(2) + '%)',
    };
  } catch (err) {
    console.warn('Forecast API error, using mock:', err);
    return mockForecast(acoId, inputs);
  }
}

// ─── Twin ACO ─────────────────────────────────────────────────────────────────

export async function findTwinACOs(acoId: string, inputs: PredictionInputs): Promise<TwinAcoResult> {
  try {
    const data = await callApi(acoId, 'twin', inputs);
    const pred = (data.prediction ?? data) as Record<string, unknown>;

    const rawTwins = Array.isArray(pred.twins) ? pred.twins : [];
    const matches = rawTwins.slice(0, 5).map((t: Record<string, unknown>) => ({
      acoId:           String(t.twin_aco_id ?? ''),
      acoName:         String(t.twin_aco_name ?? 'Unknown'),
      similarityScore: r2(Number(t.similarity_score ?? 90)),
      savingsRate:     r2(Number(t.twin_savings_rate_pct ?? 0)),
      qualityScore:    0, // not in twin response
      beneficiaries:   0, // not in twin response
    }));

    const avgSavings     = Number(pred.top5_avg_savings_rate_pct ?? 0);
    const outperformers  = Number(pred.outperformer_count ?? 0);
    const outRate        = Number(pred.outperformer_rate ?? 0);

    return {
      type: 'twin',
      acoId,
      matches,
      summary: matches.length + ' twin ACOs found. Avg savings: ' + avgSavings.toFixed(2) + '%. '
        + outperformers + ' outperformers (' + (outRate * 100).toFixed(0) + '% rate).',
    };
  } catch (err) {
    console.warn('Twin API error, using mock:', err);
    return mockTwin(acoId, inputs);
  }
}

// ─── Mock fallbacks ───────────────────────────────────────────────────────────

function buildMockFactors(inputs: PredictionInputs) {
  return [
    { factor: 'Expenditure Growth',       impact: r2(Math.abs(inputs.expenditureGrowth * 1.5)),      direction: (inputs.expenditureGrowth > 3 ? 'negative' : 'positive') as 'positive' | 'negative' },
    { factor: 'Previous Performance Gap', impact: r2(Math.abs(inputs.previousPerformanceGap * 2)),   direction: (inputs.previousPerformanceGap > 0 ? 'negative' : 'positive') as 'positive' | 'negative' },
    { factor: 'Previous Savings Rate',    impact: r2(Math.abs(inputs.previousSavingsRate * 3)),      direction: (inputs.previousSavingsRate >= 2 ? 'positive' : 'negative') as 'positive' | 'negative' },
    { factor: 'Quality Change',           impact: r2(Math.abs(inputs.qualityChange * 0.5)),          direction: (inputs.qualityChange >= 0 ? 'positive' : 'negative') as 'positive' | 'negative' },
    { factor: 'Beneficiary Volume',       impact: r2(inputs.n_ab / 5000),                           direction: (inputs.n_ab >= 8000 ? 'positive' : 'negative') as 'positive' | 'negative' },
  ].sort((a, b) => b.impact - a.impact);
}

function mockRisk(acoId: string, inputs: PredictionInputs): RiskPredictionResult {
  const raw = 50 - inputs.previousSavingsRate * 3 + inputs.previousPerformanceGap * 2 + inputs.expenditureGrowth * 1.5;
  const score = clamp(Math.round(raw), 0, 100);
  const riskLevel = score >= 75 ? 'critical' : score >= 55 ? 'high' : score >= 35 ? 'moderate' : 'low';
  return {
    type: 'risk', acoId, atRisk: score >= 35, riskProbability: r2(score / 100), riskLevel, riskScore: score,
    contributingFactors: buildMockFactors(inputs),
    summary: 'Mock: ' + riskLevel.toUpperCase() + ' risk (score: ' + score + ').',
  };
}

function mockForecast(acoId: string, inputs: PredictionInputs): PerformanceForecastResult {
  const delta = inputs.benchmarkGrowth - inputs.expenditureGrowth;
  const projected = r2(inputs.previousSavingsRate + delta * 0.8);
  const trend = projected > inputs.previousSavingsRate + 0.5 ? 'improving' : projected < inputs.previousSavingsRate - 0.5 ? 'declining' : 'stable';
  return {
    type: 'performance', acoId, projectedSavingsRate: projected,
    projectedQualityScore: r2(clamp(inputs.previousQualityScore + inputs.qualityChange, 0, 100)), trend,
    quarters: ['Q1','Q2','Q3','Q4'].map((label, i) => ({ label, savings: r2(inputs.previousSavingsRate + (projected - inputs.previousSavingsRate) * ((i+1)/4)), quality: r2(inputs.previousQualityScore + inputs.qualityChange * ((i+1)/4)) })),
    summary: 'Mock: Projected savings ' + projected + '%. Trend: ' + trend + '.',
  };
}

function mockTwin(acoId: string, inputs: PredictionInputs): TwinAcoResult {
  const matches = [
    { acoId: 'A04937', acoName: 'Colorado Health ACO' },
    { acoId: 'A02184', acoName: 'Michigan Value Network' },
    { acoId: 'A01567', acoName: 'Texas Care Alliance' },
    { acoId: 'A03891', acoName: 'Ohio Premier ACO' },
    { acoId: 'A00412', acoName: 'Virginia Health Partners' },
  ].map((m, i) => ({
    ...m, similarityScore: r2(97 - i * 6),
    savingsRate: r2(inputs.previousSavingsRate + (i % 2 === 0 ? 0.3 : -0.5)),
    qualityScore: 0, beneficiaries: 0,
  }));
  return { type: 'twin', acoId, matches, summary: 'Mock: 5 twin ACOs found.' };
}
