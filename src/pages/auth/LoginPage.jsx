import React, { useState, useEffect } from 'react';
import {
  Pill,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';
import pharmacyIllustration from '../../assets/pharmacy-illustration.jpg';

/* ─── Tiny floating decorative shape ─── */
function FloatingPill({ style, className = '' }) {
  return (
    <span
      className={`absolute rounded-full opacity-20 pointer-events-none ${className}`}
      style={style}
    />
  );
}

export function LoginPage({ onLoginSuccess }) {
  const { login } = usePharmacy();

  /* ─── Form state ─── */
  const [selectedRole, setSelectedRole] = useState('owner'); // 'owner' | 'worker'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [userFocused, setUserFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 60);
    return () => clearTimeout(timer);
  }, []);

  /* ─── Login handler: verifies credentials against selected portal role ─── */
  const handleLogin = (e) => {
    e.preventDefault();
    if (isLoading || isSuccess) return;
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      // Pass selectedRole so the role is checked BEFORE currentUser is set
      const result = login(username, password, selectedRole);

      if (result.success) {
        setIsLoading(false);
        setIsSuccess(true);
        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess(result.user);
        }, 750);
      } else {
        // Login failed: stay on login page, display error message
        setIsLoading(false);
        setIsSuccess(false);
        setErrorMessage(result.message || 'Invalid username or password.');
      }
    }, 400);
  };

  /* ─── Role selection helper (DOES NOT LOG IN, ONLY SELECTS PORTAL ROLE) ─── */
  const handleSelectRole = (roleType) => {
    setSelectedRole(roleType);
    setErrorMessage('');
  };

  /* ─── Input base classes ─── */
  const inputBase =
    'w-full pl-11 pr-4 py-3.5 text-sm rounded-2xl border bg-white/70 backdrop-blur-sm ' +
    'font-medium placeholder:text-slate-400 outline-none transition-all duration-300 ' +
    'disabled:opacity-50 disabled:cursor-not-allowed';
  const inputIdle   = 'border-slate-200 hover:border-teal-300 hover:bg-white/90';
  const inputActive = 'border-teal-500 bg-white shadow-[0_0_0_4px_rgba(13,148,136,0.10)]';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden relative font-sans antialiased">

      {/* ── Animated gradient background ── */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: 'linear-gradient(135deg, #e6faf8 0%, #f0fdf9 35%, #e0f7f4 65%, #ccfbef 100%)',
          backgroundSize: '400% 400%',
          animation: 'loginBgPan 14s ease infinite',
        }}
      />

      {/* ── Ambient orbs ── */}
      <div
        className="animate-orb fixed top-[-80px] left-[-80px] w-[420px] h-[420px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(153,246,223,0.55) 0%, transparent 70%)' }}
      />
      <div
        className="animate-orb-delay fixed bottom-[-60px] right-[-60px] w-[380px] h-[380px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(94,234,212,0.4) 0%, transparent 70%)' }}
      />

      {/* ── Main card ── */}
      <div
        className={`
          relative w-full max-w-5xl rounded-[2.5rem] overflow-hidden z-10
          bg-white/85 backdrop-blur-xl
          shadow-[0_24px_80px_-12px_rgba(13,148,136,0.18),0_0_0_1px_rgba(13,148,136,0.08)]
          flex flex-col lg:flex-row min-h-[600px]
          ${isMounted ? 'animate-login-card' : 'opacity-0 translate-y-8'}
        `}
      >

        {/* ═══════════════════════════════════════
            LEFT — LOGIN FORM
        ═══════════════════════════════════════ */}
        <div
          className={`
            w-full lg:w-[47%] flex flex-col justify-center
            px-8 sm:px-10 lg:px-12 py-10 lg:py-14
            bg-white/95 relative z-10
            transition-transform duration-700 ease-in-out
            ${isSuccess ? 'lg:translate-x-[114%]' : 'lg:translate-x-0'}
          `}
        >
          <div className={isMounted ? 'animate-form-in' : 'opacity-0'}>

            {/* ── Logo ── */}
            <div className="flex items-center gap-3 mb-8">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg shadow-teal-500/30">
                  <Pill className="w-6 h-6 text-white -rotate-45" />
                </div>
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-teal-300 border-2 border-white animate-pulse-subtle" />
              </div>
              <div>
                <span className="block text-2xl font-black tracking-tight text-slate-900" style={{ fontFamily: 'var(--font-heading)' }}>
                  MEDORA
                </span>
                <span className="block text-[11px] font-semibold text-teal-600 tracking-widest uppercase mt-0.5">
                  Smart Pharmacy Operations
                </span>
              </div>
            </div>

            {/* ── Heading ── */}
            <div className="mb-6">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                Welcome Back!
              </h1>
            </div>

            {/* ── Error alert ── */}
            {errorMessage && (
              <div className="mb-5 flex items-start gap-2.5 px-4 py-3 rounded-2xl bg-rose-50 border border-rose-200 animate-fade-in">
                <span className="mt-[3px] w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                <p className="text-xs text-rose-700 font-medium leading-relaxed">{errorMessage}</p>
              </div>
            )}

            {/* ── Success toast ── */}
            {isSuccess && (
              <div className="mb-5 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-teal-50 border border-teal-200 animate-check-in">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <p className="text-xs text-teal-800 font-semibold">Credentials verified — entering portal…</p>
              </div>
            )}

            {/* ── Form ── */}
            <form onSubmit={handleLogin} className="space-y-4">

              {/* Username */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Username or Email
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${userFocused ? 'text-teal-600' : 'text-slate-400'}`}>
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="login-username"
                    type="text"
                    required
                    autoComplete="username"
                    disabled={isSuccess}
                    value={username}
                    onChange={e => { setUsername(e.target.value); setErrorMessage(''); }}
                    onFocus={() => setUserFocused(true)}
                    onBlur={() => setUserFocused(false)}
                    placeholder="Enter your username or email"
                    className={`${inputBase} ${userFocused ? inputActive : inputIdle}`}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${passFocused ? 'text-teal-600' : 'text-slate-400'}`}>
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    disabled={isSuccess}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setErrorMessage(''); }}
                    onFocus={() => setPassFocused(true)}
                    onBlur={() => setPassFocused(false)}
                    placeholder="Enter your password"
                    className={`${inputBase} pr-12 ${passFocused ? inputActive : inputIdle}`}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-teal-600 transition-colors duration-200"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none group">
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200 ${rememberMe ? 'border-teal-600 bg-teal-600' : 'border-slate-300 bg-white group-hover:border-teal-400'}`}
                    onClick={() => setRememberMe(v => !v)}
                  >
                    {rememberMe && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 8">
                        <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span className="text-xs text-slate-600 font-medium group-hover:text-slate-800 transition-colors">
                    Remember me
                  </span>
                </label>
              </div>

              {/* ── Login button ── */}
              <button
                id="login-submit"
                type="submit"
                disabled={isLoading || isSuccess}
                className={`
                  w-full relative overflow-hidden flex items-center justify-center gap-2.5
                  py-4 px-6 mt-3 rounded-2xl text-sm font-bold text-white
                  group transition-all duration-300
                  ${(isLoading || isSuccess)
                    ? 'bg-teal-500 opacity-80 cursor-not-allowed'
                    : 'bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 shadow-lg shadow-teal-600/25 hover:shadow-xl hover:shadow-teal-600/30 hover:-translate-y-0.5 active:translate-y-0'
                  }
                `}
              >
                {/* Shine sweep */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />

                {isLoading ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin-ring" />
                    <span>Verifying…</span>
                  </>
                ) : isSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Entering Portal…</span>
                  </>
                ) : (
                  <>
                    <span>Login</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* ── Portal selection buttons ── */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2.5">
                Select Portal
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  id="quick-owner-portal"
                  onClick={() => handleSelectRole('owner')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl
                    transition-all duration-200 cursor-pointer ${
                      selectedRole === 'owner'
                        ? 'bg-teal-50 border-2 border-teal-600 text-teal-900 shadow-sm shadow-teal-600/10'
                        : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-800'
                    }`}
                  title="Select Owner Portal"
                >
                  <ShieldCheck className={`w-4 h-4 ${selectedRole === 'owner' ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold">Owner Portal</span>
                </button>
                <button
                  type="button"
                  id="quick-worker-portal"
                  onClick={() => handleSelectRole('worker')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl
                    transition-all duration-200 cursor-pointer ${
                      selectedRole === 'worker'
                        ? 'bg-teal-50 border-2 border-teal-600 text-teal-900 shadow-sm shadow-teal-600/10'
                        : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-800'
                    }`}
                  title="Select Worker Portal"
                >
                  <UserCheck className={`w-4 h-4 ${selectedRole === 'worker' ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold">Worker Portal</span>
                </button>
              </div>
            </div>

          </div>{/* /animate-form-in */}
        </div>{/* /form panel */}


        {/* ═══════════════════════════════════════
            RIGHT — ILLUSTRATION PANEL
        ═══════════════════════════════════════ */}
        <div
          className={`
            relative w-full lg:w-[53%] flex items-center justify-center
            p-8 sm:p-10 lg:p-12
            border-t lg:border-t-0 lg:border-l border-teal-100/60
            overflow-hidden
            transition-transform duration-700 ease-in-out
            ${isSuccess ? 'lg:-translate-x-[90%]' : 'lg:translate-x-0'}
          `}
          style={{ background: 'linear-gradient(145deg, #dffbfc 0%, #c8f4f4 55%, #b0eded 100%)' }}
        >
          {/* Decorative floating blobs */}
          <FloatingPill
            className="w-56 h-56 bg-teal-400 animate-orb"
            style={{ top: '-3.5rem', right: '-3.5rem' }}
          />
          <FloatingPill
            className="w-40 h-40 bg-teal-300 animate-orb-delay"
            style={{ bottom: '-2.5rem', left: '-2.5rem' }}
          />
          <FloatingPill
            className="w-16 h-16 bg-white animate-float-slow"
            style={{ top: '28%', left: '6%' }}
          />
          <FloatingPill
            className="w-10 h-10 bg-teal-200 animate-float"
            style={{ bottom: '22%', right: '7%' }}
          />

          {/* Dot-grid overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.04]"
            style={{
              backgroundImage: 'radial-gradient(circle, #0d9488 1px, transparent 1px)',
              backgroundSize: '26px 26px',
            }}
          />

          {/* Illustration + text */}
          <div className={`relative z-10 flex flex-col items-center gap-6 text-center ${isMounted ? 'animate-illus-in' : 'opacity-0'}`}>

            {/* Floating image */}
            <div className="animate-float relative">
              <div
                className="absolute inset-[-20px] rounded-[2.5rem] blur-3xl opacity-35 pointer-events-none"
                style={{ background: 'radial-gradient(circle, #99f6df, transparent 70%)' }}
              />
              <img
                src={pharmacyIllustration}
                alt="MEDORA Pharmacy Illustration"
                draggable={false}
                className="relative z-10 w-full max-w-[250px] sm:max-w-[300px] lg:max-w-[350px]
                  h-auto object-contain rounded-3xl select-none pointer-events-none
                  shadow-[0_20px_50px_-10px_rgba(13,148,136,0.22)]"
              />
            </div>

            {/* Minimal brand line */}
            <div className="space-y-1 px-4">
              <p className="text-teal-900 font-bold text-lg tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                Your pharmacy, perfectly managed.
              </p>
              <p className="text-teal-700/75 text-sm font-medium">
                Real-time inventory · Smart alerts · Role-based access
              </p>
            </div>

            {/* Animated dots */}
            <div className="flex items-center gap-2">
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  className="block w-1.5 h-1.5 rounded-full bg-teal-600 opacity-60"
                  style={{ animation: `dotPulse 1.4s ${i * 0.22}s ease-in-out infinite` }}
                />
              ))}
            </div>

          </div>
        </div>{/* /illustration panel */}

      </div>{/* /card */}
    </div>
  );
}

