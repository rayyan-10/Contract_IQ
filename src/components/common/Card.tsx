import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
  variant?: 'white' | 'cream';
}

export function Card({ children, className = '', padding = true, variant = 'white' }: CardProps) {
  const bg = variant === 'cream' ? 'bg-cream-100' : 'bg-white';

  return (
    <div
      className={[
        'rounded-2xl border border-cream-300',
        bg,
        padding ? 'p-5' : '',
        className,
      ].join(' ')}
      style={{ boxShadow: '0 1px 4px rgba(61,21,21,0.03)' }}
    >
      {children}
    </div>
  );
}
