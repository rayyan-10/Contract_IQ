import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function EmptyState({
  title = 'No data available',
  message = 'There is nothing to display at this time.',
  action,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100 text-slate-400">
        {icon ?? <Inbox className="w-6 h-6" />}
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-700">{title}</p>
        <p className="text-xs text-slate-400 mt-1">{message}</p>
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
