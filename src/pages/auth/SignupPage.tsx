import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity, Building2, Stethoscope, ChevronLeft,
  AlertCircle, ArrowRight, CheckCircle2,
} from 'lucide-react';
import { Input } from '@/components/common/Input';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types/auth';

// ─── Shared left panel ────────────────────────────────────────────────────────
function LeftPanel({ role }: { role: UserRole | null }) {
  return (
    <div className="hidden lg:flex flex-col w-[480px] flex-shrink-0 bg-[#060c18] relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="absolute top-0 left-0 w-full h-[400px] bg-indigo-600/10 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-violet-600/8 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="relative flex flex-col h-full p-12">
        <div className="flex items-center gap-2.5 mb-auto">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-900/40">
            <Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-white text-lg">ContractIQ</span>
        </div>

        <div className="mt-16 mb-auto">
          <p className="text-indigo-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">Create your account</p>
          <h2 className="text-3xl font-bold text-white leading-snug mb-4">
            Get started with<br />
            <span className="text-indigo-400">ContractIQ</span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
            Choose your role to access a workspace built for your specific analytics needs — CMS portfolio oversight or ACO operational intelligence.
          </p>
        </div>

        <div className="space-y-3">
          {[
            { role: 'CMS' as UserRole, icon: <Building2 className="w-4 h-4" />, label: 'CMS Analyst', desc: 'Portfolio-wide ACO analytics & oversight', active: role === 'CMS', color: 'text-indigo-300 border-indigo-500/30 bg-indigo-500/10' },
            { role: 'ACO' as UserRole, icon: <Stethoscope className="w-4 h-4" />, label: 'ACO Operator', desc: 'Operational performance & quality analytics', active: role === 'ACO', color: 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10' },
          ].map(r => (
            <div key={r.role} className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${r.active ? r.color : 'border-white/8 bg-white/3 text-slate-500'}`}>
              <div className={`flex-shrink-0 ${r.active ? '' : 'opacity-40'}`}>{r.icon}</div>
              <div>
                <p className={`text-xs font-semibold ${r.active ? '' : 'text-slate-500'}`}>{r.label}</p>
                <p className="text-[10px] text-slate-600">{r.desc}</p>
              </div>
              {r.active && <CheckCircle2 className="w-4 h-4 ml-auto flex-shrink-0" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Step 1: Role selection ───────────────────────────────────────────────────
function RoleSelector({ onSelect }: { onSelect: (role: UserRole) => void }) {
  const [hovered, setHovered] = useState<UserRole | null>(null);

  return (
    <div className="w-full max-w-md">
      {/* Mobile logo */}
      <div className="flex flex-col items-center mb-8 lg:hidden">
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 mb-3 shadow-lg shadow-indigo-200">
          <Activity className="w-6 h-6 text-white" strokeWidth={2.5} />
        </div>
        <h1 className="text-xl font-bold text-slate-800">ContractIQ</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-slate-100 p-8">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-1">Choose your account type</h2>
          <p className="text-sm text-slate-400">Your role determines your analytics workspace</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {([
            {
              role: 'CMS' as UserRole,
              icon: <Building2 className="w-7 h-7" />,
              label: 'CMS',
              sub: 'Centers for Medicare & Medicaid Services analyst',
              activeClass: 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100',
              iconActiveClass: 'bg-indigo-600 text-white',
              iconIdleClass: 'bg-slate-100 text-slate-500',
            },
            {
              role: 'ACO' as UserRole,
              icon: <Stethoscope className="w-7 h-7" />,
              label: 'ACO',
              sub: 'Accountable Care Organization operator',
              activeClass: 'border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-100',
              iconActiveClass: 'bg-emerald-600 text-white',
              iconIdleClass: 'bg-slate-100 text-slate-500',
            },
          ] as const).map(c => (
            <button
              key={c.role}
              type="button"
              onClick={() => onSelect(c.role)}
              onMouseEnter={() => setHovered(c.role)}
              onMouseLeave={() => setHovered(null)}
              className={[
                'flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-150 text-center',
                hovered === c.role ? c.activeClass : 'border-slate-200 bg-white hover:border-slate-300',
              ].join(' ')}
            >
              <div className={`flex items-center justify-center w-14 h-14 rounded-2xl transition-colors ${hovered === c.role ? c.iconActiveClass : c.iconIdleClass}`}>
                {c.icon}
              </div>
              <div>
                <p className="text-base font-bold text-slate-800">{c.label}</p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{c.sub}</p>
              </div>
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 hover:underline font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

// ─── CMS form ─────────────────────────────────────────────────────────────────
function CmsForm({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate();
  const { signupCms } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim() || !password || !confirm) { setError('All fields are required.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    setTimeout(() => {
      const r = signupCms({ name: name.trim(), email: email.trim(), password });
      setLoading(false);
      if (!r.success) { setError(r.error ?? 'Signup failed.'); return; }
      navigate('/cms/dashboard', { replace: true });
    }, 400);
  };

  return (
    <div className="w-full max-w-sm">
      <div className="flex flex-col items-center mb-8 lg:hidden">
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 mb-3">
          <Activity className="w-6 h-6 text-white" strokeWidth={2.5} />
        </div>
        <h1 className="text-xl font-bold text-slate-800">ContractIQ</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-slate-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <button type="button" onClick={onBack} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors" aria-label="Back">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-800 leading-none">CMS Account</h2>
            <p className="text-xs text-slate-400 mt-0.5">Create your CMS analyst workspace</p>
          </div>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-600">
            <Building2 className="w-3 h-3" /> CMS
          </span>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 mb-5">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-xs text-red-600 font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={submit} className="space-y-4" noValidate>
          <Input label="Full name"   type="text"     placeholder="Your full name"      value={name}     onChange={e => { setName(e.target.value);     setError(''); }} required />
          <Input label="Work email"  type="email"    placeholder="you@cms.hhs.gov"     value={email}    onChange={e => { setEmail(e.target.value);    setError(''); }} autoComplete="email" required />
          <Input label="Password"    type="password" placeholder="Min. 6 characters"   value={password} onChange={e => { setPassword(e.target.value); setError(''); }} required />
          <Input label="Confirm"     type="password" placeholder="Repeat password"     value={confirm}  onChange={e => { setConfirm(e.target.value);  setError(''); }} required />
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm px-4 py-3 rounded-xl transition-all shadow-lg shadow-indigo-200 mt-2"
          >
            {loading ? 'Creating…' : <><span>Create CMS Account</span><ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>
        <p className="text-center text-xs text-slate-400 mt-5">
          Have an account? <Link to="/login" className="text-indigo-600 hover:underline font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

// ─── ACO form ─────────────────────────────────────────────────────────────────
function AcoForm({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate();
  const { signupAco } = useAuth();
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [acoName, setAcoName] = useState('');
  const [acoId, setAcoId]     = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim() || !password || !confirm || !acoName.trim() || !acoId.trim()) { setError('All fields are required.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    setTimeout(() => {
      const r = signupAco({ name: name.trim(), email: email.trim(), password, acoName: acoName.trim(), acoId: acoId.trim() });
      setLoading(false);
      if (!r.success) { setError(r.error ?? 'Signup failed.'); return; }
      navigate('/aco/dashboard', { replace: true });
    }, 400);
  };

  return (
    <div className="w-full max-w-sm">
      <div className="flex flex-col items-center mb-8 lg:hidden">
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 mb-3">
          <Activity className="w-6 h-6 text-white" strokeWidth={2.5} />
        </div>
        <h1 className="text-xl font-bold text-slate-800">ContractIQ</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-slate-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <button type="button" onClick={onBack} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors" aria-label="Back">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-800 leading-none">ACO Account</h2>
            <p className="text-xs text-slate-400 mt-0.5">Register your ACO organization</p>
          </div>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-600">
            <Stethoscope className="w-3 h-3" /> ACO
          </span>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 mb-5">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-xs text-red-600 font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={submit} className="space-y-4" noValidate>
          <Input label="Full name"   type="text"     placeholder="Your full name"           value={name}     onChange={e => { setName(e.target.value);     setError(''); }} required />
          <Input label="Work email"  type="email"    placeholder="you@healthsystem.org"      value={email}    onChange={e => { setEmail(e.target.value);    setError(''); }} autoComplete="email" required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="ACO Name" type="text" placeholder="Your ACO name" value={acoName} onChange={e => { setAcoName(e.target.value); setError(''); }} required />
            <Input label="ACO ID"   type="text" placeholder="e.g. ACO-001"  value={acoId}   onChange={e => { setAcoId(e.target.value);   setError(''); }} required />
          </div>
          <Input label="Password"    type="password" placeholder="Min. 6 characters"         value={password} onChange={e => { setPassword(e.target.value); setError(''); }} required />
          <Input label="Confirm"     type="password" placeholder="Repeat password"            value={confirm}  onChange={e => { setConfirm(e.target.value);  setError(''); }} required />
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-sm px-4 py-3 rounded-xl transition-all shadow-lg shadow-emerald-200 mt-2"
          >
            {loading ? 'Creating…' : <><span>Create ACO Account</span><ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>
        <p className="text-center text-xs text-slate-400 mt-5">
          Have an account? <Link to="/login" className="text-indigo-600 hover:underline font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

// ─── Main orchestrator ────────────────────────────────────────────────────────
export function SignupPage() {
  const [role, setRole] = useState<UserRole | null>(null);

  return (
    <div className="min-h-screen flex">
      <LeftPanel role={role} />
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-6">
        {role === null  && <RoleSelector onSelect={setRole} />}
        {role === 'CMS' && <CmsForm onBack={() => setRole(null)} />}
        {role === 'ACO' && <AcoForm onBack={() => setRole(null)} />}
      </div>
    </div>
  );
}
