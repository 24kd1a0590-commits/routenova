from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from ..database import get_db
from ..models import Shipment, Vehicle, Destination, DeliveryHistory
from ..schemas import ReliabilityAnalysisRequest, PlanAnalysisRequest, PoolAnalysisRequest
from ..services.reliability_service import evaluate_delivery_plan
from ..services.plan_service import evaluate_alternative_plans
from ..services.pooling_service import find_compatible_pools

router = APIRouter(prefix="/api/analysis", tags=["analysis"])

def _to_dict(obj):
    if not obj:
        return None
    if isinstance(obj, dict):
        return obj
    # SQLAlchemy model
    result = {}
    for column in obj.__table__.columns:
        val = getattr(obj, column.name)
        result[column.name] = val

    # Add camelCase field aliases for JS compatibility
    if "capacity_kg" in result:
        result["capacityKg"] = result["capacity_kg"]
    if "base_cost" in result:
        result["baseCost"] = result["base_cost"]
    if "cost_per_km" in result:
        result["costPerKm"] = result["cost_per_km"]
    if "ground_clearance_mm" in result:
        result["groundClearanceMm"] = result["ground_clearance_mm"]
    if "road_compatibility" in result:
        result["roadCompatibility"] = result["road_compatibility"]
    if "rural_suitability" in result:
        result["ruralSuitability"] = result["rural_suitability"]
    if "road_access_score" in result:
        result["roadAccessScore"] = result["road_access_score"]
    if "address_confidence_score" in result:
        result["addressConfidenceScore"] = result["address_confidence_score"]
    if "connectivity_score" in result:
        result["connectivityScore"] = result["connectivity_score"]
    if "historical_success_rate" in result:
        result["historicalSuccessRate"] = result["historical_success_rate"]
    if "final_segment_distance" in result:
        result["finalSegmentDistance"] = result["final_segment_distance"]
    if "road_surface" in result:
        result["roadSurface"] = result["road_surface"]
    if "road_width_category" in result:
        result["roadWidthCategory"] = result["road_width_category"]
    return result

@router.post("/reliability")
def analyze_reliability(payload: ReliabilityAnalysisRequest, db: Session = Depends(get_db)):
    destination_dict = payload.destination
    if not destination_dict and payload.destination_id:
        dest_obj = db.query(Destination).filter(Destination.id == payload.destination_id).first()
        destination_dict = _to_dict(dest_obj)

    vehicle_dict = payload.vehicle
    if not vehicle_dict and payload.vehicle_id:
        veh_obj = db.query(Vehicle).filter(Vehicle.id == payload.vehicle_id).first()
        vehicle_dict = _to_dict(veh_obj)

    shipment_dict = payload.shipment
    if not shipment_dict and payload.shipment_id:
        ship_obj = db.query(Shipment).filter(Shipment.id == payload.shipment_id).first()
        shipment_dict = _to_dict(ship_obj)

    if not destination_dict:
        dest_obj = db.query(Destination).first()
        destination_dict = _to_dict(dest_obj)

    if not vehicle_dict:
        veh_obj = db.query(Vehicle).first()
        vehicle_dict = _to_dict(veh_obj)

    history_records = [_to_dict(h) for h in db.query(DeliveryHistory).all()]

    result = evaluate_delivery_plan(
        destination=destination_dict,
        vehicle=vehicle_dict,
        shipment=shipment_dict,
        history_records=history_records
    )
    return result

@router.post("/plans")
def analyze_plans(payload: PlanAnalysisRequest, db: Session = Depends(get_db)):
    shipment_dict = payload.shipment
    if not shipment_dict and payload.shipment_id:
        ship_obj = db.query(Shipment).filter(Shipment.id == payload.shipment_id).first()
        shipment_dict = _to_dict(ship_obj)

    destination_dict = payload.destination
    if not destination_dict:
        dest_id = payload.destination_id or (shipment_dict.get("destinationId") if shipment_dict else None)
        if dest_id:
            dest_obj = db.query(Destination).filter(Destination.id == dest_id).first()
            destination_dict = _to_dict(dest_obj)

    if not destination_dict:
        dest_obj = db.query(Destination).first()
        destination_dict = _to_dict(dest_obj)

    current_vehicle_dict = payload.vehicle
    if not current_vehicle_dict and payload.vehicle_id:
        veh_obj = db.query(Vehicle).filter(Vehicle.id == payload.vehicle_id).first()
        current_vehicle_dict = _to_dict(veh_obj)

    if not current_vehicle_dict:
        conv_v = shipment_dict.get("conventionalVehicle") if shipment_dict else None
        if conv_v:
            veh_obj = db.query(Vehicle).filter(Vehicle.name.contains(conv_v)).first()
            current_vehicle_dict = _to_dict(veh_obj)

    if not current_vehicle_dict:
        veh_obj = db.query(Vehicle).first()
        current_vehicle_dict = _to_dict(veh_obj)

    available_vehicles = [_to_dict(v) for v in db.query(Vehicle).all()]
    history_records = [_to_dict(h) for h in db.query(DeliveryHistory).all()]

    result = evaluate_alternative_plans(
        shipment=shipment_dict,
        destination=destination_dict,
        current_vehicle=current_vehicle_dict,
        available_vehicles=available_vehicles,
        history_records=history_records
    )
    return result

@router.post("/pools")
def analyze_pools(payload: PoolAnalysisRequest, db: Session = Depends(get_db)):
    shipment_dict = payload.shipment
    if not shipment_dict and payload.shipment_id:
        ship_obj = db.query(Shipment).filter(Shipment.id == payload.shipment_id).first()
        shipment_dict = _to_dict(ship_obj)

    if not shipment_dict:
        ship_obj = db.query(Shipment).first()
        shipment_dict = _to_dict(ship_obj)

    all_shipments = [_to_dict(s) for s in db.query(Shipment).all()]
    available_vehicles = [_to_dict(v) for v in db.query(Vehicle).all()]
    destinations = [_to_dict(d) for d in db.query(Destination).all()]

    matches = find_compatible_pools(
        target_shipment=shipment_dict,
        all_shipments=all_shipments,
        available_vehicles=available_vehicles,
        destinations=destinations
    )
    return matches
