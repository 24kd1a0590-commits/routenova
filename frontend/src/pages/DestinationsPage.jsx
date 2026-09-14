import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { DESTINATIONS as FALLBACK_DESTINATIONS, getDeliveryHistoryByDestination } from '../data/index';
import { getDestinationsAsync } from '../services/dataService';
import {
  MapPin,
  Search,
  Filter,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Wifi,
  WifiOff,
  Navigation,
  ChevronDown,
  Info,
  Layers,
  ArrowRight,
  HelpCircle,
  XCircle,
} from 'lucide-react';

export default function DestinationsPage() {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState(FALLBACK_DESTINATIONS);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [openTechDetails, setOpenTechDetails] = useState({});

  useEffect(() => {
    async function loadDestinations() {
      setLoading(true);
      const res = await getDestinationsAsync();
      if (res && res.destinations) {
        setDestinations(res.destinations);
        setIsConnected(res.isBackendConnected);
      }
      setLoading(false);
    }
    loadDestinations();
  }, []);

  const toggleTechDetails = (id) => {
    setOpenTechDetails((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Friendly status helpers
  const getRoadAccessBadge = (score) => {
    if (score >= 75) {
      return { label: 'Good Road Access', icon: '🟢', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
    }
    if (score >= 50) {
      return { label: 'Moderate Track', icon: '🟡', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
    }
    return { label: 'Difficult / Unpaved Ruts', icon: '⚠️', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' };
  };

  const getAddressConfidenceBadge = (score) => {
    if (score >= 80) {
      return { label: 'High Confidence', icon: '🟢', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
    }
    if (score >= 60) {
      return { label: 'Needs Verification', icon: '🟡', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
    }
    return { label: 'Unclear Landmark', icon: '⚠️', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' };
  };

  const getConnectivityBadge = (score) => {
    if (score >= 75) {
      return { label: 'Good Signal', icon: '🟢', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
    }
    if (score >= 50) {
      return { label: 'Intermittent Signal', icon: '🟡', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
    }
    return { label: 'Cellular Dead Zone', icon: '🔴', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' };
  };

  const getHistoricalSuccessBadge = (score) => {
    if (score >= 85) {
      return { label: 'High Success (90%+)', icon: '🟢', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
    }
    if (score >= 70) {
      return { label: 'Moderate Success', icon: '🟡', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
    }
    return { label: 'Low Success (Frequent Reattempts)', icon: '⚠️', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' };
  };

  // Helper for human concern & explanation
  const getHumanInterpretation = (dest) => {
    const risk = dest.prototypeRiskLevel || (dest.roadAccessScore < 50 ? 'HIGH' : dest.roadAccessScore < 75 ? 'MEDIUM' : 'LOW');
    if (risk === 'HIGH') {
      return {
        mainConcern: `⚠️ Narrow ${dest.roadSurface || 'unpaved'} track on final ${dest.finalSegmentDistance || 2.1} km segment`,
        meaning: `Standard 2WD vans may get stuck during rain or morning dew. We recommend dispatching a 4x4 Mini Truck or combining shipments on a pooled vehicle.`,
      };
    }
    if (risk === 'MEDIUM') {
      return {
        mainConcern: `🟡 Cell dead-zone & narrow alleyways near ${dest.defaultLandmark || 'village entrance'}`,
        meaning: `Drivers should load offline maps before departing. Suitable for Mini Trucks, EV 3-Wheelers, or Cargo Motorcycles.`,
      };
    }
    return {
      mainConcern: `🟢 Clear paved asphalt corridor with wide access`,
      meaning: `Optimal road conditions. Standard 2WD vans or baseline vehicles can execute dispatch with high on-time reliability.`,
    };
  };

  // Unique Districts
  const districts = useMemo(() => {
    const set = new Set(destinations.map((d) => d.district));
    return ['ALL', ...Array.from(set)];
  }, [destinations]);

  // Filtered Destinations
  const filteredDestinations = useMemo(() => {
    let result = [...destinations];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.district.toLowerCase().includes(q) ||
          (d.defaultLandmark && d.defaultLandmark.toLowerCase().includes(q))
      );
    }

    if (riskFilter !== 'ALL') {
      result = result.filter((d) => d.prototypeRiskLevel === riskFilter);
    }

    if (districtFilter !== 'ALL') {
      result = result.filter((d) => d.district === districtFilter);
    }

    return result;
  }, [destinations, searchQuery, riskFilter, districtFilter]);

  return (
    <div className="space-y-6 animate-fade-in pb-16 font-sans">
      {/* Header */}
      <PageHeader
        title="Destination Intelligence"
        description="Can this delivery safely and successfully reach this destination? Pre-dispatch ground safety & risk profiles."
        badge={
          isConnected ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-mono text-xs">
              <Wifi className="w-3.5 h-3.5" /> FASTAPI BACKEND ({destinations.length})
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-amber-400 font-mono text-xs">
              <WifiOff className="w-3.5 h-3.5" /> DEMO MODE ({destinations.length})
            </span>
          )
        }
      />

      {/* PROTOTYPE OPERATIONAL EVIDENCE DISCLAIMER */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <span className="font-bold uppercase tracking-wider block">PROTOTYPE NOTICE</span>
            <p className="text-[11px] text-amber-200/80">
              Prototype operational evidence — not authoritative physical-road truth. Used by dispatchers to evaluate pre-dispatch vehicle suitability.
            </p>
          </div>
        </div>
        <span className="text-[10px] bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-500/40 text-amber-300 uppercase font-bold shrink-0">
          Simulated Ground Data
        </span>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl font-mono text-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by destination name, district, landmark..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          {/* Risk Level Filter Chips */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-slate-400 text-[11px] font-bold shrink-0">Risk Profile:</span>
            {[
              { id: 'ALL', label: 'All Locations' },
              { id: 'HIGH', label: '⚠️ High Risk' },
              { id: 'MEDIUM', label: '🟡 Medium Risk' },
              { id: 'LOW', label: '🟢 Low Risk' },
            ].map((risk) => (
              <button
                key={risk.id}
                onClick={() => setRiskFilter(risk.id)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition shrink-0 ${
                  riskFilter === risk.id
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {risk.label}
              </button>
            ))}
          </div>
        </div>

        {/* District Filter Dropdown */}
        <div className="flex items-center space-x-3 pt-2 border-t border-slate-800/80">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 text-[11px]">Filter by District Zone:</span>
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1 text-slate-300 focus:outline-none"
          >
            {districts.map((d) => (
              <option key={d} value={d}>
                {d === 'ALL' ? 'All District Zones' : d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* DESTINATION INTELLIGENCE CARDS */}
      {filteredDestinations.length === 0 ? (
        <div className="p-12 text-center text-slate-400 font-mono bg-slate-900/50 rounded-2xl border border-slate-800">
          No destinations match the selected filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDestinations.map((dest) => {
            const roadBadge = getRoadAccessBadge(dest.roadAccessScore);
            const addrBadge = getAddressConfidenceBadge(dest.addressConfidenceScore);
            const connBadge = getConnectivityBadge(dest.connectivityScore);
            const histBadge = getHistoricalSuccessBadge(dest.historicalSuccessRate);
            const interpretation = getHumanInterpretation(dest);
            const history = getDeliveryHistoryByDestination(dest.id);
            const isTechOpen = !!openTechDetails[dest.id];

            return (
              <div
                key={dest.id}
                className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5 hover:border-cyan-500/40 transition-all shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Card Location Header */}
                  <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                        <h3 className="text-lg font-bold text-white font-mono">{dest.name}</h3>
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        District: <span className="text-slate-200 font-semibold">{dest.district}</span>
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Landmark: <span className="text-cyan-300 font-medium">{dest.defaultLandmark || 'Main Well'}</span>
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border ${
                        dest.prototypeRiskLevel === 'HIGH'
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                          : dest.prototypeRiskLevel === 'MEDIUM'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      }`}
                    >
                      {dest.prototypeRiskLevel || 'MEDIUM'} RISK
                    </span>
                  </div>

                  {/* 4 FRIENDLY VISUAL STATUS BADGES */}
                  <div className="grid grid-cols-2 gap-2.5 font-mono text-xs">
                    {/* 1. Road Access */}
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">🛣️ Road Access</span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold border inline-block ${roadBadge.color}`}>
                        {roadBadge.icon} {roadBadge.label}
                      </span>
                    </div>

                    {/* 2. Address Confidence */}
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">📍 Address Confidence</span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold border inline-block ${addrBadge.color}`}>
                        {addrBadge.icon} {addrBadge.label}
                      </span>
                    </div>

                    {/* 3. Connectivity */}
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">📶 Connectivity</span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold border inline-block ${connBadge.color}`}>
                        {connBadge.icon} {connBadge.label}
                      </span>
                    </div>

                    {/* 4. Previous Deliveries */}
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">📦 Previous Deliveries</span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold border inline-block ${histBadge.color}`}>
                        {histBadge.icon} {histBadge.label}
                      </span>
                    </div>
                  </div>

                  {/* MAIN CONCERN CALLOUT BOX */}
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono space-y-1">
                    <span className="text-amber-400 font-bold uppercase tracking-wider block">Main Concern:</span>
                    <p className="text-slate-200 font-bold leading-relaxed">{interpretation.mainConcern}</p>
                  </div>

                  {/* WHAT DOES THIS MEAN? HUMAN EXPLANATION */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-sans space-y-1">
                    <span className="text-cyan-400 font-mono font-bold uppercase text-[11px] block">
                      What does this mean for dispatchers?
                    </span>
                    <p className="text-slate-300 leading-relaxed text-xs">{interpretation.meaning}</p>
                  </div>

                  {/* RECENT OUTCOMES VISUAL BADGES */}
                  <div className="space-y-1.5 font-mono text-xs">
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Recent Delivery Outcomes:</span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {history.length > 0 ? (
                        history.map((h, idx) => (
                          <span
                            key={idx}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1 ${
                              h.outcome === 'SUCCESS'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : h.outcome === 'DELAYED'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            }`}
                          >
                            {h.outcome === 'SUCCESS' ? '✅ Delivered' : h.outcome === 'DELAYED' ? '⚠️ Delayed' : '❌ Failed'}
                            <span className="text-slate-500">({h.deliveryTime || h.timestamp})</span>
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">No previous failure incidents recorded</span>
                      )}
                    </div>
                  </div>

                  {/* PROGRESSIVE DISCLOSURE: VIEW TECHNICAL DETAILS */}
                  <div className="pt-2 border-t border-slate-900">
                    <button
                      onClick={() => toggleTechDetails(dest.id)}
                      className="text-[11px] font-mono text-slate-400 hover:text-cyan-400 flex items-center justify-between w-full py-1 transition"
                    >
                      <span className="flex items-center space-x-1.5">
                        <Info className="w-3.5 h-3.5 text-slate-500" />
                        <span>View Technical Scores & Coordinates</span>
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-500 transition-transform ${isTechOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {isTechOpen && (
                      <div className="mt-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono space-y-2 text-slate-300 animate-fade-in">
                        <div className="grid grid-cols-2 gap-2 border-b border-slate-850 pb-2">
                          <div>
                            <span className="text-slate-500 block">Road Access Score:</span>
                            <strong className="text-white">{dest.roadAccessScore} / 100</strong>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Address Confidence:</span>
                            <strong className="text-white">{dest.addressConfidenceScore} / 100</strong>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Connectivity Score:</span>
                            <strong className="text-white">{dest.connectivityScore} / 100</strong>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Historical Success:</span>
                            <strong className="text-white">{dest.historicalSuccessRate}%</strong>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-[10px] pt-1">
                          <span className="text-slate-500">Final Segment: <strong>{dest.finalSegmentDistance} km ({dest.roadSurface})</strong></span>
                          <span className="text-slate-500">GPS: <strong>{dest.latitude}° N, {dest.longitude}° E</strong></span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* PRE-DISPATCH ACTION BUTTON */}
                <div className="pt-4 border-t border-slate-800">
                  <button
                    onClick={() => navigate(`/deliveries/new?dest=${dest.id}`)}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-cyan-600/20 transition active:scale-[0.98]"
                  >
                    <span>Evaluate Pre-Dispatch for {dest.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
