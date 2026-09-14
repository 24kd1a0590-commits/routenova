import React from 'react';

export default function ReliabilityGauge({ score = 46, riskLevel = 'HIGH', size = 180 }) {
  const normalizedScore = Math.min(100, Math.max(0, score));

  // Circular gauge math
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  const colorConfigs = {
    HIGH: {
      stroke: '#f43f5e',
      glow: 'drop-shadow-[0_0_12px_rgba(244,63,94,0.6)]',
      text: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/30',
      label: 'HIGH RISK',
    },
    MEDIUM: {
      stroke: '#f59e0b',
      glow: 'drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]',
      text: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/30',
      label: 'MEDIUM RISK',
    },
    LOW: {
      stroke: '#10b981',
      glow: 'drop-shadow-[0_0_12px_rgba(16,185,129,0.6)]',
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/30',
      label: 'LOW RISK',
    },
  };

  const current = colorConfigs[riskLevel] || colorConfigs.HIGH;

  return (
    <div className="flex flex-col items-center justify-center relative p-4">
      {/* SVG Radial Gauge */}
      <div className="relative flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Foreground Animated Score Stroke */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={current.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className={`transition-all duration-1000 ease-out ${current.glow}`}
          />
        </svg>

        {/* Center Score Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="flex items-baseline font-mono font-bold tracking-tight">
            <span className="text-4xl text-slate-100">{normalizedScore}</span>
            <span className="text-xs text-slate-500 ml-1">/100</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">
            Reliability Score
          </span>
        </div>
      </div>

      {/* Risk Badge Pill */}
      <div className={`mt-3 px-3 py-1 rounded-full text-xs font-mono font-bold border flex items-center gap-1.5 ${current.bg} ${current.text}`}>
        <span className="w-2 h-2 rounded-full bg-current animate-ping" />
        <span>{current.label}</span>
      </div>
    </div>
  );
}
