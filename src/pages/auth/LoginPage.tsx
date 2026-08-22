import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const result = await login({ email: email.trim(), password });
      setLoading(false);
      if (!result.success) { setError(result.error ?? 'Login failed.'); return; }
      navigate(result.user?.role === 'ACO' ? '/aco/dashboard' : '/cms/dashboard', { replace: true });
    } catch {
      setLoading(false);
      setError('Unable to connect. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden bg-white">
      <style>{`
        @keyframes float1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,-30px) scale(1.1)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-15px,25px) scale(0.9)} }
        @keyframes float3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(10px,15px)} }
        .orb1 { animation: float1 8s ease-in-out infinite; }
        .orb2 { animation: float2 10s ease-in-out infinite; }
        .orb3 { animation: float3 6s ease-in-out infinite; }
        @keyframes slideRight { from{opacity:0;transform:translateX(-30px)} to{opacity:1;transform:translateX(0)} }
        @keyframes slideLeft  { from{opacity:0;transform:translateX(30px)}  to{opacity:1;transform:translateX(0)} }
        .slide-r { animation: slideRight 0.6s ease forwards; }
        .slide-l { animation: slideLeft 0.6s 0.1s ease forwards; opacity:0; }
      `}</style>

      {/* ── LEFT: Form panel ───────────────────────────────────────────── */}
      <div className="relative flex-1 flex items-center justify-center px-8 py-12 z-10">
        {/* Wavy edge (visible on desktop) */}
        <div className="hidden lg:block absolute top-0 right-0 h-full w-24 z-20 pointer-events-none">
          <svg viewBox="0 0 100 800" preserveAspectRatio="none" className="h-full w-full" fill="white">
            <path d="M0,0 L100,0 L100,800 L0,800 C30,700 70,650 30,550 C-10,450 60,350 30,250 C0,150 50,50 0,0 Z" />
          </svg>
        </div>

        <div className="w-full max-w-sm slide-r">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-10">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-200">
              <Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-xl text-slate-800 tracking-tight">ContractIQ</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome back</h1>
          <p className="text-sm text-slate-400 mb-8">Sign in to access your analytics workspace</p>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2.5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 mb-5 animate-scale-in">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Email</label>
              <input
                type="email"
                placeholder="you@organization.org"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                autoComplete="email"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 focus:bg-white transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 pr-11 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 focus:bg-white transition-all duration-200"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                  aria-label={showPw ? 'Hide' : 'Show'}>
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm px-6 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? (
                <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Signing in…</>
              ) : (
                <>Sign in <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Quick demo access</p>
            <div className="flex gap-2">
              {[
                { label: 'CMS', email: 'cms@contractiq.com', pw: 'CMS@123', color: 'from-indigo-500 to-blue-500' },
                { label: 'ACO', email: 'aco@contractiq.com', pw: 'ACO@123', color: 'from-emerald-500 to-teal-500' },
              ].map(d => (
                <button key={d.label} type="button"
                  onClick={() => { setEmail(d.email); setPassword(d.pw); setError(''); }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all text-xs font-semibold text-slate-600 group"
                >
                  <span className={'w-2 h-2 rounded-full bg-gradient-to-r ' + d.color} />
                  {d.label} Demo
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-slate-400 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-indigo-600 hover:text-indigo-700 font-semibold">Create one</Link>
          </p>
        </div>
      </div>

      {/* ── RIGHT: Branding panel ──────────────────────────────────────── */}
      <div className="hidden lg:flex relative w-[48%] flex-shrink-0 items-center justify-center bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 overflow-hidden">
        {/* Floating orbs */}
        <div className="orb1 absolute top-[10%] right-[15%] w-32 h-32 rounded-full bg-white/10 blur-xl" />
        <div className="orb2 absolute bottom-[20%] left-[10%] w-40 h-40 rounded-full bg-pink-400/15 blur-2xl" />
        <div className="orb3 absolute top-[50%] right-[40%] w-20 h-20 rounded-full bg-cyan-400/20 blur-xl" />
        <div className="absolute top-[8%] right-[8%] w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 opacity-80 orb1" />
        <div className="absolute bottom-[12%] left-[20%] w-10 h-10 rounded-full bg-gradient-to-br from-cyan-300 to-blue-400 opacity-60 orb2" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

        {/* Content */}
        <div className="relative z-10 text-center px-12 slide-l max-w-md">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mx-auto mb-8 shadow-2xl">
            <Activity className="w-8 h-8 text-white" strokeWidth={2} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 leading-snug">
            Intelligent Contract<br />Performance Analytics
          </h2>
          <p className="text-white/70 text-sm leading-relaxed mb-8">
            Monitor ACO performance, predict financial risk, and drive data-informed decisions across your entire value-based care portfolio.
          </p>
          <Link to="/signup"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-white/10 border border-white/25 text-white font-semibold text-sm hover:bg-white/20 transition-all duration-200 backdrop-blur-sm"
          >
            Create an account <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
