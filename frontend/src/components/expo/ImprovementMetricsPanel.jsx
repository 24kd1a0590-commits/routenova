import React from 'react';
import { TrendingDown, ShieldCheck, ArrowRight, Award, Check } from 'lucide-react';

export default function ImprovementMetricsPanel({
  currentPlan,
  recommendedPlan,
}) {
  const lossSaved = (currentPlan?.expectedOperationalLoss || 420) - (recommendedPlan?.expectedOperationalLoss || 78);
  const percentSaved =
    (currentPlan?.expectedOperationalLoss || 420) > 0
      ? Math.round((lossSaved / (currentPlan?.expectedOperationalLoss || 420)) * 100)
      : 0;

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800 bg-slate-950/90 space-y-4 shadow-xl font-sans">
      <div className="flex items-center justify-between border-b border-slate-850 pb-3">
        <div className="flex items-center space-x-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
          <TrendingDown className="w-5 h-5" />
          <span>QUANTIFIED IMPROVEMENT SUMMARY</span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-extrabold text-xs border border-emerald-500/40">
          -{percentSaved}% LOSS EXPOSURE
        </span>
      </div>

      {/* BEFORE -> AFTER COMPARISON TABLE / CARDS */}
      <div className="space-y-2 font-mono text-xs">
        {/* Row 1: Vehicle */}
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-between">
          <span className="text-slate-400">Selected Vehicle:</span>
          <div className="flex items-center space-x-2">
            <span className="text-rose-400 font-bold">{currentPlan?.vehicle?.name || '2WD Van'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-emerald-400 font-extrabold">{recommendedPlan?.vehicle?.name || '4WD Pickup'}</span>
          </div>
        </div>

        {/* Row 2: Reliability */}
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-between">
          <span className="text-slate-400">Reliability Score:</span>
          <div className="flex items-center space-x-2">
            <span className="text-rose-400 font-bold">{currentPlan?.reliabilityScore || 45}/100</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-emerald-400 font-extrabold">{recommendedPlan?.reliabilityScore || 94}/100</span>
          </div>
        </div>

        {/* Row 3: Expected Loss */}
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-between">
          <span className="text-slate-400">Expected Loss:</span>
          <div className="flex items-center space-x-2">
            <span className="text-rose-400 font-bold">${currentPlan?.expectedOperationalLoss || 420}</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-emerald-400 font-extrabold">${recommendedPlan?.expectedOperationalLoss || 78}</span>
          </div>
        </div>

        {/* Row 4: Risk State */}
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-between">
          <span className="text-slate-400">Risk Classification:</span>
          <div className="flex items-center space-x-2">
            <span className="text-rose-400 font-bold uppercase">{currentPlan?.riskLevel || 'HIGH'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-emerald-400 font-extrabold uppercase">{recommendedPlan?.riskLevel || 'LOW'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
