import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ShieldAlert,
  Info,
  Sliders,
  Scale,
} from 'lucide-react';

export default function RiskEvidencePanel({
  roadData,
  currentVehicle,
  reliabilityEval,
  lossEval,
}) {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const isHighRisk = reliabilityEval?.riskLevel === 'HIGH';
  const isMediumRisk = reliabilityEval?.riskLevel === 'MEDIUM';

  const hazards = roadData?.hazards || [];
  const clearance = currentVehicle?.groundClearanceMm || 160;
  const isClearanceLow = clearance < 180;
  const isNarrowMismatch = (roadData?.roadWidth || 3.0) < 2.5 && currentVehicle?.type === 'van';

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800 bg-slate-950/90 space-y-5 shadow-2xl font-sans">
      {/* PANEL TITLE BAR */}
      <div className="flex items-center justify-between border-b border-slate-850 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className={`p-2 rounded-xl ${isHighRisk ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold font-mono text-white flex items-center gap-2">
              WHY IS THIS DELIVERY {reliabilityEval?.riskLevel || 'HIGH'} RISK?
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              RouteNova Evidence-Based Risk Breakdown
            </p>
          </div>
        </div>

        {/* STATUS BADGE */}
        <span
          className={`px-3 py-1 rounded-xl font-mono text-xs font-bold border flex items-center space-x-1.5 ${
            isHighRisk
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
              : isMediumRisk
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
              : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
          }`}
        >
          {isHighRisk ? <span>🔴 HIGH RISK</span> : isMediumRisk ? <span>🟡 WARNING</span> : <span>🟢 SAFE</span>}
        </span>
      </div>

      {/* VISUAL EVIDENCE COMPARISON GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        {/* ROAD EVIDENCE COLUMN */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center space-x-2 text-amber-400 font-bold uppercase text-[11px]">
            <span>🛣️ ROAD EVIDENCE</span>
          </div>

          <ul className="space-y-2 text-slate-300 text-xs">
            {hazards.length > 0 ? (
              hazards.map((h, idx) => (
                <li key={idx} className="flex items-center space-x-2 text-rose-300">
                  <span className="text-base">{h.icon || '⚠️'}</span>
                  <span className="font-bold">{h.label}</span>
                </li>
              ))
            ) : (
              <li className="flex items-center space-x-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>No major surface hazards</span>
              </li>
            )}
            <li className="text-slate-400 text-[11px] pt-1 border-t border-slate-800">
              Width: {roadData?.roadWidth || 3.0}m ({roadData?.roadWidthCategory || 'medium'})
            </li>
          </ul>
        </div>

        {/* VEHICLE EVIDENCE COLUMN */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center space-x-2 text-cyan-400 font-bold uppercase text-[11px]">
            <span>🚚 VEHICLE EVIDENCE</span>
          </div>

          <ul className="space-y-2 text-slate-300 text-xs">
            <li className={`flex items-center space-x-2 ${isClearanceLow ? 'text-rose-300 font-bold' : 'text-slate-300'}`}>
              {isClearanceLow ? <XCircle className="w-4 h-4 text-rose-400 shrink-0" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              <span>Ground Clearance: {clearance}mm {isClearanceLow ? '(Low)' : '(OK)'}</span>
            </li>
            <li className={`flex items-center space-x-2 ${isNarrowMismatch ? 'text-rose-300 font-bold' : 'text-slate-300'}`}>
              {isNarrowMismatch ? <XCircle className="w-4 h-4 text-rose-400 shrink-0" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              <span>Track Compatibility: {isNarrowMismatch ? 'Width Mismatch' : 'Suitable'}</span>
            </li>
            <li className="text-slate-400 text-[11px] pt-1 border-t border-slate-800">
              Drivetrain: {currentVehicle?.drivetrain || '2WD Standard'}
            </li>
          </ul>
        </div>

        {/* COMBINED DECISION COLUMN */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between ${
          isHighRisk
            ? 'bg-rose-500/10 border-rose-500/40 text-rose-200'
            : 'bg-slate-900 border-slate-800 text-slate-200'
        }`}>
          <div>
            <div className="text-xs font-bold uppercase text-slate-400 mb-1">DECISION</div>
            <div className="text-sm font-extrabold font-mono flex items-center gap-1.5 text-white">
              <span>ROAD + VEHICLE =</span>
              <span className={isHighRisk ? 'text-rose-400 underline decoration-rose-500' : 'text-emerald-400'}>
                {isHighRisk ? 'UNSUITABLE ✕' : 'SUITABLE ✓'}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-sans mt-2">
              {reliabilityEval?.primaryRisk || 'High vehicle-road surface mismatch'}
            </p>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-850 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Reliability Score:</span>
            <span className="font-extrabold text-rose-400 text-sm">
              {reliabilityEval?.reliabilityScore || 45} / 100
            </span>
          </div>
        </div>
      </div>

      {/* EXPANDABLE TECHNICAL DETAILS BUTTON */}
      <div className="pt-1">
        <button
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 text-cyan-400 font-mono text-xs font-bold transition flex items-center justify-between"
        >
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>🔍 TECHNICAL DETAILS & CALCULATION ENGINE BREAKDOWN</span>
          </div>
          {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {/* EXPANDED TECHNICAL DETAILS BREAKDOWN */}
        {showTechnicalDetails && (
          <div className="mt-3 p-4 rounded-2xl bg-slate-950 border border-cyan-500/30 text-xs font-mono space-y-4 animate-fade-in text-slate-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Reliability Factor Contributions */}
              <div className="space-y-2 p-3 rounded-xl bg-slate-900 border border-slate-850">
                <span className="text-cyan-400 font-bold block text-[11px] uppercase">
                  Reliability Weights (6-Factor Model)
                </span>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>Road Accessibility (30%):</span>
                    <strong className="text-amber-400">{reliabilityEval?.factors?.roadAccessibility?.score || 45}/100</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Vehicle Compatibility (25%):</span>
                    <strong className="text-rose-400">{reliabilityEval?.factors?.vehicleCompatibility?.score || 30}/100</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Address Confidence (20%):</span>
                    <strong className="text-slate-300">{reliabilityEval?.factors?.addressConfidence?.score || 70}/100</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Historical Success (15%):</span>
                    <strong className="text-slate-300">{reliabilityEval?.factors?.historicalSuccess?.score || 65}/100</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Cell Connectivity (10%):</span>
                    <strong className="text-slate-300">{reliabilityEval?.factors?.connectivity?.score || 75}/100</strong>
                  </div>
                </div>
              </div>

              {/* Expected Operational Loss Formula */}
              <div className="space-y-2 p-3 rounded-xl bg-slate-900 border border-slate-850">
                <span className="text-emerald-400 font-bold block text-[11px] uppercase">
                  Expected Operational Loss Math
                </span>
                <div className="text-[10px] space-y-1 text-slate-400">
                  <p className="text-slate-200 font-bold">
                    Expected Loss = (P_fail × Cost_fail) + (P_delay × Cost_delay) + Cost_vehicle + Cost_reattempt
                  </p>
                  <p>• P(Failure): {Math.round((reliabilityEval?.failureProbability || 0.55) * 100)}%</p>
                  <p>• Base Incident Risk Exposure: ${lossEval?.estimatedFailureCost || 192}</p>
                  <p>• Transit Rental: ${lossEval?.vehicleCost || 85}</p>
                  <p>• Reattempt Exposure: ${lossEval?.reattemptCost || 99}</p>
                  <div className="pt-1 border-t border-slate-800 text-white font-bold flex justify-between">
                    <span>Total Exposure:</span>
                    <span className="text-rose-400 text-xs">${lossEval?.expectedOperationalLoss || 420}</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 italic">
              * Note: Prototype decision model logic using default loss coefficients.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
