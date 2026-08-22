/**
 * agentService — Calls POST /agents/analyze
 * Sends the input_id from a completed prediction and gets agent analysis back.
 */

import { getAuthHeaders } from './tokenService';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface AgentAnalysisResponse {
  inputId: string;
  analysis: Record<string, unknown>;
  raw: Record<string, unknown>;
}

export async function requestAgentAnalysis(inputId: string): Promise<AgentAnalysisResponse> {
  const res = await fetch(API_BASE + '/agents/analyze', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ input_id: inputId }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error('Agent API ' + res.status + ': ' + text);
  }

  const data = await res.json();
  // Backend wraps the actual analysis inside an "analysis" key
  const analysis = (data.analysis ?? data) as Record<string, unknown>;
  return { inputId, analysis, raw: data };
}

/** Quality-specific agent endpoint */
export async function requestQualityAgentAnalysis(inputId: string): Promise<AgentAnalysisResponse> {
  const res = await fetch(API_BASE + '/agents/quality/analyze', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ input_id: inputId }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error('Quality Agent API ' + res.status + ': ' + text);
  }

  const data = await res.json();
  // Backend wraps the actual analysis inside an "analysis" key
  const analysis = (data.analysis ?? data) as Record<string, unknown>;
  return { inputId, analysis, raw: data };
}
