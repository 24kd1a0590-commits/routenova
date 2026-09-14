import React from 'react';

export default function StatusBadge({ status = 'PRE_DISPATCH_EVALUATION', className = '' }) {
  const configs = {
    PRE_DISPATCH_EVALUATION: {
      bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      label: 'Pre-Dispatch Check',
    },
    POOL_MATCHED: {
      bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
      label: 'Pool Matched',
    },
    DISPATCHED: {
      bg: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
      label: 'In Transit',
    },
    DELIVERED: {
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      label: 'Delivered',
    },
    FAILURE_REATTEMPT: {
      bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      label: 'Reattempt Needed',
    },
    AVAILABLE: {
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      label: 'Available',
    },
    MAINTENANCE: {
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      label: 'Maintenance',
    },
  };

  const current = configs[status] || {
    bg: 'bg-slate-700/50 text-slate-300 border-slate-600',
    label: status.replace(/_/g, ' '),
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-mono font-medium border ${current.bg} ${className}`}
    >
      {current.label}
    </span>
  );
}
