// ─── Mock ACO Portfolio Data ──────────────────────────────────────────────────

export type AcoStatus = 'on-track' | 'exceeded' | 'at-risk' | 'under-review';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type Region    = 'Northeast' | 'Southeast' | 'Midwest' | 'Southwest' | 'West';

export interface AcoRecord {
  id: string;
  name: string;
  acoId: string;
  region: Region;
  track: string;
  beneficiaries: number;
  providers: number;
  benchmark: number;
  actualExpenditure: number;
  savings: number;
  savingsPct: number;
  qualityScore: number;
  riskScore: number;
  riskLevel: RiskLevel;
  status: AcoStatus;
  performanceYear: number;
  highRiskBeneficiaries: number;
}

export interface MonthlyAcoTrend {
  month: string;
  benchmark: number;
  actual: number;
  savings: number;          // % savings rate
  qualityScore: number;
  beneficiaries: number;
  edVisitRate: number;      // per 1K
  readmissionRate: number;  // %
}

// ─── Portfolio ────────────────────────────────────────────────────────────────

export const mockAcos: AcoRecord[] = [
  {
    id: 'aco-001', name: 'Northeast Health Alliance ACO', acoId: 'ACO-001',
    region: 'Northeast', track: 'MSSP Track 1B',
    beneficiaries: 24_180, providers: 312,
    benchmark: 187.4, actualExpenditure: 179.6, savings: 7.8, savingsPct: 4.16,
    qualityScore: 88.2, riskScore: 28, riskLevel: 'low',
    status: 'on-track', performanceYear: 2026, highRiskBeneficiaries: 2_890,
  },
  {
    id: 'aco-002', name: 'Midwest Premier Care Network', acoId: 'ACO-002',
    region: 'Midwest', track: 'MSSP Track 3',
    beneficiaries: 31_450, providers: 428,
    benchmark: 241.8, actualExpenditure: 225.4, savings: 16.4, savingsPct: 6.78,
    qualityScore: 91.5, riskScore: 18, riskLevel: 'low',
    status: 'exceeded', performanceYear: 2026, highRiskBeneficiaries: 3_120,
  },
  {
    id: 'aco-003', name: 'Gulf Coast Care Network', acoId: 'ACO-003',
    region: 'Southeast', track: 'MSSP Track 1A',
    beneficiaries: 18_640, providers: 241,
    benchmark: 154.2, actualExpenditure: 151.8, savings: 2.4, savingsPct: 1.56,
    qualityScore: 74.8, riskScore: 68, riskLevel: 'high',
    status: 'at-risk', performanceYear: 2026, highRiskBeneficiaries: 3_410,
  },
  {
    id: 'aco-004', name: 'Mountain West Health Partners', acoId: 'ACO-004',
    region: 'Southwest', track: 'ACO REACH',
    beneficiaries: 41_200, providers: 589,
    benchmark: 318.6, actualExpenditure: 298.1, savings: 20.5, savingsPct: 6.43,
    qualityScore: 89.7, riskScore: 22, riskLevel: 'low',
    status: 'exceeded', performanceYear: 2026, highRiskBeneficiaries: 4_820,
  },
  {
    id: 'aco-005', name: 'Pacific Coast ACO Alliance', acoId: 'ACO-005',
    region: 'West', track: 'MSSP Track 2',
    beneficiaries: 27_890, providers: 374,
    benchmark: 221.0, actualExpenditure: 214.5, savings: 6.5, savingsPct: 2.94,
    qualityScore: 82.1, riskScore: 41, riskLevel: 'medium',
    status: 'on-track', performanceYear: 2026, highRiskBeneficiaries: 3_240,
  },
  {
    id: 'aco-006', name: 'Appalachian Community Health ACO', acoId: 'ACO-006',
    region: 'Southeast', track: 'MSSP Track 1A',
    beneficiaries: 14_320, providers: 187,
    benchmark: 118.9, actualExpenditure: 122.4, savings: -3.5, savingsPct: -2.94,
    qualityScore: 69.3, riskScore: 81, riskLevel: 'critical',
    status: 'under-review', performanceYear: 2026, highRiskBeneficiaries: 2_890,
  },
  {
    id: 'aco-007', name: 'Great Lakes Health Network', acoId: 'ACO-007',
    region: 'Midwest', track: 'MSSP Track 3',
    beneficiaries: 36_710, providers: 501,
    benchmark: 284.2, actualExpenditure: 265.8, savings: 18.4, savingsPct: 6.47,
    qualityScore: 90.1, riskScore: 19, riskLevel: 'low',
    status: 'exceeded', performanceYear: 2026, highRiskBeneficiaries: 3_980,
  },
  {
    id: 'aco-008', name: 'Desert Sun ACO Collaborative', acoId: 'ACO-008',
    region: 'Southwest', track: 'MSSP Track 1B',
    beneficiaries: 21_540, providers: 289,
    benchmark: 172.3, actualExpenditure: 168.9, savings: 3.4, savingsPct: 1.97,
    qualityScore: 77.4, riskScore: 54, riskLevel: 'medium',
    status: 'on-track', performanceYear: 2026, highRiskBeneficiaries: 2_640,
  },
];

// ─── Monthly trends per ACO (8 months YTD) ───────────────────────────────────

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];

function buildMonthlyTrend(
  baseBenchmark: number,
  baseSavingsPct: number,
  baseQuality: number,
  baseBeneficiaries: number,
  improving: boolean
): MonthlyAcoTrend[] {
  return MONTHS.map((month, i) => {
    const drift = improving ? i * 0.04 : -(i * 0.03);
    const bm    = Math.round((baseBenchmark + i * 0.3) * 10) / 10;
    const sp    = Math.round((baseSavingsPct + drift) * 100) / 100;
    const actual = Math.round(bm * (1 - sp / 100) * 10) / 10;
    return {
      month,
      benchmark: bm,
      actual,
      savings: sp,
      qualityScore: Math.round(Math.min(100, baseQuality + (improving ? i * 0.15 : -(i * 0.1))) * 10) / 10,
      beneficiaries: Math.round(baseBeneficiaries + i * 120),
      edVisitRate: Math.round((340 - (improving ? i * 4 : -(i * 3))) * 10) / 10,
      readmissionRate: Math.round((12.5 - (improving ? i * 0.15 : -(i * 0.12))) * 100) / 100,
    };
  });
}

export const mockMonthlyTrends: Record<string, MonthlyAcoTrend[]> = {
  'aco-001': buildMonthlyTrend(890,  4.16, 88.2, 24_180, true),
  'aco-002': buildMonthlyTrend(892,  6.78, 91.5, 31_450, true),
  'aco-003': buildMonthlyTrend(888,  1.56, 74.8, 18_640, false),
  'aco-004': buildMonthlyTrend(895,  6.43, 89.7, 41_200, true),
  'aco-005': buildMonthlyTrend(891,  2.94, 82.1, 27_890, true),
  'aco-006': buildMonthlyTrend(885, -2.94, 69.3, 14_320, false),
  'aco-007': buildMonthlyTrend(893,  6.47, 90.1, 36_710, true),
  'aco-008': buildMonthlyTrend(889,  1.97, 77.4, 21_540, true),
};

// ─── Portfolio monthly aggregate ──────────────────────────────────────────────

export const mockPortfolioMonthly: MonthlyAcoTrend[] = MONTHS.map((month, i) => ({
  month,
  benchmark: Math.round((891 + i * 0.5) * 10) / 10,
  actual:    Math.round((858 - i * 1.2) * 10) / 10,
  savings:   Math.round((3.6 + i * 0.18) * 100) / 100,
  qualityScore: Math.round((83.4 + i * 0.12) * 10) / 10,
  beneficiaries: 214_000 + i * 800,
  edVisitRate:   Math.round((338 - i * 3.2) * 10) / 10,
  readmissionRate: Math.round((12.1 - i * 0.1) * 100) / 100,
}));
