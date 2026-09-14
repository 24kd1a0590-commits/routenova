import React from 'react';
import { X, HelpCircle, AlertTriangle, ShieldCheck, Calculator, Cpu } from 'lucide-react';

export default function ExplainabilityModal({ isOpen, onClose, delivery }) {
  if (!isOpen || !delivery) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 font-mono">
                Pre-Dispatch Decision Rationale
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Delivery ID: {delivery.id} — {delivery.customer}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Expected Operational Loss Formula */}
        <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 font-mono space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
            <Calculator className="w-4 h-4" />
            <span>Expected Operational Loss Optimization Formula</span>
          </div>
          <p className="text-[11px] text-slate-300 bg-slate-900 p-2.5 rounded border border-slate-800">
            Loss = (P_fail × Cost_fail) + (P_delay × Cost_delay) + Cost_vehicle + Cost_reattempt
          </p>
          <p className="text-[11px] text-slate-400">
            RouteNova selects the vehicle & corridor combination that minimizes total operational loss while guaranteeing capacity and safety threshold.
          </p>
        </div>

        {/* 6-Factor Breakdown */}
        <div>
          <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-3">
            6-Factor Evaluation Breakdown
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(delivery.sixFactors || {}).map(([key, val]) => (
              <div key={key} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-200 capitalize font-mono">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <span className="font-mono text-cyan-400 font-bold">{val.score}/100</span>
                </div>
                <p className="text-[11px] text-slate-400">{val.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-medium rounded-lg transition-colors font-mono"
          >
            Close Explanation
          </button>
        </div>
      </div>
    </div>
  );
}
