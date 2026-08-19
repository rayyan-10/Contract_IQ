import React from 'react';
import {
  LayoutDashboard, TrendingUp, AlertTriangle, BarChart3,
  GitBranch, Lightbulb, FileText, Users, Network,
  LineChart, BookOpen,
} from 'lucide-react';
import type { NavGroup } from '@/types';

export const cmsNavGroups: NavGroup[] = [
  {
    group: 'CMS Analytics',
    items: [
      { label: 'Dashboard',        path: '/cms/dashboard',        icon: LayoutDashboard },
      { label: 'Predictions',      path: '/cms/predictions',      icon: TrendingUp },
      { label: 'Risk Analysis',    path: '/cms/risk',             icon: AlertTriangle },
      { label: 'Forecast',         path: '/cms/forecast',         icon: BarChart3 },
      { label: 'Twin ACO',         path: '/cms/twin-aco',         icon: GitBranch },
      { label: 'Recommendations',  path: '/cms/recommendations',  icon: Lightbulb },
      { label: 'Reports',          path: '/cms/reports',          icon: FileText },
    ],
  },
];

export const acoNavGroups: NavGroup[] = [
  {
    group: 'ACO Operations',
    items: [
      { label: 'Dashboard',        path: '/aco/dashboard',         icon: LayoutDashboard },
      { label: 'Analytics',        path: '/aco/analytics',         icon: LineChart },
      { label: 'Providers',        path: '/aco/providers',         icon: Users },
      { label: 'Peer Benchmarking',path: '/aco/peer-benchmarking', icon: Network },
      { label: 'Forecast',         path: '/aco/forecast',          icon: BarChart3 },
      { label: 'Recommendations',  path: '/aco/recommendations',   icon: Lightbulb },
      { label: 'Reports',          path: '/aco/reports',           icon: BookOpen },
    ],
  },
];

export const allNavGroups: NavGroup[] = [...cmsNavGroups, ...acoNavGroups];
