/**
 * PredictionContext — Shares prediction results + input_id between pages.
 *
 * Flow:
 *   1. User submits on /cms/predictions
 *   2. Backend returns { input_id, result_id, prediction: {...} }
 *   3. Result + inputId stored here
 *   4. Navigate to /cms/risk, /cms/forecast, or /cms/twin-aco
 *   5. Target page reads result and inputId for agent analysis
 */

import React, { createContext, useContext, useState } from 'react';
import type { PredictionResult } from '@/types/prediction';

interface PredictionContextValue {
  result: PredictionResult | null;
  inputId: string | null;
  setResult: (r: PredictionResult | null) => void;
  setInputId: (id: string | null) => void;
  clearResult: () => void;
}

const PredictionContext = createContext<PredictionContextValue | null>(null);

export function PredictionProvider({ children }: { children: React.ReactNode }) {
  const [result, setResult]   = useState<PredictionResult | null>(null);
  const [inputId, setInputId] = useState<string | null>(null);

  const clearResult = () => {
    setResult(null);
    setInputId(null);
  };

  return (
    <PredictionContext.Provider value={{ result, inputId, setResult, setInputId, clearResult }}>
      {children}
    </PredictionContext.Provider>
  );
}

export function usePredictionResult() {
  const ctx = useContext(PredictionContext);
  if (!ctx) throw new Error('usePredictionResult must be within PredictionProvider');
  return ctx;
}
