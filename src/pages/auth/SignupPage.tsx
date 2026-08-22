import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity, Building2, Stethoscope, ChevronLeft,
  AlertCircle, ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types/auth';

// ─── Shared styles ────────────────────────────────────────────────────────────
const inputClass = 'w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 focus:bg-white transition-all duration-200';
const labelClass = 'block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2';

// ─── Role selection step ──────────────────────────────────────────────────────
function RoleStep({ onSelect }: { onSelect: (r: UserRole) => void }) {
  return (
    <div className="w-full max-w-md">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Create your account</h1>
      <p className="text-sm text-slate-400 mb-8">Choose your workspace type to get started</p>

      <div className="grid grid-cols-2 gap-4">
        {([
          { role: 'CMS' as UserRole, icon: <Building2 className="w-7 h-7" />, label: 'CMS Analyst', sub: 'Portfolio oversight & analytics', gradient: 'from-indigo-500 to-blue-600', hover: 'hover:border-indigo-400 hover:shadow-indigo-100' },
          { role: 'ACO' as UserRole, icon: <Stethoscope className="w-7 h-7" />, label: 'ACO Operator', sub: 'Operational performance', gradient: 'from-emerald-500 to-teal-600', hover: 'hover:border-emerald-400 hover:shadow-emerald-100' },
        ]).map(c => (
          <button key={c.role} type="button" onClick={() => onSelect(c.role)}
            className={'flex flex-col items-center gap-3 p-7 rounded-2xl border-2 border-slate-200 bg-white transition-all duration-200 hover:shadow-lg hover:-translate-y-1 text-center group ' + c.hover}>
            <div className={'flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br text-white shadow-lg group-hover:scale-110 transition-transform ' + c.gradient}>
              {c.icon}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">{c.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{c.sub}</p>
            </div>
          </button>
        ))}
      </div>

      <p className="text-center text-sm text-slate-400 mt-8">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">Sign in</Link>
      </p>
    </div>
  );
}

// ─── CMS form ─────────────────────────────────────────────────────────────────
function CmsForm({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate();
  const { signupCms } = useAuth();
  const [name, setName] = useState(''); const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(''); const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (!name.trim() || !email.trim() || !password || !confirm) { setError('All fields are required.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const r = await signupCms({ name: name.trim(), email: email.trim(), password });
      setLoading(false);
      if (!r.success) { setError(r.error ?? 'Signup failed.'); return; }
      navigate('/cms/dashboard', { replace: true });
    } catch { setLoading(false); setError('Unable to connect.'); }
  };

  return (
    <div className="w-full max-w-sm">
      <button type="button" onClick={onBack} className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-600 mb-6 transition-colors">
        <ChevronLeft className="w-3.5 h-3.5" /> Back to role selection
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">CMS Account</h2>
          <p className="text-xs text-slate-400">Create your CMS analyst workspace</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-3 mb-5">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-xs text-red-600 font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={submit} className="space-y-4" noValidate>
        <div><label className={labelClass}>Full name</label><input type="text" placeholder="Your full name" value={name} onChange={e => { setName(e.target.value); setError(''); }} className={inputClass} /></div>
        <div><label className={labelClass}>Work email</label><input type="email" placeholder="you@cms.hhs.gov" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} className={inputClass} autoComplete="email" /></div>
        <div><label className={labelClass}>Password</label><input type="password" placeholder="Min. 6 characters" value={password} onChange={e => { setPassword(e.target.value); setError(''); }} className={inputClass} /></div>
        <div><label className={labelClass}>Confirm password</label><input type="password" placeholder="Repeat password" value={confirm} onChange={e => { setConfirm(e.target.value); setError(''); }} className={inputClass} /></div>
        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-60 text-white font-semibold text-sm px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 mt-2">
          {loading ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Creating…</> : <>Create CMS Account <ArrowRight className="w-4 h-4" /></>}
        </button>
      </form>
      <p className="text-center text-sm text-slate-400 mt-6">
        Have an account? <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">Sign in</Link>
      </p>
    </div>
  );
}

// ─── ACO form ─────────────────────────────────────────────────────────────────
function AcoForm({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate();
  const { signupAco } = useAuth();
  const [name, setName] = useState(''); const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); const [confirm, setConfirm] = useState('');
  const [acoName, setAcoName] = useState(''); const [acoId, setAcoId] = useState('');
  const [error, setError] = useState(''); const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (!name.trim() || !email.trim() || !password || !confirm || !acoName.trim() || !acoId.trim()) { setError('All fields are required.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const r = await signupAco({ name: name.trim(), email: email.trim(), password, acoName: acoName.trim(), acoId: acoId.trim() });
      setLoading(false);
      if (!r.success) { setError(r.error ?? 'Signup failed.'); return; }
      navigate('/aco/dashboard', { replace: true });
    } catch { setLoading(false); setError('Unable to connect.'); }
  };

  return (
    <div className="w-full max-w-sm">
      <button type="button" onClick={onBack} className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-600 mb-6 transition-colors">
        <ChevronLeft className="w-3.5 h-3.5" /> Back to role selection
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
          <Stethoscope className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">ACO Account</h2>
          <p className="text-xs text-slate-400">Register your ACO organization</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-3 mb-5">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-xs text-red-600 font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={submit} className="space-y-4" noValidate>
        <div><label className={labelClass}>Full name</label><input type="text" placeholder="Your full name" value={name} onChange={e => { setName(e.target.value); setError(''); }} className={inputClass} /></div>
        <div><label className={labelClass}>Work email</label><input type="email" placeholder="you@healthsystem.org" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} className={inputClass} autoComplete="email" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={labelClass}>ACO Name</label><input type="text" placeholder="ACO name" value={acoName} onChange={e => { setAcoName(e.target.value); setError(''); }} className={inputClass} /></div>
          <div><label className={labelClass}>ACO ID</label><input type="text" placeholder="e.g. A00001" value={acoId} onChange={e => { setAcoId(e.target.value); setError(''); }} className={inputClass} /></div>
        </div>
        <div><label className={labelClass}>Password</label><input type="password" placeholder="Min. 6 characters" value={password} onChange={e => { setPassword(e.target.value); setError(''); }} className={inputClass} /></div>
        <div><label className={labelClass}>Confirm</label><input type="password" placeholder="Repeat password" value={confirm} onChange={e => { setConfirm(e.target.value); setError(''); }} className={inputClass} /></div>
        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60 text-white font-semibold text-sm px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:-translate-y-0.5 mt-2">
          {loading ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Creating…</> : <>Create ACO Account <ArrowRight className="w-4 h-4" /></>}
        </button>
      </form>
      <p className="text-center text-sm text-slate-400 mt-6">
        Have an account? <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">Sign in</Link>
      </p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function SignupPage() {
  const [role, setRole] = useState<UserRole | null>(null);

  return (
    <div className="min-h-screen flex overflow-hidden bg-white">
      <style>{`
        @keyframes float1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-20px,30px) scale(1.1)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(15px,-25px) scale(0.9)} }
        .orb1 { animation: float1 9s ease-in-out infinite; }
        .orb2 { animation: float2 7s ease-in-out infinite; }
        @keyframes slideRight { from{opacity:0;transform:translateX(-30px)} to{opacity:1;transform:translateX(0)} }
        .slide-r { animation: slideRight 0.5s ease forwards; }
      `}</style>

      {/* ── LEFT: Branding (mirrored from login) ───────────────────────── */}
      <div className="hidden lg:flex relative w-[48%] flex-shrink-0 items-center justify-center bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 overflow-hidden">
        <div className="orb1 absolute top-[15%] left-[20%] w-36 h-36 rounded-full bg-white/10 blur-xl" />
        <div className="orb2 absolute bottom-[15%] right-[15%] w-44 h-44 rounded-full bg-pink-400/15 blur-2xl" />
        <div className="absolute top-[10%] right-[10%] w-14 h-14 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 opacity-80 orb1" />
        <div className="absolute bottom-[20%] left-[25%] w-8 h-8 rounded-full bg-gradient-to-br from-cyan-300 to-blue-400 opacity-60 orb2" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

        {/* Wavy edge */}
        <div className="absolute top-0 right-0 h-full w-24 z-20 pointer-events-none">
          <svg viewBox="0 0 100 800" preserveAspectRatio="none" className="h-full w-full" fill="white">
            <path d="M100,0 L100,800 L0,800 C30,700 70,650 30,550 C-10,450 60,350 30,250 C0,150 50,50 100,0 Z" />
          </svg>
        </div>

        <div className="relative z-10 text-center px-12 max-w-md">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mx-auto mb-8 shadow-2xl">
            <Activity className="w-8 h-8 text-white" strokeWidth={2} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 leading-snug">
            Join ContractIQ
          </h2>
          <p className="text-white/70 text-sm leading-relaxed mb-8">
            Create your workspace and start analyzing ACO contract performance with AI-powered predictions and real-time analytics.
          </p>
          <Link to="/login"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-white/10 border border-white/25 text-white font-semibold text-sm hover:bg-white/20 transition-all backdrop-blur-sm">
            Already have an account? Sign in
          </Link>
        </div>
      </div>

      {/* ── RIGHT: Form panel ──────────────────────────────────────────── */}
      <div className="relative flex-1 flex items-center justify-center px-8 py-12 z-10">
        <div className="slide-r w-full flex justify-center">
          {role === null  && <RoleStep onSelect={setRole} />}
          {role === 'CMS' && <CmsForm  onBack={() => setRole(null)} />}
          {role === 'ACO' && <AcoForm  onBack={() => setRole(null)} />}
        </div>
      </div>
    </div>
  );
}
