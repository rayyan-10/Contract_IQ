import React from 'react';
import type { BadgeVariant } from '@/types';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  warning: 'bg-amber-50 text-amber-700 border border-amber-100',
  danger:  'bg-red-50 text-red-700 border border-red-100',
  info:    'bg-indigo-50 text-indigo-700 border border-indigo-100',
  neutral: 'bg-slate-50 text-slate-600 border border-slate-100',
};

const dotColors: Record<BadgeVariant, string> = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger:  'bg-red-500',
  info:    'bg-indigo-500',
  neutral: 'bg-slate-400',
};

export function Badge({ variant = 'neutral', children, className = '', dot = false }: BadgeProps) {
  return (
    <span className={[
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold',
      variantClasses[variant],
      className,
    ].join(' ')}>
      {dot && <span className={'w-1.5 h-1.5 rounded-full ' + dotColors[variant]} />}
      {children}
    </span>
  );
}
