import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import RiskBadge from '../components/RiskBadge';
import StatusBadge from '../components/StatusBadge';
import LoadingState from '../components/LoadingState';
import DecisionCenterHero from '../components/DecisionCenterHero';
import ReliabilityGauge from '../components/ReliabilityGauge';
import ExpectedLossCard from '../components/ExpectedLossCard';
import PlanComparisonMatrix from '../components/PlanComparisonMatrix';
import PoolingOpportunityCard from '../components/PoolingOpportunityCard';
import HeroRouteMap from '../components/HeroRouteMap';
import ExplainabilityModal from '../components/ExplainabilityModal';
import {
  getShipmentById,
  getDestinationById,
  getVehicleById,
  getDeliveryHistoryByDestination,
  SHIPMENTS,
  DESTINATIONS,
  VEHICLES,
} from '../data/index';
import { evaluateDeliveryPlan } from '../services/reliabilityEngine';
import { calculateExpectedOperationalLoss } from '../services/lossEngine';
import { evaluateAlternativePlans } from '../services/planEngine';
import { findCompatiblePools } from '../services/poolingEngine';
import { dispatchShipmentAsync } from '../services/dataService';
import {
  Zap,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Truck,
  Share2,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  Info,
  Clock,
  Radio,
  Cpu,
  Layers,
  Sparkles,
  ChevronDown,
  Compass,
  DollarSign,
} from 'lucide-react';

export default function DeliveryDetail() {
  const { id } = useParams();
  const matrixRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState('pooled'); // 'baseline', 'alternative', 'pooled'
  const [explainModalOpen, setExplainModalOpen] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState(false);

  // 1. Fetch Shipment, Destination, Vehicle, and History from Centralized Store
  const shipment = getShipmentById(id) || SHIPMENTS[0];
  const destination =
    DESTINATIONS.find((d) => d.id === shipment.destinationId || d.name.includes(shipment.destination)) ||
    DESTINATIONS[0];
  const baselineVehicle =
    VEHICLES.find((v) => v.name.includes(shipment.conventionalVehicle) || v.type === 'van') ||
    VEHICLES[6]; // Standard Delivery Van 2WD
  const historyRecords = getDeliveryHistoryByDestination(destination.id);

  // 2. Evaluate Operational Plan with RouteNova Delivery Reliability Engine
  const evaluationResult = evaluateDeliveryPlan({
    destination,
    vehicle: baselineVehicle,
    shipment,
    historyRecords,
  });

  // 3. Calculate Expected Operational Loss Exposure with Loss Engine
  const baselineLossResult = calculateExpectedOperationalLoss({
    reliabilityScore: evaluationResult.reliabilityScore,
    vehicle: baselineVehicle,
    shipment,
    destination,
  });

  // 4. Evaluate Alternative Vehicle Plans with Stage 7 Plan Engine
  const planEngineResult = evaluateAlternativePlans({
    shipment,
    destination,
    currentVehicle: baselineVehicle,
    availableVehicles: VEHICLES,
    historyRecords,
  });

  // 5. Evaluate Compatible Micropooling Opportunities with Stage 8 Pooling Engine
  const poolOptions = findCompatiblePools(shipment, SHIPMENTS, VEHICLES, DESTINATIONS);

  // STAGE 10 DECISION CENTER OPTIONS DATA
  const optionA = {
    vehicleName: baselineVehicle.name,
    vehicleType: baselineVehicle.type.replace('_', ' '),
    shipmentLoadKg: shipment.weight || 240,
    distanceKm: destination.finalSegmentDistance ? destination.finalSegmentDistance * 4 + 10 : 18.4,
    reliabilityScore: evaluationResult.reliabilityScore,
    riskLevel: evaluationResult.riskLevel,
    failureProbability: evaluationResult.failureProbability,
    estimatedCost: baselineLossResult.vehicleCost,
    expectedLoss: baselineLossResult.expectedOperationalLoss,
    utilizationPercent: Math.round(((shipment.weight || 240) / baselineVehicle.capacityKg) * 100),
  };

  const optionB = {
    vehicleName: planEngineResult.alternativePlan?.vehicle?.name || 'Yezdi Adventure Rural Express',
    vehicleType: planEngineResult.alternativePlan?.vehicle?.type || 'Off-road Motorcycle',
    shipmentLoadKg: shipment.weight || 240,
    distanceKm: 18.4,
    reliabilityScore: planEngineResult.alternativePlan?.reliabilityScore || 82,
    riskLevel: planEngineResult.alternativePlan?.riskLevel || 'LOW',
    failureProbability: planEngineResult.alternativePlan?.failureProbability || 0.18,
    estimatedCost: planEngineResult.alternativePlan?.estimatedCost || 65,
    expectedLoss: planEngineResult.alternativePlan?.expectedOperationalLoss || 145,
    utilizationPercent: 65,
  };

  const optionC = {
    vehicleName: poolOptions[0]?.vehicleAssigned?.name || 'Pooled 4x4 Mini Truck',
    vehicleType: '4x4 All-Terrain Mini Truck (Shared)',
    shipmentLoadKg: poolOptions[0]?.combinedWeightKg || 550,
    distanceKm: 18.4,
    reliabilityScore: poolOptions[0]?.reliabilityScore || 88,
    riskLevel: poolOptions[0]?.riskLevel || 'LOW',
    failureProbability: 0.12,
    estimatedCost: poolOptions[0]?.estimatedSharedCost || 55,
    expectedLoss: poolOptions[0]?.expectedOperationalLoss || 78,
    utilizationPercent: poolOptions[0]?.vehicleUtilization || 86,
  };

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [id]);

  const handleExecuteDispatch = async () => {
    setIsDispatching(true);
    await dispatchShipmentAsync({
      shipmentId: shipment.id,
      vehicleId: baselineVehicle.id,
      destinationId: destination.id,
      notes: `Dispatched via ${baselineVehicle.name} (Decision Center)`,
    });
    setIsDispatching(false);
    setDispatchSuccess(true);
  };


  const scrollToAlternatives = () => {
    matrixRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="py-12 animate-fade-in">
        <LoadingState message="RouteNova is preparing delivery intelligence..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* HERO HEADER */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 relative overflow-hidden shadow-2xl">
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
                <Zap className="w-3 h-3 fill-current" /> HERO SCREEN
              </span>
              <span className="text-xs font-mono text-slate-400">ID: {shipment.id}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-mono text-slate-100 tracking-wide">
              ROUTENOVA DELIVERY INTELLIGENCE
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Pre-dispatch failure risk evaluation & operational loss optimization layer
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setExplainModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 text-cyan-400 hover:text-cyan-300 border border-slate-700 font-mono text-xs font-semibold flex items-center gap-2 shadow-lg transition-all"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Decision Rationale</span>
            </button>
            <Link
              to="/deliveries"
              className="px-4 py-2.5 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-slate-800 font-mono text-xs"
            >
              Registry
            </Link>
          </div>
        </div>

        {/* Metadata Chips Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-slate-800/80 font-mono text-xs">
          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Destination</span>
            <span className="text-slate-200 font-bold truncate block">{destination.name}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Shipment Payload</span>
            <span className="text-slate-200 font-bold block">{shipment.weight} kg ({shipment.category})</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Baseline Vehicle</span>
            <span className="text-rose-400 font-bold truncate block">{baselineVehicle.name}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Status</span>
              <StatusBadge status={shipment.status} />
            </div>
            <RiskBadge level={evaluationResult.riskLevel} />
          </div>
        </div>
      </div>

      {/* STAGE 10 MAIN DEMO SCREEN: PREMIUM ROUTENOVA DECISION CENTER */}
      <DecisionCenterHero
        optionA={optionA}
        optionB={optionB}
        optionC={optionC}
        onAcceptDispatch={handleExecuteDispatch}
      />

      {/* MAIN SECTION: RADIAL RELIABILITY GAUGE & 5 FACTOR CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 4 Cols: Large Radial Reliability Score */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center space-y-4 shadow-xl">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-cyan-400" />
            Operational Reliability
          </span>

          <ReliabilityGauge
            score={evaluationResult.reliabilityScore}
            riskLevel={evaluationResult.riskLevel}
            size={200}
          />

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1 text-left w-full">
            <div className="flex justify-between text-slate-400">
              <span>Failure Probability:</span>
              <span className="text-rose-400 font-bold">
                {Math.round(evaluationResult.failureProbability * 100)}%
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Expected Loss (Baseline):</span>
              <span className="text-rose-400 font-bold">${baselineLossResult.expectedOperationalLoss}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Expected Loss (Pooled):</span>
              <span className="text-emerald-400 font-bold">$78</span>
            </div>
          </div>
        </div>

        {/* Right 8 Cols: Five Factor Cards */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
          <h2 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              RouteNova 5 Factor Evaluation Cards
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Weighted Decision Matrix</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
            {/* 1. Road Accessibility */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">Road Accessibility</span>
                <span className="text-rose-400 font-bold">
                  {evaluationResult.factors.roadAccessibility.score} / 100
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {evaluationResult.factors.roadAccessibility.explanation}
              </p>
            </div>

            {/* 2. Vehicle Compatibility */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">Vehicle Compatibility</span>
                <span className="text-rose-400 font-bold">
                  {evaluationResult.factors.vehicleCompatibility.score} / 100
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {evaluationResult.factors.vehicleCompatibility.explanation}
              </p>
            </div>

            {/* 3. Address Confidence */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">Address Confidence</span>
                <span className="text-amber-400 font-bold">
                  {evaluationResult.factors.addressConfidence.score} / 100
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {evaluationResult.factors.addressConfidence.explanation}
              </p>
            </div>

            {/* 4. Connectivity */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">Connectivity</span>
                <span className="text-emerald-400 font-bold">
                  {evaluationResult.factors.connectivity.score} / 100
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {evaluationResult.factors.connectivity.explanation}
              </p>
            </div>

            {/* 5. Historical Success */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">Historical Success</span>
                <span className="text-cyan-400 font-bold">
                  {evaluationResult.factors.historicalSuccess.score}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {evaluationResult.factors.historicalSuccess.explanation}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* EXPECTED OPERATIONAL LOSS ENGINE CARD (STAGE 6) */}
      <ExpectedLossCard lossResult={baselineLossResult} planName={baselineVehicle.name} />

      {/* STAGE 8: MICROPOOLING OPPORTUNITY SECTION */}
      <PoolingOpportunityCard poolOptions={poolOptions} />

      {/* STAGE 7: ROUTENOVA ALTERNATIVE PLAN ENGINE COMPARISON MATRIX */}
      <div ref={matrixRef}>
        <PlanComparisonMatrix
          currentPlan={planEngineResult.currentPlan}
          alternativePlan={planEngineResult.alternativePlan}
          recommendedPlan={planEngineResult.recommendedPlan}
          recommendationReasons={planEngineResult.recommendationReasons}
        />
      </div>

      {/* MAP SECTION BELOW ANALYSIS */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold font-mono text-slate-100 flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              RouteNova Interactive Spatial Risk & Route Preview
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Visualizes origin, destination, corridor transit line, and final-segment hazard warning marker
            </p>
          </div>
        </div>

        <HeroRouteMap
          origin={{ lat: 18.2500, lng: 83.8200, name: 'Green Valley Central Depot' }}
          destination={{ lat: destination.latitude, lng: destination.longitude, name: destination.name }}
          hazardSegment={{ lat: destination.latitude - 0.007, lng: destination.longitude - 0.012, name: `Final ${destination.finalSegmentDistance || 2.1}km Unpaved Mud Rut Track` }}
          height="380px"
        />
      </div>

      {/* Explainability Modal */}
      <ExplainabilityModal
        isOpen={explainModalOpen}
        onClose={() => setExplainModalOpen(false)}
        delivery={{ ...shipment, sixFactors: evaluationResult.factors }}
      />
    </div>
  );
}
