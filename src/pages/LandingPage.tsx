import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity, BarChart3, Shield, Zap, TrendingUp, Users,
  ArrowRight, CheckCircle2, Lock, Brain, LineChart,
  GitBranch, FileBarChart, ChevronDown, DollarSign,
  AlertTriangle, PieChart, Star, Sparkles,
} from 'lucide-react';

// ─── Animated counter ─────────────────────────────────────────────────────────
function Counter({ to, suffix = '', duration = 1600 }: { to: number; suffix?: string; duration?: number }) {
  const [val, setVal]       = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const steps = 60; const inc = to / steps; let cur = 0;
    const t = setInterval(() => {
      cur += inc;
      if (cur >= to) { setVal(to); clearInterval(t); } else setVal(Math.round(cur));
    }, duration / steps);
    return () => clearInterval(t);
  }, [started, to, duration]);

  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

// ─── Floating particle dot ────────────────────────────────────────────────────
function Particle({ style }: { style: React.CSSProperties }) {
  return <span className="absolute rounded-full bg-indigo-400/20 pointer-events-none animate-pulse" style={style} />;
}

// ─── Minimal SVG sparkline ────────────────────────────────────────────────────
function Sparkline({ data, color = '#6366f1' }: { data: number[]; color?: string }) {
  const w = 80; const h = 28;
  const min = Math.min(...data); const max = Math.max(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Live dashboard mockup ────────────────────────────────────────────────────
function DashMockup() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 2000);
    return () => clearInterval(t);
  }, []);

  const savingsData = [3.4, 3.9, 4.6, 4.9, 5.0 + (tick % 3) * 0.2, 5.4, 5.7, 5.7 + (tick % 2) * 0.1];
  const qualityData = [82, 83, 83.5, 84, 84.2 + (tick % 4) * 0.1, 84.5, 84.8, 85];

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      {/* Glow halo */}
      <div className="absolute -inset-6 bg-indigo-500/8 rounded-3xl blur-2xl pointer-events-none" />
      <div className="absolute -inset-2 bg-gradient-to-b from-indigo-500/5 to-transparent rounded-3xl pointer-events-none" />

      {/* Browser chrome */}
      <div className="relative bg-[#0d1220] border border-white/10 rounded-2xl overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.5)]">
        {/* Top bar */}
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/10 bg-[#080d18]">
          <div className="flex gap-1.5 flex-shrink-0">
            <span className="w-3 h-3 rounded-full bg-red-500/70" />
            <span className="w-3 h-3 rounded-full bg-amber-500/70" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/70" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-4 py-1">
              <Lock className="w-2.5 h-2.5 text-emerald-400" />
              <span className="text-[11px] text-slate-500 font-mono">contractiq.io/cms/dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[11px] text-slate-400 font-semibold">ContractIQ</span>
          </div>
        </div>

        {/* Dashboard content */}
        <div className="flex">
          {/* Mini sidebar */}
          <div className="hidden sm:flex flex-col w-44 border-r border-white/5 bg-[#080d18] p-3 gap-1 flex-shrink-0">
            <p className="text-[8px] text-indigo-400 font-bold uppercase tracking-widest px-2 mb-1">CMS Analytics</p>
            {['Dashboard', 'Analytics', 'Predictions', 'Risk Analysis', 'Forecast', 'Twin ACO'].map((item, i) => (
              <div key={item} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-[10px] font-medium ${i === 0 ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/25' : 'text-slate-500 hover:text-slate-300'}`}>
                <span className="w-1 h-1 rounded-full bg-current flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>

          {/* Main area */}
          <div className="flex-1 p-4 space-y-3 min-w-0">
            {/* KPI row */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { l: 'Portfolio Savings', v: '$74.5M', d: [64,68,72,75,78,80,82,82], c: '#10b981' },
                { l: 'Beneficiaries',     v: '214K',   d: [200,203,205,207,209,211,213,214], c: '#6366f1' },
                { l: 'Quality Score',     v: '84.2',   d: [81,82,82.5,83,83.5,84,84.1,84.2], c: '#0ea5e9' },
                { l: 'At-Risk ACOs',      v: '3/24',   d: [7,6,6,5,5,4,3,3], c: '#f59e0b' },
              ].map(k => (
                <div key={k.l} className="bg-white/5 border border-white/5 rounded-xl p-2.5">
                  <p className="text-[8px] text-slate-500 mb-1">{k.l}</p>
                  <p className="text-sm font-bold mb-1" style={{ color: k.c }}>{k.v}</p>
                  <Sparkline data={k.d} color={k.c} />
                </div>
              ))}
            </div>

            {/* Chart area */}
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 bg-white/5 border border-white/5 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] text-slate-400 font-medium">Expenditure PMPM vs Benchmark</p>
                  <span className="text-[8px] text-emerald-400 font-semibold">↑ 5.7% savings</span>
                </div>
                <div className="flex items-end gap-1 h-14">
                  {savingsData.map((v, i) => (
                    <div key={i} className="flex-1 flex flex-col justify-end gap-0.5">
                      <div className="bg-slate-700/50 rounded-sm transition-all duration-500" style={{ height: `${(v / 7) * 100}%` }} />
                      <div className="bg-indigo-500/80 rounded-sm transition-all duration-500" style={{ height: `${((v + 0.5) / 7) * 100}%` }} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-xl p-3">
                <p className="text-[9px] text-slate-400 font-medium mb-2">ACO Status</p>
                {[
                  { l: 'Exceeded',   p: 25, c: '#0ea5e9' },
                  { l: 'On Track',   p: 50, c: '#10b981' },
                  { l: 'At Risk',    p: 17, c: '#f59e0b' },
                  { l: 'Review',     p: 8,  c: '#ef4444' },
                ].map(s => (
                  <div key={s.l} className="flex items-center gap-1.5 mb-1.5">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.c }} />
                    <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${s.p}%`, backgroundColor: s.c }} />
                    </div>
                    <span className="text-[8px] text-slate-600 w-5 text-right">{s.p}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mini table */}
            <div className="bg-white/5 border border-white/5 rounded-xl overflow-hidden">
              <div className="grid grid-cols-4 px-3 py-1.5 border-b border-white/5">
                {['ACO Name', 'Track', 'Quality', 'Savings'].map(h => (
                  <span key={h} className="text-[8px] text-slate-600 font-semibold uppercase">{h}</span>
                ))}
              </div>
              {[
                { name: 'Northeast Alliance', track: 'Track 1B', q: 88.2, s: '+4.2%', sc: '#10b981' },
                { name: 'Midwest Premier',    track: 'Track 3',  q: 91.5, s: '+6.8%', sc: '#0ea5e9' },
                { name: 'Gulf Coast Care',    track: 'Track 1A', q: 74.8, s: '+1.6%', sc: '#f59e0b' },
              ].map(r => (
                <div key={r.name} className="grid grid-cols-4 px-3 py-1.5 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                  <span className="text-[9px] text-slate-300 font-medium truncate">{r.name}</span>
                  <span className="text-[9px] text-slate-500">{r.track}</span>
                  <span className="text-[9px] text-slate-300 font-semibold">{r.q}</span>
                  <span className="text-[9px] font-bold" style={{ color: r.sc }}>{r.s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live indicator */}
        <div className="absolute bottom-3 right-4 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[9px] text-emerald-400 font-medium">Live</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function LandingPage() {
  const navigate  = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Particle positions (fixed so no hydration issues)
  const particles = [
    { width: 6,  height: 6,  top: '12%', left: '8%',   animationDelay: '0s',    animationDuration: '6s'  },
    { width: 4,  height: 4,  top: '25%', left: '92%',  animationDelay: '1s',    animationDuration: '8s'  },
    { width: 8,  height: 8,  top: '60%', left: '5%',   animationDelay: '2s',    animationDuration: '7s'  },
    { width: 3,  height: 3,  top: '80%', left: '88%',  animationDelay: '0.5s',  animationDuration: '9s'  },
    { width: 5,  height: 5,  top: '45%', left: '95%',  animationDelay: '3s',    animationDuration: '6s'  },
    { width: 7,  height: 7,  top: '70%', left: '15%',  animationDelay: '1.5s',  animationDuration: '10s' },
  ];

  return (
    <div className="min-h-screen bg-[#060c18] text-white font-sans overflow-x-hidden selection:bg-indigo-500/30">
      <style>{`
        @keyframes floatUp {
          0%,100% { transform: translateY(0px) scale(1); opacity: 0.3; }
          50%      { transform: translateY(-20px) scale(1.1); opacity: 0.6; }
        }
        .float-particle { animation: floatUp var(--dur,6s) ease-in-out infinite; animation-delay: var(--delay,0s); }
        @keyframes gradShift {
          0%,100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
        .grad-text {
          background: linear-gradient(135deg, #818cf8, #c084fc, #38bdf8, #818cf8);
          background-size: 300% 300%;
          animation: gradShift 6s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .card-glow:hover { box-shadow: 0 0 24px rgba(99,102,241,0.15), 0 4px 24px rgba(0,0,0,0.3); }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .slide-in { animation: slideInUp 0.7s ease forwards; }
        .slide-in-2 { animation: slideInUp 0.7s 0.15s ease forwards; opacity: 0; }
        .slide-in-3 { animation: slideInUp 0.7s 0.3s ease forwards; opacity: 0; }
      `}</style>

      {/* ── FIXED NAV ──────────────────────────────────────────────────────── */}
      <nav className={[
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-[#060c18]/95 backdrop-blur-xl border-b border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
          : '',
      ].join(' ')}>
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-10 h-16">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-900/50">
              <Activity className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-white text-base tracking-tight">ContractIQ</span>
            <span className="hidden md:block text-[10px] text-slate-600 border border-white/10 px-2 py-0.5 rounded-full ml-1">
              v2026
            </span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { label: 'Platform',    href: '#platform'  },
              { label: 'Features',    href: '#features'  },
              { label: 'For CMS',     href: '#roles'     },
              { label: 'For ACO',     href: '#roles'     },
            ].map(l => (
              <a key={l.label} href={l.href}
                className="text-sm text-slate-500 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-all duration-150">
                {l.label}
              </a>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="flex items-center gap-2">
            <Link to="/login"
              className="hidden sm:block text-sm font-medium text-slate-400 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-all">
              Sign in
            </Link>
            <button onClick={() => navigate('/signup')}
              className="flex items-center gap-1.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-900/40 hover:shadow-indigo-900/60 hover:-translate-y-0.5">
              Get started <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-16 px-6 overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:80px_80px] pointer-events-none" />
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-violet-600/6 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-sky-600/6 rounded-full blur-3xl pointer-events-none" />
        {/* Floating particles */}
        {particles.map((p, i) => (
          <Particle key={i} style={{
            position: 'absolute',
            width: p.width,
            height: p.height,
            top: p.top,
            left: p.left,
            animationDelay: p.animationDelay,
            animationDuration: p.animationDuration,
          } as React.CSSProperties} />
        ))}

        <div className="relative max-w-5xl mx-auto text-center z-10">
          {/* Eyebrow */}
          <div className="slide-in inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-8 backdrop-blur-sm">
            <Sparkles className="w-3 h-3 animate-pulse" />
            Value-Based Care · MSSP · ACO REACH · Direct Contracting · FY2026
          </div>

          {/* Headline */}
          <h1 className="slide-in-2 text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-6">
            The analytics platform<br />
            <span className="grad-text">VBC contracts deserve.</span>
          </h1>

          <p className="slide-in-3 text-slate-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-10">
            ContractIQ gives CMS oversight teams and ACO operators a unified platform to monitor
            performance, predict financial risk, and make data-driven decisions — in real time.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button onClick={() => navigate('/signup')}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-[0_8px_32px_rgba(99,102,241,0.35)] hover:shadow-[0_12px_40px_rgba(99,102,241,0.5)] hover:-translate-y-1 text-sm">
              Start for free — no card required <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => navigate('/login')}
              className="flex items-center gap-2 text-slate-300 hover:text-white font-medium px-8 py-4 rounded-xl border border-white/10 hover:border-indigo-500/40 bg-white/5 hover:bg-white/5 transition-all duration-200 text-sm backdrop-blur-sm">
              Sign in to your workspace
            </button>
          </div>

          {/* Trust row */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-600 mb-20">
            {[
              { icon: <Lock className="w-3.5 h-3.5" />,   label: 'HIPAA-aligned'          },
              { icon: <Shield className="w-3.5 h-3.5" />, label: 'Role-based access'       },
              { icon: <Star className="w-3.5 h-3.5" />,   label: 'CMS MSSP certified'      },
              { icon: <Zap className="w-3.5 h-3.5" />,    label: 'Real-time analytics'     },
              { icon: <Brain className="w-3.5 h-3.5" />,  label: 'AI-powered predictions'  },
            ].map(b => (
              <span key={b.label} className="flex items-center gap-1.5 hover:text-slate-400 transition-colors cursor-default">
                {b.icon} {b.label}
              </span>
            ))}
          </div>

          {/* Dashboard mockup */}
          <DashMockup />

          {/* Scroll cue */}
          <a href="#platform" className="flex flex-col items-center gap-2 text-slate-600 hover:text-slate-400 transition-colors mt-12 mx-auto w-fit">
            <span className="text-xs">Scroll to explore</span>
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </a>
        </div>
      </section>

      {/* ── STATS ──────────────────────────────────────────────────────────── */}
      <section id="platform" className="py-24 px-6 border-y border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(99,102,241,0.05)_0%,transparent_70%)] pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-16">
            <p className="text-indigo-400 text-xs font-bold uppercase tracking-[0.2em] mb-3">Platform Scale</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Built for enterprise VBC analytics</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-14">
            {[
              { to: 500,  suffix: '+',  label: 'ACOs Supported',         icon: <Users className="w-5 h-5 text-indigo-400" />,   glow: 'shadow-indigo-900/30' },
              { to: 2,    suffix: 'M+', label: 'Beneficiaries Tracked',  icon: <Activity className="w-5 h-5 text-emerald-400" />, glow: 'shadow-emerald-900/30' },
              { to: 98,   suffix: '%',  label: 'Prediction Accuracy',    icon: <Brain className="w-5 h-5 text-violet-400" />,   glow: 'shadow-violet-900/30' },
              { to: 4,    suffix: 'x',  label: 'Faster Reporting',       icon: <Zap className="w-5 h-5 text-amber-400" />,     glow: 'shadow-amber-900/30' },
            ].map(s => (
              <div key={s.label} className={`group flex flex-col items-center text-center p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/5 hover:border-white/10 transition-all duration-300 card-glow`}>
                <div className={`flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-white/10 mb-4 shadow-lg ${s.glow} group-hover:scale-110 transition-transform`}>
                  {s.icon}
                </div>
                <p className="text-4xl font-bold text-white mb-1.5">
                  <Counter to={s.to} suffix={s.suffix} />
                </p>
                <p className="text-slate-500 text-sm">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Live metric cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Portfolio Savings YTD', value: '$74.5M', delta: '+3.2%', data: [52,58,64,68,72,75,78,80], color: '#10b981', icon: <DollarSign className="w-4 h-4" /> },
              { title: 'Avg Quality Composite', value: '84.2',   delta: '+2.1 pts', data: [80,81,81.5,82,82.5,83,83.8,84.2], color: '#6366f1', icon: <PieChart className="w-4 h-4" /> },
              { title: 'At-Risk ACO Count',      value: '3 / 24', delta: '↓ Improving', data: [7,7,6,5,5,4,4,3], color: '#f59e0b', icon: <AlertTriangle className="w-4 h-4" /> },
            ].map(m => (
              <div key={m.title} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/5 hover:border-white/10 transition-all duration-200 card-glow">
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/5 border border-white/10" style={{ color: m.color }}>{m.icon}</div>
                    <p className="text-xs text-slate-500">{m.title}</p>
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">{m.value}</p>
                  <p className="text-xs font-medium" style={{ color: m.color }}>{m.delta}</p>
                </div>
                <Sparkline data={m.data} color={m.color} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────────────────── */}
      <section id="features" className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-indigo-400 text-xs font-bold uppercase tracking-[0.2em] mb-3">Capabilities</p>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-5 leading-tight">
              The complete VBC analytics stack
            </h2>
            <p className="text-slate-400 text-base max-w-xl mx-auto">
              From financial benchmarking to AI-powered risk prediction — every layer of the analytics lifecycle, in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: <LineChart className="w-5 h-5" />,    c: 'indigo',  title: 'Contract Performance',    desc: 'Monitor savings rates, benchmark expenditure, and PMPM trends across all active contracts with YTD monthly drill-downs.' },
              { icon: <Brain className="w-5 h-5" />,        c: 'violet',  title: 'AI-Powered Predictions',  desc: 'Forecast risk scores, savings trajectories, and quality performance using an 8-input machine learning model.' },
              { icon: <BarChart3 className="w-5 h-5" />,    c: 'sky',     title: 'Portfolio Analytics',     desc: 'Compare ACO performance across regions, tracks, and benchmarks. Multi-select up to 6 ACOs for side-by-side comparison.' },
              { icon: <GitBranch className="w-5 h-5" />,    c: 'emerald', title: 'Twin ACO Matching',       desc: 'Identify statistically similar ACOs to benchmark performance and uncover improvement strategies from peers.' },
              { icon: <TrendingUp className="w-5 h-5" />,   c: 'amber',   title: 'Expenditure Forecasting', desc: 'Project year-end financial performance with quarter-by-quarter savings and quality score trajectories over 4 periods.' },
              { icon: <FileBarChart className="w-5 h-5" />, c: 'rose',    title: 'Risk Stratification',     desc: 'Track composite quality scores, RAF-based risk bands, utilization metrics, and cost drivers with provider-level attribution.' },
            ].map(f => {
              const colors: Record<string, { border: string; bg: string; iconBg: string; iconText: string }> = {
                indigo:  { border: 'border-indigo-500/20',  bg: 'from-indigo-500/8 to-transparent',  iconBg: 'bg-indigo-500/15',  iconText: 'text-indigo-300'  },
                violet:  { border: 'border-violet-500/20',  bg: 'from-violet-500/8 to-transparent',  iconBg: 'bg-violet-500/15',  iconText: 'text-violet-300'  },
                sky:     { border: 'border-sky-500/20',     bg: 'from-sky-500/8 to-transparent',     iconBg: 'bg-sky-500/15',     iconText: 'text-sky-300'     },
                emerald: { border: 'border-emerald-500/20', bg: 'from-emerald-500/8 to-transparent', iconBg: 'bg-emerald-500/15', iconText: 'text-emerald-300' },
                amber:   { border: 'border-amber-500/20',   bg: 'from-amber-500/8 to-transparent',   iconBg: 'bg-amber-500/15',   iconText: 'text-amber-300'   },
                rose:    { border: 'border-rose-500/20',    bg: 'from-rose-500/8 to-transparent',    iconBg: 'bg-rose-500/15',    iconText: 'text-rose-300'    },
              };
              const co = colors[f.c];
              return (
                <div key={f.title} className={`group bg-gradient-to-b ${co.bg} border ${co.border} rounded-2xl p-6 hover:scale-[1.02] hover:border-white/20 transition-all duration-200 cursor-default card-glow`}>
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${co.iconBg} ${co.iconText} border border-white/10 mb-4`}>
                    {f.icon}
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-2">{f.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── ROLES ──────────────────────────────────────────────────────────── */}
      <section id="roles" className="py-28 px-6 border-y border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.05)_0%,transparent_65%)] pointer-events-none" />
        <div className="max-w-5xl mx-auto relative">
          <div className="text-center mb-16">
            <p className="text-indigo-400 text-xs font-bold uppercase tracking-[0.2em] mb-3">Built for Two Roles</p>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-5">One platform. Two perspectives.</h2>
            <p className="text-slate-400 text-base max-w-lg mx-auto">
              Dedicated workspaces for CMS oversight teams and ACO operators — each tailored to their unique analytics needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CMS */}
            <div className="relative bg-gradient-to-b from-indigo-500/10 to-indigo-500/2 border border-indigo-500/20 rounded-2xl p-8 overflow-hidden group hover:border-indigo-400/30 transition-all duration-300 card-glow">
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-indigo-500/8 rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-500" />
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 text-xs font-bold mb-5">
                <Shield className="w-3 h-3" /> CMS · Centers for Medicare & Medicaid
              </span>
              <h3 className="text-white text-2xl font-bold mb-3">CMS Analysts</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-7">
                Macro-level oversight of all ACO contracts, portfolio-wide risk monitoring, and prediction tools for proactive intervention.
              </p>
              <ul className="space-y-2.5 mb-8">
                {[
                  'Portfolio-wide ACO performance dashboard',
                  'Multi-ACO comparison across regions & tracks',
                  'AI prediction & 8-input scenario analysis',
                  'Risk analysis with RAF score monitoring',
                  'Monthly trend analysis across all ACOs',
                  'Expenditure forecast modeling',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2.5 text-slate-300 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate('/login')}
                className="flex items-center gap-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-900/40 hover:-translate-y-0.5">
                Access CMS workspace <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* ACO */}
            <div className="relative bg-gradient-to-b from-emerald-500/10 to-emerald-500/2 border border-emerald-500/20 rounded-2xl p-8 overflow-hidden group hover:border-emerald-400/30 transition-all duration-300 card-glow">
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/8 rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-500" />
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 text-xs font-bold mb-5">
                <Activity className="w-3 h-3" /> ACO · Accountable Care Organizations
              </span>
              <h3 className="text-white text-2xl font-bold mb-3">ACO Operators</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-7">
                Deep-dive operational analytics for ACO administrators and clinical directors managing day-to-day performance.
              </p>
              <ul className="space-y-2.5 mb-8">
                {[
                  'ACO-specific financial performance dashboard',
                  'Quality domain analytics with benchmarks',
                  'Provider performance and attribution',
                  'Risk stratification and RAF score trending',
                  'Utilization management analytics',
                  'Peer benchmarking against similar ACOs',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2.5 text-slate-300 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate('/login')}
                className="flex items-center gap-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-900/40 hover:-translate-y-0.5">
                Access ACO workspace <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────────────────────── */}
      <section className="py-32 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-indigo-600/8 rounded-full blur-3xl" />
          <div className="absolute top-0 left-1/3 w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-400 text-xs font-medium mb-6">
            <Sparkles className="w-3 h-3 text-indigo-400" /> Join CMS teams and ACO operators
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
            Ready to transform your<br />contract analytics?
          </h2>
          <p className="text-slate-400 text-base mb-10 leading-relaxed">
            Get started today. No setup required — log in with demo credentials or create a free account.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate('/signup')}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-[0_8px_32px_rgba(99,102,241,0.3)] hover:shadow-[0_12px_48px_rgba(99,102,241,0.5)] hover:-translate-y-1 text-sm">
              Create free account <ArrowRight className="w-4 h-4" />
            </button>
            <Link to="/login"
              className="text-slate-400 hover:text-white font-medium px-8 py-4 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/5 transition-all duration-200 text-sm">
              Sign in with demo account
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 px-8 py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
              <Activity className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-slate-400 text-sm font-bold">ContractIQ</span>
            <span className="text-slate-700 text-xs ml-2 hidden sm:block">Intelligent Contract Performance Analytics</span>
          </div>
          <p className="text-slate-700 text-xs">© 2026 ContractIQ · Demo platform — not for production clinical use</p>
          <div className="flex items-center gap-6 text-xs">
            <Link to="/login"  className="text-slate-600 hover:text-slate-300 transition-colors">Sign in</Link>
            <Link to="/signup" className="text-slate-600 hover:text-slate-300 transition-colors">Create account</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

