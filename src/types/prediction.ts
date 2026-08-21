// ─── Prediction Types ─────────────────────────────────────────────────────────
// Aligned with FastAPI backend endpoints:
//   POST /risk/predict
//   POST /forecast/predict
//   POST /twin/find

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

// Payload sent to backend (ID + inputs)
export interface PredictionPayload extends PredictionInputs {
  acoId: string;
}

export type AnalysisType = 'risk' | 'performance' | 'twin';

// ─── Risk (from POST /risk/predict) ──────────────────────────────────────────

export interface RiskFactor {
  factor: string;
  impact: number;
  direction: 'positive' | 'negative';
}

export interface RiskPredictionResult {
  type: 'risk';
  acoId: string;
  atRisk: boolean;
  riskProbability: number;         // 0–1 from model
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  riskScore: number;               // 0–100 scaled
  contributingFactors: RiskFactor[];
  summary: string;
}

// ─── Forecast (from POST /forecast/predict) ──────────────────────────────────

export interface PerformanceForecastResult {
  type: 'performance';
  acoId: string;
  projectedSavingsRate: number;
  projectedQualityScore: number;
  trend: 'improving' | 'stable' | 'declining';
  quarters: Array<{ label: string; savings: number; quality: number }>;
  summary: string;
}

// ─── Twin (from POST /twin/find) ─────────────────────────────────────────────

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
  acoId: string;
  matches: TwinAcoMatch[];
  summary: string;
}

export type PredictionResult = RiskPredictionResult | PerformanceForecastResult | TwinAcoResult;
