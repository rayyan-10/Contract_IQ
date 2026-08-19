// ─── Prediction Types ─────────────────────────────────────────────────────────
// Service abstraction — replace predictionService.ts with real API calls later.
// Keep types aligned with what the service actually returns.

export interface PredictionInputs {
  n_ab: number;
  previousSavingsRate: number;
  previousQualityScore: number;
  previousPerformanceGap: number;
  expenditureGrowth: number;
  benchmarkGrowth: number;
  beneficiaryGrowth: number;
  qualityChange: number;
}

export type AnalysisType = 'risk' | 'performance' | 'twin';

// ─── Risk ─────────────────────────────────────────────────────────────────────

export interface RiskFactor {
  factor: string;
  impact: number;
  direction: 'positive' | 'negative';
}

export interface RiskPredictionResult {
  type: 'risk';
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  riskScore: number;
  contributingFactors: RiskFactor[];
  summary: string;
}

// ─── Performance Forecast ─────────────────────────────────────────────────────

export interface PerformanceForecastResult {
  type: 'performance';
  projectedSavingsRate: number;
  projectedQualityScore: number;
  trend: 'improving' | 'stable' | 'declining';
  quarters: Array<{ label: string; savings: number; quality: number }>;
  summary: string;
}

// ─── Twin ACO ─────────────────────────────────────────────────────────────────

export interface TwinAcoMatch {
  acoId: string;
  acoName: string;
  similarityScore: number;
  savingsRate: number;
  qualityScore: number;
  beneficiaries: number;
}

export interface TwinAcoResult {
  type: 'twin';
  matches: TwinAcoMatch[];
  summary: string;
}

export type PredictionResult = RiskPredictionResult | PerformanceForecastResult | TwinAcoResult;
