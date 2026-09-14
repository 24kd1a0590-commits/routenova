from typing import Dict, Any, List, Optional
from .reliability_service import evaluate_delivery_plan
from .loss_service import calculate_expected_operational_loss

def evaluate_alternative_plans(
    shipment: Dict[str, Any],
    destination: Dict[str, Any],
    current_vehicle: Dict[str, Any],
    available_vehicles: List[Dict[str, Any]],
    history_records: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    if not shipment or not destination:
        return {
            "currentPlan": None,
            "alternativePlan": None,
            "recommendedPlan": None,
            "evaluatedPlans": [],
            "recommendationReasons": [],
        }

    history_records = history_records or []
    payload_weight = shipment.get("weight") or shipment.get("weightKg") or 0

    # 1. Baseline
    baseline_eval = evaluate_delivery_plan(destination, current_vehicle, shipment, history_records)
    baseline_loss = calculate_expected_operational_loss(
        reliability_score=baseline_eval["reliabilityScore"],
        vehicle=current_vehicle,
        shipment=shipment,
        destination=destination
    )

    current_plan = {
        "vehicle": current_vehicle,
        "reliabilityScore": baseline_eval["reliabilityScore"],
        "riskLevel": baseline_eval["riskLevel"],
        "failureProbability": baseline_eval["failureProbability"],
        "estimatedCost": baseline_loss["vehicleCost"],
        "expectedOperationalLoss": baseline_loss["expectedOperationalLoss"],
        "primaryRisk": baseline_eval["primaryRisk"],
        "isBaseline": True,
        "isRecommended": False,
    }

    # 2. Candidate Vehicles
    valid_vehicles = []
    for v in available_vehicles:
        cap = v.get("capacityKg") or v.get("capacity_kg") or 0
        if cap < payload_weight:
            continue
        avail = v.get("availability", "AVAILABLE")
        if avail == "MAINTENANCE":
            continue
        valid_vehicles.append(v)

    evaluated_plans = []
    for vehicle in valid_vehicles:
        eval_res = evaluate_delivery_plan(destination, vehicle, shipment, history_records)
        loss_res = calculate_expected_operational_loss(
            reliability_score=eval_res["reliabilityScore"],
            vehicle=vehicle,
            shipment=shipment,
            destination=destination
        )
        v_id = vehicle.get("id")
        cur_v_id = current_vehicle.get("id") if current_vehicle else None

        evaluated_plans.append({
            "vehicle": vehicle,
            "reliabilityScore": eval_res["reliabilityScore"],
            "riskLevel": eval_res["riskLevel"],
            "failureProbability": eval_res["failureProbability"],
            "estimatedCost": loss_res["vehicleCost"],
            "expectedOperationalLoss": loss_res["expectedOperationalLoss"],
            "primaryRisk": eval_res["primaryRisk"],
            "isBaseline": v_id == cur_v_id,
            "isRecommended": False,
        })

    # Sort by LOWEST Expected Loss
    evaluated_plans.sort(key=lambda p: p["expectedOperationalLoss"])

    recommended_plan = evaluated_plans[0] if evaluated_plans else current_plan
    recommended_plan["isRecommended"] = True

    alternative_plan = None
    for p in evaluated_plans:
        p_v_id = p["vehicle"].get("id")
        c_v_id = current_vehicle.get("id") if current_vehicle else None
        r_v_id = recommended_plan["vehicle"].get("id") if recommended_plan and recommended_plan.get("vehicle") else None
        if p_v_id != c_v_id and p_v_id != r_v_id:
            alternative_plan = p
            break

    if not alternative_plan:
        alternative_plan = evaluated_plans[1] if len(evaluated_plans) > 1 else current_plan

    loss_saved = current_plan["expectedOperationalLoss"] - recommended_plan["expectedOperationalLoss"]
    percent_saved = (
        int(round((loss_saved / current_plan["expectedOperationalLoss"]) * 100))
        if current_plan["expectedOperationalLoss"] > 0
        else 0
    )

    reasons = []
    rec_v_name = recommended_plan["vehicle"].get("name", "Recommended Vehicle")
    if loss_saved > 0:
        reasons.append(f"Recommends {rec_v_name} because it reduces Expected Operational Loss by ${loss_saved} ({percent_saved}% reduction).")
    else:
        reasons.append(f"Current plan is already optimal with low expected operational loss (${current_plan['expectedOperationalLoss']}).")

    rec_drivetrain = recommended_plan["vehicle"].get("drivetrain", "")
    rec_clearance = recommended_plan["vehicle"].get("groundClearanceMm") or recommended_plan["vehicle"].get("ground_clearance_mm") or 200
    rec_type = recommended_plan["vehicle"].get("type", "")

    if "4WD" in rec_drivetrain:
        reasons.append(f"4x4 drivetrain and {rec_clearance}mm ground clearance eliminate unpaved mud rutting failure risk.")
    elif rec_type == "motorcycle":
        reasons.append("Agile motorcycle transport easily navigates narrow rural tracks with minimal transit cost.")

    if recommended_plan["reliabilityScore"] > current_plan["reliabilityScore"]:
        reasons.append(
            f"Boosts operational reliability score from {current_plan['reliabilityScore']}/100 to {recommended_plan['reliabilityScore']}/100 ({recommended_plan['riskLevel']} RISK)."
        )

    reasons.append("Decision prioritizes lowest Expected Operational Loss (factoring failure risk & reattempt costs), rather than merely picking the cheapest vehicle rental.")

    return {
        "currentPlan": current_plan,
        "alternativePlan": alternative_plan,
        "recommendedPlan": recommended_plan,
        "evaluatedPlans": evaluated_plans,
        "recommendationReasons": reasons,
    }
