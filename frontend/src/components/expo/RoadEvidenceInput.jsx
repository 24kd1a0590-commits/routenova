import React, { useRef } from 'react';
import { DEMO_ROAD_CASES } from '../../data/demoRoadCases';
import { Camera, Upload, Layers, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function RoadEvidenceInput({
  selectedCaseId,
  onSelectCase,
  onImageUpload,
  isSimulatingProblem,
  onToggleProblemSimulation,
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        onImageUpload({
          name: file.name,
          src: evt.target.result,
          roadSurface: 'unpaved_mud',
          roadWidth: 2.3,
          accessibilityScore: 40,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4 font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
          <Camera className="w-4 h-4" />
          <span>SELECT ROAD EVIDENCE (DEMO SCENARIOS)</span>
        </div>
        <span className="text-[10px] font-mono text-slate-500">
          Controlled Demo Inputs
        </span>
      </div>

      {/* DEMO CASE GRID SELECTOR */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs">
        {DEMO_ROAD_CASES.map((c) => {
          const isSelected = selectedCaseId === c.id;
          return (
            <button
              key={c.id}
              onClick={() => onSelectCase(c.id)}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                isSelected
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-200 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/50 scale-[1.02]'
                  : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="font-bold text-xs line-clamp-1">{c.label}</span>
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 ml-1" />}
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px]">
                <span className={`px-1.5 py-0.5 rounded font-bold ${
                  c.accessibilityScore >= 70
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : c.accessibilityScore >= 50
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-rose-500/20 text-rose-300'
                }`}>
                  Acc: {c.accessibilityScore}/100
                </span>
                <span className="text-slate-500">{c.hazards.length} hazards</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* USER UPLOAD & PROBLEM SIMULATION BUTTONS */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        {/* User Image Upload */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 text-slate-300 font-mono text-xs font-bold transition flex items-center justify-center space-x-2"
        >
          <Upload className="w-3.5 h-3.5 text-cyan-400" />
          <span>Upload Custom Road Photo</span>
        </button>

        {/* Real-time Problem Simulation Trigger */}
        <button
          onClick={onToggleProblemSimulation}
          className={`w-full sm:w-auto px-4 py-2.5 rounded-xl border font-mono text-xs font-bold transition flex items-center justify-center space-x-2 ${
            isSimulatingProblem
              ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-lg shadow-rose-500/20 animate-pulse'
              : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/40 text-amber-300'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>{isSimulatingProblem ? '⚠️ SIMULATING ROAD PROBLEM...' : '⚡ TRY ROAD PROBLEM'}</span>
        </button>
      </div>
    </div>
  );
}
