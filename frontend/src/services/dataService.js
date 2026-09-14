/**
 * ROUTENOVA UNIFIED DATA SERVICE
 * Fetches operational data from FastAPI backend with automatic local fallback.
 */

import { apiClient } from './apiClient';
import {
  DESTINATIONS,
  VEHICLES,
  SHIPMENTS,
  DELIVERY_HISTORY,
  POOL_CANDIDATES,
  getSystemStats,
} from '../data/index';

export async function checkBackendHealth() {
  const res = await apiClient.getHealth();
  return res.ok;
}

export async function getDashboardSummaryAsync() {
  const res = await apiClient.get('/dashboard');
  if (res.ok && res.data) {
    return { ...res.data, isBackendConnected: true };
  }

  // Graceful Local Fallback
  return {
    systemStats: getSystemStats(),
    deliveryAlerts: [
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
    ],
    recentDeliveries: SHIPMENTS.slice(0, 5).map((s) => ({
      id: s.id,
      recipient: s.sender,
      destination: s.destination,
      risk: s.riskLevel,
      loss: s.riskLevel === 'HIGH' ? '$420 -> $78' : '$185 -> $62',
      vehicle: s.recommendedVehicle || s.conventionalVehicle,
      status: s.status,
    })),
    impactMetrics: {
      monthlyLossPrevented: "$14,850",
      preventedFailures: "42 reattempts avoided",
      averagePoolEfficiency: "+34% capacity utilization",
      co2Reduction: "185 kg emissions saved via pooling",
      closedLoopEvidenceCount: `${DESTINATIONS.length * 4} local road segments logged`,
    },
    isBackendConnected: false,
  };
}

export async function getVehiclesAsync() {
  const res = await apiClient.get('/vehicles');
  if (res.ok && res.data && Array.isArray(res.data)) {
    // Map database snake_case keys if needed
    const mapped = res.data.map((v) => ({
      ...v,
      capacityKg: v.capacity_kg ?? v.capacityKg,
      baseCost: v.base_cost ?? v.baseCost,
      costPerKm: v.cost_per_km ?? v.costPerKm,
      groundClearanceMm: v.ground_clearance_mm ?? v.groundClearanceMm,
      roadCompatibility: v.road_compatibility ?? v.roadCompatibility,
      ruralSuitability: v.rural_suitability ?? v.ruralSuitability,
      currentLoadKg: v.current_load_kg ?? v.currentLoadKg,
      currentLocation: v.current_location ?? v.currentLocation,
      assignedDriver: v.assigned_driver ?? v.assignedDriver,
    }));
    return { vehicles: mapped, isBackendConnected: true };
  }
  return { vehicles: VEHICLES, isBackendConnected: false };
}

export async function getDestinationsAsync() {
  const res = await apiClient.get('/destinations');
  if (res.ok && res.data && Array.isArray(res.data)) {
    const mapped = res.data.map((d) => ({
      ...d,
      roadAccessScore: d.road_access_score ?? d.roadAccessScore,
      addressConfidenceScore: d.address_confidence_score ?? d.addressConfidenceScore,
      connectivityScore: d.connectivity_score ?? d.connectivityScore,
      historicalSuccessRate: d.historical_success_rate ?? d.historicalSuccessRate,
      finalSegmentDistance: d.final_segment_distance ?? d.finalSegmentDistance,
      roadSurface: d.road_surface ?? d.roadSurface,
      roadWidthCategory: d.road_width_category ?? d.roadWidthCategory,
      localEvidence: d.local_evidence ?? d.localEvidence,
      riskNotes: d.risk_notes ?? d.riskNotes,
      prototypeRiskLevel: d.prototype_risk_level ?? d.prototypeRiskLevel,
      defaultLandmark: d.default_landmark ?? d.defaultLandmark,
    }));
    return { destinations: mapped, isBackendConnected: true };
  }
  return { destinations: DESTINATIONS, isBackendConnected: false };
}

export async function getShipmentsAsync() {
  const res = await apiClient.get('/shipments');
  if (res.ok && res.data && Array.isArray(res.data)) {
    const mapped = res.data.map((s) => ({
      ...s,
      destinationId: s.destination_id ?? s.destinationId,
      volumeM3: s.volume_m3 ?? s.volumeM3,
      deliveryWindow: s.delivery_window ?? s.deliveryWindow,
      riskLevel: s.risk_level ?? s.riskLevel,
      failureProbability: s.failure_probability ?? s.failureProbability,
      conventionalVehicle: s.conventional_vehicle ?? s.conventionalVehicle,
      recommendedVehicle: s.recommended_vehicle ?? s.recommendedVehicle,
      createdAt: s.created_at ?? s.createdAt,
    }));
    return { shipments: mapped, isBackendConnected: true };
  }
  return { shipments: SHIPMENTS, isBackendConnected: false };
}

export async function dispatchShipmentAsync(dispatchData) {
  const res = await apiClient.post('/dispatch', {
    shipment_id: dispatchData.shipmentId || dispatchData.shipment_id,
    vehicle_id: dispatchData.vehicleId || dispatchData.vehicle_id,
    destination_id: dispatchData.destinationId || dispatchData.destination_id,
    pool_id: dispatchData.poolId || dispatchData.pool_id,
    notes: dispatchData.notes || 'Dispatched via RouteNova',
  });

  if (res.ok && res.data) {
    return { ...res.data, isBackendConnected: true };
  }
  return { id: `DSP-OFFLINE-${Date.now()}`, status: 'DISPATCHED', isBackendConnected: false };
}

export async function updateDeliveryStatusAsync(deliveryId, status, notes = '') {
  // Store locally in localStorage for guaranteed persistence
  try {
    localStorage.setItem(`routenova_driver_status_${deliveryId}`, status);
    if (notes) {
      localStorage.setItem(`routenova_driver_notes_${deliveryId}`, notes);
    }
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }

  const res = await apiClient.put(`/deliveries/${deliveryId}/status`, {
    status,
    notes,
  });

  if (res.ok && res.data) {
    return { ...res.data, isBackendConnected: true };
  }

  return {
    status: 'success',
    delivery_id: deliveryId,
    new_status: status,
    notes,
    isBackendConnected: false,
  };
}

export async function createVehicleAsync(vehicleData) {
  const payload = {
    id: vehicleData.id,
    type: vehicleData.type,
    name: vehicleData.name,
    plate: vehicleData.plate,
    capacity_kg: parseFloat(vehicleData.capacityKg || vehicleData.capacity_kg),
    base_cost: parseFloat(vehicleData.baseCost || vehicleData.base_cost || 50),
    cost_per_km: parseFloat(vehicleData.costPerKm || vehicleData.cost_per_km || 1.2),
    ground_clearance_mm: parseInt(vehicleData.groundClearanceMm || vehicleData.ground_clearance_mm || 180),
    drivetrain: vehicleData.drivetrain || '4x4',
    road_compatibility: vehicleData.roadCompatibility || vehicleData.road_compatibility || {
      paved_asphalt: 95,
      unpaved_mud: 80,
      gravel_rutted: 85,
    },
    rural_suitability: parseInt(vehicleData.ruralSuitability || vehicleData.rural_suitability || 85),
    availability: vehicleData.availability || 'AVAILABLE',
    current_load_kg: parseFloat(vehicleData.currentLoadKg || vehicleData.current_load_kg || 0.0),
    current_location: vehicleData.currentLocation || vehicleData.current_location || 'Central Fleet Hub',
    assigned_driver: vehicleData.assignedDriver || vehicleData.assigned_driver || 'Unassigned',
  };

  const res = await apiClient.post('/vehicles', payload);
  if (res.ok && res.data) {
    return { vehicle: res.data, isBackendConnected: true };
  }
  return { vehicle: payload, isBackendConnected: false };
}

export async function resetDemoDataAsync() {
  // Clear any local storage overrides
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('routenova_driver_status_') || key.startsWith('routenova_driver_notes_'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (e) {
    console.warn('LocalStorage clear error:', e);
  }

  const res = await apiClient.post('/demo/reset');
  if (res.ok && res.data) {
    return { ...res.data, isBackendConnected: true };
  }
  return { status: 'success', message: 'Demo Ready ✅', details: 'Reset completed offline', isBackendConnected: false };
}


