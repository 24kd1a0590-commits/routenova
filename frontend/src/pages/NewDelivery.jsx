import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import RouteMap from '../components/RouteMap';
import RiskBadge from '../components/RiskBadge';
import { PRESET_DESTINATIONS } from '../data/presetDestinations';
import { VEHICLES, DELIVERIES } from '../data/seedData';
import {
  Zap,
  MapPin,
  Package,
  Weight,
  Clock,
  Car,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Bookmark,
} from 'lucide-react';

export default function NewDelivery() {
  const navigate = useNavigate();
  const [selectedPresetId, setSelectedPresetId] = useState('PRESET-RAMPURAM');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State initialized with Rampuram Village preset data by default
  const defaultPreset = PRESET_DESTINATIONS[0];

  const [formData, setFormData] = useState({
    senderName: defaultPreset.defaultSender,
    category: defaultPreset.defaultCategory,
    weightKg: defaultPreset.defaultWeightKg,
    volumeM3: defaultPreset.defaultVolumeM3,
    priority: defaultPreset.defaultPriority,
    deliveryWindow: defaultPreset.defaultWindow,

    village: defaultPreset.village,
    district: defaultPreset.district,
    lat: defaultPreset.coordinates.lat,
    lng: defaultPreset.coordinates.lng,
    addressDescription: defaultPreset.addressDescription,

    selectedVehicleId: 'VEH-VAN-02',
    vehicleName: 'Standard Delivery Van',
    vehicleType: 'Standard Van (2WD)',
    vehicleCategory: 'van',
    vehicleCapacityKg: 850,

    prototypeRiskLevel: defaultPreset.prototypeRiskLevel,
  });

  // Handle Preset Dropdown Selection (Populates Prototype Destination Intelligence)
  const handlePresetSelect = (presetId) => {
    setSelectedPresetId(presetId);
    const preset = PRESET_DESTINATIONS.find((p) => p.id === presetId);
    if (preset) {
      setFormData((prev) => ({
        ...prev,
        senderName: preset.defaultSender,
        category: preset.defaultCategory,
        weightKg: preset.defaultWeightKg,
        volumeM3: preset.defaultVolumeM3,
        priority: preset.defaultPriority,
        deliveryWindow: preset.defaultWindow,
        village: preset.village,
        district: preset.district,
        lat: preset.coordinates.lat,
        lng: preset.coordinates.lng,
        addressDescription: preset.addressDescription,
        prototypeRiskLevel: preset.prototypeRiskLevel,
      }));
    }
  };

  // Handle Vehicle Selection
  const handleVehicleSelect = (vehicleId) => {
    const veh = VEHICLES.find((v) => v.id === vehicleId);
    if (veh) {
      setFormData((prev) => ({
        ...prev,
        selectedVehicleId: veh.id,
        vehicleName: veh.name,
        vehicleType: veh.type,
        vehicleCapacityKg: veh.payloadCapacityKg,
      }));
    }
  };

  // Form Submission -> Create Delivery & Navigate to /deliveries/:id
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.senderName || !formData.village || !formData.weightKg) {
      alert('Please complete all required shipment & destination fields.');
      return;
    }

    setIsSubmitting(true);

    const newId = `RN-2026-${Math.floor(8800 + Math.random() * 99)}`;

    // Create temporary delivery object
    const createdDelivery = {
      id: newId,
      customer: formData.senderName,
      destination: formData.village,
      region: formData.district,
      cargo: formData.category,
      weightKg: formData.weightKg,
      volumeM3: formData.volumeM3,
      status: 'PRE_DISPATCH_EVALUATION',
      riskLevel: formData.prototypeRiskLevel || 'HIGH',
      failureProbability: formData.prototypeRiskLevel === 'HIGH' ? 0.78 : 0.28,
      conventionalVehicle: formData.vehicleType,
      recommendedVehicle: '4x4 Rural Mini Truck (Pooled)',
      coordinates: { lat: formData.lat, lng: formData.lng },
      dispatchWindow: formData.deliveryWindow,
      addressDescription: formData.addressDescription,
      sixFactors: {
        roadAccessibility: { score: 32, status: 'POOR', detail: formData.addressDescription },
        vehicleRoadCompatibility: { score: 45, status: 'MISMATCH', detail: `${formData.vehicleType} has low ground clearance` },
        addressConfidence: { score: 58, status: 'MODERATE', detail: 'Geocode confidence 72%' },
        connectivityReliability: { score: 25, status: 'CRITICAL', detail: 'Cellular dead zone reported' },
        historicalEvidence: { score: 40, status: 'WARNING', detail: '3 past reattempts logged' },
        distanceConditions: { score: 70, status: 'ACCEPTABLE', detail: 'Morning daylight window' },
      },
      lossComparison: {
        baseline: {
          planName: `Plan A: ${formData.vehicleName}`,
          vehicle: formData.vehicleType,
          failureProbability: '78%',
          expectedLoss: 420,
          failureModes: ['Vehicle Stuck in Mud Track', 'Cell Dead Zone lost address'],
        },
        alternative: {
          planName: 'Plan B: 4x4 Mini Truck',
          vehicle: '4x4 Rural Mini Truck',
          failureProbability: '18%',
          expectedLoss: 145,
        },
        pooled: {
          planName: 'Plan C: Pooled 4x4 Mini Truck',
          vehicle: '4x4 Rural Mini Truck (Shared)',
          failureProbability: '12%',
          expectedLoss: 78,
          isRecommended: true,
          pooledWithCustomer: 'Kothuru Agricultural Supplies',
        },
      },
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    // Prepend to seeded deliveries array
    DELIVERIES.unshift(createdDelivery);

    setTimeout(() => {
      setIsSubmitting(false);
      navigate(`/deliveries/${newId}`);
    }, 600);
  };

  // Calculate Capacity Weight Fit %
  const weightFitPercent = Math.round((formData.weightKg / formData.vehicleCapacityKg) * 100);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Create & Evaluate Rural Delivery Plan"
        description="Multi-section delivery creation workflow with automated destination intelligence presets"
        badge="PRE-DISPATCH ENGINE WORKFLOW"
      />

      {/* Preset Intelligence Bar */}
      <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0">
            <Bookmark className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold text-cyan-300 uppercase">
              Demo Destination Preset Intelligence
            </h3>
            <p className="text-xs text-slate-300">
              Select a seeded rural village to automatically populate prototype road accessibility & landmark data.
            </p>
          </div>
        </div>

        <div className="w-full sm:w-auto shrink-0">
          <select
            value={selectedPresetId}
            onChange={(e) => handlePresetSelect(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 bg-slate-950 text-xs text-cyan-400 font-mono font-bold rounded-lg border border-cyan-500/40 focus:outline-none"
          >
            {PRESET_DESTINATIONS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                📍 {preset.name} ({preset.district})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Form & Summary Grid */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form Sections */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Shipment Details */}
          <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
            <h2 className="text-sm font-mono font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <Package className="w-4 h-4 text-cyan-400" />
              1. Shipment Specifications
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1">Sender Name / Entity</label>
                <input
                  type="text"
                  value={formData.senderName}
                  onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-950 text-slate-200 rounded-lg border border-slate-800 focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Shipment Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 text-slate-200 rounded-lg border border-slate-800 focus:border-cyan-500/50"
                >
                  <option value="Agricultural Produce & Seeds">Agricultural Produce & Seeds</option>
                  <option value="Emergency Medical Supplies">Emergency Medical Supplies</option>
                  <option value="Solar & Electrical Equipment">Solar & Electrical Equipment</option>
                  <option value="General Machinery Supplies">General Machinery Supplies</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Package Weight (kg)</label>
                <input
                  type="number"
                  value={formData.weightKg}
                  onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                  required
                  className="w-full px-3 py-2 bg-slate-950 text-slate-200 rounded-lg border border-slate-800 focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Package Volume (m³)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.volumeM3}
                  onChange={(e) => setFormData({ ...formData, volumeM3: Number(e.target.value) })}
                  required
                  className="w-full px-3 py-2 bg-slate-950 text-slate-200 rounded-lg border border-slate-800 focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Delivery Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 text-slate-200 rounded-lg border border-slate-800 focus:border-cyan-500/50"
                >
                  <option value="Low">Low Priority</option>
                  <option value="Standard">Standard Priority</option>
                  <option value="High">High Priority</option>
                  <option value="Urgent/Critical">Urgent / Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Target Delivery Window</label>
                <input
                  type="text"
                  value={formData.deliveryWindow}
                  onChange={(e) => setFormData({ ...formData, deliveryWindow: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-950 text-slate-200 rounded-lg border border-slate-800 focus:border-cyan-500/50"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Destination Intelligence */}
          <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
            <h2 className="text-sm font-mono font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <MapPin className="w-4 h-4 text-cyan-400" />
              2. Destination & Rural Accessibility Intelligence
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1">Village / Destination Hub</label>
                <input
                  type="text"
                  value={formData.village}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-950 text-slate-200 rounded-lg border border-slate-800 focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Logistics District</label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-950 text-slate-200 rounded-lg border border-slate-800 focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.lat}
                  onChange={(e) => setFormData({ ...formData, lat: Number(e.target.value) })}
                  required
                  className="w-full px-3 py-2 bg-slate-950 text-slate-200 rounded-lg border border-slate-800 focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.lng}
                  onChange={(e) => setFormData({ ...formData, lng: Number(e.target.value) })}
                  required
                  className="w-full px-3 py-2 bg-slate-950 text-slate-200 rounded-lg border border-slate-800 focus:border-cyan-500/50"
                />
              </div>
            </div>

            <div className="text-xs font-mono">
              <label className="block text-slate-400 mb-1">
                Address & Road Accessibility Intelligence Notes
              </label>
              <textarea
                rows={3}
                value={formData.addressDescription}
                onChange={(e) => setFormData({ ...formData, addressDescription: e.target.value })}
                required
                className="w-full px-3 py-2 bg-slate-950 text-slate-200 rounded-lg border border-slate-800 focus:border-cyan-500/50"
              />
            </div>

            {/* Leaflet Destination Preview Map */}
            <div className="pt-2">
              <label className="block text-xs font-mono text-slate-400 mb-2">
                Interactive Leaflet Destination Preview Map
              </label>
              <RouteMap
                lat={formData.lat}
                lng={formData.lng}
                villageName={formData.village}
                riskLevel={formData.prototypeRiskLevel}
                height="220px"
              />
            </div>
          </div>

          {/* Section 3: Baseline Vehicle Selection */}
          <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
            <h2 className="text-sm font-mono font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <Car className="w-4 h-4 text-cyan-400" />
              3. Baseline Vehicle Selection
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1">Select Fleet Vehicle</label>
                <select
                  value={formData.selectedVehicleId}
                  onChange={(e) => handleVehicleSelect(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 text-slate-200 rounded-lg border border-slate-800 focus:border-cyan-500/50 font-bold"
                >
                  {VEHICLES.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.plate}) — Max {v.payloadCapacityKg}kg
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Vehicle Drivetrain / Category</label>
                <input
                  type="text"
                  value={formData.vehicleType}
                  readOnly
                  className="w-full px-3 py-2 bg-slate-900 text-cyan-400 rounded-lg border border-slate-800 font-bold"
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono flex items-center justify-between">
              <span className="text-slate-400">Payload Weight Utilization Fit:</span>
              <span
                className={`font-bold ${
                  weightFitPercent > 90
                    ? 'text-rose-400'
                    : weightFitPercent > 70
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {formData.weightKg} kg / {formData.vehicleCapacityKg} kg ({weightFitPercent}% Capacity)
              </span>
            </div>
          </div>
        </div>

        {/* Right Col: Delivery Summary Panel & Action */}
        <div className="space-y-6">
          <div className="glass-panel p-5 rounded-xl border border-slate-800 sticky top-20 space-y-5">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-cyan-400" />
                Delivery Summary Panel
              </h3>
              <RiskBadge level={formData.prototypeRiskLevel} />
            </div>

            {/* Real-time Summary List */}
            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase block">Sender & Cargo</span>
                <p className="text-slate-100 font-bold">{formData.senderName}</p>
                <p className="text-slate-400 text-[11px]">{formData.category}</p>
                <p className="text-cyan-400 text-[11px] pt-1">
                  Weight: {formData.weightKg} kg | Vol: {formData.volumeM3} m³
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase block">Destination</span>
                <p className="text-slate-100 font-bold">{formData.village}</p>
                <p className="text-slate-400 text-[11px]">{formData.district}</p>
                <p className="text-slate-500 text-[10px]">
                  Coords: {formData.lat}, {formData.lng}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase block">Selected Baseline Vehicle</span>
                <p className="text-slate-100 font-bold">{formData.vehicleName}</p>
                <p className="text-slate-400 text-[11px]">{formData.vehicleType}</p>
                <p className="text-emerald-400 text-[11px] pt-1">
                  Payload Capacity: {formData.vehicleCapacityKg} kg
                </p>
              </div>
            </div>

            {/* Action Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>PREPARING DELIVERY INTELLIGENCE...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  <span>ANALYZE DELIVERY</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 leading-relaxed font-mono">
              <span className="text-cyan-400 font-bold block mb-0.5">Failure-Aware Pre-Dispatch Check:</span>
              Submitting launches the 6-factor evaluator to compute expected operational loss and micropooling options.
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
