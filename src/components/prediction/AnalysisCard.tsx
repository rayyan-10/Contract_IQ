import React from 'react';
import { Lock, CheckCircle2 } from 'lucide-react';
import type { AnalysisType } from '@/types/prediction';

interface AnalysisCardProps {
  type: AnalysisType;
  icon: React.ReactNode;
  title: string;
  description: string;
  locked: boolean;
  selected: boolean;
  onSelect: () => void;
}

export function AnalysisCard({
  icon,
  title,
  description,
  locked,
  selected,
  onSelect,
}: AnalysisCardProps) {
  return (
    <button
      type="button"
      onClick={() => !locked && onSelect()}
      disabled={locked}
      className={[
        'relative w-full text-left rounded-xl border-2 p-5 transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-1',
        locked
          ? 'border-slate-100 bg-slate-50 cursor-not-allowed opacity-60'
          : selected
          ? 'border-brand-500 bg-brand-50 shadow-card-md'
          : 'border-surface-border bg-white hover:border-brand-300 hover:shadow-card cursor-pointer',
      ].join(' ')}
      aria-pressed={selected}
      aria-disabled={locked}
    >
      {/* Selected check */}
      {selected && (
        <span className="absolute top-3 right-3">
          <CheckCircle2 className="w-5 h-5 text-brand-600" />
        </span>
      )}

      {/* Lock overlay badge */}
      {locked && (
        <span className="absolute top-3 right-3 flex items-center gap-1 bg-slate-200 text-slate-500 text-[10px] font-semibold px-2 py-0.5 rounded-full">
          <Lock className="w-2.5 h-2.5" />
          LOCKED
        </span>
      )}

      {/* Content */}
      <div className="flex items-start gap-4">
        <div
          className={[
            'flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0 transition-colors',
            selected ? 'bg-brand-600' : locked ? 'bg-slate-200' : 'bg-slate-100',
          ].join(' ')}
        >
          <span className={selected ? 'text-white' : locked ? 'text-slate-400' : 'text-slate-600'}>
            {icon}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={[
              'text-sm font-semibold leading-tight',
              selected ? 'text-brand-700' : 'text-slate-800',
            ].join(' ')}
          >
            {title}
          </p>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{description}</p>
          {!locked && (
            <span
              className={[
                'inline-flex items-center gap-1 mt-2 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full',
                selected
                  ? 'bg-brand-100 text-brand-700'
                  : 'bg-emerald-50 text-emerald-600',
              ].join(' ')}
            >
              {selected ? (
                <><CheckCircle2 className="w-2.5 h-2.5" /> Selected</>
              ) : (
                'Ready'
              )}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
