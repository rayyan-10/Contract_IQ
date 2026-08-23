// ─── Mock ACO Analytics Data ──────────────────────────────────────────────────
// Deterministic mock data keyed by acoId. Replace with API calls later.

export interface AcoProfile {
  acoId: string;
  acoName: string;
  trackType: string;
  performanceYear: number;
  region: string;
  totalBeneficiaries: number;
  totalProviders: number;
}

export interface FinancialSummary {
  benchmarkPMPM: number;
  actualPMPM: number;
  savingsRate: number;       // %
  sharedSavings: number;     // $M
  minLossRate: number;       // %
  performanceGap: number;    // %
}

export interface MonthlyFinancial {
  month: string;
  benchmark: number;
  actual: number;
}

export interface QualityDomain {
  domain: string;
  score: number;
  benchmark: number;
}

export interface QuarterlyQuality {
  quarter: string;
  composite: number;
  preventive: number;
  chronic: number;
  patientExp: number;
  careCoord: number;
}

export interface UtilizationMetric {
  category: string;
  rate: number;
  benchmark: number;
  unit: string;
}

export interface MonthlyUtilization {
  month: string;
  edVisits: number;
  inpatientDays: number;
  preventiveVisits: number;
}

export interface RiskBand {
  band: string;
  count: number;
  pct: number;
  avgRaf: number;
}

export interface MonthlyRisk {
  month: string;
  avgRaf: number;
  highRiskCount: number;
}

export interface CostDriver {
  category: string;
  amount: number;         // $M
  pct: number;
  yoyChange: number;      // %
}

export interface AcoAnalyticsData {
  profile: AcoProfile;
  financial: {
    summary: FinancialSummary;
    monthly: MonthlyFinancial[];
  };
  quality: {
    domains: QualityDomain[];
    quarterly: QuarterlyQuality[];
    compositeScore: number;
    compositeChange: number;
  };
  utilization: {
    metrics: UtilizationMetric[];
    monthly: MonthlyUtilization[];
  };
  risk: {
    bands: RiskBand[];
    monthly: MonthlyRisk[];
    avgRafScore: number;
    highRiskCount: number;
    highRiskPct: number;
  };
  cost: {
    drivers: CostDriver[];
    totalExpenditure: number;
  };
}

// ─── Data by ACO ID ───────────────────────────────────────────────────────────

const ACO_001_DATA: AcoAnalyticsData = {
  profile: {
    acoId: 'A00001',
    acoName: 'Northeast Health Alliance ACO',
    trackType: 'MSSP Track 1B',
    performanceYear: 2026,
    region: 'Northeast',
    totalBeneficiaries: 24_180,
    totalProviders: 312,
  },
  financial: {
    summary: {
      benchmarkPMPM: 892.4,
      actualPMPM:    854.1,
      savingsRate:   4.29,
      sharedSavings: 7.8,
      minLossRate:   2.0,
      performanceGap: -2.29,
    },
    monthly: [
      { month: 'Jan', benchmark: 890, actual: 862 },
      { month: 'Feb', benchmark: 891, actual: 858 },
      { month: 'Mar', benchmark: 891, actual: 851 },
      { month: 'Apr', benchmark: 892, actual: 848 },
      { month: 'May', benchmark: 892, actual: 853 },
      { month: 'Jun', benchmark: 893, actual: 849 },
      { month: 'Jul', benchmark: 893, actual: 845 },
      { month: 'Aug', benchmark: 894, actual: 854 },
    ],
  },
  quality: {
    compositeScore: 88.2,
    compositeChange: 2.1,
    domains: [
      { domain: 'Preventive Care',    score: 91.4, benchmark: 85.0 },
      { domain: 'Chronic Mgmt',       score: 84.7, benchmark: 80.0 },
      { domain: 'Patient Safety',     score: 93.1, benchmark: 88.0 },
      { domain: 'Care Coordination',  score: 86.2, benchmark: 82.0 },
      { domain: 'Patient Experience', score: 82.8, benchmark: 79.0 },
      { domain: 'At-Risk Population', score: 81.0, benchmark: 78.0 },
    ],
    quarterly: [
      { quarter: 'Q1 2025', composite: 84.1, preventive: 88.0, chronic: 80.2, patientExp: 79.1, careCoord: 83.0 },
      { quarter: 'Q2 2025', composite: 85.8, preventive: 89.2, chronic: 82.1, patientExp: 80.4, careCoord: 84.5 },
      { quarter: 'Q3 2025', composite: 86.9, preventive: 90.1, chronic: 83.4, patientExp: 81.2, careCoord: 85.1 },
      { quarter: 'Q4 2025', composite: 87.4, preventive: 90.8, chronic: 84.0, patientExp: 81.9, careCoord: 85.9 },
      { quarter: 'Q1 2026', composite: 87.8, preventive: 91.0, chronic: 84.3, patientExp: 82.4, careCoord: 86.1 },
      { quarter: 'Q2 2026', composite: 88.2, preventive: 91.4, chronic: 84.7, patientExp: 82.8, careCoord: 86.2 },
    ],
  },
  utilization: {
    metrics: [
      { category: 'ED Visits',            rate: 312,  benchmark: 380,  unit: 'per 1K' },
      { category: 'Inpatient Admissions',  rate: 218,  benchmark: 265,  unit: 'per 1K' },
      { category: 'Readmission Rate',      rate: 10.4, benchmark: 13.2, unit: '%' },
      { category: 'Preventive Visits',     rate: 74.2, benchmark: 68.0, unit: '%' },
      { category: 'SNF Utilization',       rate: 48,   benchmark: 62,   unit: 'per 1K' },
    ],
    monthly: [
      { month: 'Jan', edVisits: 328, inpatientDays: 1820, preventiveVisits: 1240 },
      { month: 'Feb', edVisits: 319, inpatientDays: 1790, preventiveVisits: 1310 },
      { month: 'Mar', edVisits: 315, inpatientDays: 1760, preventiveVisits: 1420 },
      { month: 'Apr', edVisits: 308, inpatientDays: 1740, preventiveVisits: 1380 },
      { month: 'May', edVisits: 302, inpatientDays: 1720, preventiveVisits: 1460 },
      { month: 'Jun', edVisits: 314, inpatientDays: 1750, preventiveVisits: 1490 },
      { month: 'Jul', edVisits: 311, inpatientDays: 1710, preventiveVisits: 1510 },
      { month: 'Aug', edVisits: 312, inpatientDays: 1700, preventiveVisits: 1530 },
    ],
  },
  risk: {
    avgRafScore: 1.24,
    highRiskCount: 2_890,
    highRiskPct: 11.9,
    bands: [
      { band: 'Low Risk',      count: 14_508, pct: 60.0, avgRaf: 0.72 },
      { band: 'Moderate Risk', count:  6_771, pct: 28.0, avgRaf: 1.18 },
      { band: 'High Risk',     count:  2_176, pct:  9.0, avgRaf: 2.14 },
      { band: 'Critical Risk', count:    725, pct:  3.0, avgRaf: 3.42 },
    ],
    monthly: [
      { month: 'Jan', avgRaf: 1.19, highRiskCount: 3050 },
      { month: 'Feb', avgRaf: 1.20, highRiskCount: 3010 },
      { month: 'Mar', avgRaf: 1.21, highRiskCount: 2980 },
      { month: 'Apr', avgRaf: 1.22, highRiskCount: 2960 },
      { month: 'May', avgRaf: 1.23, highRiskCount: 2930 },
      { month: 'Jun', avgRaf: 1.23, highRiskCount: 2910 },
      { month: 'Jul', avgRaf: 1.24, highRiskCount: 2895 },
      { month: 'Aug', avgRaf: 1.24, highRiskCount: 2890 },
    ],
  },
  cost: {
    totalExpenditure: 179.6,
    drivers: [
      { category: 'Inpatient',          amount: 64.2,  pct: 35.7, yoyChange:  -3.1 },
      { category: 'Outpatient',         amount: 47.8,  pct: 26.6, yoyChange:   1.2 },
      { category: 'Professional Svcs',  amount: 32.4,  pct: 18.0, yoyChange:   0.8 },
      { category: 'Post-Acute Care',    amount: 18.9,  pct: 10.5, yoyChange:  -5.4 },
      { category: 'Pharmacy',           amount: 10.6,  pct:  5.9, yoyChange:   4.2 },
      { category: 'Other',              amount:  5.7,  pct:  3.2, yoyChange:   0.5 },
    ],
  },
};

// ─── Fallback for demo ACO users without specific data ────────────────────────

function buildFallback(acoId: string, acoName: string): AcoAnalyticsData {
  const base = { ...ACO_001_DATA };
  return {
    ...base,
    profile: { ...base.profile, acoId, acoName },
  };
}

export function getAcoProfile(acoId: string): AcoAnalyticsData {
  if (acoId === 'A00001') return ACO_001_DATA;
  return buildFallback(acoId, acoId + ' Network');
}
