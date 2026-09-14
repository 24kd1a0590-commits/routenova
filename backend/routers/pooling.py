from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Pool, Shipment, Vehicle, Destination
from ..schemas import PoolOut
from ..services.pooling_service import find_compatible_pools

router = APIRouter(prefix="/api/pooling", tags=["pooling"])

@router.get("", response_model=List[PoolOut])
def list_pools(db: Session = Depends(get_db)):
    return db.query(Pool).all()

@router.get("/candidates")
def get_pool_candidates(db: Session = Depends(get_db)):
    shipments = [
        {
            "id": s.id,
            "sender": s.sender,
            "destination": s.destination,
            "destinationId": s.destination_id,
            "weight": s.weight,
            "riskLevel": s.risk_level,
        }
        for s in db.query(Shipment).all()
    ]
    vehicles = [
        {
            "id": v.id,
            "name": v.name,
            "capacityKg": v.capacity_kg,
            "drivetrain": v.drivetrain,
            "type": v.type,
            "ruralSuitability": v.rural_suitability,
            "baseCost": v.base_cost,
            "costPerKm": v.cost_per_km,
        }
        for v in db.query(Vehicle).all()
    ]
    destinations = [
        {
            "id": d.id,
            "name": d.name,
            "district": d.district,
            "latitude": d.latitude,
            "longitude": d.longitude,
            "roadAccessScore": d.road_access_score,
            "addressConfidenceScore": d.address_confidence_score,
            "connectivityScore": d.connectivity_score,
            "historicalSuccessRate": d.historical_success_rate,
            "finalSegmentDistance": d.final_segment_distance,
        }
        for d in db.query(Destination).all()
    ]

    all_candidates = []
    seen_pairs = set()

    for target in shipments:
        matches = find_compatible_pools(target, shipments, vehicles, destinations)
        for m in matches:
            pair_key = tuple(sorted([m["targetShipment"]["id"], m["candidateShipment"]["id"]]))
            if pair_key not in seen_pairs:
                seen_pairs.add(pair_key)
                all_candidates.append(m)

    return all_candidates

@router.get("/{pool_id}", response_model=PoolOut)
def get_pool(pool_id: str, db: Session = Depends(get_db)):
    pool = db.query(Pool).filter(Pool.id == pool_id).first()
    if not pool:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pool not found")
    return pool
