import React, { useState } from 'react';
import { X, AlertTriangle, Send, FileText, DollarSign } from 'lucide-react';

export default function FailureReportModal({ isOpen, onClose, onSubmit, shipment }) {
  const [failureReason, setFailureReason] = useState('vehicle could not access road');
  const [notes, setNotes] = useState('');
  const [actualCost, setActualCost] = useState(420);

  if (!isOpen || !shipment) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      deliveryId: shipment.id,
      destinationId: shipment.destinationId || 'DEST-RAMPURAM',
      vehicleId: shipment.conventionalVehicleId || 'VEH-VAN-01',
      outcome: 'FAILURE_REATTEMPT',
      failureReason,
      notes,
      actualCost: Number(actualCost),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-rose-500/40 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 font-mono tracking-wide uppercase">
                REPORT DELIVERY FAILURE EVIDENCE
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Delivery ID: {shipment.id} — {shipment.sender}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-slate-400 mb-1">Structured Failure Reason</label>
            <select
              value={failureReason}
              onChange={(e) => setFailureReason(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-950 text-rose-400 font-bold rounded-lg border border-slate-800 focus:border-rose-500/50"
            >
              <option value="vehicle could not access road">
                Vehicle could not access road (mud rutting / clearance issue)
              </option>
              <option value="address issue">
                Address issue / unfindable destination landmark
              </option>
              <option value="connectivity problem">
                Connectivity problem / cellular signal drop
              </option>
              <option value="customer unavailable">
                Customer unavailable / delivery window missed
              </option>
              <option value="unexpected road condition">
                Unexpected road condition (flooded creek / bridge closure)
              </option>
              <option value="other">Other operational issue</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Actual Incurred Failure Cost ($)</label>
            <input
              type="number"
              value={actualCost}
              onChange={(e) => setActualCost(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-950 text-slate-200 rounded-lg border border-slate-800 focus:border-rose-500/50"
            />
            <p className="text-[10px] text-slate-500 mt-1">Includes towing, vehicle repair, and reattempt dispatch costs.</p>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Driver Field Observations & Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe exact location of failure, track condition, and local towing details..."
              required
              className="w-full px-3 py-2 bg-slate-950 text-slate-200 rounded-lg border border-slate-800 focus:border-rose-500/50"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-rose-500/20"
            >
              <Send className="w-4 h-4" />
              <span>LOG FAILURE EVIDENCE</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
