import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface InputProgressProps {
  completed: number;
  total: number;
}

export function InputProgress({ completed, total }: InputProgressProps) {
  const allDone = completed === total;
  const pct = Math.round((completed / total) * 100);

  return (
    <div
      className={[
        'flex items-center gap-4 px-5 py-3 rounded-xl border transition-colors duration-300',
        allDone
          ? 'bg-emerald-50 border-emerald-200'
          : 'bg-slate-50 border-surface-border',
      ].join(' ')}
    >
      {/* Progress bar */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1.5">
          <span
            className={[
              'text-xs font-semibold',
              allDone ? 'text-emerald-700' : 'text-slate-600',
            ].join(' ')}
          >
            {allDone ? (
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                All prediction inputs are ready
              </span>
            ) : (
              `${completed} / ${total} inputs completed`
            )}
          </span>
          <span
            className={[
              'text-xs font-bold tabular-nums',
              allDone ? 'text-emerald-600' : 'text-slate-500',
            ].join(' ')}
          >
            {pct}%
          </span>
        </div>
        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={[
              'h-full rounded-full transition-all duration-500',
              allDone ? 'bg-emerald-500' : 'bg-brand-500',
            ].join(' ')}
            style={{ width: `${pct}%` }}
            role="progressbar"
            aria-valuenow={completed}
            aria-valuemin={0}
            aria-valuemax={total}
          />
        </div>
      </div>

      {/* Fraction badge */}
      <div
        className={[
          'flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl',
          allDone ? 'bg-emerald-100' : 'bg-white border border-surface-border',
        ].join(' ')}
      >
        <span
          className={[
            'text-sm font-bold tabular-nums leading-none',
            allDone ? 'text-emerald-700' : 'text-slate-700',
          ].join(' ')}
        >
          {completed}/{total}
        </span>
      </div>
    </div>
  );
}
