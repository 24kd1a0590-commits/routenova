import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Navigation,
  MapPin,
  Truck,
  AlertTriangle,
  Layers,
  ShieldCheck,
  Package,
  Share2,
  Info,
} from 'lucide-react';

// Custom Leaflet DivIcon Creators for clean styling without external images
const createCustomIcon = (htmlContent, className = '') => {
  return L.divIcon({
    html: `<div className="flex items-center justify-center shadow-lg transition-transform hover:scale-110 ${className}">${htmlContent}</div>`,
    className: 'custom-leaflet-marker-wrapper',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

const pickupIcon = createCustomIcon(
  `<div class="w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center font-mono font-bold text-xs border-2 border-slate-900 shadow-xl">📍</div>`
);

const destinationIcon = createCustomIcon(
  `<div class="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-mono font-bold text-xs border-2 border-slate-900 shadow-xl">🏁</div>`
);

const vehicleIcon = createCustomIcon(
  `<div class="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-mono font-bold text-xs border-2 border-slate-900 shadow-xl">🚚</div>`
);

const riskIcon = createCustomIcon(
  `<div class="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center font-mono font-bold text-xs border-2 border-slate-900 shadow-xl animate-pulse">⚠️</div>`
);

const poolIcon = createCustomIcon(
  `<div class="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-mono font-bold text-xs border-2 border-slate-900 shadow-xl">◆</div>`
);

// Map bounds / center adjuster component
function ChangeView({ bounds, center }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40] });
    } else if (center && center[0] && center[1]) {
      map.setView(center, 13);
    }
  }, [bounds, center, map]);
  return null;
}

export default function RouteMap({
  mode: initialMode = 'DELIVERY', // DELIVERY | RISK | POOLING
  lat,
  lng,
  villageName = 'Rampuram Village',
  riskLevel = 'HIGH',
  origin = { name: 'Central District Depot', lat: 18.2511, lng: 83.8410 },
  destination = null,
  vehicle = { name: 'Tata Ace 4x4 Mini Truck', plate: 'AP-30-T-4401', lat: 18.2720, lng: 83.8650 },
  riskSegment = null,
  poolShipments = [],
  height = '360px',
  showTitleHeader = true,
}) {
  const [activeMode, setActiveMode] = useState(initialMode);

  // Compute destination object fallback
  const destObj = destination || {
    name: villageName,
    lat: lat || 18.2949,
    lng: lng || 83.8938,
    landmark: 'Panchayati Well, Sector 4',
  };

  // Compute Risk Segment fallback
  const riskObj = riskSegment || {
    startLat: (origin.lat + destObj.lat * 2) / 3,
    startLng: (origin.lng + destObj.lng * 2) / 3,
    endLat: destObj.lat,
    endLng: destObj.lng,
    text: 'Attention: difficult final segment',
    riskLevel: riskLevel || 'HIGH',
  };

  // Coordinates arrays
  const pickupCoords = [origin.lat, origin.lng];
  const vehicleCoords = [vehicle.lat, vehicle.lng];
  const destCoords = [destObj.lat, destObj.lng];
  const riskStartCoords = [riskObj.startLat, riskObj.startLng];

  // Primary Main Route Polyline
  const mainRoutePolyline = [
    pickupCoords,
    vehicleCoords,
    riskStartCoords,
  ];

  // Risky Final Segment Polyline
  const riskSegmentPolyline = [
    riskStartCoords,
    destCoords,
  ];

  // Secondary Pool Route Polyline (if pooling)
  const poolCoords = poolShipments.length > 0 ? [poolShipments[0].lat, poolShipments[0].lng] : [18.3105, 83.9012];
  const poolRoutePolyline = [
    pickupCoords,
    poolCoords,
    destCoords,
  ];

  // Calculate Map Bounds
  const mapBounds = [pickupCoords, destCoords, vehicleCoords];

  return (
    <div className="w-full space-y-3 font-sans">
      {/* 1. Core Question Header Above Map */}
      {showTitleHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
              PRE-DISPATCH ROUTE EVALUATION
            </span>
            <h3 className="text-sm sm:text-base font-bold text-white font-mono flex items-center gap-2">
              <Navigation className="w-4 h-4 text-cyan-400" />
              Can this delivery reach the destination successfully?
            </h3>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center space-x-1 font-mono text-[11px]">
            {[
              { id: 'DELIVERY', label: '🚚 DELIVERY MODE' },
              { id: 'RISK', label: '⚠️ RISK MODE' },
              { id: 'POOLING', label: '🔀 POOLING MODE' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setActiveMode(m.id)}
                className={`px-2.5 py-1 rounded-lg font-bold border transition ${
                  activeMode === m.id
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border-slate-800'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. Map Container Box */}
      <div className="relative w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
        <MapContainer
          center={destCoords}
          zoom={12}
          scrollWheelZoom={false}
          style={{ height, width: '100%' }}
        >
          <ChangeView bounds={mapBounds} center={destCoords} />
          
          {/* Tile Layer */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* MARKER 1: Pickup Location */}
          <Marker position={pickupCoords} icon={pickupIcon}>
            <Popup>
              <div className="text-xs font-mono p-1">
                <p className="font-bold text-cyan-400">📍 Pickup Origin</p>
                <p className="text-slate-200 font-bold">{origin.name}</p>
                <p className="text-[10px] text-slate-400">Depot Hub Departure Point</p>
              </div>
            </Popup>
          </Marker>

          {/* MARKER 2: Destination Target */}
          <Marker position={destCoords} icon={destinationIcon}>
            <Popup>
              <div className="text-xs font-mono p-1">
                <p className="font-bold text-emerald-400">🏁 Target Destination</p>
                <p className="text-slate-200 font-bold">{destObj.name}</p>
                <p className="text-[10px] text-slate-400">Landmark: {destObj.landmark || 'Main Village Square'}</p>
              </div>
            </Popup>
          </Marker>

          {/* MARKER 3: Assigned Vehicle Location */}
          <Marker position={vehicleCoords} icon={vehicleIcon}>
            <Popup>
              <div className="text-xs font-mono p-1">
                <p className="font-bold text-amber-400">🚚 Assigned Vehicle</p>
                <p className="text-slate-200 font-bold">{vehicle.name}</p>
                <p className="text-[10px] text-slate-400">Plate: {vehicle.plate}</p>
              </div>
            </Popup>
          </Marker>

          {/* MODE: DELIVERY (Standard Blue Polyline) */}
          {activeMode === 'DELIVERY' && (
            <>
              <Polyline
                positions={mainRoutePolyline}
                pathOptions={{ color: '#06b6d4', weight: 4, opacity: 0.85 }}
              />
              <Polyline
                positions={riskSegmentPolyline}
                pathOptions={{ color: '#f59e0b', weight: 4, dashArray: '6, 6', opacity: 0.85 }}
              />
            </>
          )}

          {/* MODE: RISK (Highlighted Red Segment + Risk Warning Marker) */}
          {activeMode === 'RISK' && (
            <>
              <Polyline
                positions={mainRoutePolyline}
                pathOptions={{ color: '#06b6d4', weight: 3, opacity: 0.5 }}
              />
              {/* Highlighted Unpaved Risk Segment */}
              <Polyline
                positions={riskSegmentPolyline}
                pathOptions={{ color: '#f43f5e', weight: 6, opacity: 0.95, dashArray: '8, 8' }}
              />
              <Marker position={riskStartCoords} icon={riskIcon}>
                <Popup>
                  <div className="text-xs font-mono p-1">
                    <p className="font-bold text-rose-400">⚠️ Risk Segment Start</p>
                    <p className="text-slate-200 font-bold">{riskObj.text}</p>
                    <p className="text-[10px] text-rose-300">Unpaved mud & narrow track ruts</p>
                  </div>
                </Popup>
              </Marker>
              <Circle
                center={destCoords}
                radius={1400}
                pathOptions={{ color: '#f43f5e', fillColor: '#f43f5e', fillOpacity: 0.18 }}
              />
            </>
          )}

          {/* MODE: POOLING (Purple Corridor + Secondary Pool Marker) */}
          {activeMode === 'POOLING' && (
            <>
              <Polyline
                positions={poolRoutePolyline}
                pathOptions={{ color: '#6366f1', weight: 5, opacity: 0.9, dashArray: '5, 5' }}
              />
              <Marker position={poolCoords} icon={poolIcon}>
                <Popup>
                  <div className="text-xs font-mono p-1">
                    <p className="font-bold text-indigo-400">◆ Secondary Pool Shipment</p>
                    <p className="text-slate-200 font-bold">Pathapatnam Hardware Store</p>
                    <p className="text-[10px] text-indigo-300">Shared Corridor: 14.8 km window</p>
                  </div>
                </Popup>
              </Marker>
            </>
          )}
        </MapContainer>

        {/* RISK MODE WARNING OVERLAY BANNER */}
        {activeMode === 'RISK' && (
          <div className="absolute top-3 left-3 z-[400] bg-rose-950/90 border border-rose-500/60 text-rose-200 px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center space-x-2 shadow-2xl animate-fade-in">
            <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse shrink-0" />
            <span>Attention: difficult final segment on unpaved mud track</span>
          </div>
        )}

        {/* LEGEND OVERLAY (Top Right) */}
        <div className="absolute top-3 right-3 z-[400] bg-slate-950/90 border border-slate-800 p-2.5 rounded-xl text-[10px] font-mono text-slate-300 space-y-1 shadow-2xl">
          <span className="text-slate-500 uppercase font-bold block border-b border-slate-800 pb-1 mb-1">Map Legend</span>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span>
            <span>● Pickup</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
            <span>● Destination</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
            <span>▲ Vehicle</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
            <span>⚠️ Risk Area</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span>
            <span>◆ Pool Shipment</span>
          </div>
        </div>
      </div>

      {/* 3. Prototype Geometry Disclaimer Footer */}
      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[10px] font-mono text-slate-500 flex items-center justify-between">
        <span className="flex items-center space-x-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Prototype route geometry — not live real-time physical road condition detection.</span>
        </span>
        <span className="text-cyan-400 font-bold uppercase hidden sm:inline">Visual Route Evaluation</span>
      </div>
    </div>
  );
}
