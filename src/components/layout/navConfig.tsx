import React from 'react';
import {
  LayoutDashboard, TrendingUp, AlertTriangle, BarChart3,
  GitBranch, FileText, Users, Network,
  LineChart, BookOpen, PieChart, Award, Sliders,
} from 'lucide-react';
import type { NavGroup } from '@/types';

export const cmsNavGroups: NavGroup[] = [
  {
    group: 'CMS Analytics',
    items: [
      { label: 'Dashboard',        path: '/cms/dashboard',        icon: LayoutDashboard },
      { label: 'Analytics',        path: '/cms/analytics',        icon: PieChart        },
      { label: 'Predictions',      path: '/cms/predictions',      icon: TrendingUp      },
      { label: 'Quality',          path: '/cms/quality',          icon: Award           },
      { label: 'Risk Analysis',    path: '/cms/risk',             icon: AlertTriangle   },
      { label: 'Forecast',         path: '/cms/forecast',         icon: BarChart3       },
      { label: 'Twin ACO',         path: '/cms/twin-aco',         icon: GitBranch       },
    ],
  },
];

export const acoNavGroups: NavGroup[] = [
  {
    group: 'ACO Operations',
    items: [
      { label: 'Dashboard',        path: '/aco/dashboard',         icon: LayoutDashboard },
      { label: 'Analytics',        path: '/aco/analytics',         icon: LineChart },
      { label: 'What-If Simulator',path: '/aco/what-if',           icon: Sliders },
      { label: 'Providers',        path: '/aco/providers',         icon: Users },
      { label: 'Reports',          path: '/aco/reports',           icon: BookOpen },
    ],
  },
];

export const allNavGroups: NavGroup[] = [...cmsNavGroups, ...acoNavGroups];
