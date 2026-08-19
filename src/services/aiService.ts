/**
 * aiService — Mock AI orchestrator.
 *
 * Future architecture:
 *   User → AI Orchestrator → Agent(s) → Authorized Data → Analysis → Response
 *
 * Agents (not yet implemented):
 *   FinancialAgent | RiskAgent | QualityAgent | UtilizationAgent |
 *   TwinAcoAgent   | RecommendationAgent | DocumentAgent | ReportAgent
 *
 * Replace generateResponse() with a fetch() to the Python backend.
 * Role-awareness is enforced here — ACO users cannot receive cross-ACO data.
 */

import type { UserRole } from '@/types/auth';

export interface AiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  agent?: string;   // which mock agent handled this
}

export interface SuggestedQuestion {
  id: string;
  text: string;
}

// ─── Suggested questions by role ─────────────────────────────────────────────

export const CMS_SUGGESTIONS: SuggestedQuestion[] = [
  { id: 'c1', text: 'Which ACOs are at highest risk?' },
  { id: 'c2', text: 'Why is this ACO underperforming?' },
  { id: 'c3', text: 'Which ACO has the largest quality gap?' },
  { id: 'c4', text: 'Compare two ACOs by savings rate.' },
  { id: 'c5', text: 'What should CMS prioritize this quarter?' },
];

export const ACO_SUGGESTIONS: SuggestedQuestion[] = [
  { id: 'a1', text: 'Why are our costs increasing?' },
  { id: 'a2', text: 'Which quality measure should we improve?' },
  { id: 'a3', text: 'Which providers need attention?' },
  { id: 'a4', text: 'How do we compare with peers?' },
  { id: 'a5', text: 'What should we focus on to improve performance?' },
];

// ─── Mock response bank ───────────────────────────────────────────────────────

const CMS_RESPONSES: Record<string, { agent: string; content: string }> = {
  'which acos are at highest risk': {
    agent: 'RiskAgent',
    content: `Based on current performance indicators, three ACOs require immediate attention:\n\n**1. Sunrise Valley ACO (ACO-007)** — Risk Score: 82/100\nPrimary drivers: expenditure growth of 6.4% against a 3.1% benchmark, combined with a widening performance gap of +3.2%.\n\n**2. Gulf Coast Care Network (ACO-012)** — Risk Score: 74/100\nQuality composite has declined 4.1 points over two consecutive quarters. RAF score drift detected.\n\n**3. Mountain West ACO (ACO-019)** — Risk Score: 68/100\nBeneficiary churn rate elevated at 14.2%. Post-acute utilization 28% above benchmark.\n\nRecommendation: Schedule performance reviews for ACO-007 and ACO-012 within the next 30 days.`,
  },
  'why is this aco underperforming': {
    agent: 'FinancialAgent',
    content: `Analysis of the current ACO's underperformance reveals three primary factors:\n\n**Expenditure Growth (High Impact)**\nPer-beneficiary expenditure grew 5.2% YoY, exceeding the benchmark growth of 3.0% by 220 basis points. Inpatient admissions are the leading driver.\n\n**Quality Score Decline (Medium Impact)**\nThe chronic disease management domain fell from 84.1 to 79.8 over the last two quarters, reducing shared savings eligibility.\n\n**Beneficiary Risk Shift (Medium Impact)**\nRAF score increased from 1.18 to 1.31 without a corresponding reduction in expenditure, suggesting inadequate risk-adjusted care management.\n\nSuggested next step: Run a Performance Forecast using the Predictions module for a full trajectory analysis.`,
  },
  'which aco has the largest quality gap': {
    agent: 'QualityAgent',
    content: `**Largest Quality Gaps — Current Performance Year**\n\nACO with the widest gap: **Eastern Seaboard Health Partners (ACO-003)**\n- Composite Score: 71.4 vs. 84.0 national benchmark → Gap: **-12.6 points**\n- Weakest domain: Care Coordination (62.1 vs. 81.0 benchmark)\n- Preventive care completion rate: 58% vs. 74% target\n\nSecond: **Desert Sun ACO (ACO-021)**\n- Gap: -9.8 points, driven by patient experience scores\n\n**Portfolio average quality gap:** -3.2 points below national benchmark\n\nACOs below the minimum quality threshold for shared savings: 2 of 24`,
  },
  'compare two acos by savings rate': {
    agent: 'FinancialAgent',
    content: `**ACO Savings Rate Comparison — Top Performers vs. Portfolio Average**\n\n| ACO | Savings Rate | Benchmark | Status |\n|-----|-------------|-----------|--------|\n| Midwest Premier Care (ACO-002) | 6.78% | 3.50% | ✅ Exceeded |\n| Northeast Health Alliance (ACO-001) | 4.29% | 3.50% | ✅ On Track |\n| Portfolio Average | 3.12% | 3.50% | ⚠ Below |\n| Gulf Coast Network (ACO-012) | 1.40% | 3.50% | 🔴 At Risk |\n\nMidwest Premier Care outperforms the portfolio by 3.66 percentage points. Key differentiator: SNF utilization 31% below benchmark and strong care coordination scores (93.2).`,
  },
  'what should cms prioritize this quarter': {
    agent: 'RecommendationAgent',
    content: `**CMS Priority Recommendations — Q3 2026**\n\n**🔴 Immediate (0–30 days)**\n- Initiate corrective action review for 3 at-risk ACOs (risk scores >70)\n- Audit RAF coding accuracy for ACOs showing >15% score drift\n\n**🟡 Short-term (30–90 days)**\n- Deploy quality improvement technical assistance to 5 ACOs below quality threshold\n- Benchmark post-acute care utilization across Track 1B ACOs\n\n**🟢 Strategic (90+ days)**\n- Evaluate Track upgrade readiness for 4 ACOs consistently exceeding savings targets\n- Update expenditure benchmarks using revised regional cost indices\n\nBased on portfolio analysis of 24 active ACOs across 5 regions.`,
  },
};

const ACO_RESPONSES: Record<string, { agent: string; content: string }> = {
  'why are our costs increasing': {
    agent: 'FinancialAgent',
    content: `**Cost Increase Analysis — Your ACO**\n\nYour per-beneficiary expenditure has grown 4.3% YTD, above the 3.0% benchmark growth. Key contributors:\n\n**Inpatient (Largest Driver — 35.7% of spend)**\nAdmissions are trending 8% above prior year. 62% of excess admissions are for CHF and COPD — conditions manageable with stronger care coordination protocols.\n\n**Pharmacy (Growing Concern — 5.9% of spend, +4.2% YoY)**\nSpecialty drug costs driving growth. 14 high-cost beneficiaries account for 38% of pharmacy spend.\n\n**Post-Acute Care (Improving — -5.4% YoY)**\nSNF utilization reduction is a positive sign — continue this trajectory.\n\n**Recommendation:** Target care management outreach for the top 50 high-risk, high-cost beneficiaries. Estimated impact: $1.2M–$1.8M savings potential.`,
  },
  'which quality measure should we improve': {
    agent: 'QualityAgent',
    content: `**Quality Improvement Opportunity Analysis**\n\nYour composite score is 88.2 — above the 84.0 benchmark. However, two domains have the highest improvement ROI:\n\n**1. Chronic Disease Management (Score: 84.7 | Benchmark: 80.0)**\nWhile above benchmark, closing the gap to 90+ would qualify your ACO for the enhanced shared savings tier. Focus: diabetes HbA1c control and hypertension management.\n\n**2. At-Risk Population (Score: 81.0 | Benchmark: 78.0)**\nOnly 2.3 points above benchmark — vulnerable to falling below if high-risk beneficiary count increases. Prioritize care management enrollment for RAF score >2.5 beneficiaries.\n\n**Highest-value intervention:** Improving Chronic Disease Management by 5 points is estimated to increase your shared savings by $420K–$680K.`,
  },
  'which providers need attention': {
    agent: 'UtilizationAgent',
    content: `**Provider Performance Alerts — Your ACO**\n\nIdentified 4 providers requiring performance conversations:\n\n**Dr. [Provider A] — Internal Medicine**\n- Cost Index: 1.34 (34% above ACO average)\n- ED referral rate: 2.1x ACO average\n- Quality Score: 71 — below ACO threshold\n\n**Dr. [Provider B] — Cardiology**\n- Readmission rate: 18.4% vs. 10.4% ACO average\n- Post-acute care ordering: 2.8x benchmark\n\n**Dr. [Provider C] — Family Medicine**\n- Preventive care completion: 48% vs. 74% ACO average\n- High panel churn (22% beneficiary turnover)\n\n**Note:** Provider names are anonymized. Full details available in the Providers module.`,
  },
  'how do we compare with peers': {
    agent: 'TwinAcoAgent',
    content: `**Peer Benchmarking — Your ACO vs. Similar ACOs**\n\nYour ACO was matched with 4 peers based on beneficiary volume, track type, and region:\n\n| Metric | Your ACO | Peer Average | Rank |\n|--------|----------|-------------|------|\n| Savings Rate | 4.29% | 3.84% | 2nd of 5 |\n| Quality Score | 88.2 | 85.6 | 1st of 5 |\n| ED Visits/1K | 312 | 341 | 1st of 5 |\n| Cost Index | 0.96 | 1.02 | 2nd of 5 |\n| RAF Score | 1.24 | 1.19 | 3rd of 5 |\n\n**Key insight:** You lead peers in quality and ED utilization. Your savings rate gap vs. top performer (5.1%) is driven primarily by higher inpatient costs.\n\nNote: Peer data shown is aggregated. Individual peer ACO data is confidential.`,
  },
  'what should we focus on to improve performance': {
    agent: 'RecommendationAgent',
    content: `**Performance Improvement Recommendations — Your ACO**\n\n**🔴 High Priority**\n- Launch targeted care management for top 50 high-risk beneficiaries (RAF >2.5)\n- Implement post-discharge follow-up protocol for CHF/COPD patients within 48 hours\n\n**🟡 Medium Priority**\n- Engage 3 underperforming providers in quality improvement plans\n- Enroll eligible beneficiaries in chronic disease management programs\n- Improve HbA1c testing rates (currently 78% vs. 90% target)\n\n**🟢 Ongoing**\n- Maintain ED diversion momentum — you are top-ranked among peers\n- Continue SNF utilization reduction strategy\n\n**Estimated impact if all recommendations implemented:**\n- Additional savings: $1.8M–$2.4M\n- Quality score improvement: +3–5 points\n- Shared savings tier upgrade: likely`,
  },
};

// ─── Fuzzy match helper ───────────────────────────────────────────────────────

function matchResponse(
  query: string,
  bank: Record<string, { agent: string; content: string }>
): { agent: string; content: string } | null {
  const q = query.toLowerCase().trim();
  for (const [key, val] of Object.entries(bank)) {
    const keywords = key.split(' ');
    const hits = keywords.filter(k => q.includes(k)).length;
    if (hits >= 2) return val;
  }
  return null;
}

const FALLBACK_CMS = `I can help you analyze ACO portfolio performance, risk profiles, quality metrics, financial trends, and generate recommendations. Try asking:\n- "Which ACOs are at highest risk?"\n- "What should CMS prioritize this quarter?"\n- "Which ACO has the largest quality gap?"`;

const FALLBACK_ACO = `I can help you understand your ACO's cost drivers, quality improvement opportunities, provider performance, and peer benchmarking. Try asking:\n- "Why are our costs increasing?"\n- "Which quality measure should we improve?"\n- "How do we compare with peers?"`;

// ─── Main generate function ───────────────────────────────────────────────────

export async function generateAiResponse(
  query: string,
  role: UserRole,
  _acoId?: string   // reserved for future per-ACO data scoping
): Promise<AiMessage> {
  // Simulate network latency
  await new Promise(r => setTimeout(r, 900 + Math.random() * 600));

  const bank = role === 'CMS' ? CMS_RESPONSES : ACO_RESPONSES;
  const match = matchResponse(query, bank);

  const content = match
    ? match.content
    : role === 'CMS' ? FALLBACK_CMS : FALLBACK_ACO;

  const agent = match?.agent ?? 'OrchestratorAgent';

  return {
    id: crypto.randomUUID(),
    role: 'assistant',
    content,
    timestamp: new Date(),
    agent,
  };
}

export function getSuggestions(role: UserRole): SuggestedQuestion[] {
  return role === 'CMS' ? CMS_SUGGESTIONS : ACO_SUGGESTIONS;
}
