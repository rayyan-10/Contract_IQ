import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Network, GitBranch,
  Clock, ChevronDown, ChevronUp,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { ResultsDisplay } from '@/components/prediction/ResultsDisplay';
import { AgentAnalysisSection } from '@/components/prediction/AgentAnalysisSection';
import { usePredictionResult } from '@/context/PredictionContext';
import type { TwinAcoResult } from '@/types/prediction';

const HISTORY_KEY = 'contractiq_twin_history';
const MAX_HISTORY = 10;

interface HistoryEntry {
  id: string;
  timestamp: string;
  result: TwinAcoResult;
  inputId: string | null;
}

function loadHistory(): HistoryEntry[] {
  try { const raw = localStorage.getItem(HISTORY_KEY); return raw ? JSON.parse(raw) : []; } catch { return []; }
}

function saveToHistory(result: TwinAcoResult, inputId: string | null): void {
  const history = loadHistory();
  const entry: HistoryEntry = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), timestamp: new Date().toISOString(), result, inputId };
  const filtered = history.filter(h => !(h.result.acoId === result.acoId && h.result.matches[0]?.acoId === result.matches[0]?.acoId));
  localStorage.setItem(HISTORY_KEY, JSON.stringify([entry, ...filtered].slice(0, MAX_HISTORY)));
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function TwinResultPage() {
  const { result, inputId, clearResult } = usePredictionResult();
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (result && result.type === 'twin') { saveToHistory(result, inputId); setHistory(loadHistory()); }
  }, [result, inputId]);

  if (result && result.type === 'twin') {
    return (
      <>
        <PageHeader title="Twin ACO" subtitle={'Matches for ' + result.acoId}
          actions={<Link to="/cms/predictions" onClick={clearResult}><Button variant="secondary" size="sm" icon={<ArrowLeft className="w-3.5 h-3.5" />}>New Prediction</Button></Link>} />
        <ResultsDisplay result={result} />
        <AgentAnalysisSection inputId={inputId} />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Twin ACO" />
      {/* Hero */}
      <div className="bg-white rounded-2xl border border-cream-300 overflow-hidden mb-6" style={{ boxShadow: '0 2px 12px rgba(61,21,21,0.04)' }}>
        <div className="h-1 w-full bg-gradient-to-r from-maroon-900 to-amber-400" />
        <div className="p-8 flex items-start gap-5">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cream-200 to-amber-50 border border-cream-300 flex-shrink-0">
            <Network className="w-7 h-7 text-maroon-900" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-maroon-900 mb-1">Twin ACO Matching</h2>
            <p className="text-sm text-maroon-800/50 leading-relaxed max-w-md mb-4">Find ACOs with similar performance to benchmark and discover improvement strategies.</p>
            <Link to="/cms/predictions"><Button variant="primary" size="md" icon={<ArrowRight className="w-3.5 h-3.5" />}>Run Twin Analysis</Button></Link>
          </div>
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-maroon-900 flex items-center gap-2"><Clock className="w-4 h-4 text-maroon-800/40" />Previous Twin Analyses</h3>
            <span className="text-xs text-maroon-800/40">{history.length} result{history.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="space-y-3">
            {history.map(entry => {
              const isExpanded = expandedId === entry.id;
              const topMatch = entry.result.matches[0];
              return (
                <div key={entry.id} className="bg-white rounded-2xl border border-cream-300 overflow-hidden transition-shadow hover:shadow-card-md" style={{ boxShadow: '0 1px 4px rgba(61,21,21,0.03)' }}>
                  <button onClick={() => setExpandedId(isExpanded ? null : entry.id)} className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-cream-100/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-cream-200 border border-cream-300">
                        <GitBranch className="w-5 h-5 text-maroon-900" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-maroon-900 font-mono">{entry.result.acoId}</span>
                          <span className="text-[10px] text-maroon-800/40">{entry.result.matches.length} matches</span>
                        </div>
                        <p className="text-xs text-maroon-800/40 mt-0.5">{formatTime(entry.timestamp)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {topMatch && (
                        <div className="text-right hidden sm:block">
                          <p className="text-sm font-bold text-amber-600">{topMatch.similarityScore}%</p>
                          <p className="text-[9px] text-maroon-800/30 uppercase">Top match</p>
                        </div>
                      )}
                      <div className="w-8 h-8 rounded-lg bg-cream-200 flex items-center justify-center">
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-maroon-800/40" /> : <ChevronDown className="w-4 h-4 text-maroon-800/40" />}
                      </div>
                    </div>
                  </button>
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

      {history.length === 0 && (
        <Card className="text-center py-12">
          <GitBranch className="w-8 h-8 text-cream-400 mx-auto mb-3" />
          <p className="text-sm text-maroon-800/40">No twin matching results yet</p>
        </Card>
      )}
    </>
  );
}
