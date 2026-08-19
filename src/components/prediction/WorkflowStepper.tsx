import React from 'react';
import { Check, Lock } from 'lucide-react';

export type StepStatus = 'active' | 'completed' | 'locked';

interface Step {
  number: string;
  label: string;
  status: StepStatus;
}

interface WorkflowStepperProps {
  steps: Step[];
}

export function WorkflowStepper({ steps }: WorkflowStepperProps) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => (
        <React.Fragment key={step.number}>
          {/* Step node */}
          <div className="flex items-center gap-2.5">
            {/* Circle */}
            <div
              className={[
                'flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold flex-shrink-0 transition-colors',
                step.status === 'active'
                  ? 'bg-brand-600 text-white ring-4 ring-brand-100'
                  : step.status === 'completed'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 text-slate-400',
              ].join(' ')}
            >
              {step.status === 'completed' ? (
                <Check className="w-4 h-4" />
              ) : step.status === 'locked' ? (
                <Lock className="w-3.5 h-3.5" />
              ) : (
                step.number
              )}
            </div>
            {/* Label */}
            <span
              className={[
                'text-xs font-semibold whitespace-nowrap',
                step.status === 'active'
                  ? 'text-brand-700'
                  : step.status === 'completed'
                  ? 'text-emerald-600'
                  : 'text-slate-400',
              ].join(' ')}
            >
              {step.label}
            </span>
          </div>

          {/* Connector */}
          {i < steps.length - 1 && (
            <div
              className={[
                'flex-1 mx-3 h-px min-w-[24px]',
                step.status === 'completed' ? 'bg-emerald-300' : 'bg-slate-200',
              ].join(' ')}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
