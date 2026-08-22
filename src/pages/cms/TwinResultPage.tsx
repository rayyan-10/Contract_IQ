import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { ResultsDisplay } from '@/components/prediction/ResultsDisplay';
import { AgentAnalysisSection } from '@/components/prediction/AgentAnalysisSection';
import { usePredictionResult } from '@/context/PredictionContext';

export function TwinResultPage() {
  const { result, inputId, clearResult } = usePredictionResult();

  if (!result || result.type !== 'twin') {
    return (
      <>
        <PageHeader title="Twin ACO" subtitle="Twin ACO matching results" breadcrumb={['CMS Analytics', 'Twin ACO']} />
        <Card>
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <p className="text-sm font-semibold text-slate-600">No twin matching available</p>
            <p className="text-xs text-slate-400 max-w-sm">
              Run a Twin ACO analysis from the Predictions page to see results here.
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
        title="Twin ACO"
        subtitle={'Similar ACOs for ' + result.acoId}
        breadcrumb={['CMS Analytics', 'Twin ACO']}
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
