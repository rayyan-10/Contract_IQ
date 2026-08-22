import React from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  height?: number;
}

export function ChartCard({ title, subtitle, actions, children, className = '', height = 280 }: ChartCardProps) {
  return (
    <div
      className={'bg-white rounded-2xl border border-slate-100 p-5 ' + className}
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800">{title}</h3>
          {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
      </div>
      <div style={{ height }}>{children}</div>
    </div>
  );
}
