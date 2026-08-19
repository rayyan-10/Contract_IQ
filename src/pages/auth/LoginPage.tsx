import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useAuth } from '@/context/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    // Simulate slight async feel
    setTimeout(() => {
      const result = login({ email: email.trim(), password });
      setLoading(false);
      if (!result.success) {
        setError(result.error ?? 'Login failed.');
        return;
      }
      if (result.user?.role === 'ACO') {
        navigate('/aco/dashboard', { replace: true });
      } else {
        navigate('/cms/dashboard', { replace: true });
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left branding panel — hidden on mobile */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] bg-brand-950 p-12 flex-shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-500">
              <Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-white font-bold text-lg">ContractIQ</span>
          </div>
          <h2 className="text-3xl font-semibold text-white leading-snug">
            Intelligent Contract<br />Performance Analytics
          </h2>
          <p className="text-brand-300 text-sm mt-4 leading-relaxed">
            Value-Based Care and ACO contract intelligence — built for CMS analysts and ACO operators.
          </p>
        </div>

        <div className="space-y-4">
          {[
            { label: 'Demo CMS', email: 'cms@contractiq.com', pw: 'CMS@123' },
            { label: 'Demo ACO', email: 'aco@contractiq.com', pw: 'ACO@123' },
          ].map(d => (
            <div
              key={d.label}
              className="rounded-xl border border-brand-800 bg-brand-900/50 p-4 cursor-pointer hover:bg-brand-800/60 transition-colors"
              onClick={() => { setEmail(d.email); setPassword(d.pw); setError(''); }}
            >
              <p className="text-xs font-semibold text-brand-300 uppercase tracking-wide mb-1">{d.label} Account</p>
              <p className="text-white text-sm font-medium">{d.email}</p>
              <p className="text-brand-400 text-xs mt-0.5">Password: {d.pw}</p>
            </div>
          ))}
          <p className="text-brand-500 text-xs">Click a card to auto-fill credentials</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-600 mb-3">
              <Activity className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-bold text-slate-800">ContractIQ</h1>
            <p className="text-xs text-slate-400 mt-1">Intelligent Contract Performance Analytics</p>
          </div>

          <div className="bg-white rounded-2xl shadow-card-md border border-surface-border p-8">
            <h2 className="text-base font-semibold text-slate-800 mb-1">Sign in</h2>
            <p className="text-xs text-slate-400 mb-6">Enter your credentials to access your workspace</p>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 mb-4">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              <Input
                label="Email address"
                type="email"
                placeholder="you@organization.org"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                autoComplete="email"
                required
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    autoComplete="current-password"
                    className="w-full rounded-lg border border-surface-border bg-white px-3 py-2 pr-10 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full justify-center mt-1"
              >
                Sign in
              </Button>
            </form>
          </div>

          <p className="text-center text-xs text-slate-400 mt-5">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brand-600 hover:underline font-medium">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
