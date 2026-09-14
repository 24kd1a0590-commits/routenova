import math
from typing import Dict, Any, List, Optional
from .reliability_service import evaluate_delivery_plan
from .loss_service import calculate_expected_operational_loss

def calculate_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    if not lat1 or not lon1 or not lat2 or not lon2:
        return 15.0
    R = 6371.0
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (
        math.sin(d_lat / 2.0) ** 2 +
        math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lon / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 1)

def evaluate_corridor_compatibility(dest_a: Dict[str, Any], dest_b: Dict[str, Any]) -> Dict[str, Any]:
    if not dest_a or not dest_b:
        return {"compatible": False, "score": 0, "sharedKm": 0}

    lat1 = dest_a.get("latitude") or 0.0
    lon1 = dest_a.get("longitude") or 0.0
    lat2 = dest_b.get("latitude") or 0.0
    lon2 = dest_b.get("longitude") or 0.0

    dist = calculate_distance_km(lat1, lon1, lat2, lon2)
    same_district = dest_a.get("district") == dest_b.get("district")

    score = 95 - dist * 3
    if same_district:
        score += 10

    final_score = min(100, max(0, int(round(score))))
    compatible = (dist <= 25) and (final_score >= 60)

    return {
        "compatible": compatible,
        "score": final_score,
        "sharedKm": max(8, int(round(20 - dist))),
    }

def find_compatible_pools(
    target_shipment: Dict[str, Any],
    all_shipments: List[Dict[str, Any]],
    available_vehicles: List[Dict[str, Any]],
    destinations: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    if not target_shipment:
        return []

    target_dest_id = target_shipment.get("destinationId") or target_shipment.get("destination_id")
    target_dest_name = target_shipment.get("destination", "")

    target_dest = None
    if target_dest_id:
        target_dest = next((d for d in destinations if d.get("id") == target_dest_id), None)
    if not target_dest:
        target_dest = next((d for d in destinations if target_dest_name in d.get("name", "")), destinations[0] if destinations else {})

    target_weight = target_shipment.get("weight") or target_shipment.get("weightKg") or 0

    candidate_shipments = [s for s in all_shipments if s.get("id") != target_shipment.get("id")]
    pool_results = []

    for candidate in candidate_shipments:
        cand_dest_id = candidate.get("destinationId") or candidate.get("destination_id")
        cand_dest_name = candidate.get("destination", "")

        cand_dest = None
        if cand_dest_id:
            cand_dest = next((d for d in destinations if d.get("id") == cand_dest_id), None)
        if not cand_dest:
            cand_dest = next((d for d in destinations if cand_dest_name in d.get("name", "")), destinations[0] if destinations else {})

        cand_weight = candidate.get("weight") or candidate.get("weightKg") or 0
        combined_weight = target_weight + cand_weight

        corridor = evaluate_corridor_compatibility(target_dest, cand_dest)
        if not corridor["compatible"]:
            continue

        suitable_vehicle = None
        for v in available_vehicles:
            cap = v.get("capacityKg") or v.get("capacity_kg") or 0
            dt = v.get("drivetrain", "")
            vtype = v.get("type", "")
            if cap >= combined_weight and ("4WD" in dt or vtype == "mini_truck"):
                suitable_vehicle = v
                break

        if not suitable_vehicle and available_vehicles:
            suitable_vehicle = available_vehicles[min(3, len(available_vehicles) - 1)]

        if not suitable_vehicle:
            continue

        veh_cap = suitable_vehicle.get("capacityKg") or suitable_vehicle.get("capacity_kg") or 1000
        if veh_cap < combined_weight:
            continue

        joint_eval = evaluate_delivery_plan(
            destination=target_dest,
            vehicle=suitable_vehicle,
            shipment={"weightKg": combined_weight}
        )

        joint_loss = calculate_expected_operational_loss(
            reliability_score=joint_eval["reliabilityScore"],
            vehicle=suitable_vehicle,
            shipment={"weightKg": combined_weight},
            destination=target_dest
        )

        shared_loss = int(round(joint_loss["expectedOperationalLoss"] * 0.55))
        utilization = int(round((combined_weight / veh_cap) * 100))
        r_suitability = suitable_vehicle.get("ruralSuitability") or suitable_vehicle.get("rural_suitability") or 75

        checklist = {
            "capacityAvailable": combined_weight <= veh_cap,
            "compatibleCorridor": corridor["compatible"],
            "compatibleDeliveryWindow": True,
            "vehicleSuitable": r_suitability >= 75,
            "acceptableReliability": joint_eval["reliabilityScore"] >= 60,
        }

        t_id = target_shipment.get("id", "S1")
        c_id = candidate.get("id", "S2")

        pool_results.append({
            "poolId": f"POOL-{t_id}-{c_id}",
            "targetShipment": target_shipment,
            "candidateShipment": candidate,
            "combinedWeightKg": combined_weight,
            "targetWeightKg": target_weight,
            "candidateWeightKg": cand_weight,
            "vehicleAssigned": suitable_vehicle,
            "vehicleCapacityKg": veh_cap,
            "vehicleUtilization": utilization,
            "shipmentCount": 2,
            "sharedCorridorKm": corridor["sharedKm"],
            "routeCompatibility": f"{corridor['score']}%",
            "reliabilityScore": joint_eval["reliabilityScore"],
            "riskLevel": joint_eval["riskLevel"],
            "estimatedSharedCost": joint_loss["vehicleCost"] / 2.0,
            "expectedOperationalLoss": shared_loss,
            "checklist": checklist,
        })

    pool_results.sort(key=lambda x: x["expectedOperationalLoss"])
    return pool_results
