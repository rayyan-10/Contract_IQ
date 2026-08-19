import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Building2, Stethoscope, ChevronLeft, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types/auth';

// ─── Step 1: Role selection ────────────────────────────────────────────────────

function RoleSelector({ onSelect }: { onSelect: (role: UserRole) => void }) {
  const [hovered, setHovered] = useState<UserRole | null>(null);

  return (
    <div className="w-full max-w-lg">
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-600 mb-3">
          <Activity className="w-6 h-6 text-white" strokeWidth={2.5} />
        </div>
        <h1 className="text-xl font-bold text-slate-800">ContractIQ</h1>
        <p className="text-xs text-slate-400 mt-1">Intelligent Contract Performance Analytics</p>
      </div>

      <div className="bg-white rounded-2xl shadow-card-md border border-surface-border p-8">
        <h2 className="text-base font-semibold text-slate-800 mb-1 text-center">Choose your account type</h2>
        <p className="text-xs text-slate-400 text-center mb-7">
          Select the role that best describes your organization
        </p>

        <div className="grid grid-cols-2 gap-4">
          {/* CMS card */}
          <button
            type="button"
            onClick={() => onSelect('CMS')}
            onMouseEnter={() => setHovered('CMS')}
            onMouseLeave={() => setHovered(null)}
            className={[
              'relative flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-150 text-left',
              hovered === 'CMS'
                ? 'border-brand-500 bg-brand-50 shadow-card-md'
                : 'border-surface-border bg-white hover:border-brand-300',
            ].join(' ')}
          >
            <div className={`flex items-center justify-center w-12 h-12 rounded-xl transition-colors ${hovered === 'CMS' ? 'bg-brand-600' : 'bg-slate-100'}`}>
              <Building2 className={`w-6 h-6 ${hovered === 'CMS' ? 'text-white' : 'text-slate-500'}`} />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-800">CMS</p>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Centers for Medicare &amp; Medicaid Services analyst
              </p>
            </div>
          </button>

          {/* ACO card */}
          <button
            type="button"
            onClick={() => onSelect('ACO')}
            onMouseEnter={() => setHovered('ACO')}
            onMouseLeave={() => setHovered(null)}
            className={[
              'relative flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-150 text-left',
              hovered === 'ACO'
                ? 'border-brand-500 bg-brand-50 shadow-card-md'
                : 'border-surface-border bg-white hover:border-brand-300',
            ].join(' ')}
          >
            <div className={`flex items-center justify-center w-12 h-12 rounded-xl transition-colors ${hovered === 'ACO' ? 'bg-brand-600' : 'bg-slate-100'}`}>
              <Stethoscope className={`w-6 h-6 ${hovered === 'ACO' ? 'text-white' : 'text-slate-500'}`} />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-800">ACO</p>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Accountable Care Organization operator or administrator
              </p>
            </div>
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-slate-400 mt-5">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-600 hover:underline font-medium">Sign in</Link>
      </p>
    </div>
  );
}

// ─── Step 2a: CMS form ─────────────────────────────────────────────────────────

function CmsForm({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate();
  const { signupCms } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password || !confirm) {
      setError('All fields are required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const result = signupCms({ name: name.trim(), email: email.trim(), password });
      setLoading(false);
      if (!result.success) {
        setError(result.error ?? 'Signup failed.');
        return;
      }
      navigate('/cms/dashboard', { replace: true });
    }, 400);
  };

  return (
    <div className="w-full max-w-sm">
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-600 mb-3">
          <Activity className="w-6 h-6 text-white" strokeWidth={2.5} />
        </div>
        <h1 className="text-xl font-bold text-slate-800">ContractIQ</h1>
        <p className="text-xs text-slate-400 mt-1">Intelligent Contract Performance Analytics</p>
      </div>

      <div className="bg-white rounded-2xl shadow-card-md border border-surface-border p-8">
        <div className="flex items-center gap-2 mb-6">
          <button
            type="button"
            onClick={onBack}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Back"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-base font-semibold text-slate-800 leading-none">CMS Account</h2>
            <p className="text-xs text-slate-400 mt-0.5">Create your CMS analyst account</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-50 border border-brand-200">
            <Building2 className="w-3 h-3 text-brand-600" />
            <span className="text-xs font-semibold text-brand-600">CMS</span>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 mb-4">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <Input
            label="Full name"
            type="text"
            placeholder="Your full name"
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            required
          />
          <Input
            label="Work email"
            type="email"
            placeholder="you@cms.hhs.gov"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }}
            autoComplete="email"
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="Min. 6 characters"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
            required
          />
          <Input
            label="Confirm password"
            type="password"
            placeholder="Repeat password"
            value={confirm}
            onChange={e => { setConfirm(e.target.value); setError(''); }}
            required
          />
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full justify-center mt-1"
          >
            Create CMS Account
          </Button>
        </form>
      </div>

      <p className="text-center text-xs text-slate-400 mt-5">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-600 hover:underline font-medium">Sign in</Link>
      </p>
    </div>
  );
}

// ─── Step 2b: ACO form ─────────────────────────────────────────────────────────

function AcoForm({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate();
  const { signupAco } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [acoName, setAcoName] = useState('');
  const [acoId, setAcoId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password || !confirm || !acoName.trim() || !acoId.trim()) {
      setError('All fields are required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const result = signupAco({
        name: name.trim(),
        email: email.trim(),
        password,
        acoName: acoName.trim(),
        acoId: acoId.trim(),
      });
      setLoading(false);
      if (!result.success) {
        setError(result.error ?? 'Signup failed.');
        return;
      }
      navigate('/aco/dashboard', { replace: true });
    }, 400);
  };

  return (
    <div className="w-full max-w-sm">
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-600 mb-3">
          <Activity className="w-6 h-6 text-white" strokeWidth={2.5} />
        </div>
        <h1 className="text-xl font-bold text-slate-800">ContractIQ</h1>
        <p className="text-xs text-slate-400 mt-1">Intelligent Contract Performance Analytics</p>
      </div>

      <div className="bg-white rounded-2xl shadow-card-md border border-surface-border p-8">
        <div className="flex items-center gap-2 mb-6">
          <button
            type="button"
            onClick={onBack}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Back"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-base font-semibold text-slate-800 leading-none">ACO Account</h2>
            <p className="text-xs text-slate-400 mt-0.5">Register your ACO organization</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
            <Stethoscope className="w-3 h-3 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-600">ACO</span>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 mb-4">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <Input
            label="Full name"
            type="text"
            placeholder="Your full name"
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            required
          />
          <Input
            label="Work email"
            type="email"
            placeholder="you@yourhealthsystem.org"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }}
            autoComplete="email"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="ACO Name"
              type="text"
              placeholder="ACO full name"
              value={acoName}
              onChange={e => { setAcoName(e.target.value); setError(''); }}
              required
            />
            <Input
              label="ACO ID"
              type="text"
              placeholder="e.g. ACO-001"
              value={acoId}
              onChange={e => { setAcoId(e.target.value); setError(''); }}
              required
            />
          </div>
          <Input
            label="Password"
            type="password"
            placeholder="Min. 6 characters"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
            required
          />
          <Input
            label="Confirm password"
            type="password"
            placeholder="Repeat password"
            value={confirm}
            onChange={e => { setConfirm(e.target.value); setError(''); }}
            required
          />
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full justify-center mt-1"
          >
            Create ACO Account
          </Button>
        </form>
      </div>

      <p className="text-center text-xs text-slate-400 mt-5">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-600 hover:underline font-medium">Sign in</Link>
      </p>
    </div>
  );
}

// ─── Main SignupPage orchestrator ─────────────────────────────────────────────

export function SignupPage() {
  const [role, setRole] = useState<UserRole | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      {role === null && <RoleSelector onSelect={setRole} />}
      {role === 'CMS'  && <CmsForm  onBack={() => setRole(null)} />}
      {role === 'ACO'  && <AcoForm  onBack={() => setRole(null)} />}
    </div>
  );
}
