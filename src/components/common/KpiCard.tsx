import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { KpiData } from '@/types';

interface KpiCardProps extends KpiData {
  className?: string;
}

export function KpiCard({ label, value, change, changeLabel, icon: Icon, trend, className = '' }: KpiCardProps) {
  const trendColor =
    trend === 'up'   ? 'text-emerald-600 bg-emerald-50' :
    trend === 'down' ? 'text-red-500 bg-red-50'         :
                       'text-slate-400 bg-slate-50';

  const TrendIcon =
    trend === 'up'   ? TrendingUp   :
    trend === 'down' ? TrendingDown : Minus;

  return (
    <div className={'kpi-card flex flex-col justify-between gap-4 transition-shadow duration-200 ' + className}>
      {/* Label + optional icon */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider leading-none">{label}</span>
        {Icon && (
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-50">
            <Icon className="w-4 h-4 text-slate-400" />
          </div>
        )}
      </div>

      {/* Value + change */}
      <div>
        <p className="text-2xl font-bold text-slate-800 tracking-tight leading-none mb-1.5">{value}</p>
        {change !== undefined && (
          <span className={'inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ' + trendColor}>
            <TrendIcon className="w-3 h-3" />
            {change > 0 ? '+' : ''}{change}%{changeLabel ? ' ' + changeLabel : ''}
          </span>
        )}
      </div>
    </div>
  );
}
