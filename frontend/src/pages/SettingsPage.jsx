import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import { Settings, Sliders, Shield, Database, RefreshCw, Check } from 'lucide-react';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [weights, setWeights] = useState({
    roadAccessibility: 30,
    vehicleCompatibility: 25,
    addressConfidence: 15,
    connectivity: 10,
    historicalEvidence: 12,
    distanceConditions: 8,
  });

  const [lossCosts, setLossCosts] = useState({
    failureCost: 350,
    delayCostPerHour: 45,
    reattemptCost: 180,
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <PageHeader
        title="Engine Parameters & System Settings"
        description="Configure decision factor weighting coefficients and expected operational loss cost baselines"
        badge="CONFIGURABLE ENGINE"
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: 6-Factor Decision Weighting */}
        <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-mono font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sliders className="w-4 h-4 text-cyan-400" />
            6-Factor Failure Risk Weighting Coefficients (%)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            {Object.entries(weights).map(([key, val]) => (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-slate-300 capitalize">
                  <span>{key.replace(/([A-Z])/g, ' $1')}:</span>
                  <span className="font-bold text-cyan-400">{val}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={val}
                  onChange={(e) => setWeights({ ...weights, [key]: Number(e.target.value) })}
                  className="w-full accent-cyan-400 bg-slate-950"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Expected Loss Cost Parameters */}
        <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-mono font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <Shield className="w-4 h-4 text-emerald-400" />
            Expected Operational Loss Default Cost Coefficients ($)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div>
              <label className="block text-slate-400 mb-1">Failure Incident Cost ($)</label>
              <input
                type="number"
                value={lossCosts.failureCost}
                onChange={(e) => setLossCosts({ ...lossCosts, failureCost: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-950 text-slate-200 rounded-lg border border-slate-800"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Delay Cost per Hour ($)</label>
              <input
                type="number"
                value={lossCosts.delayCostPerHour}
                onChange={(e) => setLossCosts({ ...lossCosts, delayCostPerHour: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-950 text-slate-200 rounded-lg border border-slate-800"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Reattempt Base Cost ($)</label>
              <input
                type="number"
                value={lossCosts.reattemptCost}
                onChange={(e) => setLossCosts({ ...lossCosts, reattemptCost: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-950 text-slate-200 rounded-lg border border-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <Database className="w-4 h-4 text-cyan-400" />
            <span>Changes persist locally for prototype execution</span>
          </div>

          <div className="flex items-center gap-3">
            {saved && (
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <Check className="w-4 h-4" /> Parameters Updated!
              </span>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all"
            >
              SAVE ENGINE CONFIGURATION
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
