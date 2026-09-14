/**
 * ROUTENOVA EXPECTED OPERATIONAL LOSS ENGINE
 *
 * Core Optimization Objective:
 * Calculates the expected operational loss exposure of a delivery plan using:
 * Expected Operational Loss = (P_fail * Cost_fail) + (P_delay * Cost_delay) + Cost_vehicle + Cost_reattempt + Cost_ops
 *
 * PROTOTYPE DISCLAIMER:
 * These financial numbers are prototype decision layer estimates calculated using
 * default loss coefficients. They represent cost exposure models for plan comparison
 * and are not real financial accounting predictions.
 */

// Configurable Loss Coefficients (Defaults)
export const DEFAULT_LOSS_CONSTANTS = {
  FAILURE_INCIDENT_BASE_COST: 350,  // Towing, repair, cargo damage risk base cost
  DELAY_COST_PER_HOUR: 45,          // Per hour penalty for breach of delivery window
  REATTEMPT_BASE_COST: 180,         // Secondary dispatch attempt operational cost
  ADDITIONAL_OPS_BASE_COST: 25,     // Emergency driver overtime & coordination overhead
};

/**
 * Calculates Expected Operational Loss for a delivery plan
 * @param {Object} params
 * @param {number} params.reliabilityScore - Score 0 to 100 from Reliability Engine
 * @param {Object} params.vehicle - Selected vehicle object
 * @param {Object} [params.shipment] - Shipment payload object
 * @param {Object} [params.destination] - Destination object
 * @param {Object} [params.customConstants] - Overriding loss constants
 * @returns {Object} Expected loss breakdown and total
 */
export function calculateExpectedOperationalLoss({
  reliabilityScore = 50,
  vehicle = {},
  shipment = {},
  destination = {},
  customConstants = {},
}) {
  const constants = { ...DEFAULT_LOSS_CONSTANTS, ...customConstants };

  // 1. Convert Reliability Score into Failure Probability for prototype modeling
  const clampedScore = Math.min(100, Math.max(0, reliabilityScore));
  const failureProbability = Number((1 - clampedScore / 100).toFixed(2));

  // Delay probability increases as reliability score drops below 70
  const delayProbability = Number(
    Math.min(0.85, Math.max(0.10, (70 - clampedScore) * 0.015 + 0.15)).toFixed(2)
  );

  // 2. Vehicle Fixed & Transit Rental Cost
  const distanceKm = destination?.finalSegmentDistance ? destination.finalSegmentDistance * 4 + 10 : 18.4;
  const baseVehicleCost = vehicle?.baseCost ?? 65;
  const perKmCost = vehicle?.costPerKm ?? 2.8;
  const vehicleCost = Math.round(baseVehicleCost + distanceKm * perKmCost);

  // 3. Estimated Failure Exposure Cost = P_fail * Cost_fail_base
  const estimatedFailureCost = Math.round(failureProbability * constants.FAILURE_INCIDENT_BASE_COST);

  // 4. Estimated Delay Exposure Cost = P_delay * Cost_delay_per_hr * EstimatedDelayHours
  const estimatedDelayHours = failureProbability > 0.5 ? 2.5 : failureProbability > 0.2 ? 1.2 : 0.4;
  const estimatedDelayCost = Math.round(delayProbability * constants.DELAY_COST_PER_HOUR * estimatedDelayHours);

  // 5. Reattempt Cost = P_fail * Cost_reattempt_base
  const reattemptCost = Math.round(failureProbability * constants.REATTEMPT_BASE_COST);

  // 6. Additional Operational Overhead Cost
  const additionalOpsCost = failureProbability > 0.4 ? constants.ADDITIONAL_OPS_BASE_COST : 0;

  // 7. Total Expected Operational Loss Sum
  const expectedOperationalLoss =
    vehicleCost + estimatedFailureCost + estimatedDelayCost + reattemptCost + additionalOpsCost;

  return {
    vehicleCost,
    failureProbability,
    delayProbability,
    estimatedFailureCost,
    estimatedDelayCost,
    reattemptCost,
    additionalOpsCost,
    expectedOperationalLoss,
    costBreakdown: {
      vehicleCostText: `$${vehicleCost} (Vehicle transit rental)`,
      failureExposureText: `$${estimatedFailureCost} (${Math.round(failureProbability * 100)}% risk × $${constants.FAILURE_INCIDENT_BASE_COST} incident cost)`,
      delayExposureText: `$${estimatedDelayCost} (${Math.round(delayProbability * 100)}% delay risk × ${estimatedDelayHours}h)`,
      reattemptExposureText: `$${reattemptCost} (Reattempt risk exposure)`,
      additionalOpsText: `$${additionalOpsCost} (Emergency coordination overhead)`,
    },
    explanationText:
      "We estimate the cost exposure associated with a failed or delayed rural delivery. Lowering failure risk directly reduces expected operational loss.",
    disclaimer:
      "Prototype estimated cost exposure based on default loss coefficients ($350 failure base, $45/hr delay, $180 reattempt).",
  };
}
