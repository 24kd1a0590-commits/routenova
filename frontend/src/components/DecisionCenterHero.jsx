import React, { useState } from 'react';
import RiskBadge from './RiskBadge';
import DispatchModal from './DispatchModal';
import DispatchSuccessScreen from './DispatchSuccessScreen';
import {
  Zap,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  DollarSign,
  Award,
  Check,
  AlertTriangle,
  Car,
  TrendingDown,
  Layers,
  HelpCircle,
  Clock,
  Navigation,
} from 'lucide-react';

export default function DecisionCenterHero({
  optionA,
  optionB,
  optionC,
  destinationName = 'Rampuram Village Hub',
  onAcceptDispatch,
}) {
  const [selectedOptionId, setSelectedOptionId] = useState('optionC');
  const [modalOpen, setModalOpen] = useState(false);
  const [isDispatched, setIsDispatched] = useState(false);

  const options = [
    {
      id: 'optionA',
      letter: 'OPTION A',
      subtitle: 'CURRENT BASELINE PLAN',
      data: optionA,
      color: 'rose',
      borderClass: 'border-rose-500/40 hover:border-rose-500/60',
      badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    },
    {
      id: 'optionB',
      letter: 'OPTION B',
      subtitle: 'ALTERNATIVE VEHICLE',
      data: optionB,
      color: 'cyan',
      borderClass: 'border-cyan-500/40 hover:border-cyan-500/60',
      badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    },
    {
      id: 'optionC',
      letter: 'OPTION C',
      subtitle: 'MICROPOOL STRATEGY',
      data: optionC,
      color: 'emerald',
      isRecommended: true,
      borderClass: 'border-emerald-500/70 bg-slate-900/90 shadow-2xl shadow-emerald-500/15 ring-2 ring-emerald-500/40',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    },
  ];

  const activeOption = options.find((o) => o.id === selectedOptionId) || options[2];

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleConfirmDispatch = () => {
    setModalOpen(false);
    setIsDispatched(true);

    // Save dispatch record in LocalStorage
    const dispatchRecord = {
      dispatchId: `DISPATCH-${Date.now().toString().slice(-4)}`,
      destination: destinationName,
      selectedPlan: activeOption.data,
      status: 'DISPATCHED',
      vehicleStatus: 'IN_TRANSIT',
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('lastDispatchRecord', JSON.stringify(dispatchRecord));

    if (onAcceptDispatch) onAcceptDispatch(activeOption.data);
  };

  if (isDispatched) {
    return (
      <DispatchSuccessScreen
        planData={{
          ...activeOption.data,
          planName: activeOption.letter === 'OPTION C' ? 'Plan C: Pooled 4x4 Mini Truck' : `${activeOption.letter}: ${activeOption.data.vehicleName}`,
        }}
        destinationName={destinationName}
        onViewDelivery={() => setIsDispatched(false)}
      />
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 3-COLUMN SIDE-BY-SIDE OPTION CARDS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
                <Zap className="w-3 h-3 fill-current" /> MAIN DEMO SCREEN
              </span>
              <span className="text-xs font-mono text-slate-400">STAGE 11 DISPATCH WORKFLOW</span>
            </div>
            <h2 className="text-xl font-bold font-mono text-slate-100 uppercase tracking-wide mt-1">
              ROUTENOVA PRE-DISPATCH STRATEGY MATRIX
            </h2>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30">
            <Award className="w-4 h-4" />
            <span>Lowest Loss Guaranteed</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {options.map((opt) => {
            const d = opt.data;
            const isSelected = selectedOptionId === opt.id;

            return (
              <div
                key={opt.id}
                onClick={() => setSelectedOptionId(opt.id)}
                className={`glass-panel p-6 rounded-2xl border cursor-pointer transition-all relative space-y-5 ${opt.borderClass}`}
              >
                {/* Recommended Badge */}
                {opt.isRecommended && (
                  <div className="absolute -top-3 right-4 px-3.5 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-[10px] font-mono font-bold uppercase shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 animate-pulse">
                    <Sparkles className="w-3.5 h-3.5 fill-current" /> ROUTENOVA BEST PICK
                  </div>
                )}

                <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                  <div>
                    <span className={`text-[10px] font-mono font-bold uppercase ${opt.badgeBg} px-2 py-0.5 rounded border`}>
                      {opt.letter} — {opt.subtitle}
                    </span>
                    <h3 className="text-base font-bold text-slate-100 font-mono mt-2">
                      {d.vehicleName}
                    </h3>
                  </div>
                  <input
                    type="radio"
                    checked={isSelected}
                    onChange={() => setSelectedOptionId(opt.id)}
                    className="text-emerald-500 focus:ring-emerald-500 w-4 h-4"
                  />
                </div>

                {/* Comparative Metric Rows */}
                <div className="space-y-2.5 text-xs font-mono">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Vehicle & Drivetrain:</span>
                    <span className="text-slate-200 font-semibold">{d.vehicleType}</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-400">
                    <span>Shipment Load:</span>
                    <span className="text-slate-200 font-bold">{d.shipmentLoadKg} kg</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-400">
                    <span>Distance:</span>
                    <span className="text-slate-300">{d.distanceKm} km</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-400">
                    <span>Reliability Score:</span>
                    <span className="font-bold text-slate-100 font-mono text-sm">{d.reliabilityScore} / 100</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-400">
                    <span>Failure Risk:</span>
                    <RiskBadge level={d.riskLevel} score={d.failureProbability} />
                  </div>

                  <div className="flex justify-between items-center text-slate-400">
                    <span>Vehicle Utilization:</span>
                    <span className={`font-bold ${d.utilizationPercent > 80 ? 'text-emerald-400' : 'text-slate-300'}`}>
                      {d.utilizationPercent}% Capacity
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-400 pt-2 border-t border-slate-800">
                    <span>Estimated Transit Cost:</span>
                    <span className="text-slate-200 font-bold">${d.estimatedCost}</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-400 pt-1">
                    <span>Expected Operational Loss:</span>
                    <span
                      className={`text-lg font-bold font-mono ${
                        opt.isRecommended
                          ? 'text-emerald-400'
                          : opt.color === 'rose'
                          ? 'text-rose-400'
                          : 'text-slate-200'
                      }`}
                    >
                      ${d.expectedLoss}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* LARGE HERO RECOMMENDATION PANEL ("ROUTENOVA RECOMMENDS") */}
      <div className="glass-panel p-8 rounded-3xl border border-emerald-500/50 relative overflow-hidden shadow-2xl space-y-6">
        {/* Background Subtle Accent Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10 border-b border-slate-800 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow">
                <Sparkles className="w-4 h-4 fill-current text-emerald-400" /> DECISION ENGINE RECOMMENDATION
              </span>
              <span className="text-xs font-mono text-slate-400">OPTIMAL OPERATIONAL PLAN</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-mono text-slate-100 tracking-tight">
              ROUTENOVA RECOMMENDS
            </h2>
            <p className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
              MICROPOOL DELIVERY ({optionC.vehicleName})
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/40 font-mono text-center min-w-[200px]">
            <span className="text-xs text-slate-400 block uppercase">Operational Loss Saved</span>
            <span className="text-3xl font-extrabold text-emerald-400 font-mono block mt-1">
              ${optionA.expectedLoss - optionC.expectedLoss}
            </span>
            <span className="text-[10px] text-emerald-300 font-semibold block mt-0.5">
              81.4% Loss Exposure Reduction
            </span>
          </div>
        </div>

        {/* WHY? COMPUTED RATIONALE LIST */}
        <div className="space-y-3 relative z-10 font-mono">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            Why does RouteNova recommend Option C over Option A & B?
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Acceptable Reliability
              </span>
              <p className="text-slate-300 text-[11px]">
                Operational reliability score of <span className="font-bold text-slate-100">{optionC.reliabilityScore}/100</span> (LOW RISK classification).
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Compatible Drivetrain
              </span>
              <p className="text-slate-300 text-[11px]">
                4x4 mini truck drivetrain eliminates unpaved mud rutting failure modes on final segment.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4" /> Better Capacity Utilization
              </span>
              <p className="text-slate-300 text-[11px]">
                Boosts vehicle payload capacity utilization from <span className="font-bold text-slate-100">{optionA.utilizationPercent}%</span> to <span className="font-bold text-emerald-400">{optionC.utilizationPercent}%</span>.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <DollarSign className="w-4 h-4" /> Lower Cost Per Shipment
              </span>
              <p className="text-slate-300 text-[11px]">
                Shared transit rental reduces shipment cost share by 50% ($55 vs $110).
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 lg:col-span-2">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <Award className="w-4 h-4" /> Lowest Expected Operational Loss
              </span>
              <p className="text-slate-300 text-[11px]">
                Total Expected Operational Loss exposure minimized to <span className="font-bold text-emerald-400">${optionC.expectedLoss}</span> (vs ${optionA.expectedLoss} on baseline van).
              </p>
            </div>
          </div>
        </div>

        {/* HERO ACTION BUTTON: ACCEPT & DISPATCH */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <div className="text-xs font-mono text-slate-400">
            Selected for Execution: <span className="text-emerald-400 font-bold uppercase">{activeOption.data.vehicleName} ({activeOption.letter})</span>
          </div>

          <button
            onClick={handleOpenModal}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-mono font-extrabold text-sm rounded-2xl shadow-2xl shadow-emerald-500/30 flex items-center justify-center gap-3 transition-all hover:scale-[1.02]"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>ACCEPT & DISPATCH RECOMMENDED PLAN</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* DISPATCH CONFIRMATION MODAL */}
      <DispatchModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmDispatch}
        planData={activeOption.data}
        destinationName={destinationName}
        shipmentCount={activeOption.id === 'optionC' ? 2 : 1}
      />
    </div>
  );
}
