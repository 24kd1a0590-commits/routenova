import React from 'react';
import { X, ShieldCheck, Zap, AlertTriangle, Truck, MapPin, Check, DollarSign } from 'lucide-react';

export default function DispatchModal({
  isOpen,
  onClose,
  onConfirm,
  planData,
  destinationName = 'Rampuram Village Hub',
  shipmentCount = 2,
}) {
  if (!isOpen || !planData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-mono tracking-wide uppercase">
                ROUTENOVA DISPATCH PLAN
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Confirm final pre-dispatch vehicle & corridor execution
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

        {/* Dispatch Plan Details Grid */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-400">Destination:</span>
            <span className="font-bold text-slate-100">{destinationName}</span>
          </div>

          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-400">Assigned Vehicle:</span>
            <span className="font-bold text-cyan-400">{planData.vehicleName}</span>
          </div>

          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-400">Bundled Shipments:</span>
            <span className="font-bold text-slate-100">{shipmentCount} Shipments</span>
          </div>

          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-400">Total Combined Load:</span>
            <span className="font-bold text-emerald-400">{planData.shipmentLoadKg} kg</span>
          </div>

          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-400">Operational Reliability:</span>
            <span className="font-bold text-slate-100">{planData.reliabilityScore}/100 ({planData.riskLevel} RISK)</span>
          </div>

          <div className="flex justify-between items-center text-slate-300 pt-2 border-t border-slate-800 font-bold">
            <span className="text-slate-400">Expected Operational Loss:</span>
            <span className="text-lg text-emerald-400">${planData.expectedLoss}</span>
          </div>
        </div>

        {/* Required Rationale Statement */}
        <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300 leading-relaxed">
          <p className="flex items-start gap-2">
            <Zap className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 fill-current" />
            <span>
              RouteNova has selected this plan because it provides the lowest expected operational loss among valid alternatives.
            </span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-mono font-medium text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-6 py-2.5 rounded-xl text-xs font-mono font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>CONFIRM DISPATCH</span>
          </button>
        </div>
      </div>
    </div>
  );
}
