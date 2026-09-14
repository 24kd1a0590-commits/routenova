import React from 'react';
import { Link } from 'react-router-dom';
import RiskBadge from './RiskBadge';
import StatusBadge from './StatusBadge';
import { MapPin, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';

export default function DeliveryCard({ delivery }) {
  const isHighRisk = delivery.riskLevel === 'HIGH';

  return (
    <div
      className={`glass-panel p-4 rounded-xl border transition-all ${
        isHighRisk
          ? 'border-rose-500/30 hover:border-rose-500/50 glow-risk-high'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-cyan-400">{delivery.id}</span>
            <StatusBadge status={delivery.status} />
          </div>
          <h3 className="text-sm font-semibold text-slate-100 mt-1">{delivery.customer}</h3>
        </div>
        <RiskBadge level={delivery.riskLevel} score={delivery.failureProbability} />
      </div>

      <div className="space-y-2 mb-4 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="truncate">{delivery.destination}</span>
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono pt-2 border-t border-slate-800/80">
          <span className="text-slate-500">Conventional Plan:</span>
          <span className="text-slate-300">{delivery.conventionalVehicle}</span>
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-cyan-400/90 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" /> RouteNova Pick:
          </span>
          <span className="text-emerald-400 font-semibold">{delivery.recommendedVehicle}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-mono">Expected Loss</span>
          <span className="text-xs font-mono font-bold text-slate-200">
            ${delivery.lossComparison?.pooled?.expectedLoss || delivery.lossComparison?.baseline?.expectedLoss || 0}
          </span>
          {delivery.lossComparison?.baseline?.expectedLoss && (
            <span className="text-[10px] text-slate-500 line-through ml-1 font-mono">
              ${delivery.lossComparison.baseline.expectedLoss}
            </span>
          )}
        </div>

        <Link
          to={`/deliveries/${delivery.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 text-slate-200 hover:bg-slate-800 hover:text-white border border-slate-700 transition-all group"
        >
          <span>Evaluate Plan</span>
          <ArrowRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
