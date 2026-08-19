import React from 'react';
import { Construction } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';

interface PlaceholderPageProps {
  title: string;
  subtitle?: string;
  breadcrumb?: string[];
  description?: string;
}

export function PlaceholderPage({ title, subtitle, breadcrumb, description }: PlaceholderPageProps) {
  return (
    <>
      <PageHeader title={title} subtitle={subtitle} breadcrumb={breadcrumb} />
      <Card>
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-50">
            <Construction className="w-7 h-7 text-brand-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">Module in Development</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              {description ?? `The ${title} module will be available in the next development phase. This is a placeholder route to confirm routing is working correctly.`}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
            <span className="text-xs text-slate-400 font-medium">Planned for Phase 2</span>
          </div>
        </div>
      </Card>
    </>
  );
}
