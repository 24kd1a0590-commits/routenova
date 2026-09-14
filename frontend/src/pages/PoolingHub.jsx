import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import RiskBadge from '../components/RiskBadge';
import StatusBadge from '../components/StatusBadge';
import { SHIPMENTS, VEHICLES, DESTINATIONS, POOL_CANDIDATES } from '../data/index';
import { findCompatiblePools, findCompatiblePoolsAsync, evaluateCorridorCompatibility } from '../services/poolingEngine';

import { evaluateDeliveryPlan } from '../services/reliabilityEngine';
import { calculateExpectedOperationalLoss } from '../services/lossEngine';
import {
  Share2,
  CheckCircle2,
  Plus,
  Minus,
  Check,
  Zap,
  Package,
  Truck,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  Layers,
  Sparkles,
  AlertTriangle,
  FileCheck2,
} from 'lucide-react';

export default function PoolingHub() {
  // Available pending shipments
  const [shipments, setShipments] = useState(SHIPMENTS);
  const [selectedPrimaryId, setSelectedPrimaryId] = useState('RN-2026-8801');
  const [selectedSecondaryIds, setSelectedSecondaryIds] = useState(['RN-2026-8804']);
  const [createdPools, setCreatedPools] = useState(POOL_CANDIDATES);
  const [successMessage, setSuccessMessage] = useState(null);

  // Selected Primary Shipment object
  const primaryShipment = shipments.find((s) => s.id === selectedPrimaryId) || shipments[0];
  const primaryDest =
    DESTINATIONS.find((d) => d.id === primaryShipment.destinationId || d.name.includes(primaryShipment.destination)) ||
    DESTINATIONS[0];

  // Candidates for pooling (exclude primary)
  const candidateShipments = shipments.filter((s) => s.id !== primaryShipment.id);

  // Bundled shipments selection list
  const bundledShipments = [
    primaryShipment,
    ...candidateShipments.filter((s) => selectedSecondaryIds.includes(s.id)),
  ];

  // Calculate Combined Load Metrics
  const combinedWeight = bundledShipments.reduce(
    (sum, s) => sum + (s.weight || s.weightKg || 0),
    0
  );

  // Find optimal 4x4 or Mini Truck for bundled load
  const assignedVehicle =
    VEHICLES.find(
      (v) => v.capacityKg >= combinedWeight && (v.drivetrain.includes('4WD') || v.type === 'mini_truck')
    ) || VEHICLES[3]; // Tata Ace Gold 4x4 Mini Truck (1200kg)

  const utilizationRate = Math.round((combinedWeight / assignedVehicle.capacityKg) * 100);

  // Evaluate Joint Reliability & Loss
  const jointEval = evaluateDeliveryPlan({
    destination: primaryDest,
    vehicle: assignedVehicle,
    shipment: { weightKg: combinedWeight },
  });

  const jointLoss = calculateExpectedOperationalLoss({
    reliabilityScore: jointEval.reliabilityScore,
    vehicle: assignedVehicle,
    shipment: { weightKg: combinedWeight },
    destination: primaryDest,
  });

  const expectedSharedLoss = Math.round(jointLoss.expectedOperationalLoss / bundledShipments.length);

  // Toggle selection of secondary shipment in Visual Builder
  const toggleSecondaryShipment = (id) => {
    if (selectedSecondaryIds.includes(id)) {
      setSelectedSecondaryIds(selectedSecondaryIds.filter((sid) => sid !== id));
    } else {
      setSelectedSecondaryIds([...selectedSecondaryIds, id]);
    }
  };

  // Create Pool Handler
  const handleCreatePool = () => {
    const generatedId = `POOL-2026-${Math.floor(900 + Math.random() * 99)}`;

    const newPool = {
      id: generatedId,
      corridorName: `${primaryDest.name} Corridor Bundle`,
      primaryDeliveryId: primaryShipment.id,
      secondaryDeliveryId: selectedSecondaryIds[0] || 'RN-2026-8804',
      sharedCorridorKm: 14.8,
      timeWindowOverlap: "92%",
      vehicleCapacityBefore: "42%",
      vehicleCapacityAfter: `${utilizationRate}%`,
      combinedWeightKg: combinedWeight,
      vehicleAssigned: `${assignedVehicle.name} (${assignedVehicle.plate})`,
      expectedLossIndividual: `$${jointLoss.expectedOperationalLoss + 240} combined`,
      expectedLossPooled: `$${expectedSharedLoss * bundledShipments.length} combined`,
      totalSavings: `$${jointLoss.expectedOperationalLoss - 78} saved`,
      status: "READY_FOR_DISPATCH",
      compatibilityScores: {
        routeOverlap: "96%",
        timeCompatibility: "90%",
        weightVolumeFit: `${utilizationRate}%`,
        roadRiskSafety: `${jointEval.reliabilityScore}%`,
      },
    };

    // Update status of bundled shipments
    const updatedShipments = shipments.map((s) => {
      if (s.id === primaryShipment.id || selectedSecondaryIds.includes(s.id)) {
        return { ...s, status: 'POOL_MATCHED' };
      }
      return s;
    });

    setShipments(updatedShipments);
    setCreatedPools([newPool, ...createdPools]);
    setSuccessMessage(`Pool ${generatedId} created successfully! ${bundledShipments.length} shipments bundled.`);

    setTimeout(() => setSuccessMessage(null), 4000);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* PAGE HEADER */}
      <PageHeader
        title="Smart Micropooling Control Center"
        description="Corridor bundling engine: Combines compatible small rural shipments to maximize vehicle capacity and minimize expected operational loss"
        badge="CORRIDOR MATCHING ACTIVE"
      />

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs flex items-center justify-between shadow-xl animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-bold">{successMessage}</span>
          </div>
          <span className="text-[10px] text-emerald-400 uppercase border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
            Statuses Updated to POOLING
          </span>
        </div>
      )}

      {/* Positioning Callout Box */}
      <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-start gap-3">
        <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0">
          <Share2 className="w-5 h-5" />
        </div>
        <div className="text-xs space-y-1">
          <h3 className="font-mono font-bold text-cyan-300 uppercase">
            RouteNova Compatible Micropooling Layer
          </h3>
          <p className="text-slate-300 leading-relaxed">
            Micropooling works above conventional route navigation to bundle compatible small loads. Pool candidates are evaluated against road accessibility, delivery windows, and ground clearance to guarantee joint safety.
          </p>
        </div>
      </div>

      {/* INTERACTIVE VISUAL POOLING BUILDER SECTION */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/40 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider">
              INTERACTIVE VISUAL POOL BUILDER
            </h2>
          </div>
          <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            PROTOTYPE WORKFLOW
          </span>
        </div>

        {/* Visual Flow Diagram */}
        <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 space-y-6 text-center">
          <span className="text-xs font-mono text-slate-400 uppercase font-bold tracking-wider block">
            Shipment Load Bundling Flow
          </span>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono">
            {/* Primary Shipment Box */}
            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/40 space-y-1 min-w-[150px]">
              <span className="text-[10px] text-cyan-400 uppercase font-bold block">YOUR SHIPMENT</span>
              <p className="text-sm font-bold text-slate-100">{primaryShipment.sender}</p>
              <p className="text-emerald-400 font-bold text-base">{primaryShipment.weight || primaryShipment.weightKg} kg</p>
            </div>

            {/* Plus Icon */}
            {selectedSecondaryIds.map((sid) => {
              const sec = shipments.find((s) => s.id === sid);
              if (!sec) return null;
              return (
                <React.Fragment key={sid}>
                  <div className="text-cyan-400 font-bold text-xl">+</div>

                  <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/40 space-y-1 min-w-[150px]">
                    <span className="text-[10px] text-indigo-400 uppercase font-bold block">CANDIDATE SHIPMENT</span>
                    <p className="text-sm font-bold text-slate-100">{sec.sender}</p>
                    <p className="text-cyan-400 font-bold text-base">{sec.weight || sec.weightKg} kg</p>
                  </div>
                </React.Fragment>
              );
            })}

            {/* Arrow */}
            <div className="text-slate-500 text-xl font-bold px-2">↓</div>

            {/* Combined Total Load Box */}
            <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/50 space-y-1 min-w-[170px] shadow-xl">
              <span className="text-[10px] text-emerald-400 uppercase font-bold block">COMBINED PAYLOAD</span>
              <p className="text-lg font-bold font-mono text-emerald-400">{combinedWeight} kg</p>
              <span className="text-[10px] text-slate-400 block">{bundledShipments.length} Bundled Shipments</span>
            </div>

            {/* Arrow */}
            <div className="text-slate-500 text-xl font-bold px-2">↓</div>

            {/* Assigned Vehicle Box */}
            <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/50 space-y-1 min-w-[180px] shadow-xl">
              <span className="text-[10px] text-cyan-400 uppercase font-bold block">ASSIGNED FLEET VEHICLE</span>
              <p className="text-xs font-bold text-slate-100 truncate">{assignedVehicle.name}</p>
              <p className="text-indigo-400 font-bold text-base">{utilizationRate}% UTILIZATION</p>
              <span className="text-[10px] text-slate-400 block">Max {assignedVehicle.capacityKg} kg</span>
            </div>
          </div>
        </div>

        {/* Validation Panel & Creation Action */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Validation Panel */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Pre-Creation Compatibility Checklist:
            </span>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-emerald-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Capacity Fit:
                </span>
                <span className="font-bold">{combinedWeight} kg ≤ {assignedVehicle.capacityKg} kg</span>
              </div>
              <div className="flex items-center justify-between text-emerald-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Route Corridor:
                </span>
                <span className="font-bold">14.8 km shared corridor</span>
              </div>
              <div className="flex items-center justify-between text-emerald-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Time Window Fit:
                </span>
                <span className="font-bold">92% Overlap (08:00 - 12:00 IST)</span>
              </div>
              <div className="flex items-center justify-between text-emerald-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Vehicle Suitability:
                </span>
                <span className="font-bold">{assignedVehicle.ruralSuitability}/100 4x4 Clear</span>
              </div>
              <div className="flex items-center justify-between text-emerald-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Risk Threshold:
                </span>
                <span className="font-bold">{jointEval.reliabilityScore}/100 Reliable</span>
              </div>
            </div>
          </div>

          {/* Action Create Pool Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3 font-mono text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Micropool Loss Optimization Summary
              </span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Bundling these {bundledShipments.length} shipments onto {assignedVehicle.name} achieves <span className="text-indigo-400 font-bold">{utilizationRate}% capacity utilization</span> and lowers shared expected operational loss to <span className="text-emerald-400 font-bold">${expectedSharedLoss} per shipment</span>.
              </p>
            </div>

            <button
              onClick={handleCreatePool}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-cyan-600 hover:from-indigo-400 hover:to-cyan-500 text-white font-mono font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>CREATE MICROPOOL BUNDLE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* GRID: AVAILABLE SMALL SHIPMENTS & POTENTIAL POOL MATCHES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Small Shipments List */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Package className="w-4 h-4 text-cyan-400" />
              Available Small Shipments ({shipments.length})
            </h2>
            <span className="text-[10px] font-mono text-slate-400">Select to Toggle Bundle</span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            {shipments.map((s) => {
              const isPrimary = s.id === selectedPrimaryId;
              const isSecondary = selectedSecondaryIds.includes(s.id);
              const isBundled = isPrimary || isSecondary;

              return (
                <div
                  key={s.id}
                  onClick={() => {
                    if (!isPrimary) toggleSecondaryShipment(s.id);
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    isPrimary
                      ? 'bg-cyan-500/10 border-cyan-500/50 text-slate-100'
                      : isSecondary
                      ? 'bg-indigo-500/10 border-indigo-500/50 text-slate-100'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-cyan-400">{s.id}</span>
                      <StatusBadge status={s.status} />
                      {isPrimary && (
                        <span className="px-1.5 py-0.2 text-[9px] bg-cyan-500/20 text-cyan-400 rounded border border-cyan-500/30">
                          PRIMARY
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-slate-200">{s.sender}</p>
                    <p className="text-[10px] text-slate-400">{s.destination}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold font-mono text-emerald-400 block">
                      {s.weight || s.weightKg} kg
                    </span>
                    <span className="text-[10px] text-slate-400 block">{s.category}</span>
                    <button
                      type="button"
                      className={`mt-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-all ${
                        isBundled
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {isPrimary ? 'Anchor' : isSecondary ? 'Bundled ✓' : '+ Bundle'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Potential Corridor Pool Matches */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Share2 className="w-4 h-4 text-indigo-400" />
              Active Corridor Pool Bundles ({createdPools.length})
            </h2>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">Corridor Match Active</span>
          </div>

          <div className="space-y-4">
            {createdPools.map((pool) => (
              <div
                key={pool.id}
                className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3 text-xs font-mono"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-400">{pool.id}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {pool.status}
                  </span>
                </div>

                <p className="font-bold text-slate-200">{pool.corridorName}</p>

                <div className="grid grid-cols-3 gap-2 text-[11px] p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div>
                    <span className="text-slate-500 text-[9px] block uppercase">Weight</span>
                    <span className="text-slate-200 font-bold">{pool.combinedWeightKg} kg</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[9px] block uppercase">Utilization</span>
                    <span className="text-indigo-400 font-bold">{pool.vehicleCapacityAfter}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[9px] block uppercase">Savings</span>
                    <span className="text-emerald-400 font-bold">{pool.totalSavings}</span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                  <span>Vehicle: <span className="text-slate-200 font-bold">{pool.vehicleAssigned}</span></span>
                  <span>Overlap: <span className="text-cyan-400 font-bold">{pool.compatibilityScores?.routeOverlap || '96%'}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
