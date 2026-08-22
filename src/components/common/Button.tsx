import React from 'react';
import type { ButtonVariant, ButtonSize } from '@/types';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:   'bg-maroon-900 text-white hover:bg-maroon-800 focus:ring-maroon-900/30 shadow-md shadow-maroon-900/10',
  secondary: 'bg-white text-maroon-900 border border-cream-300 hover:bg-cream-100 focus:ring-maroon-900/10',
  ghost:     'bg-transparent text-maroon-800 hover:bg-cream-200 focus:ring-maroon-900/10',
  danger:    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/30',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center gap-2 font-semibold rounded-xl transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-offset-1',
        variantClasses[variant],
        sizeClasses[size],
        (disabled || loading) ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5 active:translate-y-0',
        className,
      ].join(' ')}
    >
      {loading && (
        <div className="w-4 h-4 rounded-full border-2 border-current/30 border-t-current animate-spin" />
      )}
      {!loading && icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
