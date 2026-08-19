import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

/** Requires any authenticated user. Redirects to /login if not. */
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}

/** CMS-only routes. Non-CMS users get redirected to their own dashboard. */
export function CmsRoute() {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'CMS') return <Navigate to="/aco/dashboard" replace />;
  return <Outlet />;
}

/** ACO-only routes. Non-ACO users get redirected to their own dashboard. */
export function AcoRoute() {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'ACO') return <Navigate to="/cms/dashboard" replace />;
  return <Outlet />;
}

/** Root redirect — sends each role to their home. */
export function RoleRedirect() {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'ACO') return <Navigate to="/aco/dashboard" replace />;
  return <Navigate to="/cms/dashboard" replace />;
}
