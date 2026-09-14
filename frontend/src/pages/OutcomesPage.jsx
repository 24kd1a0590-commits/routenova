import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import RiskBadge from '../components/RiskBadge';
import FailureReportModal from '../components/FailureReportModal';
import { SHIPMENTS, DESTINATIONS, VEHICLES } from '../data/index';
import {
  getRecordedEvidences,
  recordDeliveryOutcome,
  recordDeliveryOutcomeAsync,
  getLearningLoopSummary,
} from '../services/outcomeEngine';
import {
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  Database,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  TrendingDown,
  Layers,
  Radio,
  Send,
  HelpCircle,
} from 'lucide-react';

export default function OutcomesPage() {
  const [shipmentsList, setShipmentsList] = useState(SHIPMENTS);
  const [evidenceLog, setEvidenceLog] = useState(getRecordedEvidences());
  const [selectedFailureShipment, setSelectedFailureShipment] = useState(null);
  const [notification, setNotification] = useState(null);

  const loopSummary = getLearningLoopSummary();

  // Mark Successful Handler
  const handleMarkSuccessful = async (shipment) => {
    const res = await recordDeliveryOutcomeAsync({
      deliveryId: shipment.id,
      destinationId: shipment.destinationId || 'DEST-RAMPURAM',
      vehicleId: shipment.conventionalVehicleId || 'VEH-VAN-01',
      outcome: 'SUCCESS',
      notes: 'Delivery completed on-time without operational delay.',
      actualCost: 55,
      deliveryTime: '35 mins',
    });

    // Update shipment status locally
    const updated = shipmentsList.map((s) => (s.id === shipment.id ? { ...s, status: 'DELIVERED' } : s));
    setShipmentsList(updated);
    setEvidenceLog(getRecordedEvidences());

    const modeText = res.isBackendConnected ? '(FastAPI DB Updated)' : '(Offline Demo Mode)';
    setNotification(`✓ Delivery #${shipment.id} marked SUCCESSFUL. ${modeText}`);
    setTimeout(() => setNotification(null), 4000);
  };

  // Mark Failure Submit Handler
  const handleReportFailureSubmit = async (outcomeData) => {
    const res = await recordDeliveryOutcomeAsync(outcomeData);

    // Update shipment status locally
    const updated = shipmentsList.map((s) =>
      s.id === outcomeData.deliveryId ? { ...s, status: 'FAILURE_REATTEMPT' } : s
    );
    setShipmentsList(updated);
    setEvidenceLog(getRecordedEvidences());
    setSelectedFailureShipment(null);

    const modeText = res.isBackendConnected ? '(FastAPI DB Updated)' : '(Offline Demo Mode)';
    setNotification(`🚨 Delivery #${outcomeData.deliveryId} logged as FAILURE. ${modeText}`);
    setTimeout(() => setNotification(null), 4000);
  };


  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <PageHeader
        title="Local Operational Evidence & Outcomes"
        description="Closed-loop feedback engine: Past delivery outcomes update rural road accessibility models and failure forecasting"
        badge="OUTCOME-INFORMED EVIDENCE"
      />

      {/* Notification Banner */}
      {notification && (
        <div className="p-4 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono text-xs flex items-center justify-between shadow-xl animate-fade-in">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse shrink-0" />
            <span className="font-bold">{notification}</span>
          </div>
          <span className="text-[10px] text-cyan-400 font-mono border border-cyan-500/30 px-2 py-0.5 rounded uppercase">
            Local Evidence Refresh
          </span>
        </div>
      )}

      {/* VISUAL LEARNING LOOP DIAGRAM */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/40 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" style={{ animationDuration: '12s' }} />
            <h2 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider">
              RouteNova Learning Loop
            </h2>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
            CLOSED-LOOP ARCHITECTURE
          </span>
        </div>

        {/* Visual Diagram */}
        <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-4 font-mono text-xs">
          <span className="text-slate-400 uppercase font-bold text-[11px] block">
            Operational Evidence Feedback Diagram
          </span>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-bold">
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              Predicted Plan
            </div>

            <div className="text-slate-600">→</div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">
              Dispatch
            </div>

            <div className="text-slate-600">→</div>

            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              Actual Outcome
            </div>

            <div className="text-slate-600">→</div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              Operational Evidence
            </div>

            <div className="text-slate-600">→</div>

            <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
              Future Decision Improvement
            </div>
          </div>

          <p className="text-[11px] text-slate-400 max-w-2xl mx-auto leading-relaxed pt-2 border-t border-slate-900">
            Note: The prototype demonstrates the closed-loop architecture of outcome-informed operational evidence rather than claiming production machine learning.
          </p>
        </div>
      </div>

      {/* DISPATCHED SHIPMENTS & OUTCOME RECORDING WORKBENCH */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-cyan-400" />
            Active & Dispatched Shipments Outcome Recorder
          </h2>
          <span className="text-[10px] font-mono text-slate-400 font-semibold">
            {shipmentsList.length} Pending & Active Dispatches
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="pb-3 font-semibold">Shipment ID</th>
                <th className="pb-3 font-semibold">Recipient</th>
                <th className="pb-3 font-semibold">Destination</th>
                <th className="pb-3 font-semibold">Vehicle</th>
                <th className="pb-3 font-semibold">Predicted Rel.</th>
                <th className="pb-3 font-semibold">Predicted Loss</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Outcome Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {shipmentsList.map((s) => (
                <tr key={s.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3 font-bold text-cyan-400">{s.id}</td>
                  <td className="py-3 text-slate-200">{s.sender}</td>
                  <td className="py-3 text-slate-400">{s.destination}</td>
                  <td className="py-3 text-slate-300">{s.recommendedVehicle || s.conventionalVehicle}</td>
                  <td className="py-3 font-bold text-slate-200">
                    {s.riskLevel === 'HIGH' ? '34/100' : '88/100'}
                  </td>
                  <td className="py-3 font-bold text-emerald-400">
                    {s.riskLevel === 'HIGH' ? '$420' : '$78'}
                  </td>
                  <td className="py-3">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="py-3 text-right">
                    {s.status === 'DELIVERED' ? (
                      <span className="text-emerald-400 font-bold text-[11px]">✓ Completed</span>
                    ) : s.status === 'FAILURE_REATTEMPT' ? (
                      <span className="text-rose-400 font-bold text-[11px]">🚨 Failure Logged</span>
                    ) : (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleMarkSuccessful(s)}
                          className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 text-[10px] font-bold"
                        >
                          Mark Successful
                        </button>
                        <button
                          onClick={() => setSelectedFailureShipment(s)}
                          className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 text-[10px] font-bold"
                        >
                          Report Failure
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORDED OPERATIONAL EVIDENCE LOG */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            Recorded Operational Evidence Log ({evidenceLog.length})
          </h2>
          <span className="text-[10px] font-mono text-cyan-400 font-bold">Local Memory Updated</span>
        </div>

        <div className="space-y-4">
          {evidenceLog.map((item) => (
            <div key={item.id} className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2.5 text-xs font-mono">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-cyan-400">{item.id}</span>
                  <span className="text-slate-400">Delivery #{item.shipmentId}</span>
                  <span className="text-slate-500 text-[10px]">({item.timestamp})</span>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                    item.outcome === 'SUCCESS'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {item.outcome}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-200">
                <span>Location: <span className="font-bold text-slate-100">{item.location}</span></span>
                <span>Actual Cost: <span className="font-bold text-emerald-400">${item.cost}</span></span>
              </div>

              <p className="text-slate-400 leading-relaxed font-sans">{item.notes}</p>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                <span className="text-cyan-400 font-semibold">{item.evidenceAdded}</span>
                <span className="text-emerald-400 font-semibold">{item.reliabilityImpact}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAILURE REPORTING MODAL */}
      <FailureReportModal
        isOpen={!!selectedFailureShipment}
        onClose={() => setSelectedFailureShipment(null)}
        onSubmit={handleReportFailureSubmit}
        shipment={selectedFailureShipment}
      />
    </div>
  );
}
