import React from 'react';

export default function LoadingState({ message = 'Evaluating operational parameters...' }) {
  return (
    <div className="glass-panel p-12 rounded-xl border border-slate-800 text-center flex flex-col items-center justify-center space-y-4">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
        <div className="absolute w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-500/30 animate-pulse" />
      </div>
      <div className="space-y-1">
        <p className="text-xs font-mono font-semibold text-slate-200 tracking-wide uppercase">
          {message}
        </p>
        <p className="text-[11px] text-slate-500 font-mono">
          RouteNova Pre-Dispatch Decision Engine
        </p>
      </div>
    </div>
  );
}
