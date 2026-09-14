import React from 'react';
import { X, Truck, ShieldCheck, MapPin, User, DollarSign, Activity, AlertCircle, Layers } from 'lucide-react';

export default function VehicleDetailsModal({ vehicle, isOpen, onClose }) {
  if (!isOpen || !vehicle) return null;

  const roadComp = vehicle.roadCompatibility || {
    paved_asphalt: 95,
    unpaved_mud: 70,
    gravel_rutted: 80,
  };

  const utilizationPct = Math.min(
    100,
    Math.round(((vehicle.currentLoadKg || 0) / (vehicle.capacityKg || 1)) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white font-mono">{vehicle.name}</h3>
                <span className="text-xs font-mono text-cyan-400 font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                  {vehicle.plate}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Category: <span className="text-slate-200 font-bold uppercase">{vehicle.type.replace('_', ' ')}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Load & Capacity Indicator Card */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-bold uppercase">Current Load Utilization</span>
            <span className="text-cyan-400 font-bold">{vehicle.currentLoadKg || 0} / {vehicle.capacityKg} kg ({utilizationPct}%)</span>
          </div>
          <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all rounded-full ${
                utilizationPct > 85 ? 'bg-amber-500' : utilizationPct > 50 ? 'bg-cyan-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${utilizationPct}%` }}
            />
          </div>
        </div>

        {/* Technical Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase">Drivetrain</span>
            <span className="text-white font-bold">{vehicle.drivetrain || '4x4'}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase">Ground Clearance</span>
            <span className="text-cyan-400 font-bold">{vehicle.groundClearanceMm} mm</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase">Base Cost</span>
            <span className="text-emerald-400 font-bold">${vehicle.baseCost}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase">Per Km Rate</span>
            <span className="text-slate-200 font-bold">${vehicle.costPerKm}</span>
          </div>
        </div>

        {/* Road Surface Compatibility Matrix */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
          <span className="text-cyan-400 font-bold block uppercase flex items-center space-x-2">
            <Layers className="w-4 h-4" />
            <span>Surface Compatibility Matrix</span>
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Paved Asphalt</span>
              <span className="text-emerald-400 font-bold">{roadComp.paved_asphalt || 95}%</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Unpaved Mud</span>
              <span className={`font-bold ${roadComp.unpaved_mud > 70 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {roadComp.unpaved_mud || 60}%
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Gravel / Rutted</span>
              <span className="text-cyan-400 font-bold">{roadComp.gravel_rutted || 80}%</span>
            </div>
          </div>
        </div>

        {/* Driver & Location Assignment */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center space-x-2 text-slate-300">
            <User className="w-4 h-4 text-cyan-400" />
            <span>Driver: <strong className="text-white">{vehicle.assignedDriver || 'Unassigned'}</strong></span>
          </div>
          <div className="flex items-center space-x-2 text-slate-300">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>Depot: <strong className="text-white">{vehicle.currentLocation || 'Central Depot'}</strong></span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold transition"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
