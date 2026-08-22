import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Activity, Eye, EyeOff, AlertCircle, ArrowRight,
  Building2, Stethoscope, ChevronLeft,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types/auth';

// ─── Shared ───────────────────────────────────────────────────────────────────
const inputClass = 'w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 focus:bg-white transition-all duration-200';
const labelClass = 'block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2';

// ─── Main Auth Page ───────────────────────────────────────────────────────────
export function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(location.pathname === '/login');

  // Sync with URL
  useEffect(() => {
    setIsLogin(location.pathname === '/login');
  }, [location.pathname]);

  const switchToSignup = () => { setIsLogin(false); window.history.replaceState(null, '', '/signup'); };
  const switchToLogin  = () => { setIsLogin(true);  window.history.replaceState(null, '', '/login');  };

  return (
    <div className="min-h-screen w-full overflow-hidden bg-white relative">
      <style>{`
        @keyframes float1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,-30px) scale(1.1)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-15px,25px) scale(0.9)} }
        .orb1 { animation: float1 8s ease-in-out infinite; }
        .orb2 { animation: float2 10s ease-in-out infinite; }
      `}</style>

      {/* ── Container with two form panels side by side ──────────────── */}
      <div className="flex min-h-screen w-full">

        {/* Sign In Form (always on left half) */}
        <div className={[
          'absolute inset-y-0 left-0 w-full lg:w-1/2 flex items-center justify-center px-8 py-12 transition-all duration-700 ease-in-out z-20',
          isLogin ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none',
        ].join(' ')}>
          <LoginForm onSwitchToSignup={switchToSignup} />
        </div>

        {/* Sign Up Form (always on right half) */}
        <div className={[
          'absolute inset-y-0 right-0 w-full lg:w-1/2 flex items-center justify-center px-8 py-12 transition-all duration-700 ease-in-out z-20',
          !isLogin ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none',
        ].join(' ')}>
          <SignupForm onSwitchToLogin={switchToLogin} />
        </div>

        {/* ── Sliding Gradient Panel ─────────────────────────────────── */}
        <div className={[
          'hidden lg:block absolute inset-y-0 w-1/2 z-30 transition-transform duration-700 ease-in-out',
          isLogin ? 'translate-x-full' : 'translate-x-0',
        ].join(' ')}>
          <div className="h-full w-full bg-gradient-to-br from-maroon-900 via-maroon-800 to-maroon-950 relative overflow-hidden flex items-center justify-center">
            {/* Floating orbs */}
            <div className="orb1 absolute top-[12%] right-[20%] w-32 h-32 rounded-full bg-amber-400/10 blur-xl" />
            <div className="orb2 absolute bottom-[18%] left-[15%] w-40 h-40 rounded-full bg-amber-400/5 blur-2xl" />
            <div className="absolute top-[8%] right-[10%] w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 opacity-70 orb1" />
            <div className="absolute bottom-[15%] left-[22%] w-10 h-10 rounded-full bg-gradient-to-br from-cream-300 to-cream-400 opacity-40 orb2" />
            {/* Grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(245,166,35,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(245,166,35,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
            {/* Wavy edge — left side */}
            <div className="absolute top-0 left-0 h-full w-20 pointer-events-none">
              <svg viewBox="0 0 80 800" preserveAspectRatio="none" className="h-full w-full" fill="white">
                <path d="M80,0 L0,0 L0,800 L80,800 C50,700 20,650 50,550 C80,450 20,350 50,250 C80,150 30,50 80,0 Z" />
              </svg>
            </div>
            {/* Wavy edge — right side */}
            <div className="absolute top-0 right-0 h-full w-20 pointer-events-none">
              <svg viewBox="0 0 80 800" preserveAspectRatio="none" className="h-full w-full" fill="white">
                <path d="M0,0 L80,0 L80,800 L0,800 C30,700 60,650 30,550 C0,450 60,350 30,250 C0,150 50,50 0,0 Z" />
              </svg>
            </div>

            {/* Content */}
            <div className="relative z-10 text-center px-12 max-w-md transition-opacity duration-500">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-400/20 backdrop-blur-sm border border-amber-400/30 mx-auto mb-8 shadow-2xl">
                <Activity className="w-8 h-8 text-amber-400" strokeWidth={2} />
              </div>

              {isLogin ? (
                <>
                  <h2 className="text-3xl font-bold text-cream-100 mb-4">New here?</h2>
                  <p className="text-cream-300/70 text-sm leading-relaxed mb-8">
                    Create your workspace and start analyzing ACO contract performance with AI-powered predictions.
                  </p>
                  <button onClick={switchToSignup}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-amber-400 text-maroon-900 font-bold text-sm hover:bg-amber-300 transition-all hover:-translate-y-0.5 shadow-lg shadow-amber-400/20">
                    Create an account <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-bold text-cream-100 mb-4">Welcome back!</h2>
                  <p className="text-cream-300/70 text-sm leading-relaxed mb-8">
                    Already have a ContractIQ workspace? Sign in to access your analytics dashboard.
                  </p>
                  <button onClick={switchToLogin}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-amber-400 text-maroon-900 font-bold text-sm hover:bg-amber-300 transition-all hover:-translate-y-0.5 shadow-lg shadow-amber-400/20">
                    Sign in to your account <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile toggle (only on small screens since overlay is hidden) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 z-50">
        {isLogin ? (
          <button onClick={switchToSignup} className="w-full text-center text-sm text-maroon-900 font-semibold">
            Don't have an account? <span className="underline">Create one</span>
          </button>
        ) : (
          <button onClick={switchToLogin} className="w-full text-center text-sm text-maroon-900 font-semibold">
            Already have an account? <span className="underline">Sign in</span>
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Login Form ───────────────────────────────────────────────────────────────
function LoginForm({ onSwitchToSignup }: { onSwitchToSignup: () => void }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState(''); const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (!email.trim() || !password.trim()) { setError('Please enter email and password.'); return; }
    setLoading(true);
    try {
      const r = await login({ email: email.trim(), password });
      setLoading(false);
      if (!r.success) { setError(r.error ?? 'Login failed.'); return; }
      navigate(r.user?.role === 'ACO' ? '/aco/dashboard' : '/cms/dashboard', { replace: true });
    } catch { setLoading(false); setError('Connection failed.'); }
  };

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-10">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 shadow-lg shadow-amber-200">
          <Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
        <span className="font-bold text-xl text-slate-800 tracking-tight">ContractIQ</span>
      </div>

      <h1 className="text-3xl font-bold text-slate-800 mb-2">Sign in</h1>
      <p className="text-sm text-slate-400 mb-8">Access your analytics workspace</p>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-3 mb-5">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-xs text-red-600 font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={submit} className="space-y-5" noValidate>
        <div>
          <label className={labelClass}>Email</label>
          <input type="email" placeholder="you@organization.org" value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }} autoComplete="email" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Password</label>
          <div className="relative">
            <input type={showPw ? 'text' : 'password'} placeholder="••••••••" value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }} autoComplete="current-password"
              className={inputClass + ' pr-11'} />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-maroon-900 to-maroon-800 hover:from-maroon-800 hover:to-maroon-900 disabled:opacity-60 text-white font-semibold text-sm px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-maroon-900/10 hover:shadow-maroon-900/20 hover:-translate-y-0.5">
          {loading ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Signing in…</> : <>Sign in <ArrowRight className="w-4 h-4" /></>}
        </button>
      </form>

      {/* Demo */}
      <div className="mt-8 pt-6 border-t border-slate-100">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Quick demo</p>
        <div className="flex gap-2">
          {[
            { label: 'CMS', email: 'cms@contractiq.com', pw: 'CMS@123', color: 'from-indigo-500 to-blue-500' },
            { label: 'ACO', email: 'aco@contractiq.com', pw: 'ACO@123', color: 'from-emerald-500 to-teal-500' },
          ].map(d => (
            <button key={d.label} type="button"
              onClick={() => { setEmail(d.email); setPassword(d.pw); setError(''); }}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all text-xs font-semibold text-slate-600">
              <span className={'w-2 h-2 rounded-full bg-gradient-to-r ' + d.color} />
              {d.label} Demo
            </button>
          ))}
        </div>
      </div>

      {/* Mobile only link */}
      <p className="text-center text-sm text-slate-400 mt-6 lg:hidden">
        Don't have an account? <button onClick={onSwitchToSignup} className="text-maroon-900 font-semibold">Create one</button>
      </p>
    </div>
  );
}

// ─── Signup Form ──────────────────────────────────────────────────────────────
function SignupForm({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  const navigate = useNavigate();
  const { signupCms, signupAco } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);

  // CMS state
  const [name, setName] = useState(''); const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); const [confirm, setConfirm] = useState('');
  // ACO extra state
  const [acoName, setAcoName] = useState(''); const [acoId, setAcoId] = useState('');
  const [error, setError] = useState(''); const [loading, setLoading] = useState(false);

  const clearForm = () => { setName(''); setEmail(''); setPassword(''); setConfirm(''); setAcoName(''); setAcoId(''); setError(''); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (!name.trim() || !email.trim() || !password || !confirm) { setError('All fields are required.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (role === 'ACO' && (!acoName.trim() || !acoId.trim())) { setError('ACO Name and ID are required.'); return; }

    setLoading(true);
    try {
      const r = role === 'ACO'
        ? await signupAco({ name: name.trim(), email: email.trim(), password, acoName: acoName.trim(), acoId: acoId.trim() })
        : await signupCms({ name: name.trim(), email: email.trim(), password });
      setLoading(false);
      if (!r.success) { setError(r.error ?? 'Signup failed.'); return; }
      navigate(r.user?.role === 'ACO' ? '/aco/dashboard' : '/cms/dashboard', { replace: true });
    } catch { setLoading(false); setError('Connection failed.'); }
  };

  // Role selection
  if (!role) {
    return (
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2.5 mb-10 lg:hidden">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 shadow-lg shadow-amber-200">
            <Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-xl text-slate-800">ContractIQ</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Create your account</h1>
        <p className="text-sm text-slate-400 mb-8">Choose your workspace type</p>

        <div className="grid grid-cols-2 gap-4">
          {([
            { r: 'CMS' as UserRole, icon: <Building2 className="w-7 h-7" />, label: 'CMS Analyst', sub: 'Portfolio oversight', gradient: 'from-amber-400 to-amber-500', hover: 'hover:border-amber-300 hover:shadow-amber-100' },
            { r: 'ACO' as UserRole, icon: <Stethoscope className="w-7 h-7" />, label: 'ACO Operator', sub: 'Operational analytics', gradient: 'from-amber-500 to-amber-600', hover: 'hover:border-amber-400 hover:shadow-amber-100' },
          ]).map(c => (
            <button key={c.r} type="button" onClick={() => { setRole(c.r); clearForm(); }}
              className={'flex flex-col items-center gap-3 p-7 rounded-2xl border-2 border-slate-200 bg-white transition-all duration-200 hover:shadow-lg hover:-translate-y-1 text-center group ' + c.hover}>
              <div className={'flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br text-white shadow-lg group-hover:scale-110 transition-transform ' + c.gradient}>
                {c.icon}
              </div>
              <p className="text-sm font-bold text-slate-800">{c.label}</p>
              <p className="text-xs text-slate-400">{c.sub}</p>
            </button>
          ))}
        </div>

        <p className="text-center text-sm text-slate-400 mt-8 lg:hidden">
          Have an account? <button onClick={onSwitchToLogin} className="text-maroon-900 font-semibold">Sign in</button>
        </p>
      </div>
    );
  }

  // Registration form
  const isAco = role === 'ACO';
  return (
    <div className="w-full max-w-sm">
      <button type="button" onClick={() => setRole(null)}
        className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-600 mb-6 transition-colors">
        <ChevronLeft className="w-3.5 h-3.5" /> Change role
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className={'flex items-center justify-center w-10 h-10 rounded-xl text-white shadow-lg bg-gradient-to-br ' + (isAco ? 'from-amber-500 to-amber-600' : 'from-amber-400 to-amber-500')}>
          {isAco ? <Stethoscope className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">{isAco ? 'ACO' : 'CMS'} Account</h2>
          <p className="text-xs text-slate-400">{isAco ? 'Register your organization' : 'Create analyst workspace'}</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-3 mb-5">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-xs text-red-600 font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={submit} className="space-y-4" noValidate>
        <div><label className={labelClass}>Full name</label><input type="text" placeholder="Your name" value={name} onChange={e => { setName(e.target.value); setError(''); }} className={inputClass} /></div>
        <div><label className={labelClass}>Email</label><input type="email" placeholder={isAco ? 'you@healthsystem.org' : 'you@cms.hhs.gov'} value={email} onChange={e => { setEmail(e.target.value); setError(''); }} className={inputClass} autoComplete="email" /></div>
        {isAco && (
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelClass}>ACO Name</label><input type="text" placeholder="ACO name" value={acoName} onChange={e => { setAcoName(e.target.value); setError(''); }} className={inputClass} /></div>
            <div><label className={labelClass}>ACO ID</label><input type="text" placeholder="A00001" value={acoId} onChange={e => { setAcoId(e.target.value); setError(''); }} className={inputClass} /></div>
          </div>
        )}
        <div><label className={labelClass}>Password</label><input type="password" placeholder="Min. 6 chars" value={password} onChange={e => { setPassword(e.target.value); setError(''); }} className={inputClass} /></div>
        <div><label className={labelClass}>Confirm</label><input type="password" placeholder="Repeat" value={confirm} onChange={e => { setConfirm(e.target.value); setError(''); }} className={inputClass} /></div>

        <button type="submit" disabled={loading}
          className={'w-full flex items-center justify-center gap-2 text-white font-semibold text-sm px-6 py-3.5 rounded-xl transition-all shadow-lg hover:-translate-y-0.5 disabled:opacity-60 mt-2 bg-gradient-to-r ' + (isAco ? 'from-maroon-900 to-maroon-800 shadow-maroon-900/10 hover:shadow-maroon-900/20' : 'from-indigo-600 to-violet-600 shadow-maroon-900/10 hover:shadow-maroon-900/20')}>
          {loading ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Creating…</> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
        </button>
      </form>

      <p className="text-center text-sm text-slate-400 mt-6 lg:hidden">
        Have an account? <button onClick={onSwitchToLogin} className="text-maroon-900 font-semibold">Sign in</button>
      </p>
    </div>
  );
}

