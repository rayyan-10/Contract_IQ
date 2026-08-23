import React from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  height?: number;
  accent?: 'amber' | 'maroon' | 'emerald' | 'none';
}

const accentBar: Record<string, string> = {
  amber:   'from-amber-400 to-amber-500',
  maroon:  'from-maroon-900 to-maroon-800',
  emerald: 'from-emerald-400 to-emerald-500',
  none:    '',
};

export function ChartCard({ title, subtitle, actions, children, className = '', height = 280, accent = 'none' }: ChartCardProps) {
  return (
    <div
      className={'bg-white rounded-2xl border border-cream-300 overflow-hidden ' + className}
      style={{ boxShadow: '0 1px 4px rgba(61,21,21,0.03)' }}
    >
      {/* Accent top bar */}
      {accent !== 'none' && (
        <div className={'h-1 w-full bg-gradient-to-r ' + accentBar[accent]} />
      )}

      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-maroon-900">{title}</h3>
            {subtitle && <p className="text-[11px] text-maroon-800/40 mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
        </div>
        <div style={{ height }}>{children}</div>
      </div>
    </div>
  );
}
