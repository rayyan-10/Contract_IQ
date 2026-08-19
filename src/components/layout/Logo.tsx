import React from 'react';
import { Activity } from 'lucide-react';

interface LogoProps {
  collapsed?: boolean;
}

export function Logo({ collapsed = false }: LogoProps) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-600 flex-shrink-0">
        <Activity className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
      </div>
      {!collapsed && (
        <div className="flex flex-col leading-none">
          <span className="text-sm font-bold text-slate-800 tracking-tight">ContractIQ</span>
          <span className="text-[10px] text-slate-400 font-normal">Analytics Platform</span>
        </div>
      )}
    </div>
  );
}
