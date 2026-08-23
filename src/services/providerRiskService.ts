/**
 * providerRiskService — Provider Risk Lookup + What-If Simulation
 *
 * Endpoints (no auth required):
 *   POST /provider/lookup
 *   POST /provider/simulate
 *   GET  /provider/simulation-config
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ─── Types ────────────────────────────────────────────────────────────────────

export type RiskTier = 'HIGH' | 'MEDIUM' | 'LOW';

export interface ProviderLookupRequest {
  provider_id: string;
  performance_year: number;
}

export interface ProviderLookupResponse {
  provider_id: string;
  aco_id: string;
  performance_year: number;
  provider_type: string;
  specialty: string;
  beneficiary_count: number;
  predicted_risk_tier: RiskTier;
  confidence: number;
  class_probabilities: { HIGH: number; MEDIUM: number; LOW: number };
  show_simulator: boolean;
  current_metrics: {
    ed_visits_vs_aco: number;
    quality_vs_aco: number;
    per_capita_vs_aco: number;
    admissions_vs_aco: number;
    snf_admission_vs_aco: number;
  };
}

export interface SimulationMetric {
  field: string;
  label: string;
  min: number;
  max: number;
  impact_pct: number;
}

export interface SimulationConfigResponse {
  metrics: SimulationMetric[];
}

export interface SimulationRequest {
  provider_id: string;
  performance_year: number;
  modifications: Partial<{
    ed_visits_vs_aco: number;
    quality_vs_aco: number;
    per_capita_vs_aco: number;
    admissions_vs_aco: number;
    snf_admission_vs_aco: number;
  }>;
}

export interface SimulationResponse {
  provider_id: string;
  original: {
    risk_tier: RiskTier;
    confidence: number;
    class_probabilities: { HIGH: number; MEDIUM: number; LOW: number };
  };
  modified: {
    risk_tier: RiskTier;
    confidence: number;
    class_probabilities: { HIGH: number; MEDIUM: number; LOW: number };
  };
  risk_change: 'improved' | 'worsened' | 'unchanged';
  modifications_applied: Record<string, { original: number; modified: number; change: number }>;
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function lookupProvider(req: ProviderLookupRequest): Promise<ProviderLookupResponse> {
  const res = await fetch(API_BASE + '/provider/lookup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(data.detail || 'Provider lookup failed (' + res.status + ')');
  }
  return res.json();
}

export async function getSimulationConfig(): Promise<SimulationConfigResponse> {
  const res = await fetch(API_BASE + '/provider/simulation-config', {
    headers: { 'ngrok-skip-browser-warning': 'true' },
  });
  if (!res.ok) throw new Error('Failed to load simulation config');
  return res.json();
}

export async function runSimulation(req: SimulationRequest): Promise<SimulationResponse> {
  const res = await fetch(API_BASE + '/provider/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({ detail: 'Simulation failed' }));
    throw new Error(data.detail || 'Simulation failed (' + res.status + ')');
  }
  return res.json();
}
