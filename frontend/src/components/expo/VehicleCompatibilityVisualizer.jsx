import React from 'react';
import { Truck, Check, X, AlertTriangle, ShieldCheck, Zap, Layers } from 'lucide-react';

export default function VehicleCompatibilityVisualizer({
  evaluatedPlans = [],
  currentVehicle,
  recommendedPlan,
  isAnalyzing,
}) {
  return (
    <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800 bg-slate-950/90 space-y-5 shadow-2xl font-sans">
      <div className="flex items-center justify-between border-b border-slate-850 pb-3">
        <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
          <Truck className="w-5 h-5" />
          <span>VEHICLE-ROAD COMPATIBILITY CHECK</span>
        </div>
        <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
          {isAnalyzing ? '🧠 ROUTENOVA CHECKING FLEET...' : 'DYNAMICAL EVALUATED'}
        </span>
      </div>

      {/* CANDIDATE VEHICLES LIST / CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
        {evaluatedPlans.map((plan) => {
          const v = plan.vehicle;
          const isBaseline = plan.isBaseline;
          const isRecommended = plan.vehicle.id === recommendedPlan?.vehicle?.id;

          const isUnsuitable = plan.reliabilityScore < 50;
          const isModerate = plan.reliabilityScore >= 50 && plan.reliabilityScore < 75;
          const isOptimal = plan.reliabilityScore >= 75;

          return (
            <div
              key={v.id}
              className={`p-4 rounded-2xl border flex flex-col justify-between transition-all duration-300 ${
                isRecommended
                  ? 'bg-emerald-500/10 border-emerald-500/60 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-500/40 scale-[1.02]'
                  : isBaseline
                  ? 'bg-rose-500/10 border-rose-500/40 opacity-90'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div>
                {/* VEHICLE HEADER */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-extrabold text-white flex items-center gap-1.5">
                    <span>{v.type === 'van' ? '🚐' : v.type === 'pickup' ? '🛻' : '🚙'}</span>
                    <span className="line-clamp-1">{v.name}</span>
                  </span>
                  {isRecommended ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> BEST
                    </span>
                  ) : isBaseline ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
                      CURRENT
                    </span>
                  ) : null}
                </div>

                {/* SPEC CHECK LIST */}
                <div className="space-y-1.5 text-[11px] text-slate-300 mt-3 border-t border-slate-850 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Capacity ({v.capacityKg}kg):</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> OK
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Ground Clearance:</span>
                    {v.groundClearanceMm >= 180 ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> {v.groundClearanceMm}mm
                      </span>
                    ) : (
                      <span className="text-rose-400 font-bold flex items-center gap-0.5">
                        <X className="w-3 h-3" /> {v.groundClearanceMm}mm
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Drivetrain:</span>
                    <span className={v.drivetrain?.includes('4WD') ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                      {v.drivetrain || '2WD'}
                    </span>
                  </div>
                </div>
              </div>

              {/* FOOTER METRIC SUMMARY */}
              <div className="mt-4 pt-2 border-t border-slate-850 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Expected Loss</span>
                  <span className={`font-mono font-extrabold text-sm ${isRecommended ? 'text-emerald-400' : isUnsuitable ? 'text-rose-400' : 'text-slate-300'}`}>
                    ${plan.expectedOperationalLoss}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block uppercase">Compatibility</span>
                  <span className={`font-mono font-bold text-xs ${isOptimal ? 'text-emerald-400' : isModerate ? 'text-amber-400' : 'text-rose-400'}`}>
                    {isOptimal ? '🟢 HIGH' : isModerate ? '🟡 MEDIUM' : '🔴 LOW'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
