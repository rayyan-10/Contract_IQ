import React from 'react';

interface LoadingStateProps {
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingState({ message = 'Loading…', className = '', size = 'md' }: LoadingStateProps) {
  const sizeMap = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  const textMap = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' };

  return (
    <div className={'flex flex-col items-center justify-center gap-3 py-12 ' + className}>
      <div className="relative">
        <div className={sizeMap[size] + ' rounded-full border-2 border-slate-100'} />
        <div className={sizeMap[size] + ' rounded-full border-2 border-transparent border-t-indigo-500 animate-spin absolute inset-0'} />
      </div>
      <p className={textMap[size] + ' font-medium text-slate-400'}>{message}</p>
    </div>
  );
}
