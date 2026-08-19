/**
 * authService — Demo-only localStorage authentication.
 * Replace this file's implementation with real API calls
 * when connecting to a backend. The interface stays the same.
 */

import type { AuthUser, LoginCredentials, CmsSignupData, AcoSignupData, AuthResult, UserRole } from '@/types/auth';

const STORAGE_KEY = 'contractiq_user';

// ─── Seed demo accounts ───────────────────────────────────────────────────────

const DEMO_ACCOUNTS: Array<AuthUser & { password: string }> = [
  {
    id: 'demo-cms-001',
    name: 'CMS Admin',
    email: 'cms@contractiq.com',
    password: 'CMS@123',
    role: 'CMS',
  },
  {
    id: 'demo-aco-001',
    name: 'ACO Admin',
    email: 'aco@contractiq.com',
    password: 'ACO@123',
    role: 'ACO',
    acoName: 'Demo ACO Network',
    acoId: 'ACO-001',
  },
];

// ─── Internal helpers ─────────────────────────────────────────────────────────

function getStoredUsers(): Array<AuthUser & { password: string }> {
  try {
    const raw = localStorage.getItem('contractiq_users');
    return raw ? JSON.parse(raw) : [...DEMO_ACCOUNTS];
  } catch {
    return [...DEMO_ACCOUNTS];
  }
}

function saveUsers(users: Array<AuthUser & { password: string }>): void {
  localStorage.setItem('contractiq_users', JSON.stringify(users));
}

function generateId(): string {
  return `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const authService = {
  /**
   * Authenticate with email + password.
   * Returns the user on success, an error string on failure.
   */
  login(credentials: LoginCredentials): AuthResult {
    const { email, password } = credentials;
    const users = getStoredUsers();
    const match = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!match) {
      return { success: false, error: 'Invalid email or password.' };
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pw, ...user } = match;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return { success: true, user };
  },

  /** Register a new CMS user. */
  signupCms(data: CmsSignupData): AuthResult {
    const users = getStoredUsers();
    if (users.find(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, error: 'An account with this email already exists.' };
    }
    const user: AuthUser = {
      id: generateId(),
      name: data.name,
      email: data.email,
      role: 'CMS',
    };
    users.push({ ...user, password: data.password });
    saveUsers(users);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return { success: true, user };
  },

  /** Register a new ACO user. */
  signupAco(data: AcoSignupData): AuthResult {
    const users = getStoredUsers();
    if (users.find(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, error: 'An account with this email already exists.' };
    }
    const user: AuthUser = {
      id: generateId(),
      name: data.name,
      email: data.email,
      role: 'ACO',
      acoName: data.acoName,
      acoId: data.acoId,
    };
    users.push({ ...user, password: data.password });
    saveUsers(users);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return { success: true, user };
  },

  /** Clear session. */
  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  /** Returns the currently logged-in user or null. */
  getCurrentUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  },

  /** Returns true if a user session exists. */
  isAuthenticated(): boolean {
    return authService.getCurrentUser() !== null;
  },

  /** Returns the role of the current user, or null. */
  getUserRole(): UserRole | null {
    return authService.getCurrentUser()?.role ?? null;
  },
};
