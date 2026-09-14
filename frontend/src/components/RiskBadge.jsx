import React from 'react';
import { AlertTriangle, ShieldCheck, AlertCircle } from 'lucide-react';

export default function RiskBadge({ level = 'LOW', score = null, className = '' }) {
  const normalizedLevel = String(level).toUpperCase();

  const configs = {
    HIGH: {
      bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      dot: 'bg-rose-500',
      icon: AlertTriangle,
      label: 'High Risk',
    },
    MEDIUM: {
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      dot: 'bg-amber-500',
      icon: AlertCircle,
      label: 'Medium Risk',
    },
    LOW: {
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      dot: 'bg-emerald-500',
      icon: ShieldCheck,
      label: 'Low Risk',
    },
  };

  const current = configs[normalizedLevel] || configs.LOW;
  const IconComponent = current.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${current.bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot} animate-pulse`} />
      <IconComponent className="w-3.5 h-3.5" />
      <span>{current.label}</span>
      {score !== null && (
        <span className="ml-1 opacity-80 border-l border-current/20 pl-1.5 font-mono">
          {Math.round(score * 100)}%
        </span>
      )}
    </span>
  );
}
