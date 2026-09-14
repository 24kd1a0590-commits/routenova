import React, { useState, useEffect, useMemo } from 'react';
import PageHeader from '../components/PageHeader';
import AddVehicleModal from '../components/AddVehicleModal';
import VehicleDetailsModal from '../components/VehicleDetailsModal';
import { VEHICLES as FALLBACK_VEHICLES } from '../data/index';
import { getVehiclesAsync, createVehicleAsync } from '../services/dataService';
import {
  Truck,
  Plus,
  Search,
  Filter,
  ShieldCheck,
  Star,
  Wrench,
  Navigation,
  CheckCircle2,
  Wifi,
  WifiOff,
  Info,
  Clock,
  Layers,
  ArrowUpDown,
} from 'lucide-react';

export default function VehiclesPage() {
  const [vehiclesList, setVehiclesList] = useState(FALLBACK_VEHICLES);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('RURAL_DESC');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedVehicleForDetails, setSelectedVehicleForDetails] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    async function loadVehicles() {
      setLoading(true);
      const res = await getVehiclesAsync();
      if (res && res.vehicles) {
        setVehiclesList(res.vehicles);
        setIsConnected(res.isBackendConnected);
      }
      setLoading(false);
    }
    loadVehicles();
  }, []);

  const handleAddVehicle = async (formData) => {
    const res = await createVehicleAsync(formData);
    const newV = res.vehicle;
    setVehiclesList((prev) => [newV, ...prev]);
    
    const modeText = res.isBackendConnected ? '(Backend DB Saved)' : '(Offline Demo)';
    setNotification(`✅ Vehicle ${newV.name} (${newV.plate}) added to fleet! ${modeText}`);
    setTimeout(() => setNotification(null), 4000);
  };

  // Friendly status translation helper
  const getFriendlyStatus = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return { label: 'Available', icon: '🟢', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
      case 'ASSIGNED':
        return { label: 'Assigned', icon: '🔵', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' };
      case 'IN_TRANSIT':
      case 'ON_DELIVERY':
        return { label: 'On the Road', icon: '🚚', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' };
      case 'MAINTENANCE':
        return { label: 'Maintenance', icon: '🔧', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
      default:
        return { label: status, icon: '⚪', color: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  // Helper: Render Star Rating (1 to 5 stars)
  const renderStars = (score) => {
    const starsCount = Math.min(5, Math.max(1, Math.round((score / 100) * 5)));
    return (
      <div className="flex items-center space-x-0.5 text-amber-400" title={`Rural Suitability Score: ${score}/100`}>
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${i < starsCount ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`}
          />
        ))}
      </div>
    );
  };

  // Helper: Get Icon per Vehicle Type
  const getVehicleTypeIcon = (type) => {
    switch (type) {
      case 'motorcycle':
        return '🏍️';
      case 'mini_truck':
        return '🚚';
      case 'van':
        return '🚐';
      case 'pickup':
        return '🛻';
      default:
        return '🚚';
    }
  };

  // Filter & Sort Logic
  const filteredVehicles = useMemo(() => {
    let result = [...vehiclesList];

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.plate.toLowerCase().includes(q) ||
          v.type.toLowerCase().includes(q) ||
          (v.assignedDriver && v.assignedDriver.toLowerCase().includes(q))
      );
    }

    // Category Type Filter
    if (selectedType !== 'ALL') {
      result = result.filter((v) => v.type === selectedType);
    }

    // Status Filter
    if (selectedStatus !== 'ALL') {
      result = result.filter((v) => {
        if (selectedStatus === 'IN_TRANSIT') {
          return v.availability === 'IN_TRANSIT' || v.availability === 'ON_DELIVERY';
        }
        return v.availability === selectedStatus;
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'RURAL_DESC') return (b.ruralSuitability || 0) - (a.ruralSuitability || 0);
      if (sortBy === 'UTIL_DESC') {
        const utilA = (a.currentLoadKg || 0) / (a.capacityKg || 1);
        const utilB = (b.currentLoadKg || 0) / (b.capacityKg || 1);
        return utilB - utilA;
      }
      if (sortBy === 'CAPACITY_DESC') return (b.capacityKg || 0) - (a.capacityKg || 0);
      return 0;
    });

    return result;
  }, [vehiclesList, searchQuery, selectedType, selectedStatus, sortBy]);

  return (
    <div className="space-y-6 animate-fade-in pb-16 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Fleet Management Workbench"
          description="View fleet load utilization, ground clearance, and rural road compatibility ratings"
          badge={
            isConnected ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-mono text-xs">
                <Wifi className="w-3.5 h-3.5" /> FASTAPI BACKEND ({vehiclesList.length})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-amber-400 font-mono text-xs">
                <WifiOff className="w-3.5 h-3.5" /> DEMO MODE ({vehiclesList.length})
              </span>
            )
          }
        />

        {/* ADD VEHICLE BUTTON */}
        <div className="shrink-0">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-cyan-600/20 transition active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Vehicle</span>
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs flex items-center justify-between shadow-xl animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-bold">{notification}</span>
          </div>
        </div>
      )}

      {/* OPERATIONAL QUICK ANSWERS TOOLBAR */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by vehicle name, plate ID, driver..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          {/* Quick Operational Answer Buttons */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className="text-slate-400 text-[11px] font-bold">Quick Answers:</span>
            <button
              onClick={() => {
                setSelectedStatus('AVAILABLE');
                setSelectedType('ALL');
              }}
              className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition flex items-center space-x-1.5 ${
                selectedStatus === 'AVAILABLE'
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🟢 Which vehicles are available?</span>
            </button>

            <button
              onClick={() => {
                setSortBy('RURAL_DESC');
                setSelectedStatus('ALL');
              }}
              className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition flex items-center space-x-1.5 ${
                sortBy === 'RURAL_DESC' && selectedStatus === 'ALL'
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🌲 Best for rural roads?</span>
            </button>

            <button
              onClick={() => {
                setSortBy('UTIL_DESC');
                setSelectedStatus('ALL');
              }}
              className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition flex items-center space-x-1.5 ${
                sortBy === 'UTIL_DESC'
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>📦 Heavily loaded vehicles?</span>
            </button>
          </div>
        </div>

        {/* Secondary Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 font-mono text-xs">
          {/* Category Chips */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'ALL', label: 'All Types' },
              { id: 'mini_truck', label: '🚚 Mini Trucks' },
              { id: 'van', label: '🚐 Vans' },
              { id: 'motorcycle', label: '🏍️ Motorcycles' },
              { id: 'pickup', label: '🛻 Pickups' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedType(cat.id)}
                className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition shrink-0 ${
                  selectedType === cat.id
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300 focus:outline-none"
            >
              <option value="RURAL_DESC">Sort: Rural Suitability (High to Low)</option>
              <option value="UTIL_DESC">Sort: Load Utilization (High to Low)</option>
              <option value="CAPACITY_DESC">Sort: Max Capacity (High to Low)</option>
            </select>
          </div>
        </div>
      </div>

      {/* FRIENDLY VEHICLE CARDS GRID */}
      {filteredVehicles.length === 0 ? (
        <div className="p-12 text-center text-slate-400 font-mono bg-slate-900/50 rounded-2xl border border-slate-800">
          No vehicles match the selected filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => {
            const statusInfo = getFriendlyStatus(vehicle.availability);
            const loadKg = vehicle.currentLoadKg || 0;
            const capKg = vehicle.capacityKg || 1;
            const utilPct = Math.min(100, Math.round((loadKg / capKg) * 100));

            return (
              <div
                key={vehicle.id}
                className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 hover:border-cyan-500/40 transition-all shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Card Row */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{getVehicleTypeIcon(vehicle.type)}</span>
                        <h3 className="text-sm font-bold text-white font-mono">{vehicle.name}</h3>
                      </div>
                      <div className="flex items-center space-x-2 font-mono text-[11px]">
                        <span className="font-bold text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {vehicle.plate}
                        </span>
                        <span className="text-slate-400 uppercase text-[10px]">
                          {vehicle.drivetrain || '4x4'}
                        </span>
                      </div>
                    </div>

                    {/* Friendly Status Badge */}
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border flex items-center space-x-1 ${statusInfo.color}`}>
                      <span>{statusInfo.icon}</span>
                      <span>{statusInfo.label}</span>
                    </span>
                  </div>

                  {/* VISUAL CAPACITY & UTILIZATION PROGRESS BAR */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">Current Load:</span>
                      <span className="text-slate-200 font-bold">
                        {loadKg} / {capKg} kg <span className="text-cyan-400">({utilPct}% loaded)</span>
                      </span>
                    </div>

                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full transition-all rounded-full ${
                          utilPct > 85 ? 'bg-amber-500' : utilPct > 50 ? 'bg-cyan-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${utilPct}%` }}
                      />
                    </div>
                  </div>

                  {/* RURAL SUITABILITY STAR RATING */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">Rural Suitability</span>
                      {renderStars(vehicle.ruralSuitability)}
                    </div>
                    <span className="text-sm font-bold text-emerald-400">{vehicle.ruralSuitability}/100</span>
                  </div>

                  {/* Surface Compatibility Chips */}
                  <div className="space-y-1 font-mono text-[11px]">
                    <span className="text-slate-500 text-[10px] uppercase font-bold">Road Capability:</span>
                    <div className="flex items-center space-x-2 text-[10px]">
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                        Mud: <strong className={vehicle.roadCompatibility?.unpaved_mud > 70 ? 'text-emerald-400' : 'text-amber-400'}>
                          {vehicle.roadCompatibility?.unpaved_mud || 70}%
                        </strong>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                        Clearance: <strong className="text-cyan-400">{vehicle.groundClearanceMm} mm</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 text-[11px]">
                    Driver: <span className="text-slate-200">{vehicle.assignedDriver || 'Unassigned'}</span>
                  </span>

                  <button
                    onClick={() => setSelectedVehicleForDetails(vehicle)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 font-bold transition text-[11px]"
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODALS */}
      <AddVehicleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddVehicle}
      />

      <VehicleDetailsModal
        vehicle={selectedVehicleForDetails}
        isOpen={!!selectedVehicleForDetails}
        onClose={() => setSelectedVehicleForDetails(null)}
      />
    </div>
  );
}
