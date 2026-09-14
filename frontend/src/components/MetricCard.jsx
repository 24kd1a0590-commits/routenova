import React from 'react';

export default function MetricCard({
  title,
  value,
  subtitle,
  trend,
  trendPositive = true,
  icon: Icon,
  iconColor = 'text-cyan-400',
  iconBg = 'bg-cyan-500/10',
  borderAccent = '',
}) {
  return (
    <div className={`glass-panel p-5 rounded-xl border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-all ${borderAccent}`}>
      {/* Background Subtle Accent Glow */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-slate-800/30 blur-2xl group-hover:bg-slate-700/40 transition-all pointer-events-none" />

      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-lg ${iconBg} ${iconColor} border border-slate-700/50`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl lg:text-3xl font-bold font-mono text-slate-100 tracking-tight">
          {value}
        </span>
        {trend && (
          <span
            className={`text-xs font-medium px-1.5 py-0.5 rounded ${
              trendPositive
                ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
            }`}
          >
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
          {subtitle}
        </p>
      )}
    </div>
  );
}
