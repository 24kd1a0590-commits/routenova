// RouteNova Centralized Seed Data Facade & Legacy Re-export
// PROTOTYPE NOTICE: Seeded operational data for prototype evaluation purposes.

import {
  DESTINATIONS,
  VEHICLES as CENTRAL_VEHICLES,
  SHIPMENTS as CENTRAL_SHIPMENTS,
  DELIVERY_HISTORY as CENTRAL_HISTORY,
  POOL_CANDIDATES as CENTRAL_POOLS,
  getSystemStats,
} from './index';

export {
  DESTINATIONS,
  VEHICLES,
  SHIPMENTS,
  DELIVERY_HISTORY,
  POOL_CANDIDATES,
  getDestinationById,
  getVehicleById,
  getShipmentById,
  getDeliveryHistoryByDestination,
  getDeliveryHistoryByShipment,
  getCompatiblePoolCandidates,
  getVehiclesByType,
  getSystemStats,
} from './index';

export const SYSTEM_STATS = getSystemStats();

export const DELIVERIES = CENTRAL_SHIPMENTS.map((s) => ({
  ...s,
  customer: s.sender,
  weightKg: s.weight,
  coordinates: { lat: 18.2949, lng: 83.8938 },
  sixFactors: {
    roadAccessibility: { score: 35, status: "POOR", detail: "Unpaved track, 2.1m width limit, mud hazard" },
    vehicleRoadCompatibility: { score: 45, status: "MISMATCH", detail: "Low clearance for sector 4 rutting" },
    addressConfidence: { score: 70, status: "MODERATE", detail: "Panchayati Well landmark; geocode confidence 72%" },
    connectivityReliability: { score: 78, status: "MODERATE", detail: "Cellular dead zone along final approach" },
    historicalEvidence: { score: 62, status: "WARNING", detail: "Past 2WD van dispatches suffered axle stuck" },
    distanceConditions: { score: 80, status: "GOOD", detail: "2.1 km final segment distance" },
  },
  lossComparison: {
    baseline: {
      planName: `Plan A: ${s.conventionalVehicle}`,
      vehicle: s.conventionalVehicle,
      failureProbability: s.riskLevel === 'HIGH' ? '78%' : '28%',
      expectedLoss: s.riskLevel === 'HIGH' ? 420 : 185,
      failureModes: ["Vehicle Stuck in Mud Track", "Cell Dead Zone lost address"],
    },
    alternative: {
      planName: "Plan B: 4x4 Mini Truck (Single)",
      vehicle: "4x4 Rural Mini Truck",
      failureProbability: "18%",
      expectedLoss: 145,
    },
    pooled: {
      planName: "Plan C: Pooled 4x4 Mini Truck",
      vehicle: "4x4 Rural Mini Truck (Shared)",
      failureProbability: "12%",
      expectedLoss: 78,
      isRecommended: true,
      pooledWithCustomer: "Kothuru Agricultural Supplies",
    },
  },
}));

export const DELIVERY_ALERTS = [
  {
    id: "ALT-01",
    village: "Rampuram Village — Sector 4",
    riskType: "HIGH RISK",
    color: "rose",
    message: "Failure probability 78% on standard 2WD van due to unpaved mud rutting & cell dead zone.",
    recommendation: "Switch to 4x4 Mini Truck or execute Micropooling with Pathapatnam shipment.",
    deliveryId: "RN-2026-8801",
    timestamp: "12 mins ago",
  },
  {
    id: "ALT-02",
    village: "Kothuru Village Corridor",
    riskType: "POOL MATCH",
    color: "cyan",
    message: "Compatible small shipment RN-2026-8804 shares 14.8 km corridor window with RN-2026-8801.",
    recommendation: "Combine shipments on 4x4 Mini Truck to save $465 in expected operational loss.",
    deliveryId: "RN-2026-8801",
    timestamp: "25 mins ago",
  },
  {
    id: "ALT-03",
    village: "Garividi Industrial Ridge",
    riskType: "LOW RISK",
    color: "emerald",
    message: "Optimal asphalt conditions. Conventional vehicle path cleared with 98% reliability score.",
    recommendation: "Proceed with standard dispatch schedule.",
    deliveryId: "RN-2026-8803",
    timestamp: "40 mins ago",
  },
  {
    id: "ALT-04",
    village: "Salur Hill Pass",
    riskType: "AMBER WARNING",
    color: "amber",
    message: "Local operational evidence reports seasonal mud swelling on wooden bridge segment.",
    recommendation: "Enforce weight cap of 3.5 tonnes on vehicle selection.",
    deliveryId: "RN-2026-8805",
    timestamp: "1 hr ago",
  },
];

export const RECENT_DELIVERIES = CENTRAL_SHIPMENTS.slice(0, 5).map((s) => ({
  id: s.id,
  recipient: s.sender,
  destination: s.destination,
  risk: s.riskLevel,
  loss: s.riskLevel === 'HIGH' ? '$420 -> $78' : '$185 -> $62',
  vehicle: s.recommendedVehicle,
  status: s.status,
}));

export const IMPACT_METRICS = {
  monthlyLossPrevented: "$14,850",
  preventedFailures: "42 reattempts avoided",
  averagePoolEfficiency: "+34% capacity utilization",
  co2Reduction: "185 kg emissions saved via pooling",
  closedLoopEvidenceCount: "318 local road segments logged",
};

export const POOL_MATCHES = CENTRAL_POOLS;
export const HISTORICAL_OUTCOMES = CENTRAL_HISTORY;
