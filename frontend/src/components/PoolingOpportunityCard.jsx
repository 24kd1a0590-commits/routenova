import React, { useState } from 'react';
import { Share2, CheckCircle2, ShieldCheck, ArrowRight, Layers, Check, Sparkles } from 'lucide-react';

export default function PoolingOpportunityCard({ poolOptions = [], onApplyPool }) {
  const [applied, setApplied] = useState(false);

  if (!poolOptions || poolOptions.length === 0) {
    return (
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <Share2 className="w-5 h-5 text-indigo-400" />
          <h2 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider">
            POOLING OPPORTUNITY
          </h2>
        </div>
        <p className="text-xs text-slate-400 font-mono">
          No compatible corridor shipments found for bundling at this time. Standard single-vehicle dispatch recommended.
        </p>
      </div>
    );
  }

  // Primary top candidate pool
  const pool = poolOptions[0];
  const checklist = pool.checklist || {
    capacityAvailable: true,
    compatibleCorridor: true,
    compatibleDeliveryWindow: true,
    vehicleSuitable: true,
    acceptableReliability: true,
  };

  const handleApply = () => {
    setApplied(true);
    if (onApplyPool) onApplyPool(pool);
    setTimeout(() => setApplied(false), 2500);
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-indigo-500/40 space-y-5 shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center gap-1">
              <Share2 className="w-3 h-3" /> MICROPOOLING LAYER
            </span>
            <span className="text-xs font-mono text-slate-400">
              {poolOptions.length} Compatible Shipment{poolOptions.length > 1 ? 's' : ''} Found
            </span>
          </div>
          <h2 className="text-base font-bold font-mono text-slate-100 uppercase tracking-wide mt-1">
            POOLING OPPORTUNITY
          </h2>
        </div>

        <div className="text-right font-mono">
          <span className="text-[10px] text-slate-500 uppercase block">Expected Loss Saved</span>
          <span className="text-xl font-bold font-mono text-emerald-400">
            ${pool.expectedOperationalLoss} Shared Loss
          </span>
        </div>
      </div>

      {/* Weight & Vehicle Utilization Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono relative z-10">
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <span className="text-[10px] text-slate-500 font-bold uppercase block">
            Bundled Payload Breakdown
          </span>
          <div className="space-y-1">
            <div className="flex justify-between text-slate-300">
              <span>Your Shipment:</span>
              <span className="font-bold text-slate-200">{pool.targetWeightKg} kg</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Candidate ({pool.candidateShipment.sender}):</span>
              <span className="font-bold text-cyan-400">{pool.candidateWeightKg} kg</span>
            </div>
            <div className="flex justify-between text-slate-200 pt-1.5 border-t border-slate-800 font-bold">
              <span>Combined Total Payload:</span>
              <span className="text-emerald-400">{pool.combinedWeightKg} kg / {pool.vehicleCapacityKg} kg</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase block">
              Vehicle Utilization & Corridor
            </span>
            <div className="flex items-center justify-between text-slate-200 mt-1">
              <span>Vehicle:</span>
              <span className="font-bold text-cyan-400">{pool.vehicleAssigned.name}</span>
            </div>
            <div className="flex items-center justify-between text-slate-200 mt-1">
              <span>Shared Corridor:</span>
              <span className="font-bold text-slate-300">{pool.sharedCorridorKm} km shared</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Utilization Rate:</span>
            <span className="font-bold text-indigo-400 text-sm font-mono">
              {pool.vehicleUtilization}% Capacity
            </span>
          </div>
        </div>
      </div>

      {/* Compatibility Checklist */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 relative z-10">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          Micropooling Compatibility Checklist:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Capacity available</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Compatible corridor</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Compatible window</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Vehicle suitable</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Acceptable reliability</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-end relative z-10 pt-1">
        <button
          onClick={handleApply}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-600 hover:from-indigo-400 hover:to-cyan-500 text-white font-mono font-bold text-xs shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all"
        >
          {applied ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>MICROPOOL STRATEGY APPLIED</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              <span>View Pool Recommendation & Apply</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
