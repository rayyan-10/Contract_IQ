import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Shield, AlertTriangle,
  CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp, Sparkles,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { ResultsDisplay } from '@/components/prediction/ResultsDisplay';
import { AgentAnalysisSection } from '@/components/prediction/AgentAnalysisSection';
import { usePredictionResult } from '@/context/PredictionContext';
import type { RiskPredictionResult } from '@/types/prediction';

// ─── History storage ──────────────────────────────────────────────────────────

const HISTORY_KEY = 'contractiq_risk_history';
const MAX_HISTORY = 10;

interface HistoryEntry {
  id: string;
  timestamp: string;
  result: RiskPredictionResult;
  inputId: string | null;
}

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveToHistory(result: RiskPredictionResult, inputId: string | null): void {
  const history = loadHistory();
  const entry: HistoryEntry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    timestamp: new Date().toISOString(),
    result,
    inputId,
  };
  // Avoid duplicates (same acoId + same score)
  const filtered = history.filter(h => !(h.result.acoId === result.acoId && h.result.riskScore === result.riskScore));
  const updated = [entry, ...filtered].slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

function tierColor(tier: string) {
  if (tier === 'critical' || tier === 'high') return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', dot: 'bg-red-500' };
  if (tier === 'moderate') return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' };
  return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' };
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function RiskResultPage() {
  const { result, inputId, clearResult } = usePredictionResult();
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Save current result to history when it arrives
  useEffect(() => {
    if (result && result.type === 'risk') {
      saveToHistory(result, inputId);
      setHistory(loadHistory());
    }
  }, [result, inputId]);

  // ── If we have a fresh result from Predictions page ─────────────────────
  if (result && result.type === 'risk') {
    return (
      <>
        <PageHeader
          title="Risk Analysis"
          subtitle={'Results for ' + result.acoId}
          actions={
            <Link to="/cms/predictions" onClick={clearResult}>
              <Button variant="secondary" size="sm" icon={<ArrowLeft className="w-3.5 h-3.5" />}>
                New Prediction
              </Button>
            </Link>
          }
        />
        <ResultsDisplay result={result} />
        <AgentAnalysisSection inputId={inputId} />
      </>
    );
  }

  // ── Empty state + history ───────────────────────────────────────────────
  return (
    <>
      <PageHeader title="Risk Analysis" />

      {/* Hero guide card */}
      <div className="bg-white rounded-2xl border border-cream-300 overflow-hidden mb-6" style={{ boxShadow: '0 2px 12px rgba(61,21,21,0.04)' }}>
        <div className="h-1 w-full bg-gradient-to-r from-red-400 via-amber-400 to-emerald-400" />
        <div className="p-8 flex items-center justify-between gap-8">
          <div className="flex items-start gap-5">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-red-50 to-amber-50 border border-red-100 flex-shrink-0">
              <Shield className="w-7 h-7 text-maroon-900" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-maroon-900 mb-1">ACO Risk Prediction</h2>
              <p className="text-sm text-maroon-800/50 leading-relaxed max-w-md">
                Assess whether an ACO is at risk of not meeting its savings benchmark. Run a prediction from the Predictions page and results will appear here.
              </p>
              <div className="flex items-center gap-4 mt-4">
                <Link to="/cms/predictions">
                  <Button variant="primary" size="md" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Run Risk Prediction
                  </Button>
                </Link>
                <div className="flex items-center gap-3 text-xs text-maroon-800/40">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> High</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Moderate</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Low</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mini workflow visual */}
          <div className="hidden lg:flex flex-col gap-2 flex-shrink-0 text-xs">
            {[
              { step: '01', label: 'Select ACO + Inputs', active: false },
              { step: '02', label: 'Choose Risk Model', active: false },
              { step: '03', label: 'View Results Here', active: true },
            ].map(s => (
              <div key={s.step} className={['flex items-center gap-2 px-3 py-2 rounded-lg border',
                s.active ? 'bg-amber-50 border-amber-200 text-amber-700 font-bold' : 'bg-cream-100 border-cream-300 text-maroon-800/40',
              ].join(' ')}>
                <span className={['w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold',
                  s.active ? 'bg-amber-400 text-white' : 'bg-cream-300 text-maroon-800/30',
                ].join(' ')}>{s.step}</span>
                {s.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Previous results history */}
      {history.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-maroon-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-maroon-800/40" />
              Previous Risk Analyses
            </h3>
            <span className="text-xs text-maroon-800/40">{history.length} result{history.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="space-y-3">
            {history.map(entry => {
              const tc = tierColor(entry.result.riskLevel);
              const isExpanded = expandedId === entry.id;

              return (
                <div key={entry.id} className="bg-white rounded-2xl border border-cream-300 overflow-hidden transition-shadow hover:shadow-card-md"
                  style={{ boxShadow: '0 1px 4px rgba(61,21,21,0.03)' }}>
                  {/* Summary row — clickable */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-cream-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* Tier indicator */}
                      <div className={['w-10 h-10 rounded-xl flex items-center justify-center border', tc.bg, tc.border].join(' ')}>
                        {entry.result.riskLevel === 'low'
                          ? <CheckCircle2 className={'w-5 h-5 ' + tc.text} />
                          : entry.result.riskLevel === 'moderate'
                          ? <AlertTriangle className={'w-5 h-5 ' + tc.text} />
                          : <XCircle className={'w-5 h-5 ' + tc.text} />}
                      </div>

                      {/* Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-maroon-900 font-mono">{entry.result.acoId}</span>
                          <span className={['text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border', tc.bg, tc.border, tc.text].join(' ')}>
                            {entry.result.riskLevel}
                          </span>
                        </div>
                        <p className="text-xs text-maroon-800/40 mt-0.5">{formatTime(entry.timestamp)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Score */}
                      <div className="text-right hidden sm:block">
                        <p className="text-lg font-bold text-maroon-900">{entry.result.riskScore}</p>
                        <p className="text-[9px] text-maroon-800/30 uppercase">Score</p>
                      </div>
                      {/* Confidence */}
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-maroon-800/70">{(entry.result.riskProbability * 100).toFixed(1)}%</p>
                        <p className="text-[9px] text-maroon-800/30 uppercase">Prob.</p>
                      </div>
                      {/* Expand icon */}
                      <div className="w-8 h-8 rounded-lg bg-cream-200 flex items-center justify-center">
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-maroon-800/40" /> : <ChevronDown className="w-4 h-4 text-maroon-800/40" />}
                      </div>
                    </div>
                  </button>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="border-t border-cream-300 p-5 bg-cream-100/30 animate-slide-up">
                      <ResultsDisplay result={entry.result} />
                      <AgentAnalysisSection inputId={entry.inputId} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Truly empty — no history at all */}
      {history.length === 0 && (
        <Card className="text-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Sparkles className="w-8 h-8 text-cream-400" />
            <p className="text-sm text-maroon-800/40">No previous risk analyses yet</p>
            <p className="text-xs text-maroon-800/30 max-w-xs">
              Run your first risk prediction and results will be stored here for quick reference.
            </p>
          </div>
        </Card>
      )}
    </>
  );
}
