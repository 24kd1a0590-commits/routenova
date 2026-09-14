import React, { useState, useEffect } from 'react';
import {
  Zap,
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export default function BeforeAfterDecision({
  currentPlan,
  recommendedPlan,
  isAnalyzing,
}) {
  const [relScoreBefore, setRelScoreBefore] = useState(0);
  const [relScoreAfter, setRelScoreAfter] = useState(0);
  const [lossBefore, setLossBefore] = useState(0);
  const [lossAfter, setLossAfter] = useState(0);

  const targetRelBefore = currentPlan?.reliabilityScore || 45;
  const targetRelAfter = recommendedPlan?.reliabilityScore || 94;
  const targetLossBefore = currentPlan?.expectedOperationalLoss || 420;
  const targetLossAfter = recommendedPlan?.expectedOperationalLoss || 78;

  // Number Count-up Animation Effect
  useEffect(() => {
    let frame = 0;
    const totalFrames = 30;
    const timer = setInterval(() => {
      frame++;
      const progress = Math.min(1, frame / totalFrames);
      setRelScoreBefore(Math.round(targetRelBefore * progress));
      setRelScoreAfter(Math.round(targetRelAfter * progress));
      setLossBefore(Math.round(targetLossBefore * progress));
      setLossAfter(Math.round(targetLossAfter * progress));

      if (frame >= totalFrames) clearInterval(timer);
    }, 20);
    return () => clearInterval(timer);
  }, [targetRelBefore, targetRelAfter, targetLossBefore, targetLossAfter]);

  const lossSaved = targetLossBefore - targetLossAfter;
  const percentReduction = targetLossBefore > 0 ? Math.round((lossSaved / targetLossBefore) * 100) : 0;

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/40 bg-gradient-to-b from-slate-900/90 to-slate-950/95 space-y-6 shadow-2xl relative overflow-hidden font-sans">
      {/* BACKGROUND DECORATIVE GLOW */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* PROMINENT CLIMAX HEADER */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5 fill-current" />
          <span>ROUTENOVA PRE-DISPATCH DECISION CLIMAX</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold font-mono text-white tracking-tight">
          BEFORE vs AFTER ROUTENOVA
        </h2>
        <p className="text-slate-300 text-sm font-sans max-w-xl mx-auto">
          “RouteNova identifies the baseline failure risk and dynamically selects a reliable delivery plan.”
        </p>
      </div>

      {/* 3-STAGE VISUAL COMPARISON CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-center font-mono">
        {/* LEFT: BEFORE ROUTENOVA */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-950/90 border-2 border-rose-500/50 space-y-4 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block">
              BEFORE ROUTENOVA
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 font-extrabold text-xs border border-rose-500/40">
              🔴 HIGH RISK
            </span>
          </div>

          <div className="flex items-center space-x-3 pt-1">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-2xl">
              🚐
            </div>
            <div>
              <span className="text-slate-400 text-xs block">Current Plan Vehicle</span>
              <span className="text-white font-extrabold text-base">
                {currentPlan?.vehicle?.name || 'Standard 2WD Van'}
              </span>
            </div>
          </div>

          {/* DYNAMIC METRICS */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-850">
              <span className="text-slate-500 text-[10px] uppercase block">Reliability</span>
              <span className="text-rose-400 font-extrabold text-2xl">{relScoreBefore} / 100</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-850">
              <span className="text-slate-500 text-[10px] uppercase block">Expected Loss</span>
              <span className="text-rose-400 font-extrabold text-2xl">${lossBefore}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <XCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span className="font-sans font-medium text-[11px]">
              {currentPlan?.primaryRisk || 'High vehicle-road surface mismatch'}
            </span>
          </div>
        </div>

        {/* CENTER: ROUTENOVA TRANSITION ARROW / LOGIC */}
        <div className="lg:col-span-1 flex flex-col items-center justify-center space-y-2 py-2">
          <div className="w-12 h-12 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400 animate-pulse shadow-lg shadow-cyan-500/20">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest text-center">
            DECIDES
          </span>
        </div>

        {/* RIGHT: AFTER ROUTENOVA */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-emerald-950/40 border-2 border-emerald-500/70 space-y-4 shadow-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
              AFTER ROUTENOVA
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-extrabold text-xs border border-emerald-500/40">
              🟢 OPTIMAL PLAN
            </span>
          </div>

          <div className="flex items-center space-x-3 pt-1">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-2xl">
              🚙
            </div>
            <div>
              <span className="text-slate-400 text-xs block">Recommended Plan</span>
              <span className="text-white font-extrabold text-base">
                {recommendedPlan?.vehicle?.name || '4WD Pickup Truck'}
              </span>
            </div>
          </div>

          {/* DYNAMIC METRICS */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-850">
              <span className="text-slate-500 text-[10px] uppercase block">Reliability</span>
              <span className="text-emerald-400 font-extrabold text-2xl">{relScoreAfter} / 100</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-850">
              <span className="text-slate-500 text-[10px] uppercase block">Expected Loss</span>
              <span className="text-emerald-400 font-extrabold text-2xl">${lossAfter}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span className="font-sans font-medium text-[11px]">
              Expected operational loss reduced by <strong>${lossSaved} ({percentReduction}%)</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
