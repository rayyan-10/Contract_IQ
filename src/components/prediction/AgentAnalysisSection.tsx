import React, { useState } from 'react';
import {
  Bot, Sparkles, AlertCircle, CheckCircle2, XCircle,
  TrendingUp, Lightbulb, Target, ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { requestAgentAnalysis, requestQualityAgentAnalysis, type AgentAnalysisResponse } from '@/services/agentService';

interface AgentAnalysisSectionProps {
  inputId: string | null;
  variant?: 'default' | 'quality';
}

// Fields to never display
const HIDDEN_FIELDS = new Set(['agent', 'confidence_note']);

// Known array fields with their styling
const ARRAY_STYLES: Record<string, { color: string; bg: string; border: string; icon: React.ReactNode; label: string }> = {
  strengths:          { color: 'text-emerald-700', bg: 'bg-emerald-50',  border: 'border-l-emerald-500', icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />, label: 'Strengths' },
  weaknesses:         { color: 'text-red-700',     bg: 'bg-red-50',      border: 'border-l-red-500',     icon: <XCircle className="w-3.5 h-3.5 text-red-500" />,          label: 'Weaknesses' },
  improvement_areas:  { color: 'text-amber-700',   bg: 'bg-amber-50',    border: 'border-l-amber-500',   icon: <TrendingUp className="w-3.5 h-3.5 text-amber-600" />,    label: 'Improvement Areas' },
  recommended_actions:{ color: 'text-maroon-900',  bg: 'bg-cream-200',   border: 'border-l-violet-500',  icon: <Lightbulb className="w-3.5 h-3.5 text-maroon-900" />,    label: 'Recommended Actions' },
  recommendations:    { color: 'text-maroon-900',  bg: 'bg-cream-200',   border: 'border-l-violet-500',  icon: <Lightbulb className="w-3.5 h-3.5 text-maroon-900" />,    label: 'Recommendations' },
  insights:           { color: 'text-sky-700',     bg: 'bg-sky-50',      border: 'border-l-sky-500',     icon: <Target className="w-3.5 h-3.5 text-sky-600" />,           label: 'Key Insights' },
  key_findings:       { color: 'text-indigo-700',  bg: 'bg-indigo-50',   border: 'border-l-indigo-500',  icon: <Target className="w-3.5 h-3.5 text-indigo-600" />,        label: 'Key Findings' },
  risk_factors:       { color: 'text-red-700',     bg: 'bg-red-50',      border: 'border-l-red-500',     icon: <AlertCircle className="w-3.5 h-3.5 text-red-500" />,      label: 'Risk Factors' },
  opportunities:      { color: 'text-emerald-700', bg: 'bg-emerald-50',  border: 'border-l-emerald-500', icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />,   label: 'Opportunities' },
};

// Known text assessment fields
const ASSESSMENT_FIELDS = new Set([
  'quality_assessment', 'risk_assessment', 'forecast_assessment',
  'twin_assessment', 'assessment', 'summary', 'analysis', 'message',
  'interpretation', 'overview',
]);

// Known metric fields to show as colored KPI boxes
const METRIC_FIELDS = new Set([
  'predicted_score', 'quality_band', 'risk_level', 'risk_score',
  'risk_probability_pct', 'forecasted_savings_rate_pct', 'savings_category',
  'savings_direction', 'similarity_score', 'outperformer_count',
]);

function getMetricStyle(key: string, value: unknown): { bg: string; text: string } {
  const str = String(value).toUpperCase();
  if (str === 'HIGH' || str === 'LOW RISK' || str === 'NON-RISK' || str === 'POSITIVE')
    return { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' };
  if (str === 'MODERATE' || str === 'STABLE')
    return { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' };
  if (str === 'LOW' || str === 'AT-RISK' || str === 'HIGH RISK' || str === 'CRITICAL' || str === 'NEGATIVE')
    return { bg: 'bg-red-50 border-red-200', text: 'text-red-700' };
  return { bg: 'bg-slate-50 border-slate-200', text: 'text-slate-700' };
}

// ─── Main renderer ────────────────────────────────────────────────────────────

function AgentResultDisplay({ data }: { data: Record<string, unknown> }) {
  const assessmentEntries: Array<[string, string]> = [];
  const metricEntries: Array<[string, unknown]> = [];
  const arrayEntries: Array<[string, unknown[]]> = [];
  const otherEntries: Array<[string, unknown]> = [];

  for (const [key, value] of Object.entries(data)) {
    if (HIDDEN_FIELDS.has(key)) continue;
    if (key === 'aco_id') continue; // shown in header already

    if (ASSESSMENT_FIELDS.has(key) && typeof value === 'string') {
      assessmentEntries.push([key, value]);
    } else if (METRIC_FIELDS.has(key)) {
      metricEntries.push([key, value]);
    } else if (Array.isArray(value)) {
      arrayEntries.push([key, value]);
    } else if (typeof value === 'string' || typeof value === 'number') {
      otherEntries.push([key, value]);
    }
  }

  return (
    <div className="space-y-4">
      {/* Assessment text */}
      {assessmentEntries.map(([key, text]) => (
        <div key={key} className="bg-white rounded-xl border border-surface-border p-5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-violet-500" />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              {key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </p>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">{text}</p>
        </div>
      ))}

      {/* Metric KPI boxes */}
      {metricEntries.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {metricEntries.map(([key, value]) => {
            const style = getMetricStyle(key, value);
            return (
              <div key={key} className={['rounded-xl border p-4 text-center', style.bg].join(' ')}>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                  {key.replace(/_/g, ' ').replace(/pct$/, '%')}
                </p>
                <p className={['text-lg font-bold', style.text].join(' ')}>
                  {typeof value === 'number' ? (value % 1 === 0 ? value : value.toFixed(2)) : String(value)}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Array sections (strengths, weaknesses, etc.) */}
      {arrayEntries.map(([key, items]) => {
        const style = ARRAY_STYLES[key] ?? {
          color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-l-slate-400',
          icon: <ArrowRight className="w-3.5 h-3.5 text-slate-500" />,
          label: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        };

        const isNumbered = key === 'recommended_actions' || key === 'recommendations';

        return (
          <div key={key} className={['rounded-xl border-l-4 p-5', style.bg, style.border].join(' ')}>
            <div className="flex items-center gap-2 mb-3">
              {style.icon}
              <p className={['text-xs font-bold uppercase tracking-wide', style.color].join(' ')}>
                {style.label}
              </p>
              <span className="ml-auto text-[10px] text-slate-400 bg-white px-2 py-0.5 rounded-full border border-surface-border">
                {items.length} item{items.length !== 1 ? 's' : ''}
              </span>
            </div>
            <ul className="space-y-2">
              {items.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed">
                  {isNumbered ? (
                    <span className={['flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5 bg-white border', style.color].join(' ')}>
                      {i + 1}
                    </span>
                  ) : (
                    <span className="flex-shrink-0 mt-1.5">{style.icon}</span>
                  )}
                  <span>{typeof item === 'string' ? item : JSON.stringify(item)}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      {/* Other fields (catch-all) */}
      {otherEntries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {otherEntries.map(([key, value]) => (
            <div key={key} className="bg-white rounded-xl border border-surface-border p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                {key.replace(/_/g, ' ')}
              </p>
              <p className="text-sm font-medium text-slate-700">
                {typeof value === 'number' ? (value % 1 === 0 ? value : Number(value).toFixed(2)) : String(value)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AgentAnalysisSection({ inputId, variant = 'default' }: AgentAnalysisSectionProps) {
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [response, setResponse] = useState<AgentAnalysisResponse | null>(null);

  if (!inputId) {
    return (
      <div className="mt-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-cream-300" />
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-cream-200 border border-cream-300">
            <Bot className="w-3.5 h-3.5 text-maroon-900" />
            <span className="text-xs font-bold text-maroon-900 uppercase tracking-wide">AI Agent Analysis</span>
          </div>
          <div className="flex-1 h-px bg-cream-300" />
        </div>
        <div className="text-center py-6">
          <p className="text-xs text-maroon-800/50">Agent analysis requires a backend connection. Run the prediction with your FastAPI server active to enable this feature.</p>
        </div>
      </div>
    );
  }

  const handleAnalyze = async () => {
    setLoading(true);
    setError('');
    try {
      const res = variant === 'quality'
        ? await requestQualityAgentAnalysis(inputId)
        : await requestAgentAnalysis(inputId);
      setResponse(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Agent analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8">
      {/* Divider */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-surface-border" />
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-cream-200 border border-cream-300">
          <Bot className="w-3.5 h-3.5 text-maroon-900" />
          <span className="text-xs font-bold text-maroon-900 uppercase tracking-wide">AI Agent Analysis</span>
        </div>
        <div className="flex-1 h-px bg-surface-border" />
      </div>

      {/* Button state — not yet analyzed */}
      {!response && (
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-50 to-cream-200 border border-cream-300 shadow-sm">
            <Bot className="w-7 h-7 text-maroon-900" />
          </div>
          <div className="text-center max-w-md">
            <p className="text-sm font-semibold text-slate-800">Get Deeper AI Insights</p>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Our AI agent will analyze this prediction result and provide actionable recommendations,
              identify strengths and weaknesses, and suggest improvement strategies.
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            loading={loading}
            icon={!loading ? <Sparkles className="w-4 h-4" /> : undefined}
            onClick={handleAnalyze}
            className="bg-maroon-900 hover:bg-maroon-800 focus:ring-maroon-900/30 shadow-lg shadow-maroon-900/10 mt-1"
          >
            {loading ? 'Agent is analyzing…' : 'Run Agent Analysis'}
          </Button>
          {error && (
            <div className="flex items-center gap-2 mt-3 rounded-xl bg-red-50 border border-red-200 px-4 py-2.5">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-600 font-medium">{error}</p>
            </div>
          )}
        </div>
      )}

      {/* Agent response */}
      {response && (
        <div className="rounded-2xl border border-cream-300 bg-white border-cream-300 p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-cream-300">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-50">
              <Sparkles className="w-4.5 h-4.5 text-maroon-900" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Agent Analysis Complete</p>
              <p className="text-xs text-slate-400">Powered by ContractIQ AI Agents</p>
            </div>
            {response.analysis.aco_id && (
              <span className="ml-auto text-xs font-mono font-semibold text-maroon-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-cream-300">
                {String(response.analysis.aco_id)}
              </span>
            )}
          </div>

          {/* Rendered analysis */}
          <AgentResultDisplay data={response.analysis as Record<string, unknown>} />

          {/* Collapsed raw JSON */}
          <details className="mt-5 pt-4 border-t border-cream-300">
            <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600 flex items-center gap-1">
              <span>View raw JSON response</span>
            </summary>
            <pre className="mt-2 p-3 rounded-lg bg-slate-50 border border-surface-border text-[11px] text-slate-500 font-mono overflow-x-auto whitespace-pre-wrap max-h-48 overflow-y-auto">
              {JSON.stringify(response.raw, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}

