import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity, Eye, EyeOff, AlertCircle,
  ArrowRight, Shield, BarChart3, Brain,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useAuth } from '@/context/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const result = login({ email: email.trim(), password });
      setLoading(false);
      if (!result.success) { setError(result.error ?? 'Login failed.'); return; }
      navigate(result.user?.role === 'ACO' ? '/aco/dashboard' : '/cms/dashboard', { replace: true });
    }, 400);
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel ─────────────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col w-[480px] flex-shrink-0 bg-[#060c18] relative overflow-hidden">
        {/* Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:48px_48px]" />
        {/* Glow */}
        <div className="absolute top-0 left-0 w-full h-[400px] bg-indigo-600/10 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-violet-600/8 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

        <div className="relative flex flex-col h-full p-12">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-auto">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-900/40">
              <Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-white text-lg">ContractIQ</span>
          </div>

          {/* Main copy */}
          <div className="mt-16 mb-auto">
            <p className="text-indigo-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">Welcome back</p>
            <h2 className="text-3xl font-bold text-white leading-snug mb-4">
              Intelligent Contract<br />Performance Analytics
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Sign in to access your CMS or ACO analytics workspace. Monitor contracts, predict risk, and drive performance improvements.
            </p>

            {/* Feature bullets */}
            <div className="mt-8 space-y-3">
              {[
                { icon: <BarChart3 className="w-4 h-4 text-indigo-400" />,   text: 'Portfolio-wide ACO performance analytics'   },
                { icon: <Brain className="w-4 h-4 text-violet-400" />,        text: 'AI-powered risk prediction & scenario models' },
                { icon: <Shield className="w-4 h-4 text-emerald-400" />,      text: 'Role-based access for CMS & ACO teams'       },
              ].map(f => (
                <div key={f.text} className="flex items-center gap-3">
                  <div className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-white/6 border border-white/8">
                    {f.icon}
                  </div>
                  <span className="text-slate-400 text-xs">{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Demo credential cards */}
          <div className="space-y-3">
            <p className="text-slate-600 text-xs font-semibold uppercase tracking-wide">Demo accounts</p>
            {[
              { role: 'CMS', email: 'cms@contractiq.com', pw: 'CMS@123', color: 'border-indigo-500/25 hover:border-indigo-400/40', tag: 'bg-indigo-500/15 text-indigo-300' },
              { role: 'ACO', email: 'aco@contractiq.com', pw: 'ACO@123', color: 'border-emerald-500/25 hover:border-emerald-400/40', tag: 'bg-emerald-500/15 text-emerald-300' },
            ].map(d => (
              <div
                key={d.role}
                onClick={() => { setEmail(d.email); setPassword(d.pw); setError(''); }}
                className={`rounded-xl border bg-white/3 p-3.5 cursor-pointer transition-all duration-150 ${d.color}`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${d.tag}`}>{d.role}</span>
                  <span className="text-[10px] text-slate-600">click to fill</span>
                </div>
                <p className="text-white text-xs font-medium">{d.email}</p>
                <p className="text-slate-500 text-[10px] mt-0.5 font-mono">{d.pw}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel ────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 mb-3 shadow-lg shadow-indigo-200">
              <Activity className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-bold text-slate-800">ContractIQ</h1>
            <p className="text-xs text-slate-400 mt-1">Intelligent Contract Performance Analytics</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-slate-100 p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-800 mb-1">Sign in</h2>
              <p className="text-sm text-slate-400">Access your ContractIQ workspace</p>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 mb-5">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-xs text-red-600 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Input
                label="Email address"
                type="email"
                placeholder="you@organization.org"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                autoComplete="email"
                required
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    autoComplete="current-password"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 pr-10 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <a href="#" className="text-xs text-indigo-600 hover:text-indigo-700 hover:underline">Forgot password?</a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm px-4 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 mt-2"
              >
                {loading ? (
                  <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg> Signing in…</>
                ) : (
                  <>Sign in <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-slate-400 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
