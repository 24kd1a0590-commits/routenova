import React, { useState } from 'react';
import { RotateCcw, CheckCircle2, Clock, AlertTriangle, Database, ArrowRight, ShieldCheck } from 'lucide-react';
import { recordOutcomeAsync } from '../../services/outcomeEngine';

export default function OutcomeLearningLoop({
  destinationId = 'DEST-01',
  vehicleId = 'VEH-03',
  shipmentId = 'RN-2026-8801',
  onRecorded,
}) {
  const [selectedOutcome, setSelectedOutcome] = useState('SUCCESS');
  const [notes, setNotes] = useState('');
  const [recorded, setRecorded] = useState(false);
  const [evidenceCount, setEvidenceCount] = useState(42);

  const handleRecordOutcome = async () => {
    await recordOutcomeAsync({
      destinationId,
      vehicleId,
      shipmentId,
      outcome: selectedOutcome,
      notes: notes || `Field outcome recorded via RouteNova Expo: ${selectedOutcome}`,
    });

    setRecorded(true);
    setEvidenceCount((prev) => prev + 1);
    if (onRecorded) onRecorded(selectedOutcome);
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-950/90 space-y-6 shadow-2xl font-sans">
      <div className="flex items-center justify-between border-b border-slate-850 pb-3">
        <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
          <RotateCcw className="w-5 h-5" />
          <span>OPERATIONAL EVIDENCE FEEDBACK LOOP</span>
        </div>
        <span className="px-2.5 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-cyan-300">
          CLOSED-LOOP EVIDENCE
        </span>
      </div>

      {!recorded ? (
        <div className="space-y-4 font-mono text-xs">
          <p className="text-slate-300 font-sans text-sm">
            Record actual field delivery outcome to update local segment reliability evidence:
          </p>

          {/* OUTCOME SELECTION BUTTONS */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setSelectedOutcome('SUCCESS')}
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition ${
                selectedOutcome === 'SUCCESS'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold scale-[1.02]'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>✓ SUCCESSFUL</span>
            </button>

            <button
              onClick={() => setSelectedOutcome('DELAYED')}
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition ${
                selectedOutcome === 'DELAYED'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold scale-[1.02]'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-5 h-5 text-amber-400" />
              <span>⏱️ DELAYED</span>
            </button>

            <button
              onClick={() => setSelectedOutcome('FAILED')}
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition ${
                selectedOutcome === 'FAILED'
                  ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold scale-[1.02]'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <span>✕ REATTEMPT</span>
            </button>
          </div>

          <button
            onClick={handleRecordOutcome}
            className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs shadow-lg transition flex items-center justify-center space-x-2"
          >
            <Database className="w-4 h-4" />
            <span>RECORD OUTCOME INTO OPERATIONAL EVIDENCE</span>
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 font-mono text-xs space-y-2 text-center animate-fade-in">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
          <div className="font-extrabold text-sm text-white">
            OUTCOME RECORDED AS {selectedOutcome}!
          </div>
          <p className="text-slate-300 text-[11px] font-sans">
            Segment historical evidence updated ({evidenceCount} total records). Future decision evaluations for Rampuram Corridor will utilize this updated operational evidence.
          </p>
        </div>
      )}

      {/* VISUAL FEEDBACK PIPELINE DIAGRAM */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-850 space-y-2 font-mono text-[11px]">
        <div className="text-slate-400 font-bold uppercase text-[10px] text-center mb-1">
          OPERATIONAL EVIDENCE FEEDBACK PIPELINE
        </div>
        <div className="grid grid-cols-5 gap-1 text-center">
          <div className="p-2 rounded bg-slate-950 text-cyan-400 font-bold">1. Delivery</div>
          <div className="p-2 rounded bg-slate-950 text-cyan-400 font-bold">2. Outcome</div>
          <div className="p-2 rounded bg-slate-950 text-indigo-400 font-bold">3. Evidence Log</div>
          <div className="p-2 rounded bg-slate-950 text-amber-400 font-bold">4. Risk Weight</div>
          <div className="p-2 rounded bg-slate-950 text-emerald-400 font-bold">5. Better Decisions</div>
        </div>
      </div>
    </div>
  );
}
