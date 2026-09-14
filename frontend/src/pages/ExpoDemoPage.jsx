import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import {
  Package,
  Scan,
  AlertTriangle,
  Search,
  Truck,
  Scale,
  Zap,
  CheckCircle2,
  RotateCcw,
  Play,
  Pause,
  ArrowRight,
  ShieldAlert,
  Sliders,
  Sparkles,
  Info,
} from 'lucide-react';

import VisualEvidenceOverlay from '../components/expo/VisualEvidenceOverlay';
import RoadEvidenceInput from '../components/expo/RoadEvidenceInput';
import RiskEvidencePanel from '../components/expo/RiskEvidencePanel';
import VehicleCompatibilityVisualizer from '../components/expo/VehicleCompatibilityVisualizer';
import BeforeAfterDecision from '../components/expo/BeforeAfterDecision';
import ImprovementMetricsPanel from '../components/expo/ImprovementMetricsPanel';
import DeliverySimulationController from '../components/expo/DeliverySimulationController';
import OutcomeLearningLoop from '../components/expo/OutcomeLearningLoop';
import DemoResetModal from '../components/DemoResetModal';

import { DEMO_ROAD_CASES, getDemoRoadCaseById } from '../data/demoRoadCases';
import { analyzeRoadEvidence } from '../services/roadVisionEngine';
import { evaluateDeliveryPlan } from '../services/reliabilityEngine';
import { calculateExpectedOperationalLoss } from '../services/lossEngine';
import { evaluateAlternativePlans } from '../services/planEngine';
import { SHIPMENTS, VEHICLES, DESTINATIONS } from '../data/index';

const STAGES = [
  { id: 1, title: 'DELIVERY', icon: Package, label: '01 DELIVERY' },
  { id: 2, title: 'ROAD SCAN', icon: Scan, label: '02 SCAN' },
  { id: 3, title: 'DETECTION', icon: AlertTriangle, label: '03 DETECT' },
  { id: 4, title: 'RISK EXPLAINED', icon: Search, label: '04 EXPLAIN' },
  { id: 5, title: 'VEHICLE CHECK', icon: Truck, label: '05 VEHICLES' },
  { id: 6, title: 'OPTIMIZATION', icon: Scale, label: '06 OPTIMIZE' },
  { id: 7, title: 'BEFORE / AFTER', icon: Zap, label: '07 DECIDE' },
  { id: 8, title: 'SIMULATION', icon: Play, label: '08 SIMULATE' },
  { id: 9, title: 'OUTCOME', icon: CheckCircle2, label: '09 OUTCOME' },
  { id: 10, title: 'LEARNING LOOP', icon: RotateCcw, label: '10 LEARN' },
];

export default function ExpoDemoPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isAutoDemo, setIsAutoDemo] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);

  // Selected Road Evidence State
  const [selectedCaseId, setSelectedCaseId] = useState('pothole-road');
  const [userImageSrc, setUserImageSrc] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [roadAnalysis, setRoadAnalysis] = useState(null);
  const [isSimulatingProblem, setIsSimulatingProblem] = useState(false);

  // Baseline Demo Order & Vehicles
  const demoShipment = SHIPMENTS[0] || {
    id: 'RN-2026-8801',
    weightKg: 120,
    itemType: 'Produce & Seeds',
    destination: 'Rampuram Village',
  };
  const baselineVehicle = VEHICLES[0] || {
    id: 'VEH-01',
    name: 'Standard 2WD Delivery Van',
    type: 'van',
    groundClearanceMm: 160,
    drivetrain: '2WD',
    capacityKg: 600,
  };

  // Run Road Vision Analysis whenever selected scenario changes
  useEffect(() => {
    let isMounted = true;
    async function runAnalysis() {
      setIsScanning(true);
      const caseInput = userImageSrc ? { name: 'Uploaded Road Image', src: userImageSrc } : selectedCaseId;
      const res = await analyzeRoadEvidence(caseInput);
      if (isMounted) {
        setRoadAnalysis(res);
        setIsScanning(false);
      }
    }
    runAnalysis();
    return () => {
      isMounted = false;
    };
  }, [selectedCaseId, userImageSrc]);

  // DYNAMIC COMPUTATIONS FROM ROUTENOVA ENGINES
  const activeDestination = {
    ...DESTINATIONS[0],
    id: 'DEST-01',
    name: 'Rampuram Village',
    roadAccessScore: roadAnalysis?.accessibilityScore ?? 45,
    roadSurface: roadAnalysis?.roadSurface ?? 'unpaved_mud',
    roadWidthCategory: roadAnalysis?.roadWidthCategory ?? 'narrow',
    roadWidth: roadAnalysis?.roadWidth ?? 2.4,
  };

  // 1. Reliability Engine Calculation
  const reliabilityEval = evaluateDeliveryPlan({
    destination: activeDestination,
    vehicle: baselineVehicle,
    shipment: demoShipment,
  });

  // 2. Expected Loss Engine Calculation
  const baselineLossEval = calculateExpectedOperationalLoss({
    reliabilityScore: reliabilityEval.reliabilityScore,
    vehicle: baselineVehicle,
    shipment: demoShipment,
    destination: activeDestination,
  });

  // 3. Alternative Plan Engine Calculation
  const planEval = evaluateAlternativePlans({
    shipment: demoShipment,
    destination: activeDestination,
    currentVehicle: baselineVehicle,
    availableVehicles: VEHICLES,
  });

  const recommendedPlan = planEval?.recommendedPlan || planEval?.evaluatedPlans?.[0] || {
    vehicle: VEHICLES[2] || baselineVehicle,
    reliabilityScore: 94,
    expectedOperationalLoss: 78,
    riskLevel: 'LOW',
  };

  // AUTOMATIC DEMO MODE TIMER (60-90 seconds flow)
  useEffect(() => {
    if (!isAutoDemo) return;
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= 10) {
          setIsAutoDemo(false);
          return 10;
        }
        return prev + 1;
      });
    }, 4500); // 4.5 sec per stage (~45 seconds total demo)

    return () => clearInterval(timer);
  }, [isAutoDemo]);

  // Toggle Road Problem Simulation
  const handleToggleProblem = () => {
    if (!isSimulatingProblem) {
      setIsSimulatingProblem(true);
      setSelectedCaseId('combined-risk-road');
      setCurrentStep(3); // jump to hazard detection
    } else {
      setIsSimulatingProblem(false);
      setSelectedCaseId('good-road');
      setCurrentStep(1);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16 font-sans">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title="RouteNova Expo Interactive Demonstration"
          description="Live visual demonstration of evidence-based rural failure prediction and pre-dispatch optimization"
          badge="✨ EXPO DEMO EXPERIENCE"
        />

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsAutoDemo(!isAutoDemo)}
            className={`px-4 py-2.5 rounded-xl border font-mono text-xs font-bold transition flex items-center space-x-2 ${
              isAutoDemo
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-lg animate-pulse'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/20'
            }`}
          >
            {isAutoDemo ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isAutoDemo ? 'PAUSE DEMO' : 'START AUTO DEMO'}</span>
          </button>

          <button
            onClick={() => setResetModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 text-slate-300 font-mono text-xs font-bold transition flex items-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* CORE NOVELTY STATEMENT BANNER */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-cyan-950/90 via-slate-900 to-indigo-950/90 border border-cyan-500/40 text-center space-y-2 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-center space-x-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 fill-current" />
          <span>ROUTENOVA CORE PRODUCT INNOVATION</span>
        </div>
        <blockquote className="text-base sm:text-xl font-extrabold font-mono text-white max-w-4xl mx-auto leading-snug">
          “RouteNova doesn't just predict delivery risk. It shows the evidence behind the risk and changes the delivery plan to reduce that risk.”
        </blockquote>
      </div>

      {/* VISUAL 10-STEP PROGRESS TIMELINE */}
      <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 shadow-xl overflow-x-auto">
        <div className="flex items-center justify-between min-w-[840px] gap-2 font-mono text-xs">
          {STAGES.map((stg) => {
            const Icon = stg.icon;
            const isActive = currentStep === stg.id;
            const isDone = currentStep > stg.id;

            return (
              <button
                key={stg.id}
                onClick={() => setCurrentStep(stg.id)}
                className={`flex-1 p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-lg scale-105 ring-1 ring-cyan-500/50'
                    : isDone
                    ? 'bg-slate-900 border-slate-800 text-emerald-400 hover:border-slate-700'
                    : 'bg-slate-950/60 border-slate-850 text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400 animate-pulse' : isDone ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span className="text-[10px] font-bold tracking-wider">{stg.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN EXPO CONTENT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (COL-5): ROAD EVIDENCE VISUAL OVERLAY & INPUT SELECTOR */}
        <div className="lg:col-span-5 space-y-5">
          <VisualEvidenceOverlay
            roadData={roadAnalysis}
            isScanning={isScanning}
            userImageSrc={userImageSrc}
          />

          <RoadEvidenceInput
            selectedCaseId={selectedCaseId}
            onSelectCase={(id) => {
              setSelectedCaseId(id);
              setUserImageSrc(null);
            }}
            onImageUpload={(data) => {
              setUserImageSrc(data.src);
            }}
            isSimulatingProblem={isSimulatingProblem}
            onToggleProblemSimulation={handleToggleProblem}
          />
        </div>

        {/* RIGHT COLUMN (COL-7): STAGE-SPECIFIC ROUTENOVA DECISION WORKFLOW */}
        <div className="lg:col-span-7 space-y-5">
          {/* STAGE 01 & 02: DELIVERY & SCAN */}
          {(currentStep === 1 || currentStep === 2) && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-950/90 space-y-5 shadow-2xl animate-fade-in font-sans">
              <div className="flex items-center space-x-3 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
                <Package className="w-5 h-5" />
                <span>STEP 01/02 — NEW RURAL SHIPMENT & ROAD SCAN</span>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold font-mono text-white">
                  “120 kg produce scheduled for Rampuram Village.”
                </h2>
                <p className="text-slate-300 text-sm">
                  Initial default dispatch assignment: <strong>Standard 2WD Delivery Van</strong>. RouteNova is scanning the final rural segment road conditions.
                </p>
              </div>

              {/* Order Specs Grid */}
              <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-850">
                  <span className="text-slate-500 text-[10px] block uppercase">Payload Weight</span>
                  <span className="text-cyan-400 font-extrabold text-lg">120 kg</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-850">
                  <span className="text-slate-500 text-[10px] block uppercase">Destination</span>
                  <span className="text-white font-extrabold text-base">Rampuram Village</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-850">
                  <span className="text-slate-500 text-[10px] block uppercase">Initial Vehicle</span>
                  <span className="text-amber-400 font-extrabold text-xs">🚐 Standard 2WD Van</span>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 03 & 04: HAZARD DETECTION & RISK EXPLANATION */}
          {(currentStep === 3 || currentStep === 4) && (
            <RiskEvidencePanel
              roadData={roadAnalysis}
              currentVehicle={baselineVehicle}
              reliabilityEval={reliabilityEval}
              lossEval={baselineLossEval}
            />
          )}

          {/* STAGE 05: VEHICLE COMPATIBILITY CHECK */}
          {currentStep === 5 && (
            <VehicleCompatibilityVisualizer
              evaluatedPlans={planEval?.evaluatedPlans || []}
              currentVehicle={baselineVehicle}
              recommendedPlan={recommendedPlan}
              isAnalyzing={isScanning}
            />
          )}

          {/* STAGE 06: PLAN OPTIMIZATION */}
          {currentStep === 6 && (
            <div className="space-y-4 animate-fade-in">
              <VehicleCompatibilityVisualizer
                evaluatedPlans={planEval?.evaluatedPlans || []}
                currentVehicle={baselineVehicle}
                recommendedPlan={recommendedPlan}
                isAnalyzing={isScanning}
              />
              <ImprovementMetricsPanel
                currentPlan={planEval?.currentPlan}
                recommendedPlan={recommendedPlan}
              />
            </div>
          )}

          {/* STAGE 07: THE KILLER BEFORE/AFTER DECISION MOMENT */}
          {currentStep === 7 && (
            <div className="space-y-5 animate-fade-in">
              <BeforeAfterDecision
                currentPlan={planEval?.currentPlan || { reliabilityScore: 45, expectedOperationalLoss: 420, primaryRisk: 'Vehicle mismatch' }}
                recommendedPlan={recommendedPlan}
                isAnalyzing={isScanning}
              />
              <ImprovementMetricsPanel
                currentPlan={planEval?.currentPlan}
                recommendedPlan={recommendedPlan}
              />
            </div>
          )}

          {/* STAGE 08: DELIVERY SIMULATION */}
          {currentStep === 8 && (
            <DeliverySimulationController
              deliveryId={demoShipment.id}
              vehicleName={recommendedPlan?.vehicle?.name}
              destinationName={activeDestination.name}
              onComplete={() => setCurrentStep(9)}
            />
          )}

          {/* STAGE 09 & 10: OUTCOME & LEARNING LOOP */}
          {(currentStep === 9 || currentStep === 10) && (
            <OutcomeLearningLoop
              destinationId={activeDestination.id}
              vehicleId={recommendedPlan?.vehicle?.id}
              shipmentId={demoShipment.id}
              onRecorded={() => setCurrentStep(10)}
            />
          )}

          {/* STEP CONTROLS FOOTER */}
          <div className="p-4 rounded-2xl glass-panel border border-slate-800 flex items-center justify-between font-mono text-xs">
            <button
              disabled={currentStep === 1}
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-4 py-2.5 rounded-xl border border-slate-850 text-slate-300 hover:bg-slate-800 disabled:opacity-40 transition"
            >
              ← Previous Stage
            </button>

            <span className="text-slate-500 font-bold text-xs">
              Stage {currentStep} of 10
            </span>

            {currentStep < 10 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition flex items-center space-x-1.5 shadow-lg shadow-cyan-600/20"
              >
                <span>Next Stage</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => navigate('/dashboard')}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center space-x-1.5 shadow-lg shadow-emerald-600/20"
              >
                <span>Go to Main Control Center</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <DemoResetModal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        onSuccess={() => {
          setCurrentStep(1);
          window.location.reload();
        }}
      />
    </div>
  );
}
