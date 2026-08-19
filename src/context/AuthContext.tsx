import React, { createContext, useContext, useState, useCallback } from 'react';
import { authService } from '@/services/authService';
import type { AuthUser, LoginCredentials, CmsSignupData, AcoSignupData, AuthResult } from '@/types/auth';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => AuthResult;
  signupCms: (data: CmsSignupData) => AuthResult;
  signupAco: (data: AcoSignupData) => AuthResult;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => authService.getCurrentUser());

  const login = useCallback((credentials: LoginCredentials): AuthResult => {
    const result = authService.login(credentials);
    if (result.success && result.user) setUser(result.user);
    return result;
  }, []);

  const signupCms = useCallback((data: CmsSignupData): AuthResult => {
    const result = authService.signupCms(data);
    if (result.success && result.user) setUser(result.user);
    return result;
  }, []);

  const signupAco = useCallback((data: AcoSignupData): AuthResult => {
    const result = authService.signupAco(data);
    if (result.success && result.user) setUser(result.user);
    return result;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        login,
        signupCms,
        signupAco,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
