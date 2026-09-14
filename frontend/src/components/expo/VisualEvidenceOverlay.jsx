import React, { useState, useEffect } from 'react';
import {
  Scan,
  AlertTriangle,
  Droplets,
  HelpCircle,
  Eye,
  CheckCircle,
  Maximize2,
  Sparkles,
} from 'lucide-react';

export default function VisualEvidenceOverlay({
  roadData,
  isScanning,
  userImageSrc,
  onMarkerClick,
}) {
  const [scanPosition, setScanPosition] = useState(0);

  // Scanning laser animation effect
  useEffect(() => {
    if (!isScanning) return;
    const interval = setInterval(() => {
      setScanPosition((prev) => (prev >= 100 ? 0 : prev + 2.5));
    }, 30);
    return () => clearInterval(interval);
  }, [isScanning]);

  const variant = roadData?.svgVariant || 'potholes';

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-slate-950 border border-cyan-500/40 shadow-2xl group select-none">
      {/* TOP SCANNING STATUS BAR */}
      <div className="absolute top-0 left-0 right-0 z-20 px-4 py-2 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between font-mono text-xs">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-cyan-400 font-bold uppercase tracking-wider">
            {isScanning ? '🔍 ROUTENOVA SCANNING ROAD...' : '👁️ ROAD EVIDENCE INPUT'}
          </span>
        </div>
        <div className="text-[10px] text-slate-400 flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
            {roadData?.label || 'Rural Segment'}
          </span>
          <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
            PROTOTYPE EVIDENCE
          </span>
        </div>
      </div>

      {/* ROAD VISUAL CONTAINER */}
      <div className="relative w-full h-[320px] sm:h-[380px] bg-slate-900 flex items-center justify-center overflow-hidden">
        {userImageSrc ? (
          <img
            src={userImageSrc}
            alt="User uploaded road evidence"
            className="w-full h-full object-cover"
          />
        ) : (
          /* SVG ARTWORK REPRESENTING DEMO ROAD TYPES */
          <svg
            className="w-full h-full object-cover"
            viewBox="0 0 800 500"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>

              <linearGradient id="roadGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                {variant === 'paved' && (
                  <>
                    <stop offset="0%" stopColor="#334155" />
                    <stop offset="100%" stopColor="#1e293b" />
                  </>
                )}
                {variant === 'mud' || variant === 'combined' ? (
                  <>
                    <stop offset="0%" stopColor="#78350f" />
                    <stop offset="100%" stopColor="#451a03" />
                  </>
                ) : null}
                {variant === 'waterlogged' && (
                  <>
                    <stop offset="0%" stopColor="#1e3a8a" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </>
                )}
                {variant === 'potholes' || variant === 'narrow' ? (
                  <>
                    <stop offset="0%" stopColor="#475569" />
                    <stop offset="100%" stopColor="#334155" />
                  </>
                ) : null}
              </linearGradient>

              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Background Sky & Hills */}
            <rect width="800" height="500" fill="url(#skyGrad)" />
            <path d="M0 220 Q 200 160 400 200 T 800 180 L 800 500 L 0 500 Z" fill="#0f172a" opacity="0.8" />
            <path d="M0 260 Q 300 210 600 250 T 800 230 L 800 500 L 0 500 Z" fill="#1e293b" opacity="0.6" />

            {/* Perspective Road Geometry */}
            {variant === 'narrow' ? (
              <polygon points="380,220 420,220 620,500 180,500" fill="url(#roadGrad)" />
            ) : (
              <polygon points="360,220 440,220 750,500 50,500" fill="url(#roadGrad)" />
            )}

            {/* Road Markings / Mud Ruts / Water Highlights */}
            {variant === 'paved' && (
              <>
                <line x1="400" y1="220" x2="400" y2="500" stroke="#f59e0b" strokeWidth="4" strokeDasharray="20 15" opacity="0.8" />
                <line x1="365" y1="220" x2="60" y2="500" stroke="#ffffff" strokeWidth="3" opacity="0.5" />
                <line x1="435" y1="220" x2="740" y2="500" stroke="#ffffff" strokeWidth="3" opacity="0.5" />
              </>
            )}

            {(variant === 'mud' || variant === 'combined') && (
              <>
                {/* Mud Ruts */}
                <path d="M 380,220 Q 350,350 200,500" stroke="#27272a" strokeWidth="22" fill="none" opacity="0.6" />
                <path d="M 420,220 Q 450,350 600,500" stroke="#27272a" strokeWidth="22" fill="none" opacity="0.6" />
                <path d="M 378,220 Q 348,350 196,500" stroke="#92400e" strokeWidth="10" fill="none" />
                <path d="M 422,220 Q 452,350 604,500" stroke="#92400e" strokeWidth="10" fill="none" />
              </>
            )}

            {variant === 'waterlogged' && (
              <>
                {/* Water Body Overlay */}
                <ellipse cx="400" cy="380" rx="220" ry="60" fill="#3b82f6" opacity="0.45" filter="url(#glow)" />
                <path d="M 200,380 Q 400,340 600,380 T 200,380" fill="#60a5fa" opacity="0.3" />
              </>
            )}

            {variant === 'potholes' && (
              <>
                {/* Pothole Shapes */}
                <ellipse cx="340" cy="360" rx="45" ry="25" fill="#090d16" stroke="#94a3b8" strokeWidth="2" opacity="0.9" />
                <ellipse cx="580" cy="420" rx="55" ry="30" fill="#090d16" stroke="#64748b" strokeWidth="2" opacity="0.8" />
              </>
            )}

            {variant === 'combined' && (
              <>
                <ellipse cx="380" cy="320" rx="35" ry="18" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="2" opacity="0.8" />
                <ellipse cx="480" cy="390" rx="50" ry="25" fill="#090d16" stroke="#ef4444" strokeWidth="2" opacity="0.9" />
              </>
            )}
          </svg>
        )}

        {/* SCANNING LASER WAVE EFFECT */}
        {isScanning && (
          <div
            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] z-20 pointer-events-none transition-all duration-75"
            style={{ top: `${scanPosition}%` }}
          />
        )}

        {/* GRID OVERLAY WHEN SCANNING */}
        {isScanning && (
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0891b215_1px,transparent_1px),linear-gradient(to_bottom,#0891b215_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-10 animate-pulse" />
        )}

        {/* HAZARD MARKER OVERLAYS ON IMAGE */}
        {!isScanning &&
          roadData?.hazards?.map((h, idx) => (
            <div
              key={h.id || idx}
              onClick={() => onMarkerClick && onMarkerClick(h)}
              className="absolute z-30 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group/marker transition-all duration-300 hover:scale-125"
              style={{ left: `${h.x || 50}%`, top: `${h.y || 50}%` }}
            >
              {/* Pulse Ring */}
              <div className="relative flex items-center justify-center">
                <span className="absolute w-12 h-12 rounded-full bg-rose-500/30 animate-ping" />
                <span className="absolute w-8 h-8 rounded-full bg-rose-500/50 border border-rose-400" />
                <div className="relative z-10 w-9 h-9 rounded-full bg-slate-950 border-2 border-rose-500 flex items-center justify-center shadow-lg text-lg">
                  {h.icon || '⚠️'}
                </div>
              </div>

              {/* Marker Label Tooltip */}
              <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 rounded-xl bg-slate-950/95 border border-rose-500/60 text-white font-mono text-[11px] shadow-2xl pointer-events-none flex items-center gap-1.5 font-bold">
                <span className="text-rose-400">{h.label}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300">
                  {Math.round((h.confidence || 0.9) * 100)}% DETECTED
                </span>
              </div>
            </div>
          ))}
      </div>

      {/* BOTTOM SUMMARY FLOATING BADGE */}
      <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between font-mono text-xs">
        <div className="flex items-center space-x-2 text-slate-300">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>
            Accessibility Score:{' '}
            <strong className={roadData?.accessibilityScore < 50 ? 'text-rose-400 font-extrabold' : 'text-emerald-400 font-extrabold'}>
              {roadData?.accessibilityScore || 50} / 100
            </strong>
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {roadData?.hazards?.length > 0 ? (
            <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold text-[11px]">
              ⚠️ {roadData.hazards.length} HAZARD(S) IDENTIFIED
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-[11px]">
              ✓ NO HAZARD DETECTED
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
