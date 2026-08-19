/**
 * predictionService — Mock prediction engine.
 * Replace each function body with fetch() calls to the Python backend.
 * Types and signatures stay the same.
 */

import type {
  PredictionInputs,
  RiskPredictionResult,
  PerformanceForecastResult,
  TwinAcoResult,
} from '@/types/prediction';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const r2    = (n: number) => Math.round(n * 100) / 100;
const delay = (ms: number) => new Promise<void>(res => setTimeout(res, ms));

// ─── Risk Prediction ──────────────────────────────────────────────────────────

export async function predictRisk(inputs: PredictionInputs): Promise<RiskPredictionResult> {
  await delay(1200);

  const rawScore =
    50
    - inputs.previousSavingsRate * 3
    + inputs.previousPerformanceGap * 2
    + inputs.expenditureGrowth * 1.5
    - inputs.benchmarkGrowth * 0.8
    - inputs.qualityChange * 0.5
    + (inputs.previousQualityScore < 75 ? 15 : 0)
    + (inputs.n_ab < 5000 ? 8 : 0);

  const riskScore = clamp(Math.round(rawScore), 0, 100);

  const riskLevel =
    riskScore >= 75 ? 'critical' :
    riskScore >= 55 ? 'high'     :
    riskScore >= 35 ? 'moderate' : 'low';

  const contributingFactors = [
    {
      factor: 'Expenditure Growth',
      impact: r2(Math.abs(inputs.expenditureGrowth * 1.5)),
      direction: (inputs.expenditureGrowth > 3 ? 'negative' : 'positive') as 'positive' | 'negative',
    },
    {
      factor: 'Previous Performance Gap',
      impact: r2(Math.abs(inputs.previousPerformanceGap * 2)),
      direction: (inputs.previousPerformanceGap > 0 ? 'negative' : 'positive') as 'positive' | 'negative',
    },
    {
      factor: 'Previous Savings Rate',
      impact: r2(Math.abs(inputs.previousSavingsRate * 3)),
      direction: (inputs.previousSavingsRate >= 2 ? 'positive' : 'negative') as 'positive' | 'negative',
    },
    {
      factor: 'Quality Change',
      impact: r2(Math.abs(inputs.qualityChange * 0.5)),
      direction: (inputs.qualityChange >= 0 ? 'positive' : 'negative') as 'positive' | 'negative',
    },
    {
      factor: 'Beneficiary Volume',
      impact: r2(inputs.n_ab / 5000),
      direction: (inputs.n_ab >= 8000 ? 'positive' : 'negative') as 'positive' | 'negative',
    },
  ].sort((a, b) => b.impact - a.impact);

  const interventionMsg = riskLevel === 'high' || riskLevel === 'critical'
    ? 'Immediate intervention recommended.'
    : 'Continue monitoring key metrics.';

  return {
    type: 'risk',
    riskLevel,
    riskScore,
    contributingFactors,
    summary: 'ACO shows ' + riskLevel + ' risk profile. ' + interventionMsg,
  };
}

// ─── Performance Forecast ─────────────────────────────────────────────────────

export async function predictPerformance(inputs: PredictionInputs): Promise<PerformanceForecastResult> {
  await delay(1400);

  const baseSavings    = inputs.previousSavingsRate;
  const growthDelta    = inputs.benchmarkGrowth - inputs.expenditureGrowth;
  const qualityMoment  = inputs.qualityChange * 0.3;

  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'].map((label, i) => ({
    label,
    savings: r2(baseSavings + growthDelta * (i + 1) * 0.25 + qualityMoment * (i + 1) * 0.1),
    quality: r2(clamp(inputs.previousQualityScore + inputs.qualityChange * (i + 1) * 0.25, 0, 100)),
  }));

  const projectedSavingsRate  = r2(quarters[3].savings);
  const projectedQualityScore = r2(quarters[3].quality);

  const trend =
    projectedSavingsRate > baseSavings + 0.5 ? 'improving' :
    projectedSavingsRate < baseSavings - 0.5 ? 'declining' : 'stable';

  return {
    type: 'performance',
    projectedSavingsRate,
    projectedQualityScore,
    trend,
    quarters,
    summary: 'Performance trajectory is ' + trend + '. Projected year-end savings rate: '
      + projectedSavingsRate + '%. Quality composite projected at ' + projectedQualityScore + '.',
  };
}

// ─── Twin ACO Matching ────────────────────────────────────────────────────────

export async function findTwinACOs(inputs: PredictionInputs): Promise<TwinAcoResult> {
  await delay(1000);

  const mockPool = [
    { acoId: 'ACO-1042', acoName: 'Northeast Community Health ACO' },
    { acoId: 'ACO-0891', acoName: 'Midwest Value Network'          },
    { acoId: 'ACO-2310', acoName: 'Coastal Care Alliance'          },
    { acoId: 'ACO-0654', acoName: 'Mountain Health Collaborative'  },
    { acoId: 'ACO-1789', acoName: 'Southern ACO Partners'          },
  ];

  const matches = mockPool.map((aco, i) => ({
    acoId:           aco.acoId,
    acoName:         aco.acoName,
    similarityScore: r2(97 - i * 2.4),
    savingsRate:     r2(inputs.previousSavingsRate + (i % 2 === 0 ? 0.3 : -0.2) - i * 0.15),
    qualityScore:    r2(clamp(inputs.previousQualityScore + (i % 3 === 0 ? 1.5 : -1.2), 60, 100)),
    beneficiaries:   Math.round(inputs.n_ab * (0.85 + i * 0.07)),
  }));

  return {
    type: 'twin',
    matches,
    summary: 'Found ' + matches.length + ' ACOs with similar characteristics. Top match: '
      + matches[0].acoName + ' at ' + matches[0].similarityScore + '% similarity.',
  };
}
