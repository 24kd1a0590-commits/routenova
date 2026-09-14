/**
 * ROUTENOVA ALTERNATIVE PLAN ENGINE
 *
 * Core Decision Optimization:
 * Evaluates candidate vehicle plans for a shipment across available fleet vehicles.
 * Calculates reliability scores, failure probabilities, transit costs, and expected operational losses.
 * Selects the plan with the LOWEST Expected Operational Loss (balancing transit cost vs failure risk).
 *
 * PROTOTYPE NOTICE:
 * Uses deterministic decision logic to minimize operational loss.
 */

import { evaluateDeliveryPlan } from './reliabilityEngine';
import { calculateExpectedOperationalLoss } from './lossEngine';
import { VEHICLES } from '../data/index';

/**
 * Evaluates candidate vehicle plans and selects the optimal delivery plan
 * @param {Object} params
 * @param {Object} params.shipment - Delivery shipment object
 * @param {Object} params.destination - Destination object
 * @param {Object} params.currentVehicle - Current baseline vehicle
 * @param {Array} [params.availableVehicles] - List of available vehicles
 * @param {Array} [params.historyRecords] - History records array
 * @returns {Object} Evaluated plans and recommendations
 */
export function evaluateAlternativePlans({
  shipment,
  destination,
  currentVehicle,
  availableVehicles = VEHICLES,
  historyRecords = [],
}) {
  if (!shipment || !destination) {
    return {
      currentPlan: null,
      alternativePlan: null,
      recommendedPlan: null,
      evaluatedPlans: [],
      recommendationReasons: [],
    };
  }

  const payloadWeight = shipment.weight || shipment.weightKg || 0;

  // 1. Evaluate Current Baseline Plan
  const baselineEval = evaluateDeliveryPlan({
    destination,
    vehicle: currentVehicle,
    shipment,
    historyRecords,
  });

  const baselineLoss = calculateExpectedOperationalLoss({
    reliabilityScore: baselineEval.reliabilityScore,
    vehicle: currentVehicle,
    shipment,
    destination,
  });

  const currentPlan = {
    vehicle: currentVehicle,
    reliabilityScore: baselineEval.reliabilityScore,
    riskLevel: baselineEval.riskLevel,
    failureProbability: baselineEval.failureProbability,
    estimatedCost: baselineLoss.vehicleCost,
    expectedOperationalLoss: baselineLoss.expectedOperationalLoss,
    primaryRisk: baselineEval.primaryRisk,
    isBaseline: true,
    isRecommended: false,
  };

  // 2. Filter & Evaluate Candidate Vehicles
  const validVehicles = availableVehicles.filter((v) => {
    // Constraint 1: Must have enough payload capacity
    if (v.capacityKg < payloadWeight) return false;
    // Constraint 2: Must be available or on delivery (exclude maintenance)
    if (v.availability === 'MAINTENANCE') return false;
    return true;
  });

  const evaluatedPlans = validVehicles.map((vehicle) => {
    const evalResult = evaluateDeliveryPlan({
      destination,
      vehicle,
      shipment,
      historyRecords,
    });

    const lossResult = calculateExpectedOperationalLoss({
      reliabilityScore: evalResult.reliabilityScore,
      vehicle,
      shipment,
      destination,
    });

    return {
      vehicle,
      reliabilityScore: evalResult.reliabilityScore,
      riskLevel: evalResult.riskLevel,
      failureProbability: evalResult.failureProbability,
      estimatedCost: lossResult.vehicleCost,
      expectedOperationalLoss: lossResult.expectedOperationalLoss,
      primaryRisk: evalResult.primaryRisk,
      isBaseline: vehicle.id === currentVehicle.id,
      isRecommended: false,
    };
  });

  // 3. Sort Plans by LOWEST Expected Operational Loss
  evaluatedPlans.sort((a, b) => a.expectedOperationalLoss - b.expectedOperationalLoss);

  // Pick Best Plan (Lowest Expected Operational Loss)
  const recommendedPlan = evaluatedPlans[0] || currentPlan;
  recommendedPlan.isRecommended = true;

  // Pick Alternative Single Vehicle Plan (Second best or distinct category)
  const alternativePlan =
    evaluatedPlans.find((p) => p.vehicle.id !== currentVehicle.id && p.vehicle.id !== recommendedPlan.vehicle.id) ||
    evaluatedPlans[1] ||
    currentPlan;

  // 4. Generate Computed Recommendation Reasons
  const lossSaved = currentPlan.expectedOperationalLoss - recommendedPlan.expectedOperationalLoss;
  const percentSaved =
    currentPlan.expectedOperationalLoss > 0
      ? Math.round((lossSaved / currentPlan.expectedOperationalLoss) * 100)
      : 0;

  const recommendationReasons = [];

  if (lossSaved > 0) {
    recommendationReasons.push(
      `Recommends ${recommendedPlan.vehicle.name} because it reduces Expected Operational Loss by $${lossSaved} (${percentSaved}% reduction).`
    );
  } else {
    recommendationReasons.push(
      `Current plan is already optimal with low expected operational loss ($${currentPlan.expectedOperationalLoss}).`
    );
  }

  if (recommendedPlan.vehicle.drivetrain && recommendedPlan.vehicle.drivetrain.includes('4WD')) {
    recommendationReasons.push(
      `4x4 drivetrain and ${recommendedPlan.vehicle.groundClearanceMm}mm ground clearance eliminate unpaved mud rutting failure risk.`
    );
  } else if (recommendedPlan.vehicle.type === 'motorcycle') {
    recommendationReasons.push(
      `Agile motorcycle transport easily navigates narrow rural tracks with minimal transit cost.`
    );
  }

  if (recommendedPlan.reliabilityScore > currentPlan.reliabilityScore) {
    recommendationReasons.push(
      `Boosts operational reliability score from ${currentPlan.reliabilityScore}/100 to ${recommendedPlan.reliabilityScore}/100 (${recommendedPlan.riskLevel} RISK).`
    );
  }

  recommendationReasons.push(
    `Decision prioritizes lowest Expected Operational Loss (factoring failure risk & reattempt costs), rather than merely picking the cheapest vehicle rental.`
  );

  return {
    currentPlan,
    alternativePlan,
    recommendedPlan,
    evaluatedPlans,
    recommendationReasons,
  };
}

/**
 * Async API Wrapper: Evaluates alternative vehicle plans via backend with offline fallback
 */
import { apiClient } from './apiClient';

export async function evaluateAlternativePlansAsync(params) {
  const { shipment, destination, currentVehicle } = params || {};
  const res = await apiClient.post('/analysis/plans', {
    shipment_id: shipment?.id,
    destination_id: destination?.id,
    vehicle_id: currentVehicle?.id,
    shipment,
    destination,
    vehicle: currentVehicle,
  });

  if (res.ok && res.data) {
    return { ...res.data, isBackendConnected: true };
  }

  // Graceful Offline Fallback
  const fallback = evaluateAlternativePlans(params);
  return { ...fallback, isBackendConnected: false };
}

