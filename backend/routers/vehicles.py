from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid
from ..database import get_db
from ..models import Vehicle
from ..schemas import VehicleCreate, VehicleOut

from ..auth import require_roles

router = APIRouter(prefix="/api/vehicles", tags=["vehicles"])

@router.get("", response_model=List[VehicleOut])
def list_vehicles(db: Session = Depends(get_db)):
    return db.query(Vehicle).all()

@router.get("/{vehicle_id}", response_model=VehicleOut)
def get_vehicle(vehicle_id: str, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
    return vehicle

@router.post("", response_model=VehicleOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_roles(["ADMIN", "FLEET_MANAGER"]))])
def create_vehicle(payload: VehicleCreate, db: Session = Depends(get_db)):

    v_id = payload.id or f"VEH-{payload.type[:4].upper()}-{uuid.uuid4().hex[:4].upper()}"
    existing = db.query(Vehicle).filter(Vehicle.id == v_id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Vehicle ID already exists")

    vehicle = Vehicle(
        id=v_id,
        type=payload.type,
        name=payload.name,
        plate=payload.plate,
        capacity_kg=payload.capacity_kg,
        base_cost=payload.base_cost,
        cost_per_km=payload.cost_per_km,
        ground_clearance_mm=payload.ground_clearance_mm,
        drivetrain=payload.drivetrain,
        road_compatibility=payload.road_compatibility,
        rural_suitability=payload.rural_suitability,
        availability=payload.availability or "AVAILABLE",
        current_load_kg=payload.current_load_kg or 0.0,
        current_location=payload.current_location,
        assigned_driver=payload.assigned_driver
    )
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle

@router.put("/{vehicle_id}", response_model=VehicleOut, dependencies=[Depends(require_roles(["ADMIN", "FLEET_MANAGER"]))])
def update_vehicle(vehicle_id: str, payload: VehicleCreate, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")

    for key, val in payload.dict(exclude_unset=True).items():
        if key != "id":
            setattr(vehicle, key, val)

    db.commit()
    db.refresh(vehicle)
    return vehicle

@router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_roles(["ADMIN", "FLEET_MANAGER"]))])
def delete_vehicle(vehicle_id: str, db: Session = Depends(get_db)):

    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
    db.delete(vehicle)
    db.commit()
    return None
