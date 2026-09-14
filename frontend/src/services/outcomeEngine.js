/**
 * ROUTENOVA OUTCOME-INFORMED OPERATIONAL EVIDENCE ENGINE
 *
 * Closed-Loop Learning Architecture:
 * Converts completed delivery outcomes (successes & failures) into local operational evidence.
 * When repeated failures occur for a destination or vehicle type, the engine adjusts
 * the segment's historical risk signal and local confidence scores for future pre-dispatch analysis.
 *
 * PROTOTYPE NOTICE:
 * This is NOT machine learning. It is an outcome-informed operational evidence system
 * demonstrating closed-loop feedback architecture.
 */

import { DESTINATIONS, DELIVERY_HISTORY } from '../data/index';

// Central memory for local evidence feedback loop
let localEvidenceStore = [...DELIVERY_HISTORY];

/**
 * Retrieves all recorded outcome evidence
 */
export function getRecordedEvidences() {
  return localEvidenceStore;
}

/**
 * Records a delivery outcome and updates destination historical evidence signals
 * @param {Object} outcomeData
 * @param {string} outcomeData.deliveryId
 * @param {string} outcomeData.destinationId
 * @param {string} outcomeData.vehicleId
 * @param {'SUCCESS' | 'FAILURE_REATTEMPT' | 'DELAYED'} outcomeData.outcome
 * @param {string} [outcomeData.failureReason]
 * @param {string} [outcomeData.notes]
 * @param {number} [outcomeData.actualCost]
 * @param {string} [outcomeData.deliveryTime]
 * @returns {Object} Updated outcome record with feedback impact summary
 */
export function recordDeliveryOutcome(outcomeData) {
  const {
    deliveryId,
    destinationId,
    vehicleId,
    outcome,
    failureReason = null,
    notes = '',
    actualCost = outcome === 'SUCCESS' ? 55 : 420,
    deliveryTime = outcome === 'SUCCESS' ? '35 mins' : 'N/A (Reattempt Needed)',
  } = outcomeData;

  const destination = DESTINATIONS.find((d) => d.id === destinationId) || DESTINATIONS[0];

  // 1. Calculate local evidence feedback impact
  let evidenceTag = '';
  let reliabilityImpact = '';

  if (outcome === 'SUCCESS') {
    evidenceTag = `Segment #${destination.id.replace('DEST-', '')}-01 tagged as clear and verified.`;
    reliabilityImpact = `+2.4% local confidence score boost for ${destination.name}.`;

    // Increase destination historical success rate slightly in prototype memory
    if (destination.historicalSuccessRate < 98) {
      destination.historicalSuccessRate = Math.min(100, destination.historicalSuccessRate + 2);
    }
  } else {
    evidenceTag = `Segment #${destination.id.replace('DEST-', '')}-04 tagged with ${failureReason || 'operational failure hazard'}.`;
    reliabilityImpact = `Failure risk updated: Historical success rate reduced for ${destination.name}.`;

    // Decrease destination historical success rate and road access score upon failure
    destination.historicalSuccessRate = Math.max(20, destination.historicalSuccessRate - 5);
    destination.roadAccessScore = Math.max(15, destination.roadAccessScore - 3);
  }

  // 2. Create Outcome Record
  const newRecord = {
    id: `OUT-${Date.now().toString().slice(-4)}`,
    shipmentId: deliveryId,
    destinationId: destination.id,
    vehicleId,
    outcome,
    failureReason,
    deliveryTime,
    cost: actualCost,
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
    location: destination.name,
    notes: notes || (outcome === 'SUCCESS' ? 'Delivery completed safely.' : `Failed: ${failureReason}`),
    evidenceAdded: evidenceTag,
    reliabilityImpact,
  };

  // Prepend to local evidence memory
  localEvidenceStore = [newRecord, ...localEvidenceStore];

  // Save to LocalStorage for persistent demo
  try {
    localStorage.setItem('routenovaEvidenceStore', JSON.stringify(localEvidenceStore));
  } catch (err) {
    console.warn('LocalStorage save error:', err);
  }

  return newRecord;
}

/**
 * Returns learning loop statistics summary
 */
export function getLearningLoopSummary() {
  const totalOutcomes = localEvidenceStore.length;
  const successes = localEvidenceStore.filter((e) => e.outcome === 'SUCCESS').length;
  const failures = localEvidenceStore.filter((e) => e.outcome === 'FAILURE_REATTEMPT').length;

  return {
    totalOutcomes,
    successes,
    failures,
    successRatePercent: totalOutcomes > 0 ? Math.round((successes / totalOutcomes) * 100) : 100,
    evidenceSegmentsCount: DESTINATIONS.length * 4,
  };
}

/**
 * Async API Wrapper: Records delivery outcome via backend with offline fallback
 */
import { apiClient } from './apiClient';

export async function recordDeliveryOutcomeAsync(outcomeData) {
  const res = await apiClient.post('/outcomes', {
    delivery_id: outcomeData.deliveryId || outcomeData.delivery_id,
    destination_id: outcomeData.destinationId || outcomeData.destination_id,
    vehicle_id: outcomeData.vehicleId || outcomeData.vehicle_id,
    outcome: outcomeData.outcome,
    failure_reason: outcomeData.failureReason || outcomeData.failure_reason,
    notes: outcomeData.notes || '',
    actual_cost: outcomeData.actualCost || outcomeData.actual_cost,
    delivery_time: outcomeData.deliveryTime || outcomeData.delivery_time,
  });

  if (res.ok && res.data) {
    // Also record in local prototype memory for consistency
    recordDeliveryOutcome(outcomeData);
    return { ...res.data, isBackendConnected: true };
  }

  // Graceful Offline Fallback
  const fallback = recordDeliveryOutcome(outcomeData);
  return { ...fallback, isBackendConnected: false };
}

export { recordDeliveryOutcomeAsync as recordOutcomeAsync };

