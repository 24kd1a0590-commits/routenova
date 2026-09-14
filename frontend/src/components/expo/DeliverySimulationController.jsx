import React, { useState, useEffect } from 'react';
import { Truck, MapPin, CheckCircle2, Navigation, Play, Pause, RotateCcw } from 'lucide-react';
import { updateDeliveryStatusAsync } from '../../services/dataService';

const SIMULATION_STAGES = [
  { id: 'ASSIGNED', title: 'DISPATCHED', icon: Truck, label: '01 DISPATCHED', color: 'cyan' },
  { id: 'IN_TRANSIT', title: 'ON ROUTE', icon: Navigation, label: '02 ON ROUTE', color: 'indigo' },
  { id: 'ARRIVED', title: 'ARRIVED', icon: MapPin, label: '03 ARRIVED', color: 'amber' },
  { id: 'DELIVERED', title: 'DELIVERED', icon: CheckCircle2, label: '04 DELIVERED', color: 'emerald' },
];

export default function DeliverySimulationController({
  deliveryId = 'RN-2026-8801',
  vehicleName = '4WD Pickup Truck',
  destinationName = 'Rampuram Village',
  onComplete,
}) {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progressPct, setProgressPct] = useState(0);

  const activeStage = SIMULATION_STAGES[currentStageIdx];

  // Auto-play delivery transit simulation
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setProgressPct((prev) => {
        if (prev >= 100) {
          if (currentStageIdx < SIMULATION_STAGES.length - 1) {
            const nextIdx = currentStageIdx + 1;
            setCurrentStageIdx(nextIdx);
            const nextStage = SIMULATION_STAGES[nextIdx];
            updateDeliveryStatusAsync(deliveryId, nextStage.id, `Simulated transition to ${nextStage.id}`);
            return 0;
          } else {
            setIsPlaying(false);
            if (onComplete) onComplete();
            return 100;
          }
        }
        return prev + 5;
      });
    }, 150);

    return () => clearInterval(timer);
  }, [isPlaying, currentStageIdx, deliveryId, onComplete]);

  const handleStartSimulation = () => {
    setIsPlaying(true);
    if (currentStageIdx === SIMULATION_STAGES.length - 1) {
      setCurrentStageIdx(0);
      setProgressPct(0);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-950/90 space-y-6 shadow-2xl font-sans">
      <div className="flex items-center justify-between border-b border-slate-850 pb-3">
        <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
          <Truck className="w-5 h-5" />
          <span>REAL-TIME DELIVERY DISPATCH SIMULATION</span>
        </div>
        <span className="px-2.5 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-xs font-bold text-emerald-400">
          STATUS: {activeStage.title}
        </span>
      </div>

      {/* VISUAL ROUTE TIMELINE */}
      <div className="space-y-4 font-mono">
        <div className="flex items-center justify-between min-w-[320px] gap-2 text-xs">
          {SIMULATION_STAGES.map((stg, idx) => {
            const Icon = stg.icon;
            const isActive = currentStageIdx === idx;
            const isDone = currentStageIdx > idx;

            return (
              <div
                key={stg.id}
                className={`flex-1 p-3 rounded-xl border flex flex-col items-center justify-center space-y-1.5 transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-200 shadow-lg scale-105 ring-1 ring-cyan-500/50'
                    : isDone
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-900 border-slate-850 text-slate-500'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'animate-bounce text-cyan-400' : isDone ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span className="text-[10px] font-bold tracking-wider">{stg.label}</span>
              </div>
            );
          })}
        </div>

        {/* VEHICLE MOVEMENT PROGRESS BAR */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Dispatch Center</span>
            <span className="text-cyan-400 font-bold">{vehicleName} in transit... ({progressPct}%)</span>
            <span>{destinationName}</span>
          </div>
          <div className="relative w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500 transition-all duration-150 rounded-full shadow-[0_0_12px_#06b6d4]"
              style={{ width: `${(currentStageIdx * 33.3) + (progressPct * 0.333)}%` }}
            />
          </div>
        </div>
      </div>

      {/* SIMULATION CONTROLS */}
      <div className="flex items-center justify-center gap-3 pt-2">
        {!isPlaying ? (
          <button
            onClick={handleStartSimulation}
            className="py-3 px-8 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-mono font-bold text-xs shadow-xl flex items-center space-x-2 transition"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>START DELIVERY SIMULATION</span>
          </button>
        ) : (
          <button
            onClick={() => setIsPlaying(false)}
            className="py-3 px-8 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs flex items-center space-x-2 transition"
          >
            <Pause className="w-4 h-4" />
            <span>PAUSE SIMULATION</span>
          </button>
        )}
      </div>
    </div>
  );
}
