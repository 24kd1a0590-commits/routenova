import React from 'react';
import { CheckCircle2, ShieldCheck, ArrowRight, Truck, MapPin, DollarSign, RotateCcw } from 'lucide-react';

export default function DispatchSuccessScreen({ planData, destinationName = 'Rampuram Village Hub', onViewDelivery }) {
  if (!planData) return null;

  return (
    <div className="glass-panel p-8 rounded-3xl border border-emerald-500/50 space-y-6 shadow-2xl animate-fade-in max-w-2xl mx-auto text-center relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      {/* Hero Success Icon */}
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-xl shadow-emerald-500/20 mb-2">
        <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-100 tracking-wide">
          ✓ DISPATCH CONFIRMED
        </h1>
        <p className="text-xs text-slate-400 font-mono">
          RouteNova Decision Layer has logged and initiated transit execution
        </p>
      </div>

      {/* Details Card */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-left font-mono text-xs space-y-3 shadow-inner">
        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
          <span className="text-slate-400">RouteNova Plan:</span>
          <span className="font-bold text-emerald-400 text-sm">
            {planData.planName || 'Plan C: Pooled 4x4 Mini Truck'}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-400">Assigned Vehicle:</span>
          <span className="font-bold text-cyan-400">{planData.vehicleName}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-400">Destination Hub:</span>
          <span className="font-bold text-slate-200">{destinationName}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-400">Total Bundled Load:</span>
          <span className="font-bold text-slate-100">{planData.shipmentLoadKg} kg</span>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-slate-800 font-bold">
          <span className="text-slate-400">Expected Operational Loss:</span>
          <span className="text-lg text-emerald-400">${planData.expectedLoss}</span>
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>Shipment status updated to DISPATCHED | Vehicle status updated to IN_TRANSIT</span>
      </div>

      {/* Action Button */}
      <div className="pt-2 flex justify-center">
        <button
          onClick={onViewDelivery}
          className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-mono font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all"
        >
          <Truck className="w-4 h-4" />
          <span>VIEW DELIVERY WORKBENCH</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
