import React, { useState } from 'react';
import { X, PlusCircle, Truck, Shield, AlertCircle } from 'lucide-react';

export default function AddVehicleModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    type: 'mini_truck',
    name: '',
    plate: '',
    capacityKg: '500',
    currentLoadKg: '0',
    baseCost: '45',
    costPerKm: '1.2',
    groundClearanceMm: '220',
    drivetrain: '4x4',
    ruralSuitability: '85',
    assignedDriver: 'Driver Unassigned',
    currentLocation: 'Central District Depot',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Vehicle name is required';
    if (!formData.plate.trim()) errs.plate = 'License plate is required';
    
    const cap = parseFloat(formData.capacityKg);
    if (isNaN(cap) || cap <= 0) {
      errs.capacityKg = 'Capacity must be greater than 0 kg';
    }

    const load = parseFloat(formData.currentLoadKg);
    if (isNaN(load) || load < 0) {
      errs.currentLoadKg = 'Current load cannot be negative';
    } else if (cap > 0 && load > cap) {
      errs.currentLoadKg = `Current load (${load} kg) cannot exceed capacity (${cap} kg)`;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    await onAdd(formData);
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-mono">+ Register New Fleet Vehicle</h3>
              <p className="text-xs text-slate-400 font-mono">Add vehicle to RouteNova decision & plan engines</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          {/* Vehicle Type & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider">
                Vehicle Category *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500/50"
              >
                <option value="mini_truck">🚚 Mini Truck (4x4)</option>
                <option value="van">🚐 Standard 2WD Van</option>
                <option value="motorcycle">🏍️ Cargo Motorcycle</option>
                <option value="pickup">🛻 Heavy Pickup</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider">
                Vehicle Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Tata Ace 4x4 Pro"
                className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-slate-200 focus:outline-none ${
                  errors.name ? 'border-rose-500' : 'border-slate-800 focus:border-cyan-500/50'
                }`}
              />
              {errors.name && <p className="text-[10px] text-rose-400 mt-1">{errors.name}</p>}
            </div>
          </div>

          {/* License Plate & Drivetrain */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider">
                License Plate / ID *
              </label>
              <input
                type="text"
                name="plate"
                value={formData.plate}
                onChange={handleChange}
                placeholder="e.g. AP-30-T-9090"
                className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-slate-200 focus:outline-none ${
                  errors.plate ? 'border-rose-500' : 'border-slate-800 focus:border-cyan-500/50'
                }`}
              />
              {errors.plate && <p className="text-[10px] text-rose-400 mt-1">{errors.plate}</p>}
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider">
                Drivetrain System
              </label>
              <select
                name="drivetrain"
                value={formData.drivetrain}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500/50"
              >
                <option value="4x4">4x4 (Four-Wheel Drive)</option>
                <option value="2WD">2WD (Rear-Wheel Drive)</option>
                <option value="FWD">FWD (Front-Wheel Drive)</option>
                <option value="AWD">AWD (All-Wheel Drive)</option>
              </select>
            </div>
          </div>

          {/* Capacity (kg) & Current Load (kg) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-850">
            <div>
              <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider">
                Max Capacity (kg) *
              </label>
              <input
                type="number"
                name="capacityKg"
                value={formData.capacityKg}
                onChange={handleChange}
                placeholder="500"
                className={`w-full bg-slate-900 border rounded-xl px-3 py-2 text-slate-200 focus:outline-none ${
                  errors.capacityKg ? 'border-rose-500' : 'border-slate-800 focus:border-cyan-500/50'
                }`}
              />
              {errors.capacityKg && <p className="text-[10px] text-rose-400 mt-1">{errors.capacityKg}</p>}
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider">
                Current Load (kg)
              </label>
              <input
                type="number"
                name="currentLoadKg"
                value={formData.currentLoadKg}
                onChange={handleChange}
                placeholder="0"
                className={`w-full bg-slate-900 border rounded-xl px-3 py-2 text-slate-200 focus:outline-none ${
                  errors.currentLoadKg ? 'border-rose-500' : 'border-slate-800 focus:border-cyan-500/50'
                }`}
              />
              {errors.currentLoadKg && <p className="text-[10px] text-rose-400 mt-1">{errors.currentLoadKg}</p>}
            </div>
          </div>

          {/* Ground Clearance & Rural Score */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider">
                Ground Clearance (mm)
              </label>
              <input
                type="number"
                name="groundClearanceMm"
                value={formData.groundClearanceMm}
                onChange={handleChange}
                placeholder="220"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider">
                Rural Score (1 - 100)
              </label>
              <input
                type="number"
                name="ruralSuitability"
                value={formData.ruralSuitability}
                onChange={handleChange}
                placeholder="85"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          {/* Driver & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider">
                Assigned Driver
              </label>
              <input
                type="text"
                name="assignedDriver"
                value={formData.assignedDriver}
                onChange={handleChange}
                placeholder="e.g. Ramesh Kumar"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider">
                Depot Location
              </label>
              <input
                type="text"
                name="currentLocation"
                value={formData.currentLocation}
                onChange={handleChange}
                placeholder="e.g. Rampuram Hub"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition shadow-lg shadow-cyan-600/20 flex items-center space-x-2 disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{submitting ? 'Registering...' : 'Save Vehicle to Fleet'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
