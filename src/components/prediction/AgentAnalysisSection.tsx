import React, { useState, useEffect, useRef } from 'react';
import { Bot, AlertCircle } from 'lucide-react';
import { requestAgentAnalysis, requestQualityAgentAnalysis, type AgentAnalysisResponse } from '@/services/agentService';

interface AgentAnalysisSectionProps {
  inputId: string | null;
  variant?: 'default' | 'quality';
}

// ─── Typewriter ───────────────────────────────────────────────────────────────

function useTypewriter(text: string, speed = 30) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const idx = useRef(0);

  useEffect(() => {
    if (!text) { setDisplayed(''); setDone(true); return; }
    setDisplayed('');
    setDone(false);
    idx.current = 0;
    const t = setInterval(() => {
      idx.current += 2;
      if (idx.current >= text.length) {
        setDisplayed(text);
        setDone(true);
        clearInterval(t);
      } else {
        setDisplayed(text.slice(0, idx.current));
      }
    }, speed);
    return () => clearInterval(t);
  }, [text, speed]);

  return { displayed, done };
}

function StreamText({ text, onDone }: { text: string; onDone?: () => void }) {
  const { displayed, done } = useTypewriter(text, 30);
  const firedRef = useRef(false);

  useEffect(() => {
    if (done && onDone && !firedRef.current) { firedRef.current = true; onDone(); }
  }, [done, onDone]);

  return (
    <span>
      {displayed}
      {!done && <span className="inline-block w-[2px] h-[14px] bg-amber-500 ml-0.5 animate-pulse align-middle rounded-full" />}
    </span>
  );
}

// ─── Hidden fields ────────────────────────────────────────────────────────────

const HIDDEN_FIELDS = new Set(['agent', 'confidence_note', 'aco_id']);

const ASSESSMENT_FIELDS = new Set([
  'quality_assessment', 'risk_assessment', 'forecast_assessment',
  'twin_assessment', 'assessment', 'summary', 'analysis', 'message',
  'interpretation', 'overview',
]);

const METRIC_FIELDS = new Set([
  'predicted_score', 'quality_band', 'risk_level', 'risk_score',
  'risk_probability_pct', 'forecasted_savings_rate_pct', 'savings_category',
  'savings_direction', 'similarity_score', 'outperformer_count',
]);

function getMetricColor(value: unknown): string {
  const s = String(value).toUpperCase();
  if (s === 'HIGH' || s === 'LOW RISK' || s === 'NON-RISK' || s === 'POSITIVE') return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (s === 'MODERATE' || s === 'STABLE') return 'text-amber-700 bg-amber-50 border-amber-200';
  if (s === 'LOW' || s === 'AT-RISK' || s === 'HIGH RISK' || s === 'CRITICAL') return 'text-red-700 bg-red-50 border-red-200';
  return 'text-maroon-900 bg-cream-100 border-cream-300';
}

// Section left-border colors (no icons)
function getSectionAccent(key: string): { border: string; text: string } {
  if (key === 'strengths' || key === 'key_findings' || key === 'opportunities') return { border: 'border-l-emerald-400', text: 'text-emerald-800' };
  if (key === 'weaknesses' || key === 'risk_factors' || key === 'attention_areas') return { border: 'border-l-red-400', text: 'text-red-800' };
  if (key === 'improvement_areas') return { border: 'border-l-amber-400', text: 'text-amber-800' };
  if (key === 'recommended_actions' || key === 'recommendations') return { border: 'border-l-maroon-900', text: 'text-maroon-900' };
  return { border: 'border-l-cream-400', text: 'text-maroon-900' };
}

function formatLabel(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// ─── Sequential renderer ──────────────────────────────────────────────────────

function AgentResultDisplay({ data }: { data: Record<string, unknown> }) {
  const [visibleIdx, setVisibleIdx] = useState(0);

  const sections: Array<{ type: 'text' | 'metrics' | 'list' | 'other'; key: string; content: unknown }> = [];

  for (const [key, value] of Object.entries(data)) {
    if (HIDDEN_FIELDS.has(key)) continue;
    if (ASSESSMENT_FIELDS.has(key) && typeof value === 'string') sections.push({ type: 'text', key, content: value });
    else if (METRIC_FIELDS.has(key)) sections.push({ type: 'metrics', key, content: value });
    else if (Array.isArray(value)) sections.push({ type: 'list', key, content: value });
    else if (typeof value === 'string' || typeof value === 'number') sections.push({ type: 'other', key, content: value });
  }

  // Group consecutive metrics into one section
  const grouped: typeof sections = [];
  let metricBuf: Array<{ key: string; content: unknown }> = [];
  for (const s of sections) {
    if (s.type === 'metrics') { metricBuf.push(s); }
    else {
      if (metricBuf.length) { grouped.push({ type: 'metrics', key: '_metrics', content: metricBuf }); metricBuf = []; }
      grouped.push(s);
    }
  }
  if (metricBuf.length) grouped.push({ type: 'metrics', key: '_metrics', content: metricBuf });

  const handleSectionDone = () => setVisibleIdx(v => v + 1);

  // Show first section immediately, then sequentially after each finishes
  useEffect(() => { setVisibleIdx(1); }, []);

  return (
    <div className="space-y-5">
      {grouped.slice(0, visibleIdx).map((section, si) => {
        const isLast = si === visibleIdx - 1;

        if (section.type === 'text') {
          return (
            <div key={section.key} className="text-sm text-maroon-800 leading-relaxed">
              <p className="text-[10px] font-semibold text-maroon-800/40 uppercase tracking-wider mb-2">
                {formatLabel(section.key)}
              </p>
              <p className="font-medium">
                <StreamText text={section.content as string} onDone={isLast ? handleSectionDone : undefined} />
              </p>
            </div>
          );
        }

        if (section.type === 'metrics') {
          const items = section.content as Array<{ key: string; content: unknown }>;
          // Metrics appear instantly (no typewriter needed)
          if (isLast) setTimeout(handleSectionDone, 300);
          return (
            <div key={section.key} className="flex flex-wrap gap-3">
              {items.map(m => (
                <div key={m.key} className={'rounded-xl border px-4 py-3 text-center min-w-[100px] ' + getMetricColor(m.content)}>
                  <p className="text-[9px] font-semibold uppercase tracking-wider opacity-60 mb-0.5">{formatLabel(m.key)}</p>
                  <p className="text-base font-bold">
                    {typeof m.content === 'number' ? (m.content % 1 === 0 ? m.content : Number(m.content).toFixed(2)) : String(m.content)}
                  </p>
                </div>
              ))}
            </div>
          );
        }

        if (section.type === 'list') {
          const items = section.content as unknown[];
          const accent = getSectionAccent(section.key);
          const isNumbered = section.key.includes('recommend') || section.key.includes('action');

          return (
            <div key={section.key} className={'border-l-[3px] pl-5 py-1 ' + accent.border}>
              <p className={'text-[10px] font-bold uppercase tracking-wider mb-3 ' + accent.text}>
                {formatLabel(section.key)}
              </p>
              <ul className="space-y-2.5">
                {items.map((item, i) => (
                  <li key={i} className="text-sm text-maroon-800 leading-relaxed flex items-start gap-2.5">
                    {isNumbered ? (
                      <span className="flex-shrink-0 text-xs font-bold text-maroon-800/40 mt-0.5 w-4">{i + 1}.</span>
                    ) : (
                      <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-maroon-900/20 mt-2" />
                    )}
                    <StreamText
                      text={typeof item === 'string' ? item : JSON.stringify(item)}
                      onDone={isLast && i === items.length - 1 ? handleSectionDone : undefined}
                    />
                  </li>
                ))}
              </ul>
            </div>
          );
        }

        // Other
        if (isLast) setTimeout(handleSectionDone, 200);
        return (
          <div key={section.key} className="text-sm">
            <span className="text-[10px] font-semibold text-maroon-800/40 uppercase tracking-wider">{formatLabel(section.key)}: </span>
            <span className="font-semibold text-maroon-900">
              {typeof section.content === 'number' ? Number(section.content).toFixed(2) : String(section.content)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function AgentAnalysisSection({ inputId, variant = 'default' }: AgentAnalysisSectionProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [response, setResponse] = useState<AgentAnalysisResponse | null>(null);

  if (!inputId) {
    return (
      <div className="mt-8 text-center py-6">
        <p className="text-xs text-maroon-800/30">Connect backend to enable agent analysis.</p>
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
      setError(err instanceof Error ? err.message : 'Analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8">
      {/* Button */}
      {!response && (
        <div className="flex justify-center py-4">
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-maroon-900 font-bold text-sm shadow-lg shadow-amber-300/30 hover:shadow-amber-400/40 hover:from-amber-300 hover:to-amber-400 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><div className="w-4 h-4 rounded-full border-2 border-maroon-900/30 border-t-maroon-900 animate-spin" /> Generating insights…</>
            ) : (
              <><Bot className="w-4 h-4" /> Agent Analysis</>
            )}
          </button>
          {error && (
            <div className="flex items-center gap-2 mt-3 rounded-xl bg-red-50 border border-red-200 px-4 py-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}
        </div>
      )}

      {/* Response */}
      {response && (
        <div className="rounded-2xl border border-cream-300 bg-white p-6 animate-fade-in" style={{ boxShadow: '0 2px 8px rgba(61,21,21,0.03)' }}>
          <AgentResultDisplay data={response.analysis as Record<string, unknown>} />
        </div>
      )}
    </div>
  );
}
