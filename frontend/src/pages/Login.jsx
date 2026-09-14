import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, DEMO_CREDENTIALS } from '../context/AuthContext';
import { Zap, ShieldCheck, Lock, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login, loginAsDemoRole } = useAuth();

  const [selectedRoleKey, setSelectedRoleKey] = useState('DISPATCHER');
  const [email, setEmail] = useState('dispatcher@routenova.com');
  const [password, setPassword] = useState('dispatch123');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectRoleCard = (persona) => {
    setSelectedRoleKey(persona.roleKey);
    setEmail(persona.email);
    setPassword(persona.password);
  };

  const handleDemoQuickLogin = async (roleKey) => {
    setIsSubmitting(true);
    await loginAsDemoRole(roleKey);
    setIsSubmitting(false);
    if (roleKey === 'DRIVER') {
      navigate('/driver');
    } else {
      navigate('/dashboard');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await login(email, password);
    setIsSubmitting(false);
    if (res.ok) {
      if (res.user?.role === 'DRIVER' || selectedRoleKey === 'DRIVER') {
        navigate('/driver');
      } else {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 relative z-10 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-xl shadow-cyan-500/20 border border-cyan-400/30 mb-1">
            <Zap className="w-7 h-7 fill-current text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-mono text-slate-100 tracking-wider">
            ROUTE<span className="text-cyan-400">NOVA</span>
          </h1>
          <p className="text-xs sm:text-sm text-cyan-300 font-mono font-semibold">
            Smarter Deliveries. Safer Routes.
          </p>
        </div>

        {/* DEMO CREDENTIALS NOTICE BANNER */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs text-center flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-bold tracking-wider">DEMO CREDENTIALS — DEVELOPMENT ONLY</span>
        </div>

        {/* 4 PERSONA SELECTION CARDS WITH LARGE ICONS */}
        <div className="space-y-2">
          <label className="text-xs font-mono font-bold uppercase text-slate-400 block tracking-wider text-center">
            Choose Your Delivery Role:
          </label>
          <div className="grid grid-cols-2 gap-3">
            {DEMO_CREDENTIALS.map((persona) => {
              const isSelected = selectedRoleKey === persona.roleKey;

              return (
                <div
                  key={persona.roleKey}
                  onClick={() => handleSelectRoleCard(persona)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-2 relative ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-500/60 shadow-lg shadow-cyan-500/10 text-white'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute top-2 right-2 text-cyan-400">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  )}
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{persona.icon}</span>
                    <div>
                      <h3 className="font-mono font-bold text-xs text-slate-100">{persona.roleLabel}</h3>
                      <span className="text-[10px] text-slate-400 block">{persona.email}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight font-mono">{persona.description}</p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDemoQuickLogin(persona.roleKey);
                    }}
                    className={`w-full py-1 px-2 rounded text-[10px] font-mono font-bold border transition-all mt-1 ${
                      isSelected
                        ? 'bg-cyan-500/30 text-cyan-200 border-cyan-400/50'
                        : 'bg-slate-950 text-slate-300 border-slate-700 hover:text-white'
                    }`}
                  >
                    Quick Sign-In →
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Standard Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono pt-2 border-t border-slate-800/80">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Account Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 bg-slate-950 text-slate-200 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500/60 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 bg-slate-950 text-slate-200 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500/60 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>SIGNING IN...</span>
            ) : (
              <>
                <span>SIGN IN TO ROUTENOVA</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-400 font-mono flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Failure-aware delivery reliability & micropooling engine active</span>
        </div>
      </div>
    </div>
  );
}
