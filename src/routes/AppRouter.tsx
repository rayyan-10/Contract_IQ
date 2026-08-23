import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthPage } from '@/pages/auth/AuthPage';
import { LandingPage } from '@/pages/LandingPage';
import { CmsDashboard } from '@/pages/cms/CmsDashboard';
import { PredictionsPage } from '@/pages/cms/PredictionsPage';
import { CmsAnalytics } from '@/pages/cms/CmsAnalytics';
import { QualityPage } from '@/pages/cms/QualityPage';
import { RiskResultPage } from '@/pages/cms/RiskResultPage';
import { ForecastResultPage } from '@/pages/cms/ForecastResultPage';
import { TwinResultPage } from '@/pages/cms/TwinResultPage';
import { AcoDashboard } from '@/pages/aco/AcoDashboard';
import { AcoAnalytics } from '@/pages/aco/AcoAnalytics';
import { WhatIfSimulator } from '@/pages/aco/WhatIfSimulator';
import { ProvidersPage } from '@/pages/aco/ProvidersPage';
import { ReportsPage } from '@/pages/aco/ReportsPage';
import { PlaceholderPage } from '@/components/dashboard/PlaceholderPage';
import { ProtectedRoute, CmsRoute, AcoRoute, RoleRedirect } from './ProtectedRoute';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/"       element={<LandingPage />} />
        <Route path="/login"  element={<AuthPage />} />
        <Route path="/signup" element={<AuthPage />} />

        {/* Protected app shell */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>

            {/* CMS-only routes */}
            <Route element={<CmsRoute />}>
              <Route path="/cms/dashboard"       element={<CmsDashboard />} />
              <Route path="/cms/analytics"       element={<CmsAnalytics />} />
              <Route path="/cms/predictions"     element={<PredictionsPage />} />
              <Route path="/cms/quality"         element={<QualityPage />} />
              <Route path="/cms/risk"            element={<RiskResultPage />} />
              <Route path="/cms/forecast"        element={<ForecastResultPage />} />
              <Route path="/cms/twin-aco"        element={<TwinResultPage />} />
            </Route>

            {/* ACO-only routes */}
            <Route element={<AcoRoute />}>
              <Route path="/aco/dashboard"         element={<AcoDashboard />} />
              <Route path="/aco/analytics"         element={<AcoAnalytics />} />
              <Route path="/aco/what-if"           element={<WhatIfSimulator />} />
              <Route path="/aco/providers"         element={<ProvidersPage />} />
              <Route path="/aco/reports"           element={<ReportsPage />} />
            </Route>

            {/* Role-based root redirect */}
            <Route index element={<RoleRedirect />} />
            <Route path="*" element={<RoleRedirect />} />
          </Route>
        </Route>

        {/* Catch-all for unauthenticated */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
