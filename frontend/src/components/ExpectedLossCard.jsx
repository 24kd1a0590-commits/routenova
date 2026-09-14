import React from 'react';
import { DollarSign, AlertTriangle, TrendingDown, Info, Shield, HelpCircle } from 'lucide-react';

export default function ExpectedLossCard({ lossResult, planName = 'Current Baseline Plan' }) {
  if (!lossResult) return null;

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider">
              Expected Operational Loss Exposure
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Evaluated for {planName}
            </p>
          </div>
        </div>

        <div className="text-right font-mono">
          <span className="text-[10px] text-slate-500 uppercase block">Expected Loss</span>
          <span className="text-2xl font-bold font-mono text-emerald-400">
            ${lossResult.expectedOperationalLoss}
          </span>
        </div>
      </div>

      {/* Main Highlights Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase block">Failure Risk</span>
          <span className="font-bold text-rose-400 text-base">
            {Math.round(lossResult.failureProbability * 100)}%
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase block">Vehicle Cost</span>
          <span className="font-bold text-slate-200 text-base">
            ${lossResult.vehicleCost}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase block">Failure Exposure</span>
          <span className="font-bold text-rose-400 text-base">
            ${lossResult.estimatedFailureCost}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase block">Reattempt Risk</span>
          <span className="font-bold text-amber-400 text-base">
            ${lossResult.reattemptCost}
          </span>
        </div>
      </div>

      {/* Itemized Cost Exposure Breakdown List */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
          Itemized Operational Loss Equation Breakdown:
        </span>
        <div className="space-y-1.5 text-[11px]">
          <div className="flex justify-between text-slate-300">
            <span>Vehicle Transit Rental:</span>
            <span className="font-bold text-slate-200">{lossResult.costBreakdown.vehicleCostText}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Estimated Failure Risk Exposure:</span>
            <span className="font-bold text-rose-400">{lossResult.costBreakdown.failureExposureText}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Estimated Delay Risk Exposure:</span>
            <span className="font-bold text-amber-400">{lossResult.costBreakdown.delayExposureText}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Reattempt Base Exposure:</span>
            <span className="font-bold text-amber-400">{lossResult.costBreakdown.reattemptExposureText}</span>
          </div>
        </div>
      </div>

      {/* Explanation for Judges & Prototype Disclaimer */}
      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono space-y-1.5 text-slate-300">
        <p className="flex items-center gap-1.5 text-cyan-400 font-semibold text-[11px]">
          <Info className="w-3.5 h-3.5" />
          <span>{lossResult.explanationText}</span>
        </p>
        <p className="text-[10px] text-slate-500 italic">
          Note: {lossResult.disclaimer}
        </p>
      </div>
    </div>
  );
}
