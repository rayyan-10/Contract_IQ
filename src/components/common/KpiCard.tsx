import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { KpiData } from '@/types';

interface KpiCardProps extends KpiData {
  className?: string;
}

export function KpiCard({ label, value, change, changeLabel, icon: Icon, trend, className = '' }: KpiCardProps) {
  const trendIcon =
    trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> :
    trend === 'down' ? <TrendingDown className="w-3.5 h-3.5" /> :
    <Minus className="w-3.5 h-3.5" />;

  const trendColor =
    trend === 'up' ? 'text-emerald-600' :
    trend === 'down' ? 'text-red-500' :
    'text-slate-400';

  return (
    <div className={`kpi-card flex flex-col gap-3 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
        {Icon && (
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-50">
            <Icon className="w-4 h-4 text-brand-600" />
          </div>
        )}
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className="text-2xl font-semibold text-slate-800 leading-none">{value}</span>
        {change !== undefined && (
          <span className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
            {trendIcon}
            {Math.abs(change)}%{changeLabel ? ` ${changeLabel}` : ''}
          </span>
        )}
      </div>
    </div>
  );
}
