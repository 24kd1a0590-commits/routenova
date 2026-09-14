import React, { useState } from 'react';
import RiskBadge from './RiskBadge';
import { Zap, CheckCircle2, ShieldCheck, Sparkles, ArrowRight, DollarSign, Award, Check } from 'lucide-react';

export default function PlanComparisonMatrix({
  currentPlan,
  alternativePlan,
  recommendedPlan,
  recommendationReasons = [],
  onSelectPlan,
}) {
  const [selectedVehicleId, setSelectedVehicleId] = useState(recommendedPlan?.vehicle?.id);
  const [confirmed, setConfirmed] = useState(false);

  if (!currentPlan || !recommendedPlan) return null;

  const plans = [
    { title: 'Current Plan', data: currentPlan, color: 'rose', isRec: false },
    { title: 'Alternative Plan', data: alternativePlan, color: 'cyan', isRec: false },
    { title: 'Best Plan (Recommended)', data: recommendedPlan, color: 'emerald', isRec: true },
  ];

  const handleConfirm = (vehicleId) => {
    setSelectedVehicleId(vehicleId);
    setConfirmed(true);
    if (onSelectPlan) onSelectPlan(vehicleId);
    setTimeout(() => setConfirmed(false), 2500);
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6 shadow-2xl">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
              <Zap className="w-3 h-3 fill-current" /> STAGE 7 ENGINE
            </span>
            <span className="text-xs font-mono text-slate-400">PLAN OPTIMIZER MATRIX</span>
          </div>
          <h2 className="text-lg font-bold font-mono text-slate-100 uppercase tracking-wide mt-1">
            DELIVERY PLAN COMPARISON
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30">
          <Award className="w-4 h-4 text-emerald-400" />
          <span>Optimal Loss Reduction: ${currentPlan.expectedOperationalLoss - recommendedPlan.expectedOperationalLoss}</span>
        </div>
      </div>

      {/* 3-Column Plan Comparison Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {plans.map((p, idx) => {
          const isSelected = selectedVehicleId === p.data.vehicle.id;
          const isRecommended = p.isRec;

          return (
            <div
              key={idx}
              onClick={() => setSelectedVehicleId(p.data.vehicle.id)}
              className={`glass-panel p-5 rounded-2xl border cursor-pointer transition-all relative space-y-4 ${
                isRecommended
                  ? 'border-emerald-500/60 bg-slate-900/90 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-500/40'
                  : isSelected
                  ? 'border-cyan-500/50 bg-slate-900/90 shadow-xl'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Badge for Recommended Plan */}
              {isRecommended && (
                <div className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-mono font-bold uppercase shadow-lg flex items-center gap-1">
                  <Sparkles className="w-3 h-3 fill-current" /> ROUTENOVA RECOMMENDED
                </div>
              )}

              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <span
                    className={`text-[10px] font-mono font-bold uppercase ${
                      p.color === 'rose'
                        ? 'text-rose-400'
                        : p.color === 'cyan'
                        ? 'text-cyan-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {p.title}
                  </span>
                  <h3 className="text-sm font-bold text-slate-100 font-mono mt-0.5">
                    {p.data.vehicle.name}
                  </h3>
                </div>
                <input
                  type="radio"
                  checked={isSelected}
                  onChange={() => setSelectedVehicleId(p.data.vehicle.id)}
                  className="text-emerald-500 focus:ring-emerald-500"
                />
              </div>

              {/* Rows */}
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Vehicle Category:</span>
                  <span className="text-slate-200 capitalize">{p.data.vehicle.type.replace('_', ' ')}</span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>Capacity:</span>
                  <span className="text-slate-200">{p.data.vehicle.capacityKg} kg</span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>Reliability Score:</span>
                  <span className="font-bold text-slate-100">{p.data.reliabilityScore} / 100</span>
                </div>

                <div className="flex justify-between items-center text-slate-400">
                  <span>Risk Level:</span>
                  <RiskBadge level={p.data.riskLevel} score={p.data.failureProbability} />
                </div>

                <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800">
                  <span>Estimated Transit Cost:</span>
                  <span className="text-slate-200 font-bold">${p.data.estimatedCost}</span>
                </div>

                <div className="flex justify-between text-slate-400 pt-1">
                  <span>Expected Operational Loss:</span>
                  <span
                    className={`text-base font-bold font-mono ${
                      isRecommended ? 'text-emerald-400' : p.color === 'rose' ? 'text-rose-400' : 'text-slate-200'
                    }`}
                  >
                    ${p.data.expectedOperationalLoss}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleConfirm(p.data.vehicle.id);
                  }}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 ${
                    isRecommended
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  {confirmed && isSelected ? (
                    <>
                      <Check className="w-4 h-4 text-slate-950" />
                      <span>PLAN SELECTED & CONFIRMED</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>{isRecommended ? 'Select Recommended Plan' : 'Select This Plan'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* WHY ROUTENOVA RECOMMENDS THIS SECTION */}
      <div className="p-5 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider">
            WHY ROUTENOVA RECOMMENDS THIS
          </h3>
        </div>

        <ul className="space-y-1.5 text-xs font-mono text-slate-300">
          {recommendationReasons.map((reason, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-emerald-400 shrink-0">✓</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>

        <p className="text-[10px] text-slate-500 font-mono italic pt-1 border-t border-slate-900">
          Note: RouteNova's plan engine evaluates reliability and total expected loss exposure, rather than blindly selecting the cheapest vehicle rental cost.
        </p>

        {/* PROGRESSIVE DISCLOSURE: Technical Details Accordion */}
        <details className="mt-3 pt-3 border-t border-slate-900 font-mono text-xs text-slate-400 group">
          <summary className="cursor-pointer hover:text-cyan-300 transition-colors font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
            <span>🔍 View Technical Details & Formula Breakdown</span>
          </summary>
          <div className="mt-3 p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-2 text-[11px]">
            <p className="text-slate-200 font-semibold">Expected Operational Loss Model:</p>
            <p className="text-cyan-400">Expected Loss = (P_fail × Cost_fail) + (P_delay × Cost_delay) + Cost_vehicle + Cost_reattempt</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 text-[10px] pt-1">
              <li>Failure Base Cost Coefficient: $350 (Towing & Cargo Risk Base)</li>
              <li>Delay Cost Penalty: $45 / hour delay window breach</li>
              <li>Secondary Reattempt Base: $180</li>
              <li>5-Factor Weights: Accessibility 30%, Compatibility 25%, Address 20%, History 15%, Connectivity 10%</li>
            </ul>
          </div>
        </details>
      </div>
    </div>
  );
}

