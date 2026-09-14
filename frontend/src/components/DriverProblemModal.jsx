import React, { useState } from 'react';
import {
  AlertTriangle,
  Wrench,
  MapPin,
  UserX,
  WifiOff,
  HelpCircle,
  X,
  Send,
} from 'lucide-react';

const PROBLEM_TYPES = [
  {
    id: 'ROAD_BLOCKED',
    label: 'Road Blocked / Unpaved Ruts',
    desc: 'Mud, flooding, or fallen trees blocking access',
    icon: AlertTriangle,
    color: 'rose',
  },
  {
    id: 'VEHICLE_ISSUE',
    label: 'Vehicle Problem',
    desc: 'Tire puncture, overheating, or engine trouble',
    icon: Wrench,
    color: 'amber',
  },
  {
    id: 'DESTINATION_LOST',
    label: 'Destination Not Found',
    desc: 'Landmark or village location is unclear',
    icon: MapPin,
    color: 'cyan',
  },
  {
    id: 'CUSTOMER_UNAVAILABLE',
    label: 'Recipient Unavailable',
    desc: 'Nobody at delivery site to receive package',
    icon: UserX,
    color: 'indigo',
  },
  {
    id: 'OFF_GRID',
    label: 'No Cell Signal',
    desc: 'Entering dead-zone without data connection',
    icon: WifiOff,
    color: 'emerald',
  },
  {
    id: 'OTHER',
    label: 'Other Issue',
    desc: 'Weather delay or unexpected obstacle',
    icon: HelpCircle,
    color: 'slate',
  },
];

export default function DriverProblemModal({ isOpen, onClose, onSubmit }) {
  const [selectedType, setSelectedType] = useState('ROAD_BLOCKED');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const selectedObj = PROBLEM_TYPES.find((p) => p.id === selectedType);
    const fullNotes = `[${selectedObj?.label}] ${notes.trim()}`;
    await onSubmit(selectedType, fullNotes);
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Report Delivery Issue</h3>
              <p className="text-xs text-slate-400">Let dispatch know what stopped or slowed your route</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Problem Selection Grid */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Problem Category
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {PROBLEM_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedType(type.id)}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-rose-500/10 border-rose-500/50 text-white ring-1 ring-rose-500/50'
                        : 'bg-slate-950/50 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-rose-400' : 'text-slate-500'}`} />
                      <span className="text-xs font-bold truncate">{type.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 line-clamp-1">{type.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Additional Details (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Muddy segment near village boundary. Waiting for local guidance."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-rose-500/50 transition resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-lg shadow-rose-600/20 flex items-center space-x-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Submitting...' : 'Submit Issue'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
