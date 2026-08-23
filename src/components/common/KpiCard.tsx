import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { KpiData } from '@/types';

interface KpiCardProps extends KpiData {
  className?: string;
  accent?: 'amber' | 'emerald' | 'red' | 'maroon' | 'default';
}

const accentStyles = {
  amber:   { border: 'border-l-amber-400',   iconBg: 'bg-amber-50',   iconText: 'text-amber-600'   },
  emerald: { border: 'border-l-emerald-400',  iconBg: 'bg-emerald-50', iconText: 'text-emerald-600' },
  red:     { border: 'border-l-red-400',      iconBg: 'bg-red-50',     iconText: 'text-red-500'     },
  maroon:  { border: 'border-l-maroon-900',   iconBg: 'bg-maroon-50',  iconText: 'text-maroon-900'  },
  default: { border: 'border-l-cream-400',    iconBg: 'bg-cream-200',  iconText: 'text-maroon-800'  },
};

export function KpiCard({ label, value, change, changeLabel, icon: Icon, trend, className = '', accent = 'default' }: KpiCardProps) {
  const trendColor =
    trend === 'up'   ? 'text-emerald-700 bg-emerald-50 border-emerald-100' :
    trend === 'down' ? 'text-red-600 bg-red-50 border-red-100'             :
                       'text-maroon-800/50 bg-cream-200 border-cream-300';

  const TrendIcon =
    trend === 'up'   ? TrendingUp   :
    trend === 'down' ? TrendingDown : Minus;

  const a = accentStyles[accent];

  return (
    <div className={[
      'bg-white rounded-2xl p-5 border border-cream-300 border-l-4 transition-all duration-200 hover:shadow-card-md group',
      a.border,
      className,
    ].join(' ')} style={{ boxShadow: '0 1px 4px rgba(61,21,21,0.03)' }}>
      {/* Top row: label + icon */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold text-maroon-800/50 uppercase tracking-wider leading-none">{label}</span>
        {Icon && (
          <div className={'flex items-center justify-center w-9 h-9 rounded-xl transition-transform group-hover:scale-110 ' + a.iconBg}>
            <Icon className={'w-4 h-4 ' + a.iconText} />
          </div>
        )}
      </div>

      {/* Value */}
      <p className="text-2xl font-bold text-maroon-900 tracking-tight leading-none mb-2">{value}</p>

      {/* Change badge */}
      {change !== undefined && (
        <span className={'inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border ' + trendColor}>
          <TrendIcon className="w-3 h-3" />
          {change > 0 ? '+' : ''}{change}%{changeLabel ? ' ' + changeLabel : ''}
        </span>
      )}
    </div>
  );
}
