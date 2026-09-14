import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import RouteMap from '../components/RouteMap';
import {
  Sparkles,
  Package,
  Brain,
  AlertTriangle,
  Search,
  Share2,
  Scale,
  CheckCircle2,
  Truck,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Info,
  ShieldCheck,
  Zap,
  TrendingDown,
  Layers,
} from 'lucide-react';

import DemoResetModal from '../components/DemoResetModal';

const DEMO_STEPS = [
  { id: 1, title: 'ORDER', icon: Package, label: '01 ORDER' },
  { id: 2, title: 'ANALYZE', icon: Brain, label: '02 ANALYZE' },
  { id: 3, title: 'IDENTIFY RISK', icon: AlertTriangle, label: '03 RISK' },
  { id: 4, title: 'WHY?', icon: Search, label: '04 WHY?' },
  { id: 5, title: 'FIND POOL', icon: Share2, label: '05 POOL' },
  { id: 6, title: 'COMPARE', icon: Scale, label: '06 COMPARE' },
  { id: 7, title: 'ROUTENOVA DECIDES', icon: Zap, label: '07 DECIDE' },
  { id: 8, title: 'DISPATCH', icon: Truck, label: '08 DISPATCH' },
  { id: 9, title: 'SUCCESS', icon: CheckCircle2, label: '09 SUCCESS' },
  { id: 10, title: 'LEARN', icon: RotateCcw, label: '10 LEARN' },
];

export default function ExpoDemoPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showTechDetails, setShowTechDetails] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);

  const handleNext = () => {
    if (currentStep < 10) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleRestart = () => {
    setCurrentStep(1);
    setShowTechDetails(false);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="RouteNova Expo Presentation Demo"
          description="Interactive 2-minute visual walkthrough of RouteNova's rural failure-forecasting decision engine"
          badge="✨ EXPO PRESENTATION MODE"
        />

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setResetModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold transition flex items-center space-x-2"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Reset Demo Data</span>
          </button>

          <button
            onClick={handleRestart}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs font-bold transition flex items-center space-x-2"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Restart Demo</span>
          </button>
        </div>
      </div>

      {/* PROMINENT NOVELTY STATEMENT BANNER */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/90 via-slate-900 to-indigo-950/90 border border-cyan-500/40 text-center space-y-2 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-center space-x-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 fill-current" />
          <span>Core RouteNova Innovation Statement</span>
        </div>
        <blockquote className="text-base sm:text-lg font-bold font-mono text-white max-w-3xl mx-auto leading-relaxed">
          “RouteNova doesn't simply find a route. It decides whether the delivery plan is likely to succeed — and chooses a better plan when necessary.”
        </blockquote>
      </div>

      {/* VISUAL CLICKABLE 10-STEP PROGRESS BAR */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 shadow-xl overflow-x-auto">
        <div className="flex items-center justify-between min-w-[760px] gap-2 font-mono text-xs">
          {DEMO_STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isDone = currentStep > step.id;

            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`flex-1 p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-500/50 scale-105'
                    : isDone
                    ? 'bg-slate-900 border-slate-700 text-emerald-400 hover:border-slate-600'
                    : 'bg-slate-950/60 border-slate-850 text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400 animate-pulse' : isDone ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span className="text-[10px] font-bold tracking-wider">{step.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP CONTENT CONTAINER */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-cyan-500/30 space-y-6 shadow-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/95 min-h-[420px] flex flex-col justify-between">
        
        {/* STEP 01: ORDER */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center space-x-3 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
              <Package className="w-5 h-5" />
              <span>STEP 01 — NEW SHIPMENT ORDER</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
                “120 kg agricultural produce needs delivery.”
              </h2>
              <p className="text-slate-300 text-sm font-sans">
                Destination: <strong>Rampuram Village</strong>. Initial assigned vehicle: <strong>Standard 2WD Delivery Van</strong>.
              </p>
            </div>

            {/* Visual Specs Card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-500 uppercase block text-[10px]">Payload Weight</span>
                <span className="text-cyan-400 font-extrabold text-xl">120 kg</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-500 uppercase block text-[10px]">Target Location</span>
                <span className="text-white font-extrabold text-xl">Rampuram Village</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-500 uppercase block text-[10px]">Initial Selected Vehicle</span>
                <span className="text-amber-400 font-extrabold text-xl">🚐 Standard 2WD Van</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 02: ANALYZE */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center space-x-3 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
              <Brain className="w-5 h-5 animate-spin" />
              <span>STEP 02 — PRE-DISPATCH INTELLIGENCE EVALUATION</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
                “RouteNova checks the delivery.”
              </h2>
              <p className="text-slate-300 text-sm font-sans">
                Evaluating 6-dimensional failure parameters: ground clearance mm, road surface mud rutting, bridge weight limits, and cell coverage.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                <span className="text-slate-400">Road Access & Ground Clearance Check...</span>
                <span className="text-cyan-400 font-bold animate-pulse">Evaluating 35/100...</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                <span className="text-slate-400">Address Landmark & Cellular Coverage Check...</span>
                <span className="text-cyan-400 font-bold animate-pulse">Evaluating 70/100...</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Historical Axle & Mud Rut Failure Risk...</span>
                <span className="text-rose-400 font-bold animate-pulse">Calculating Failure Probability...</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 03: IDENTIFY RISK */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center space-x-3 text-rose-400 font-mono text-xs font-bold uppercase tracking-wider">
              <AlertTriangle className="w-5 h-5" />
              <span>STEP 03 — IDENTIFY DELIVERY RISK</span>
            </div>

            <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/40 space-y-3">
              <h2 className="text-xl sm:text-2xl font-extrabold font-mono text-white flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />
                “⚠️ This delivery may fail because the selected van is not well suited to the final rural road.”
              </h2>
            </div>

            {/* Risk Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs text-center">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block uppercase text-[10px]">Road Access</span>
                <span className="text-rose-400 font-extrabold text-sm">Difficult (35)</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block uppercase text-[10px]">Vehicle Compatibility</span>
                <span className="text-rose-400 font-extrabold text-sm">Poor (2WD)</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block uppercase text-[10px]">Address Confidence</span>
                <span className="text-amber-400 font-extrabold text-sm">Medium (70)</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block uppercase text-[10px]">Reliability Score</span>
                <span className="text-rose-400 font-extrabold text-sm">46 / 100</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 col-span-2 sm:col-span-1">
                <span className="text-slate-500 block uppercase text-[10px]">Risk State</span>
                <span className="text-rose-400 font-extrabold text-sm uppercase">HIGH RISK</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 04: WHY? */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center space-x-3 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
              <Search className="w-5 h-5" />
              <span>STEP 04 — WHY DOES THIS RISK EXIST?</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold font-mono text-white">
                “Selected van has poor compatibility with the final rural segment.”
              </h2>
            </div>

            {/* Visual Cause Breakdown Diagram */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center font-mono text-xs">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 w-full">
                  <span className="text-amber-400 font-bold block text-sm">🚐 2WD Standard Van</span>
                  <span className="text-[10px] text-slate-500">Low ground clearance (160mm)</span>
                </div>
                <ArrowRight className="w-6 h-6 text-slate-500 shrink-0 rotate-90 sm:rotate-0" />
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 w-full">
                  <span className="text-rose-400 font-bold block text-sm">🛣️ Narrow Final 2.1km</span>
                  <span className="text-[10px] text-slate-500">Unpaved mud & rutting</span>
                </div>
                <ArrowRight className="w-6 h-6 text-slate-500 shrink-0 rotate-90 sm:rotate-0" />
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 w-full">
                  <span className="text-rose-400 font-bold block text-sm">⚠️ High Failure Risk</span>
                  <span className="text-[10px] text-slate-500">$420 expected operational loss</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 05: FIND POOL */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center space-x-3 text-indigo-400 font-mono text-xs font-bold uppercase tracking-wider">
              <Share2 className="w-5 h-5" />
              <span>STEP 05 — MICROPOOL CONSOLIDATION</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-extrabold font-mono text-white">
                “RouteNova finds compatible shipments along the corridor.”
              </h2>
              <p className="text-slate-300 text-sm font-sans">
                Consolidates 3 compatible small shipments onto a high-clearance 4x4 Mini Truck.
              </p>
            </div>

            {/* Load Sum Diagram */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 font-mono text-xs">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                  <span className="text-cyan-400 font-bold block text-sm">120 kg</span>
                  <span className="text-[10px] text-slate-400">Produce Order</span>
                </div>
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
                  <span className="text-indigo-400 font-bold block text-sm">+ 80 kg</span>
                  <span className="text-[10px] text-slate-400">Medical Parcel</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <span className="text-emerald-400 font-bold block text-sm">+ 60 kg</span>
                  <span className="text-[10px] text-slate-400">Hardware Goods</span>
                </div>
              </div>

              {/* Total Combined Capacity */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Combined Vehicle Load:</span>
                  <span className="text-emerald-400 font-bold">260 / 500 kg (52% capacity utilization)</span>
                </div>
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '52%' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 06: COMPARE */}
        {currentStep === 6 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center space-x-3 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
              <Scale className="w-5 h-5" />
              <span>STEP 06 — COMPARE DELIVERY OPTIONS</span>
            </div>

            {/* 3 Large Visual Comparison Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
              {/* Option A */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-rose-500/40 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-rose-400 text-sm">🚐 Van Alone</span>
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded border border-rose-500/40">HIGH RISK</span>
                </div>
                <div className="space-y-1 text-slate-300">
                  <div className="flex justify-between"><span>Reliability:</span><strong className="text-rose-400">46%</strong></div>
                  <div className="flex justify-between"><span>Trip Cost:</span><strong>$85</strong></div>
                  <div className="flex justify-between"><span>Expected Loss:</span><strong className="text-rose-400">$420</strong></div>
                  <div className="flex justify-between"><span>Utilization:</span><strong>24%</strong></div>
                </div>
              </div>

              {/* Option B */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-200 text-sm">🏍️ Bike Express</span>
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/40">MODERATE</span>
                </div>
                <div className="space-y-1 text-slate-300">
                  <div className="flex justify-between"><span>Reliability:</span><strong className="text-cyan-400">82%</strong></div>
                  <div className="flex justify-between"><span>Trip Cost:</span><strong>$65</strong></div>
                  <div className="flex justify-between"><span>Expected Loss:</span><strong className="text-cyan-400">$145</strong></div>
                  <div className="flex justify-between"><span>Utilization:</span><strong>65%</strong></div>
                </div>
              </div>

              {/* Option C */}
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/50 space-y-3 shadow-xl">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-emerald-400 text-sm">🤝 Pooled 4x4</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40">RECOMMENDED</span>
                </div>
                <div className="space-y-1 text-slate-200">
                  <div className="flex justify-between"><span>Reliability:</span><strong className="text-emerald-400">94%</strong></div>
                  <div className="flex justify-between"><span>Trip Cost:</span><strong>$55</strong></div>
                  <div className="flex justify-between"><span>Expected Loss:</span><strong className="text-emerald-400">$78</strong></div>
                  <div className="flex justify-between"><span>Utilization:</span><strong className="text-emerald-400">86%</strong></div>
                </div>
              </div>
            </div>

            {/* Toggle Details button */}
            <div className="text-center pt-1">
              <button
                onClick={() => setShowTechDetails(!showTechDetails)}
                className="text-xs font-mono text-cyan-400 hover:underline flex items-center space-x-1 mx-auto"
              >
                <Info className="w-3.5 h-3.5" />
                <span>{showTechDetails ? 'Hide Technical Loss Details' : 'View Details (Loss Math)'}</span>
              </button>

              {showTechDetails && (
                <div className="mt-3 p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 text-left space-y-1 max-w-md mx-auto animate-fade-in">
                  <p>Option A Loss: P(Fail=0.54) × $700 + $420 = $420 expected loss</p>
                  <p>Option C Loss: P(Fail=0.06) × $700 + $36 = $78 expected loss</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 07: ROUTENOVA DECIDES (HERO MOMENT) */}
        {currentStep === 7 && (
          <div className="space-y-6 text-center animate-fade-in my-auto py-4">
            <div className="w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center mx-auto text-cyan-400 animate-pulse">
              <Zap className="w-8 h-8 fill-current" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-widest block">
                HERO DECISION MOMENT
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight">
                “ROUTENOVA RECOMMENDS”
              </h2>
              <p className="text-lg font-bold text-emerald-400 font-mono">
                🤝 Option 3: Pooled 4x4 Mini Truck Dispatch
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 max-w-lg mx-auto text-xs font-mono text-slate-300">
              “Best valid plan with the lowest expected operational loss ($78 vs $420 baseline).”
            </div>
          </div>
        )}

        {/* STEP 08: DISPATCH */}
        {currentStep === 8 && (
          <div className="space-y-6 text-center animate-fade-in my-auto py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
              <Truck className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="text-2xl font-bold font-mono text-white">Ready for Dispatch</h2>
              <p className="text-xs text-slate-400 font-mono">
                Assigning Tata Ace 4x4 Mini Truck to Rampuram Corridor. Driver Ramesh notified.
              </p>
            </div>

            {/* LARGE DISPATCH BUTTON */}
            <div className="pt-2">
              <button
                onClick={handleNext}
                className="py-5 px-10 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-mono font-extrabold text-base shadow-2xl shadow-emerald-500/30 flex items-center justify-center space-x-3 mx-auto transition active:scale-[0.98]"
              >
                <CheckCircle2 className="w-6 h-6" />
                <span>ACCEPT & DISPATCH</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 09: SUCCESS */}
        {currentStep === 9 && (
          <div className="space-y-6 text-center animate-fade-in my-auto py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
                “Delivery successfully dispatched.”
              </h2>
              <p className="text-sm font-mono text-cyan-400">
                RouteNova will continue learning from the outcome.
              </p>
            </div>
          </div>
        )}

        {/* STEP 10: LEARN */}
        {currentStep === 10 && (
          <div className="space-y-6 text-center animate-fade-in">
            <div className="flex items-center justify-center space-x-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
              <RotateCcw className="w-5 h-5" />
              <span>STEP 10 — CLOSED-LOOP LEARNING PIPELINE</span>
            </div>

            <div className="space-y-1 max-w-lg mx-auto">
              <h2 className="text-xl sm:text-2xl font-extrabold font-mono text-white">
                “Continuous Learning Feedback Loop”
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Driver field outcomes update operational evidence for future decision cycles.
              </p>
            </div>

            {/* Visual Learning Loop Diagram */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center font-mono text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300 font-bold">1. Analyze</div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-indigo-300 font-bold">2. Decide</div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 font-bold">3. Dispatch</div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-300 font-bold">4. Outcome</div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-rose-300 font-bold">5. Evidence</div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300 font-bold">6. Better Decisions</div>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER STEP NAVIGATION BUTTONS */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-800 font-mono text-xs">
          <button
            disabled={currentStep === 1}
            onClick={handlePrev}
            className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40 transition flex items-center space-x-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>

          <div className="text-slate-500 font-bold text-xs">
            Step {currentStep} of 10
          </div>

          {currentStep < 10 ? (
            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition flex items-center space-x-1.5 shadow-lg shadow-cyan-600/20"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center space-x-1.5 shadow-lg shadow-emerald-600/20"
            >
              <span>Go to Control Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <DemoResetModal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        onSuccess={() => {
          handleRestart();
          window.location.reload();
        }}
      />
    </div>
  );
}
