import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import RiskBadge from '../components/RiskBadge';
import DriverProblemModal from '../components/DriverProblemModal';
import { SHIPMENTS, DESTINATIONS } from '../data/index';
import { updateDeliveryStatusAsync, getShipmentsAsync } from '../services/dataService';
import { recordDeliveryOutcomeAsync } from '../services/outcomeEngine';
import {
  Truck,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Play,
  Radio,
  HelpCircle,
  RotateCcw,
  ChevronDown,
  Info,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export default function DriverDashboard() {
  const { getFriendlyRoleTitle } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [activeDeliveryId, setActiveDeliveryId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isProblemModalOpen, setIsProblemModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize deliveries with persistent status lookup
  useEffect(() => {
    async function loadDeliveries() {
      setLoading(true);
      let list = SHIPMENTS.slice(0, 4);

      // Attempt to load live shipments from backend
      const res = await getShipmentsAsync();
      if (res.shipments && res.shipments.length > 0) {
        list = res.shipments.slice(0, 4);
      }

      const formatted = list.map((s) => {
        const localStatus = localStorage.getItem(`routenova_driver_status_${s.id}`);
        const localNotes = localStorage.getItem(`routenova_driver_notes_${s.id}`);
        return {
          ...s,
          driverStatus: localStatus || s.status || 'ASSIGNED',
          driverNotes: localNotes || '',
        };
      });

      setDeliveries(formatted);
      if (formatted.length > 0) {
        setActiveDeliveryId(formatted[0].id);
      }
      setLoading(false);
    }

    loadDeliveries();
  }, []);

  const activeDelivery = deliveries.find((d) => d.id === activeDeliveryId) || deliveries[0];
  
  const activeDest =
    DESTINATIONS.find(
      (d) => d.id === activeDelivery?.destinationId || (activeDelivery?.destination && d.name.includes(activeDelivery.destination))
    ) || DESTINATIONS[0];

  const handleUpdateStatus = async (deliveryId, newStatus, notes = '') => {
    // 1. Update state immediately
    setDeliveries((prev) =>
      prev.map((d) => (d.id === deliveryId ? { ...d, driverStatus: newStatus, driverNotes: notes || d.driverNotes } : d))
    );

    // 2. Persist using backend API + localStorage
    await updateDeliveryStatusAsync(deliveryId, newStatus, notes);

    // 3. Optional backend outcome logging
    if (newStatus === 'DELIVERED') {
      await recordDeliveryOutcomeAsync({
        deliveryId,
        destinationId: activeDest.id,
        vehicleId: 'VEH-MINI-01',
        outcome: 'SUCCESS',
        notes: notes || 'Delivery completed safely by driver.',
        actualCost: 65,
        deliveryTime: '28 mins',
      });
      setNotification(`✅ Delivery #${deliveryId} completed successfully! Dispatcher notified.`);
    } else if (newStatus === 'ARRIVED') {
      setNotification(`📍 Arrived at ${activeDest.name}! Recipient notified.`);
    } else if (newStatus === 'IN_TRANSIT') {
      setNotification(`🚀 Delivery #${deliveryId} started! Navigation live.`);
    } else if (newStatus === 'ISSUE_REPORTED') {
      await recordDeliveryOutcomeAsync({
        deliveryId,
        destinationId: activeDest.id,
        vehicleId: 'VEH-MINI-01',
        outcome: 'FAILURE_REATTEMPT',
        failureReason: notes || 'Driver reported route obstruction',
        notes: notes,
        actualCost: 350,
      });
      setNotification(`⚠️ Operational issue reported for Delivery #${deliveryId}. Dispatcher alerted!`);
    }

    setTimeout(() => setNotification(null), 5000);
  };

  const handleResetDemo = (deliveryId) => {
    localStorage.removeItem(`routenova_driver_status_${deliveryId}`);
    localStorage.removeItem(`routenova_driver_notes_${deliveryId}`);
    setDeliveries((prev) =>
      prev.map((d) => (d.id === deliveryId ? { ...d, driverStatus: 'ASSIGNED', driverNotes: '' } : d))
    );
    setNotification(`🔄 Delivery #${deliveryId} reset to ASSIGNED state.`);
    setTimeout(() => setNotification(null), 3000);
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'ARRIVED':
        return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      case 'IN_TRANSIT':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30 animate-pulse';
      case 'ISSUE_REPORTED':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 font-mono">
        <Truck className="w-8 h-8 mx-auto animate-bounce text-cyan-400 mb-2" />
        Loading driver portal...
      </div>
    );
  }

  const currentStatus = activeDelivery?.driverStatus || 'ASSIGNED';

  return (
    <div className="space-y-6 animate-fade-in pb-12 font-sans">
      {/* Role Header */}
      <PageHeader
        title={getFriendlyRoleTitle()}
        description="Your operational delivery assistant: clear routes, simple actions & live status updates"
        badge="🚚 DRIVER MODE"
      />

      {/* Notification Banner */}
      {notification && (
        <div className="p-4 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono text-xs flex items-center justify-between shadow-xl animate-fade-in">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse shrink-0" />
            <span className="font-bold">{notification}</span>
          </div>
        </div>
      )}

      {/* ASSIGNED DELIVERIES SELECTION */}
      <div className="space-y-3">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
          Assigned Deliveries ({deliveries.length})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {deliveries.map((del) => {
            const isSelected = del.id === activeDeliveryId;
            const status = del.driverStatus || 'ASSIGNED';
            return (
              <div
                key={del.id}
                onClick={() => setActiveDeliveryId(del.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                  isSelected
                    ? 'bg-cyan-500/15 border-cyan-500/60 shadow-xl shadow-cyan-500/10 text-white'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="font-bold text-cyan-400">{del.id}</span>
                  <RiskBadge level={del.riskLevel || 'MEDIUM'} />
                </div>
                <h3 className="font-bold text-slate-100 text-sm truncate">{del.destination}</h3>
                <div className="pt-1 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400">Status:</span>
                  <span className={`font-bold px-2 py-0.5 rounded border uppercase text-[10px] ${getStatusBadgeStyle(status)}`}>
                    {status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ACTIVE DELIVERY WORKBENCH */}
      {activeDelivery && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-cyan-500/40 space-y-6 shadow-2xl">
          {/* Top Header Card */}
          <div className="border-b border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                  ACTIVE ROUTE #{activeDelivery.id}
                </span>
                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border uppercase ${getStatusBadgeStyle(currentStatus)}`}>
                  {currentStatus.replace('_', ' ')}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-mono text-slate-100">
                {activeDelivery.destination}
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                Target Landmark: <span className="text-slate-200 font-bold">{activeDest.defaultLandmark || 'Village Main Square'}</span>
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-right">
                <span className="text-slate-500 text-[10px] uppercase block">Assigned Vehicle</span>
                <span className="text-emerald-400 font-bold text-sm">Tata Ace 4x4 Mini Truck</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Sender / Org</span>
              <span className="text-slate-200 font-bold truncate block">{activeDelivery.sender}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Cargo Weight</span>
              <span className="text-cyan-400 font-bold block">{activeDelivery.weight} kg</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Delivery Window</span>
              <span className="text-slate-200 font-bold block">{activeDelivery.deliveryWindow || '09:00 - 17:00 IST'}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Road Condition</span>
              <span className="text-amber-400 font-bold block">{activeDest.roadSurface} ({activeDest.roadWidthCategory})</span>
            </div>
          </div>

          {/* ACTION BUTTON WORKFLOW CONTROLLER */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Driver Delivery Actions:
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">Step-by-step progress</span>
            </div>

            {/* If DELIVERED, show completion state */}
            {currentStatus === 'DELIVERED' ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">Delivery Completed Successfully!</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    Outcome recorded in system database. Vehicle is now available for next dispatch assignment.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => handleResetDemo(activeDelivery.id)}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono flex items-center justify-center space-x-2 mx-auto transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Reset Delivery Status (Demo Mode)</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. START DELIVERY */}
                <button
                  disabled={currentStatus !== 'ASSIGNED' && currentStatus !== 'DISPATCHED'}
                  onClick={() => handleUpdateStatus(activeDelivery.id, 'IN_TRANSIT')}
                  className={`py-4 px-5 rounded-2xl font-mono font-bold text-sm flex items-center justify-center gap-2.5 transition-all ${
                    currentStatus === 'ASSIGNED' || currentStatus === 'DISPATCHED'
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-xl shadow-cyan-500/20 active:scale-[0.98]'
                      : 'bg-slate-950 border border-slate-800 text-slate-600 cursor-not-allowed opacity-60'
                  }`}
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>
                    {currentStatus === 'IN_TRANSIT' || currentStatus === 'ARRIVED'
                      ? '✓ IN TRANSIT'
                      : '1. START DELIVERY'}
                  </span>
                </button>

                {/* 2. ARRIVED AT DESTINATION */}
                <button
                  disabled={currentStatus !== 'IN_TRANSIT'}
                  onClick={() => handleUpdateStatus(activeDelivery.id, 'ARRIVED')}
                  className={`py-4 px-5 rounded-2xl font-mono font-bold text-sm flex items-center justify-center gap-2.5 transition-all ${
                    currentStatus === 'IN_TRANSIT'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-xl shadow-indigo-500/20 active:scale-[0.98]'
                      : 'bg-slate-950 border border-slate-800 text-slate-600 cursor-not-allowed opacity-60'
                  }`}
                >
                  <MapPin className="w-5 h-5" />
                  <span>
                    {currentStatus === 'ARRIVED' ? '✓ ARRIVED' : '2. ARRIVED AT DESTINATION'}
                  </span>
                </button>

                {/* 3. MARK DELIVERED */}
                <button
                  disabled={currentStatus !== 'ARRIVED'}
                  onClick={() => handleUpdateStatus(activeDelivery.id, 'DELIVERED')}
                  className={`py-4 px-5 rounded-2xl font-mono font-bold text-sm flex items-center justify-center gap-2.5 transition-all ${
                    currentStatus === 'ARRIVED'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xl shadow-emerald-500/20 active:scale-[0.98]'
                      : 'bg-slate-950 border border-slate-800 text-slate-600 cursor-not-allowed opacity-60'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>3. MARK DELIVERED</span>
                </button>
              </div>
            )}

            {/* REPORT PROBLEM BUTTON */}
            {currentStatus !== 'DELIVERED' && (
              <div className="pt-1">
                <button
                  onClick={() => setIsProblemModalOpen(true)}
                  className={`w-full py-3.5 px-5 rounded-2xl font-mono font-bold text-xs flex items-center justify-center gap-2 border transition ${
                    currentStatus === 'ISSUE_REPORTED'
                      ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                      : 'bg-rose-950/30 border-rose-800/40 text-rose-400 hover:bg-rose-900/40 hover:border-rose-700'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>
                    {currentStatus === 'ISSUE_REPORTED'
                      ? `⚠️ ISSUE REPORTED: ${activeDelivery.driverNotes || 'Obstructed'}`
                      : 'REPORT A PROBLEM (Road Blocked, Malfunction, Recipient Missing)'}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* PROGRESSIVE DISCLOSURE: WHY THIS PLAN? */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold font-mono">
              <ShieldCheck className="w-4 h-4" />
              <span>Why This Route & Vehicle Plan?</span>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              RouteNova assigned the <strong>Tata Ace 4x4 Mini Truck</strong> for {activeDelivery.destination} because the final 2.4 km path has unpaved mud ruts and steep incline. A standard 2WD van has a 78% failure risk on this segment.
            </p>

            {/* Expandable Technical Rationale for curious users */}
            <details className="group pt-1 border-t border-slate-900">
              <summary className="text-[11px] font-mono text-slate-400 cursor-pointer hover:text-cyan-300 flex items-center justify-between list-none py-1 select-none">
                <span className="flex items-center space-x-1.5">
                  <Info className="w-3.5 h-3.5 text-slate-500" />
                  <span>View Technical Loss Math & Rationale</span>
                </span>
                <ChevronDown className="w-4 h-4 text-slate-500 group-open:rotate-180 transition-transform" />
              </summary>

              <div className="mt-3 p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] font-mono space-y-2 text-slate-400">
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span>Conventional 2WD Expected Loss:</span>
                  <span className="text-rose-400 font-bold">$420</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span>RouteNova 4x4 Plan Expected Loss:</span>
                  <span className="text-emerald-400 font-bold">$78</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span>Net Loss Prevention:</span>
                  <span className="text-cyan-400 font-bold">$342 saved</span>
                </div>
                <div className="pt-1 text-[10px] text-slate-500">
                  Formula: <code className="text-slate-300">Loss = P(Failure) × Cost(Reattempt) + Fuel Cost</code>
                </div>
              </div>
            </details>
          </div>

          {/* Local Evidence Note */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs font-mono text-slate-300 space-y-1">
            <span className="text-cyan-400 font-bold block flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Local Segment Notes & Landmark:</span>
            </span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              {activeDest.localEvidence || 'Track cleared by local panchayat. Proceed via main Panchayati Well approach.'}
            </p>
          </div>
        </div>
      )}

      {/* Problem Reporting Modal */}
      <DriverProblemModal
        isOpen={isProblemModalOpen}
        onClose={() => setIsProblemModalOpen(false)}
        onSubmit={(type, notes) => handleUpdateStatus(activeDelivery.id, 'ISSUE_REPORTED', notes)}
      />
    </div>
  );
}
