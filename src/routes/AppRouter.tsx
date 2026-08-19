import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { SignupPage } from '@/pages/auth/SignupPage';
import { CmsDashboard } from '@/pages/cms/CmsDashboard';
import { PredictionsPage } from '@/pages/cms/PredictionsPage';
import { CmsAnalytics } from '@/pages/cms/CmsAnalytics';
import { AcoDashboard } from '@/pages/aco/AcoDashboard';
import { AcoAnalytics } from '@/pages/aco/AcoAnalytics';
import { PlaceholderPage } from '@/components/dashboard/PlaceholderPage';
import { ProtectedRoute, CmsRoute, AcoRoute, RoleRedirect } from './ProtectedRoute';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public auth routes */}
        <Route path="/login"  element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected app shell */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>

            {/* CMS-only routes */}
            <Route element={<CmsRoute />}>
              <Route path="/cms/dashboard"       element={<CmsDashboard />} />
              <Route path="/cms/analytics"       element={<CmsAnalytics />} />
              <Route path="/cms/predictions"     element={<PredictionsPage />} />
              <Route path="/cms/risk"            element={<PlaceholderPage title="Risk Analysis"   subtitle="RAF score modeling and risk stratification"           breadcrumb={['CMS Analytics', 'Risk Analysis']} />} />
              <Route path="/cms/forecast"        element={<PlaceholderPage title="Forecast"        subtitle="Budget impact and savings trajectory modeling"        breadcrumb={['CMS Analytics', 'Forecast']} />} />
              <Route path="/cms/twin-aco"        element={<PlaceholderPage title="Twin ACO"        subtitle="Peer cohort comparison and benchmark analysis"        breadcrumb={['CMS Analytics', 'Twin ACO']} />} />
              <Route path="/cms/recommendations" element={<PlaceholderPage title="Recommendations" subtitle="AI-generated contract optimization insights"          breadcrumb={['CMS Analytics', 'Recommendations']} />} />
              <Route path="/cms/reports"         element={<PlaceholderPage title="Reports"         subtitle="Regulatory and performance reporting suite"           breadcrumb={['CMS Analytics', 'Reports']} />} />
            </Route>

            {/* ACO-only routes */}
            <Route element={<AcoRoute />}>
              <Route path="/aco/dashboard"         element={<AcoDashboard />} />
              <Route path="/aco/analytics"         element={<AcoAnalytics />} />
              <Route path="/aco/providers"         element={<PlaceholderPage title="Providers"         subtitle="Provider performance and attribution management"                    breadcrumb={['ACO Operations', 'Providers']} />} />
              <Route path="/aco/peer-benchmarking" element={<PlaceholderPage title="Peer Benchmarking" subtitle="Compare performance against peer ACOs and national benchmarks"     breadcrumb={['ACO Operations', 'Peer Benchmarking']} />} />
              <Route path="/aco/forecast"          element={<PlaceholderPage title="Forecast"          subtitle="Savings trajectory and shared savings projections"                 breadcrumb={['ACO Operations', 'Forecast']} />} />
              <Route path="/aco/recommendations"   element={<PlaceholderPage title="Recommendations"   subtitle="Clinical and operational improvement recommendations"              breadcrumb={['ACO Operations', 'Recommendations']} />} />
              <Route path="/aco/reports"           element={<PlaceholderPage title="Reports"           subtitle="ACO performance and compliance reporting"                          breadcrumb={['ACO Operations', 'Reports']} />} />
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
