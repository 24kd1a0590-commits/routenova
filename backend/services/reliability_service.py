import math
from typing import Dict, Any, List, Optional

ENGINE_WEIGHTS = {
    "roadAccessibility": 0.30,
    "vehicleCompatibility": 0.25,
    "addressConfidence": 0.20,
    "historicalSuccess": 0.15,
    "connectivity": 0.10,
}

RISK_THRESHOLDS = {
    "HIGH_MAX": 40,
    "MEDIUM_MAX": 70,
}

def calculate_vehicle_road_compatibility(
    vehicle: Dict[str, Any],
    destination: Dict[str, Any],
    shipment: Optional[Dict[str, Any]] = None
) -> int:
    if not vehicle or not destination:
        return 50

    weight_kg = shipment.get("weight") or shipment.get("weightKg") or 0 if shipment else 0
    capacity_kg = vehicle.get("capacityKg") or vehicle.get("capacity_kg") or 0
    if capacity_kg and weight_kg > capacity_kg:
        return 0

    surface_key = destination.get("roadSurface") or destination.get("road_surface") or "mixed"
    road_comp = vehicle.get("roadCompatibility") or vehicle.get("road_compatibility") or {}
    base_score = road_comp.get(surface_key, 70)

    clearance = vehicle.get("groundClearanceMm") or vehicle.get("ground_clearance_mm") or 150
    if surface_key in ["unpaved_mud", "mixed"]:
        if clearance < 180:
            base_score -= 30
        elif clearance >= 220:
            base_score += 10

    road_width = destination.get("roadWidthCategory") or destination.get("road_width_category") or "standard"
    vtype = vehicle.get("type", "")
    if road_width == "narrow":
        if vtype in ["van", "pickup"]:
            base_score -= 10
        elif vtype in ["motorcycle", "mini_truck"]:
            base_score += 5

    drivetrain = vehicle.get("drivetrain", "")
    if "4WD" in drivetrain:
        if surface_key in ["unpaved_mud", "gravel_track"]:
            base_score += 15

    return min(100, max(0, int(round(base_score))))

def calculate_historical_success(
    destination: Dict[str, Any],
    history_records: Optional[List[Dict[str, Any]]] = None
) -> int:
    if history_records:
        dest_id = destination.get("id")
        dest_history = [h for h in history_records if h.get("destinationId") == dest_id or h.get("destination_id") == dest_id]
        if dest_history:
            successes = len([h for h in dest_history if h.get("outcome") == "SUCCESS"])
            return int(round((successes / len(dest_history)) * 100))

    rate = destination.get("historicalSuccessRate") or destination.get("historical_success_rate")
    return rate if rate is not None else 70

def evaluate_delivery_plan(
    destination: Dict[str, Any],
    vehicle: Dict[str, Any],
    shipment: Optional[Dict[str, Any]] = None,
    history_records: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    if not destination or not vehicle:
        return {
            "reliabilityScore": 50,
            "riskLevel": "MEDIUM",
            "failureProbability": 0.50,
            "factors": {},
            "primaryRisk": "Incomplete Parameters",
            "explanation": "Insufficient destination or vehicle data to complete evaluation.",
            "recommendedActions": ["Provide complete vehicle and destination parameters."],
        }

    road_access_score = destination.get("roadAccessScore") or destination.get("road_access_score") or 50
    vehicle_comp_score = calculate_vehicle_road_compatibility(vehicle, destination, shipment)
    address_conf_score = destination.get("addressConfidenceScore") or destination.get("address_confidence_score") or 70
    connectivity_score = destination.get("connectivityScore") or destination.get("connectivity_score") or 75
    historical_success_score = calculate_historical_success(destination, history_records)

    weighted_sum = (
        road_access_score * ENGINE_WEIGHTS["roadAccessibility"] +
        vehicle_comp_score * ENGINE_WEIGHTS["vehicleCompatibility"] +
        address_conf_score * ENGINE_WEIGHTS["addressConfidence"] +
        historical_success_score * ENGINE_WEIGHTS["historicalSuccess"] +
        connectivity_score * ENGINE_WEIGHTS["connectivity"]
    )

    reliability_score = min(100, max(0, int(round(weighted_sum))))

    risk_level = "LOW"
    if reliability_score <= RISK_THRESHOLDS["HIGH_MAX"]:
        risk_level = "HIGH"
    elif reliability_score <= RISK_THRESHOLDS["MEDIUM_MAX"]:
        risk_level = "MEDIUM"

    failure_probability = round(1 - reliability_score / 100.0, 2)

    factor_explanations = []
    recommended_actions = []
    primary_risk = "Optimal Operational Parameters"

    # Factors
    road_status = "GOOD"
    road_exp = "Road accessibility is acceptable along the delivery route."
    if road_access_score < 50:
        road_status = "POOR"
        road_exp = "Road accessibility is limited on the final delivery segment."
        factor_explanations.append(road_exp)
        recommended_actions.append("Verify road surface conditions and seasonal mud degradation before dispatch.")

    vehicle_status = "EXCELLENT"
    vehicle_exp = "Selected vehicle is compatible with route surface and terrain."
    if vehicle_comp_score < 50:
        vehicle_status = "MISMATCH"
        vehicle_exp = "Selected vehicle has poor compatibility with the identified rural road conditions."
        factor_explanations.append(vehicle_exp)
        vname = vehicle.get("name", "selected vehicle")
        recommended_actions.append(f"Switch from {vname} to a 4x4 high clearance vehicle or all-terrain pickup.")

    address_status = "HIGH"
    address_exp = "Destination landmark and geocode confidence are high."
    if address_conf_score < 60:
        address_status = "LOW"
        address_exp = "Destination address confidence is low."
        factor_explanations.append(address_exp)
        recommended_actions.append("Confirm local landmark (e.g. Panchayati Well / Health Clinic) with recipient prior to departure.")

    connectivity_status = "GOOD"
    connectivity_exp = "Cellular signal coverage is sufficient along the corridor."
    if connectivity_score < 50:
        connectivity_status = "CRITICAL"
        connectivity_exp = "Connectivity reliability may affect driver coordination."
        factor_explanations.append(connectivity_exp)
        recommended_actions.append("Pre-download offline navigation route map and SMS dispatch instructions to driver mobile device.")

    history_status = "GOOD"
    history_exp = "Historical delivery evidence shows acceptable past completion rates."
    if historical_success_score < 65:
        history_status = "WARNING"
        history_exp = "Previous delivery outcomes indicate elevated operational risk."
        factor_explanations.append(history_exp)
        recommended_actions.append("Review local evidence logs for past tow/reattempt incidents along this segment.")

    lowest_score = min(
        road_access_score,
        vehicle_comp_score,
        address_conf_score,
        connectivity_score,
        historical_success_score
    )

    if lowest_score == vehicle_comp_score and vehicle_comp_score < 60:
        primary_risk = "Vehicle Ground Clearance / Drivetrain Mismatch"
    elif lowest_score == road_access_score and road_access_score < 60:
        primary_risk = "Unpaved Mud Rutting / Bridge Weight Restriction"
    elif lowest_score == connectivity_score and connectivity_score < 60:
        primary_risk = "Cellular Dead Zone Along Final Segment"
    elif lowest_score == address_conf_score and address_conf_score < 60:
        primary_risk = "Low Destination Geocode Confidence"
    elif lowest_score == historical_success_score and historical_success_score < 65:
        primary_risk = "Elevated Historical Reattempt Rate"

    summary_exp = f"RouteNova Reliability Engine evaluated this plan at {reliability_score}/100 reliability ({risk_level} RISK)."
    if factor_explanations:
        summary_exp += f" Key risks identified: {' '.join(factor_explanations)}"
    else:
        summary_exp += " All operational parameters satisfy safety and delivery reliability thresholds."

    if not recommended_actions:
        recommended_actions.append("Proceed with scheduled dispatch plan.")

    return {
        "reliabilityScore": reliability_score,
        "riskLevel": risk_level,
        "failureProbability": failure_probability,
        "factors": {
            "roadAccessibility": {
                "score": road_access_score,
                "weight": ENGINE_WEIGHTS["roadAccessibility"],
                "status": road_status,
                "explanation": road_exp,
            },
            "vehicleCompatibility": {
                "score": vehicle_comp_score,
                "weight": ENGINE_WEIGHTS["vehicleCompatibility"],
                "status": vehicle_status,
                "explanation": vehicle_exp,
            },
            "addressConfidence": {
                "score": address_conf_score,
                "weight": ENGINE_WEIGHTS["addressConfidence"],
                "status": address_status,
                "explanation": address_exp,
            },
            "historicalSuccess": {
                "score": historical_success_score,
                "weight": ENGINE_WEIGHTS["historicalSuccess"],
                "status": history_status,
                "explanation": history_exp,
            },
            "connectivity": {
                "score": connectivity_score,
                "weight": ENGINE_WEIGHTS["connectivity"],
                "status": connectivity_status,
                "explanation": connectivity_exp,
            },
        },
        "primaryRisk": primary_risk,
        "explanation": summary_exp,
        "recommendedActions": recommended_actions,
    }
