/**
 * ROUTENOVA DELIVERY RELIABILITY ENGINE
 *
 * Primary Decision Layer Innovation:
 * Evaluates a rural delivery operational plan BEFORE dispatch by analyzing
 * road accessibility, vehicle-road compatibility, address confidence,
 * cellular connectivity, and historical delivery evidence.
 *
 * PROTOTYPE CONFIGURATION NOTICE:
 * This module uses deterministic rule-weighted decision logic. It is a prototype
 * decision layer designed to operate above conventional navigation. It is NOT
 * a scientifically validated prediction model.
 */

// Configurable Engine Weights (Total sum = 1.0)
export const ENGINE_WEIGHTS = {
  roadAccessibility: 0.30,      // 30%
  vehicleCompatibility: 0.25,   // 25%
  addressConfidence: 0.20,      // 20%
  historicalSuccess: 0.15,      // 15%
  connectivity: 0.10,           // 10%
};

// Configurable Risk Thresholds
export const RISK_THRESHOLDS = {
  HIGH_MAX: 40,    // 0 - 40 = HIGH RISK
  MEDIUM_MAX: 70,  // 41 - 70 = MEDIUM RISK
  // 71 - 100 = LOW RISK
};

/**
 * Calculates vehicle-road compatibility score based on vehicle specs and road segment hazards
 * @param {import('../types/delivery').Vehicle} vehicle
 * @param {import('../types/delivery').Destination} destination
 * @param {import('../types/delivery').Shipment} shipment
 * @returns {number} Score from 0 to 100
 */
export function calculateVehicleRoadCompatibility(vehicle, destination, shipment) {
  if (!vehicle || !destination) return 50;

  // Overweight capacity check -> Hard failure (score = 0)
  const weightKg = shipment?.weight || shipment?.weightKg || 0;
  if (weightKg > vehicle.capacityKg) {
    return 0;
  }

  // Base compatibility from vehicle surface compatibility map
  const surfaceKey = destination.roadSurface || 'mixed';
  let baseScore = vehicle.roadCompatibility?.[surfaceKey] ?? 70;

  // Ground clearance penalty for unpaved mud tracks
  if (surfaceKey === 'unpaved_mud' || surfaceKey === 'mixed') {
    const clearance = vehicle.groundClearanceMm || 150;
    if (clearance < 180) {
      baseScore -= 30; // Severe penalty for low clearance vans on mud
    } else if (clearance >= 220) {
      baseScore += 10; // Bonus for high clearance 4x4
    }
  }

  // Road width category penalty
  if (destination.roadWidthCategory === 'narrow') {
    if (vehicle.type === 'van' || vehicle.type === 'pickup') {
      baseScore -= 10;
    } else if (vehicle.type === 'motorcycle' || vehicle.type === 'mini_truck') {
      baseScore += 5; // Mini trucks and motorcycles pass narrow tracks better
    }
  }

  // Drivetrain boost for off-road tracks
  if (vehicle.drivetrain && vehicle.drivetrain.includes('4WD')) {
    if (surfaceKey === 'unpaved_mud' || surfaceKey === 'gravel_track') {
      baseScore += 15;
    }
  }

  return Math.min(100, Math.max(0, Math.round(baseScore)));
}

/**
 * Calculates historical success rate from destination data or past outcome evidence
 * @param {import('../types/delivery').Destination} destination
 * @param {Array} historyRecords
 * @returns {number} Score 0 to 100
 */
export function calculateHistoricalSuccess(destination, historyRecords = []) {
  if (historyRecords && historyRecords.length > 0) {
    const destHistory = historyRecords.filter((h) => h.destinationId === destination.id);
    if (destHistory.length > 0) {
      const successes = destHistory.filter((h) => h.outcome === 'SUCCESS').length;
      return Math.round((successes / destHistory.length) * 100);
    }
  }
  return destination?.historicalSuccessRate ?? 70;
}

/**
 * Core Function: Evaluate Delivery Plan Reliability
 * @param {Object} params
 * @param {Object} params.destination
 * @param {Object} params.vehicle
 * @param {Object} params.shipment
 * @param {Array} [params.historyRecords]
 * @returns {Object} Reliability evaluation result
 */
export function evaluateDeliveryPlan({ destination, vehicle, shipment, historyRecords = [] }) {
  if (!destination || !vehicle) {
    return {
      reliabilityScore: 50,
      riskLevel: 'MEDIUM',
      failureProbability: 0.50,
      factors: {},
      primaryRisk: 'Incomplete Parameters',
      explanation: 'Insufficient destination or vehicle data to complete evaluation.',
      recommendedActions: ['Provide complete vehicle and destination parameters.'],
    };
  }

  // Factor Scores
  const roadAccessScore = destination.roadAccessScore ?? 50;
  const vehicleCompatibilityScore = calculateVehicleRoadCompatibility(vehicle, destination, shipment);
  const addressConfidenceScore = destination.addressConfidenceScore ?? 70;
  const connectivityScore = destination.connectivityScore ?? 75;
  const historicalSuccessScore = calculateHistoricalSuccess(destination, historyRecords);

  // Weighted Sum Calculation
  const weightedSum =
    roadAccessScore * ENGINE_WEIGHTS.roadAccessibility +
    vehicleCompatibilityScore * ENGINE_WEIGHTS.vehicleCompatibility +
    addressConfidenceScore * ENGINE_WEIGHTS.addressConfidence +
    historicalSuccessScore * ENGINE_WEIGHTS.historicalSuccess +
    connectivityScore * ENGINE_WEIGHTS.connectivity;

  const reliabilityScore = Math.min(100, Math.max(0, Math.round(weightedSum)));

  // Risk Level Classification
  let riskLevel = 'LOW';
  if (reliabilityScore <= RISK_THRESHOLDS.HIGH_MAX) {
    riskLevel = 'HIGH';
  } else if (reliabilityScore <= RISK_THRESHOLDS.MEDIUM_MAX) {
    riskLevel = 'MEDIUM';
  }

  const failureProbability = Number((1 - reliabilityScore / 100).toFixed(2));

  // Generate Factor Explanations & Statuses
  const factorExplanations = [];
  const recommendedActions = [];
  let primaryRisk = 'Optimal Operational Parameters';

  // Factor 1: Road Accessibility
  let roadStatus = 'GOOD';
  let roadExplanation = 'Road accessibility is acceptable along the delivery route.';
  if (roadAccessScore < 50) {
    roadStatus = 'POOR';
    roadExplanation = 'Road accessibility is limited on the final delivery segment.';
    factorExplanations.push(roadExplanation);
    recommendedActions.push('Verify road surface conditions and seasonal mud degradation before dispatch.');
  }

  // Factor 2: Vehicle Compatibility
  let vehicleStatus = 'EXCELLENT';
  let vehicleExplanation = 'Selected vehicle is compatible with route surface and terrain.';
  if (vehicleCompatibilityScore < 50) {
    vehicleStatus = 'MISMATCH';
    vehicleExplanation = 'Selected vehicle has poor compatibility with the identified rural road conditions.';
    factorExplanations.push(vehicleExplanation);
    recommendedActions.push(`Switch from ${vehicle.name} to a 4x4 high clearance vehicle or all-terrain pickup.`);
  }

  // Factor 3: Address Confidence
  let addressStatus = 'HIGH';
  let addressExplanation = 'Destination landmark and geocode confidence are high.';
  if (addressConfidenceScore < 60) {
    addressStatus = 'LOW';
    addressExplanation = 'Destination address confidence is low.';
    factorExplanations.push(addressExplanation);
    recommendedActions.push('Confirm local landmark (e.g. Panchayati Well / Health Clinic) with recipient prior to departure.');
  }

  // Factor 4: Connectivity
  let connectivityStatus = 'GOOD';
  let connectivityExplanation = 'Cellular signal coverage is sufficient along the corridor.';
  if (connectivityScore < 50) {
    connectivityStatus = 'CRITICAL';
    connectivityExplanation = 'Connectivity reliability may affect driver coordination.';
    factorExplanations.push(connectivityExplanation);
    recommendedActions.push('Pre-download offline navigation route map and SMS dispatch instructions to driver mobile device.');
  }

  // Factor 5: Historical Success
  let historyStatus = 'GOOD';
  let historyExplanation = 'Historical delivery evidence shows acceptable past completion rates.';
  if (historicalSuccessScore < 65) {
    historyStatus = 'WARNING';
    historyExplanation = 'Previous delivery outcomes indicate elevated operational risk.';
    factorExplanations.push(historyExplanation);
    recommendedActions.push('Review local evidence logs for past tow/reattempt incidents along this segment.');
  }

  // Determine Primary Risk Factor
  const lowestFactorScore = Math.min(
    roadAccessScore,
    vehicleCompatibilityScore,
    addressConfidenceScore,
    connectivityScore,
    historicalSuccessScore
  );

  if (lowestFactorScore === vehicleCompatibilityScore && vehicleCompatibilityScore < 60) {
    primaryRisk = 'Vehicle Ground Clearance / Drivetrain Mismatch';
  } else if (lowestFactorScore === roadAccessScore && roadAccessScore < 60) {
    primaryRisk = 'Unpaved Mud Rutting / Bridge Weight Restriction';
  } else if (lowestFactorScore === connectivityScore && connectivityScore < 60) {
    primaryRisk = 'Cellular Dead Zone Along Final Segment';
  } else if (lowestFactorScore === addressConfidenceScore && addressConfidenceScore < 60) {
    primaryRisk = 'Low Destination Geocode Confidence';
  } else if (lowestFactorScore === historicalSuccessScore && historicalSuccessScore < 65) {
    primaryRisk = 'Elevated Historical Reattempt Rate';
  }

  // Overall Synthesis Explanation
  let summaryExplanation = `RouteNova Reliability Engine evaluated this plan at ${reliabilityScore}/100 reliability (${riskLevel} RISK).`;
  if (factorExplanations.length > 0) {
    summaryExplanation += ` Key risks identified: ${factorExplanations.join(' ')}`;
  } else {
    summaryExplanation += ' All operational parameters satisfy safety and delivery reliability thresholds.';
  }

  if (recommendedActions.length === 0) {
    recommendedActions.push('Proceed with scheduled dispatch plan.');
  }

  return {
    reliabilityScore,
    riskLevel,
    failureProbability,
    factors: {
      roadAccessibility: {
        score: roadAccessScore,
        weight: ENGINE_WEIGHTS.roadAccessibility,
        status: roadStatus,
        explanation: roadExplanation,
      },
      vehicleCompatibility: {
        score: vehicleCompatibilityScore,
        weight: ENGINE_WEIGHTS.vehicleCompatibility,
        status: vehicleStatus,
        explanation: vehicleExplanation,
      },
      addressConfidence: {
        score: addressConfidenceScore,
        weight: ENGINE_WEIGHTS.addressConfidence,
        status: addressStatus,
        explanation: addressExplanation,
      },
      historicalSuccess: {
        score: historicalSuccessScore,
        weight: ENGINE_WEIGHTS.historicalSuccess,
        status: historyStatus,
        explanation: historyExplanation,
      },
      connectivity: {
        score: connectivityScore,
        weight: ENGINE_WEIGHTS.connectivity,
        status: connectivityStatus,
        explanation: connectivityExplanation,
      },
    },
    primaryRisk,
    explanation: summaryExplanation,
    recommendedActions,
  };
}

/**
 * Async API Wrapper: Evaluates Delivery Plan via backend with offline fallback
 */
import { apiClient } from './apiClient';

export async function evaluateDeliveryPlanAsync(params) {
  const { destination, vehicle, shipment } = params || {};
  const res = await apiClient.post('/analysis/reliability', {
    destination_id: destination?.id,
    vehicle_id: vehicle?.id,
    shipment_id: shipment?.id,
    destination,
    vehicle,
    shipment,
  });

  if (res.ok && res.data) {
    return { ...res.data, isBackendConnected: true };
  }

  // Graceful Offline Fallback
  const fallback = evaluateDeliveryPlan(params);
  return { ...fallback, isBackendConnected: false };
}

