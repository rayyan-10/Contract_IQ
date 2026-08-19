// Re-export auth types for convenience
export type { UserRole, AuthUser } from './auth';
// Re-export prediction types for convenience
export type { PredictionInputs, AnalysisType, PredictionResult } from './prediction';

// ─── Navigation ──────────────────────────────────────────────────────────────

export interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
}

export interface NavGroup {
  group: string;
  items: NavItem[];
}

// ─── Common UI ───────────────────────────────────────────────────────────────

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface KpiData {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
}

// ─── Mock domain types ───────────────────────────────────────────────────────

export interface Provider {
  id: string;
  name: string;
  specialty: string;
  npi: string;
  qualityScore: number;
  costIndex: number;
  status: 'active' | 'inactive' | 'pending';
}

export interface ContractSummary {
  id: string;
  name: string;
  payer: string;
  type: 'MSSP' | 'Direct' | 'Capitation' | 'P4P';
  startDate: string;
  endDate: string;
  targetSavings: number;
  currentSavings: number;
  status: 'on-track' | 'at-risk' | 'exceeded' | 'under-review';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  timestamp: string;
  read: boolean;
}
