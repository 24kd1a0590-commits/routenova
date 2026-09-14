from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid
import datetime
from ..database import get_db
from ..models import Shipment
from ..schemas import ShipmentCreate, ShipmentOut
from ..auth import require_roles

router = APIRouter(prefix="/api/shipments", tags=["shipments"])

@router.get("", response_model=List[ShipmentOut])
def list_shipments(db: Session = Depends(get_db)):
    return db.query(Shipment).all()

@router.get("/{shipment_id}", response_model=ShipmentOut)
def get_shipment(shipment_id: str, db: Session = Depends(get_db)):
    shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shipment not found")
    return shipment

@router.post("", response_model=ShipmentOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_roles(["ADMIN", "FLEET_MANAGER", "DISPATCHER", "SHIPPER"]))])
def create_shipment(payload: ShipmentCreate, db: Session = Depends(get_db)):
    s_id = payload.id or f"RN-2026-{uuid.uuid4().hex[:4].upper()}"
    existing = db.query(Shipment).filter(Shipment.id == s_id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Shipment ID already exists")

    shipment = Shipment(
        id=s_id,
        sender=payload.sender,
        destination=payload.destination,
        destination_id=payload.destination_id,
        weight=payload.weight,
        volume_m3=payload.volume_m3 or 1.0,
        category=payload.category or "General",
        priority=payload.priority or "Standard",
        delivery_window=payload.delivery_window or "09:00 - 17:00 IST",
        status=payload.status or "PRE_DISPATCH_EVALUATION",
        risk_level=payload.risk_level or "MEDIUM",
        failure_probability=payload.failure_probability or 0.3,
        conventional_vehicle=payload.conventional_vehicle,
        recommended_vehicle=payload.recommended_vehicle,
        created_at=datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    )
    db.add(shipment)
    db.commit()
    db.refresh(shipment)
    return shipment

@router.put("/{shipment_id}", response_model=ShipmentOut, dependencies=[Depends(require_roles(["ADMIN", "FLEET_MANAGER", "DISPATCHER"]))])
def update_shipment(shipment_id: str, payload: ShipmentCreate, db: Session = Depends(get_db)):
    shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shipment not found")

    for key, val in payload.dict(exclude_unset=True).items():
        if key != "id":
            setattr(shipment, key, val)

    db.commit()
    db.refresh(shipment)
    return shipment

