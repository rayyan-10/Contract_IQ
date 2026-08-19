// ─── Auth Types ───────────────────────────────────────────────────────────────
// NOTE: This is demo-only auth. Swap authService.ts for a real API later.

export type UserRole = 'CMS' | 'ACO';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  acoName?: string;
  acoId?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface CmsSignupData {
  name: string;
  email: string;
  password: string;
}

export interface AcoSignupData {
  name: string;
  email: string;
  password: string;
  acoName: string;
  acoId: string;
}

export type SignupData = CmsSignupData | AcoSignupData;

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}
