/**
 * authService — Real backend auth with localStorage fallback.
 *
 * Backend endpoints:
 *   POST /auth/signup → { access_token, token_type, user }
 *   POST /auth/login  → { access_token, token_type, user }
 *
 * If backend is offline, falls back to localStorage demo auth.
 */

import type { AuthUser, LoginCredentials, CmsSignupData, AcoSignupData, AuthResult } from '@/types/auth';
import { setToken, clearToken } from './tokenService';

const API_BASE    = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const USER_KEY    = 'contractiq_user';

// ─── Backend API calls ────────────────────────────────────────────────────────

async function apiLogin(email: string, password: string): Promise<AuthResult> {
  const res = await fetch(API_BASE + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    if (res.status === 401 || res.status === 400) {
      return { success: false, error: 'Invalid email or password.' };
    }
    const text = await res.text().catch(() => '');
    return { success: false, error: 'Login failed (' + res.status + '): ' + text };
  }

  const data = await res.json();
  const token = data.access_token;
  const user: AuthUser = {
    id:      data.user?.id ?? '',
    name:    data.user?.name ?? '',
    email:   data.user?.email ?? email,
    role:    data.user?.role ?? 'CMS',
    acoName: data.user?.aco_name ?? undefined,
    acoId:   data.user?.aco_id ?? undefined,
  };

  setToken(token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return { success: true, user };
}

async function apiSignup(payload: Record<string, string>): Promise<AuthResult> {
  const res = await fetch(API_BASE + '/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    if (res.status === 409 || res.status === 400) {
      const body = await res.json().catch(() => ({}));
      return { success: false, error: body.detail ?? 'Account already exists or invalid data.' };
    }
    const text = await res.text().catch(() => '');
    return { success: false, error: 'Signup failed (' + res.status + '): ' + text };
  }

  const data = await res.json();
  const token = data.access_token;
  const user: AuthUser = {
    id:      data.user?.id ?? '',
    name:    data.user?.name ?? '',
    email:   data.user?.email ?? payload.email,
    role:    data.user?.role ?? (payload.role as 'CMS' | 'ACO'),
    acoName: data.user?.aco_name ?? payload.aco_name ?? undefined,
    acoId:   data.user?.aco_id ?? payload.aco_id ?? undefined,
  };

  setToken(token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return { success: true, user };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const authService = {
  /** Login via backend. Falls back to demo if backend offline. */
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      return await apiLogin(credentials.email, credentials.password);
    } catch (err) {
      console.warn('Backend login unavailable, using demo fallback:', err);
      return demoLogin(credentials);
    }
  },

  /** Signup CMS user via backend. */
  async signupCms(data: CmsSignupData): Promise<AuthResult> {
    try {
      return await apiSignup({
        name: data.name,
        email: data.email,
        password: data.password,
        role: 'CMS',
      });
    } catch (err) {
      console.warn('Backend signup unavailable, using demo fallback:', err);
      return demoSignupCms(data);
    }
  },

  /** Signup ACO user via backend. */
  async signupAco(data: AcoSignupData): Promise<AuthResult> {
    try {
      return await apiSignup({
        name: data.name,
        email: data.email,
        password: data.password,
        role: 'ACO',
        aco_name: data.acoName,
        aco_id: data.acoId,
      });
    } catch (err) {
      console.warn('Backend signup unavailable, using demo fallback:', err);
      return demoSignupAco(data);
    }
  },

  /** Clear session. */
  logout(): void {
    clearToken();
    localStorage.removeItem(USER_KEY);
  },

  /** Get current user from localStorage. */
  getCurrentUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return authService.getCurrentUser() !== null;
  },
};

// ─── Demo fallbacks (when backend is offline) ─────────────────────────────────

const DEMO_ACCOUNTS = [
  { email: 'cms@contractiq.com', password: 'CMS@123', user: { id: 'demo-cms', name: 'CMS Admin', email: 'cms@contractiq.com', role: 'CMS' as const } },
  { email: 'aco@contractiq.com', password: 'ACO@123', user: { id: 'demo-aco', name: 'ACO Admin', email: 'aco@contractiq.com', role: 'ACO' as const, acoName: 'Demo ACO Network', acoId: 'A00001' } },
];

function demoLogin(creds: LoginCredentials): AuthResult {
  const match = DEMO_ACCOUNTS.find(a => a.email === creds.email && a.password === creds.password);
  if (!match) return { success: false, error: 'Invalid credentials (demo mode).' };
  localStorage.setItem(USER_KEY, JSON.stringify(match.user));
  return { success: true, user: match.user };
}

function demoSignupCms(data: CmsSignupData): AuthResult {
  const user: AuthUser = { id: 'local-' + Date.now(), name: data.name, email: data.email, role: 'CMS' };
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return { success: true, user };
}

function demoSignupAco(data: AcoSignupData): AuthResult {
  const user: AuthUser = { id: 'local-' + Date.now(), name: data.name, email: data.email, role: 'ACO', acoName: data.acoName, acoId: data.acoId };
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return { success: true, user };
}
