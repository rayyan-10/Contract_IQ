import type { Notification } from '@/types';

export const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Quality Score Alert',
    message: 'ACO Track 1 quality composite dropped below 80% threshold.',
    type: 'alert',
    timestamp: '2026-08-18T09:15:00Z',
    read: false,
  },
  {
    id: '2',
    title: 'Benchmark Update',
    message: 'CMS released updated FY2026 expenditure benchmarks.',
    type: 'info',
    timestamp: '2026-08-17T14:30:00Z',
    read: false,
  },
  {
    id: '3',
    title: 'Savings Target Met',
    message: 'Contract IQ-2024-MSSP has exceeded 3% savings target.',
    type: 'success',
    timestamp: '2026-08-16T11:00:00Z',
    read: true,
  },
  {
    id: '4',
    title: 'Risk Score Drift',
    message: 'RAF score variance detected in Northeast region providers.',
    type: 'warning',
    timestamp: '2026-08-15T08:45:00Z',
    read: true,
  },
];
