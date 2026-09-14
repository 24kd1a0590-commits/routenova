import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { AlertTriangle, MapPin, Navigation, ShieldCheck } from 'lucide-react';

// Custom SVG Markers for Origin, Destination, and Hazard Warning
const createCustomIcon = (color, symbol) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background-color: #0f172a;
        border: 2px solid ${color};
        color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 13px;
        box-shadow: 0 0 12px ${color}66;
      ">
        ${symbol}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const originIcon = createCustomIcon('#06b6d4', '🟢');
const destIcon = createCustomIcon('#10b981', '📍');
const hazardIcon = createCustomIcon('#f43f5e', '🚧');

function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.setView([center.lat, center.lng], 12);
    }
  }, [center, map]);
  return null;
}

export default function HeroRouteMap({
  origin = { lat: 18.2500, lng: 83.8200, name: 'Green Valley Central Depot' },
  destination = { lat: 18.2949, lng: 83.8938, name: 'Rampuram Village Hub' },
  hazardSegment = { lat: 18.2880, lng: 83.8800, name: 'Final 2.1km Unpaved Mud Rut Track' },
  height = '360px',
}) {
  const originPos = [origin.lat, origin.lng];
  const destPos = [destination.lat, destination.lng];
  const hazardPos = [hazardSegment.lat, hazardSegment.lng];

  // Route path coordinates (Origin -> Highway Waypoint -> Hazard Segment -> Destination)
  const routePolyline = [
    originPos,
    [18.2650, 83.8450], // State Highway junction
    [18.2780, 83.8650], // Rural corridor turnoff
    hazardPos,          // Unpaved final segment start
    destPos,            // Final village hub
  ];

  // Final hazard segment highlight path
  const hazardPolyline = [
    hazardPos,
    destPos,
  ];

  return (
    <div className="w-full relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-2xl">
      <MapContainer
        center={destPos}
        zoom={12}
        scrollWheelZoom={false}
        style={{ height, width: '100%' }}
      >
        <ChangeView center={destination} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Full Route Line (Cyan) */}
        <Polyline
          positions={routePolyline}
          pathOptions={{ color: '#06b6d4', weight: 4, opacity: 0.7, dashArray: '8, 8' }}
        />

        {/* Hazard Segment Line (Red Glow) */}
        <Polyline
          positions={hazardPolyline}
          pathOptions={{ color: '#f43f5e', weight: 6, opacity: 0.9 }}
        />

        {/* Origin Marker */}
        <Marker position={originPos} icon={originIcon}>
          <Popup>
            <div className="text-xs font-mono">
              <p className="font-bold text-cyan-400">Origin Depot</p>
              <p className="text-slate-200">{origin.name}</p>
            </div>
          </Popup>
        </Marker>

        {/* Destination Marker */}
        <Marker position={destPos} icon={destIcon}>
          <Popup>
            <div className="text-xs font-mono">
              <p className="font-bold text-emerald-400">Destination</p>
              <p className="text-slate-200">{destination.name}</p>
            </div>
          </Popup>
        </Marker>

        {/* Final Segment Warning Marker */}
        <Marker position={hazardPos} icon={hazardIcon}>
          <Popup>
            <div className="text-xs font-mono">
              <p className="font-bold text-rose-400">🚧 FINAL SEGMENT WARNING</p>
              <p className="text-slate-200 font-semibold">{hazardSegment.name}</p>
              <p className="text-[10px] text-slate-400 mt-1">
                RouteNova Intelligence: Mud rutting & 3.5T wooden bridge restriction detected.
              </p>
            </div>
          </Popup>
        </Marker>

        {/* Hazard Warning Circle Overlay */}
        <Circle
          center={hazardPos}
          radius={1200}
          pathOptions={{ color: '#f43f5e', fillColor: '#f43f5e', fillOpacity: 0.2 }}
        />
      </MapContainer>

      {/* Map Positioning Disclaimer Banner */}
      <div className="absolute top-3 right-3 z-[400] px-3 py-1.5 rounded-lg bg-slate-950/90 border border-slate-800 text-[10px] font-mono text-slate-300 flex items-center gap-2 shadow-xl backdrop-blur-md">
        <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
        <div>
          <span className="font-bold text-cyan-300 block">RouteNova Decision Layer</span>
          <span className="text-slate-400 text-[9px]">Evaluates road accessibility & vehicle fit above conventional GPS navigation</span>
        </div>
      </div>
    </div>
  );
}
