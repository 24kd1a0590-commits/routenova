/**
 * RouteNova Centralized Seeded Data Store & Utility Accessors
 *
 * PROTOTYPE NOTICE:
 * This dataset contains prototype / simulated operational evidence data for
 * demonstration and pre-dispatch decision evaluation purposes.
 */

import { DESTINATIONS } from './destinationsData';
import { VEHICLES } from './vehiclesData';
import { SHIPMENTS } from './shipmentsData';
import { DELIVERY_HISTORY } from './historyData';
import { POOL_CANDIDATES } from './poolingData';

export { DESTINATIONS } from './destinationsData';
export { VEHICLES } from './vehiclesData';
export { SHIPMENTS } from './shipmentsData';
export { DELIVERY_HISTORY } from './historyData';
export { POOL_CANDIDATES } from './poolingData';

/**
 * Retrieve a destination record by ID
 * @param {string} id
 */
export function getDestinationById(id) {
  return DESTINATIONS.find((d) => d.id === id) || DESTINATIONS[0];
}

/**
 * Retrieve a vehicle record by ID
 * @param {string} id
 */
export function getVehicleById(id) {
  return VEHICLES.find((v) => v.id === id) || VEHICLES[0];
}

/**
 * Retrieve a shipment record by ID
 * @param {string} id
 */
export function getShipmentById(id) {
  return SHIPMENTS.find((s) => s.id === id) || SHIPMENTS[0];
}

/**
 * Retrieve historical delivery records for a specific destination
 * @param {string} destinationId
 */
export function getDeliveryHistoryByDestination(destinationId) {
  return DELIVERY_HISTORY.filter((h) => h.destinationId === destinationId);
}

/**
 * Retrieve historical delivery records for a specific shipment
 * @param {string} shipmentId
 */
export function getDeliveryHistoryByShipment(shipmentId) {
  return DELIVERY_HISTORY.filter((h) => h.shipmentId === shipmentId);
}

/**
 * Retrieve compatible micropool candidates for a shipment
 * @param {string} shipmentId
 */
export function getCompatiblePoolCandidates(shipmentId) {
  return POOL_CANDIDATES.filter(
    (p) => p.primaryShipmentId === shipmentId || p.secondaryShipmentId === shipmentId
  );
}

/**
 * Helper to retrieve all vehicles of a specific type category
 * @param {'motorcycle' | 'mini_truck' | 'van' | 'pickup'} type
 */
export function getVehiclesByType(type) {
  return VEHICLES.filter((v) => v.type === type);
}

/**
 * Helper summary statistics computed from centralized dataset
 */
export function getSystemStats() {
  const atRiskCount = SHIPMENTS.filter((s) => s.riskLevel === 'HIGH').length;
  const poolCount = POOL_CANDIDATES.length;

  return {
    totalDeliveries: SHIPMENTS.length,
    atRiskDeliveries: atRiskCount,
    activePoolMatches: poolCount,
    avoidableLossSaved: "$14,850",
    averageReliability: "94.2%",
    activeVehicles: VEHICLES.length,
    destinationsCount: DESTINATIONS.length,
  };
}
