from typing import Dict, Any, Optional

DEFAULT_LOSS_CONSTANTS = {
    "FAILURE_INCIDENT_BASE_COST": 350,
    "DELAY_COST_PER_HOUR": 45,
    "REATTEMPT_BASE_COST": 180,
    "ADDITIONAL_OPS_BASE_COST": 25,
}

def calculate_expected_operational_loss(
    reliability_score: int = 50,
    vehicle: Optional[Dict[str, Any]] = None,
    shipment: Optional[Dict[str, Any]] = None,
    destination: Optional[Dict[str, Any]] = None,
    custom_constants: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    vehicle = vehicle or {}
    destination = destination or {}
    constants = {**DEFAULT_LOSS_CONSTANTS, **(custom_constants or {})}

    clamped_score = min(100, max(0, reliability_score))
    failure_probability = round(1 - clamped_score / 100.0, 2)
    delay_probability = round(min(0.85, max(0.10, (70 - clamped_score) * 0.015 + 0.15)), 2)

    seg_dist = destination.get("finalSegmentDistance") or destination.get("final_segment_distance") or 2.1
    distance_km = seg_dist * 4 + 10

    base_vehicle_cost = vehicle.get("baseCost") or vehicle.get("base_cost") or 65
    cost_per_km = vehicle.get("costPerKm") or vehicle.get("cost_per_km") or 2.8
    vehicle_cost = int(round(base_vehicle_cost + distance_km * cost_per_km))

    estimated_failure_cost = int(round(failure_probability * constants["FAILURE_INCIDENT_BASE_COST"]))
    estimated_delay_hours = 2.5 if failure_probability > 0.5 else (1.2 if failure_probability > 0.2 else 0.4)
    estimated_delay_cost = int(round(delay_probability * constants["DELAY_COST_PER_HOUR"] * estimated_delay_hours))
    reattempt_cost = int(round(failure_probability * constants["REATTEMPT_BASE_COST"]))
    additional_ops_cost = constants["ADDITIONAL_OPS_BASE_COST"] if failure_probability > 0.4 else 0

    expected_operational_loss = (
        vehicle_cost + estimated_failure_cost + estimated_delay_cost + reattempt_cost + additional_ops_cost
    )

    return {
        "vehicleCost": vehicle_cost,
        "failureProbability": failure_probability,
        "delayProbability": delay_probability,
        "estimatedFailureCost": estimated_failure_cost,
        "estimatedDelayCost": estimated_delay_cost,
        "reattemptCost": reattempt_cost,
        "additionalOpsCost": additional_ops_cost,
        "expectedOperationalLoss": expected_operational_loss,
        "costBreakdown": {
            "vehicleCostText": f"${vehicle_cost} (Vehicle transit rental)",
            "failureExposureText": f"${estimated_failure_cost} ({int(round(failure_probability * 100))}% risk × ${constants['FAILURE_INCIDENT_BASE_COST']} incident cost)",
            "delayExposureText": f"${estimated_delay_cost} ({int(round(delay_probability * 100))}% delay risk × {estimated_delay_hours}h)",
            "reattemptExposureText": f"${reattempt_cost} (Reattempt risk exposure)",
            "additionalOpsText": f"${additional_ops_cost} (Emergency coordination overhead)",
        },
        "explanationText": "We estimate the cost exposure associated with a failed or delayed rural delivery. Lowering failure risk directly reduces expected operational loss.",
        "disclaimer": "Prototype estimated cost exposure based on default loss coefficients ($350 failure base, $45/hr delay, $180 reattempt).",
    }
