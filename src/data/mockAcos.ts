// ─── Mock ACO Portfolio Data ──────────────────────────────────────────────────
// Realistic VBC / MSSP mock data — replace with API later

export type AcoStatus = 'on-track' | 'exceeded' | 'at-risk' | 'under-review';
export type RiskLevel  = 'low' | 'medium' | 'high' | 'critical';
export type Region     = 'Northeast' | 'Southeast' | 'Midwest' | 'Southwest' | 'West';

export interface AcoRecord {
  id: string;
  name: string;
  acoId: string;
  region: Region;
  track: string;
  beneficiaries: number;
  providers: number;
  benchmark: number;        // $ millions
  actualExpenditure: number;// $ millions
  savings: number;          // $ millions (negative = loss)
  savingsPct: number;       // %
  qualityScore: number;     // 0–100
  riskScore: number;        // 0–100
  riskLevel: RiskLevel;
  status: AcoStatus;
  performanceYear: number;
  highRiskBeneficiaries: number;
}

export interface MonthlyTrend {
  month: string;
  benchmark: number;
  actual: number;
  savings: number;
}

export interface QuarterlyQuality {
  quarter: string;
  composite: number;
  preventive: number;
  chronic: number;
  patientExp: number;
}

export interface BeneficiaryTrend {
  month: string;
  total: number;
  highRisk: number;
  newlyAttributed: number;
}

// ─── ACO Portfolio ────────────────────────────────────────────────────────────

export const mockAcos: AcoRecord[] = [
  {
    id: 'aco-001',
    name: 'Northeast Health Alliance ACO',
    acoId: 'ACO-001',
    region: 'Northeast',
    track: 'MSSP Track 1B',
    beneficiaries: 24_180,
    providers: 312,
    benchmark: 187.4,
    actualExpenditure: 179.6,
    savings: 7.8,
    savingsPct: 4.16,
    qualityScore: 88.2,
    riskScore: 28,
    riskLevel: 'low',
    status: 'on-track',
    performanceYear: 2026,
    highRiskBeneficiaries: 2_890,
  },
  {
    id: 'aco-002',
    name: 'Midwest Premier Care Network',
    acoId: 'ACO-002',
    region: 'Midwest',
    track: 'MSSP Track 3',
    beneficiaries: 31_450,
    providers: 428,
    benchmark: 241.8,
    actualExpenditure: 225.4,
    savings: 16.4,
    savingsPct: 6.78,
    qualityScore: 91.5,
    riskScore: 18,
    riskLevel: 'low',
    status: 'exceeded',
    performanceYear: 2026,
    highRiskBeneficiaries: 3_120,
  },
  {
    id: 'aco-003',
   