import React, { useState } from 'react';
import { Info, CheckCircle2, AlertCircle } from 'lucide-react';

export interface MetricInputProps {
  id: string;
  label: string;
  identifier?: string;       // e.g. "N_AB"
  unit?: string;             // e.g. "%" or "pts"
  helperText: string;
  placeholder?: string;
  allowNegative?: boolean;
  value: string;
  onChange: (val: string) => void;
  error?: string;
  completed?: boolean;
}

export function MetricInput({
  id,
  label,
  identifier,
  unit,
  helperText,
  placeholder,
  allowNegative = false,
  value,
  onChange,
  error,
  completed,
}: MetricInputProps) {
  const [focused, setFocused] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const borderColor =
    error    ? 'border-red-400 focus-within:ring-red-300' :
    completed ? 'border-emerald-400 focus-within:ring-emerald-200' :
    focused   ? 'border-brand-400 focus-within:ring-brand-200' :
               'border-surface-border focus-within:ring-brand-200';

  return (
    <div className="flex flex-col gap-1.5 group">
      {/* Label row */}
      <div className="flex items-center gap-1.5">
        <label
          htmlFor={id}
          className="text-xs font-semibold text-slate-600 uppercase tracking-wide leading-none"
        >
          {label}
        </label>
        {identifier && (
          <span className="text-[10px] font-mono font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
            {identifier}
          </span>
        )}
        {/* Info tooltip */}
        <div className="relative ml-auto">
          <button
            type="button"
            onMouseEnter={() => setShowInfo(true)}
            onMouseLeave={() => setShowInfo(false)}
            onFocus={() => setShowInfo(true)}
            onBlur={() => setShowInfo(false)}
            className="text-slate-300 hover:text-slate-500 transition-colors"
            aria-label={`Info: ${label}`}
          >
            <Info className="w-3.5 h-3.5" />
          </button>
          {showInfo && (
            <div className="absolute right-0 top-5 z-20 w-52 bg-slate-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg pointer-events-none">
              {helperText}
            </div>
          )}
        </div>
      </div>

      {/* Input row */}
      <div
        className={[
          'flex items-center gap-0 rounded-lg border bg-white overflow-hidden',
          'focus-within:ring-2 transition-all duration-150',
          borderColor,
        ].join(' ')}
      >
        <input
          id={id}
          type="number"
          step="any"
          min={allowNegative ? undefined : 0}
          placeholder={placeholder ?? (allowNegative ? 'e.g. -2.5' : 'e.g. 4.2')}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 min-w-0 px-3 py-2.5 text-sm text-slate-800 bg-transparent focus:outline-none placeholder:text-slate-300"
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : `${id}-helper`}
        />
        {unit && (
          <span className="px-3 py-2.5 text-xs font-semibold text-slate-400 bg-slate-50 border-l border-surface-border select-none">
            {unit}
          </span>
        )}
        {/* State icon */}
        <span className="px-2 flex-shrink-0">
          {completed && !error && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          {error && <AlertCircle className="w-4 h-4 text-red-400" />}
        </span>
      </div>

      {/* Error / helper */}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {error}
        </p>
      ) : (
        <p id={`${id}-helper`} className="text-xs text-slate-400">
          {helperText}
        </p>
      )}
    </div>
  );
}
