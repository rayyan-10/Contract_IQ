import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { ResultsDisplay } from '@/components/prediction/ResultsDisplay';
import { AgentAnalysisSection } from '@/components/prediction/AgentAnalysisSection';
import { usePredictionResult } from '@/context/PredictionContext';

export function RiskResultPage() {
  const { result, inputId, clearResult } = usePredictionResult();

  // No result available — show empty state with link back
  if (!result || result.type !== 'risk') {
    return (
      <>
        <PageHeader title="Risk Analysis" subtitle="ACO risk prediction results" breadcrumb={['CMS Analytics', 'Risk Analysis']} />
        <Card>
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <p className="text-sm font-semibold text-slate-600">No risk prediction available</p>
            <p className="text-xs text-slate-400 max-w-sm">
              Run a Risk Prediction from the Predictions page to see results here.
            </p>
            <Link to="/cms/predictions">
              <Button variant="secondary" size="sm" icon={<ArrowLeft className="w-3.5 h-3.5" />}>
                Go to Predictions
              </Button>
            </Link>
          </div>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Risk Analysis"
        subtitle={'Results for ' + result.acoId}
        breadcrumb={['CMS Analytics', 'Risk Analysis']}
        actions={
          <Link to="/cms/predictions" onClick={clearResult}>
            <Button variant="secondary" size="sm" icon={<ArrowLeft className="w-3.5 h-3.5" />}>
              New Prediction
            </Button>
          </Link>
        }
      />
      <ResultsDisplay result={result} />
      <AgentAnalysisSection inputId={inputId} />
    </>
  );
}
