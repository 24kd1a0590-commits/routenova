from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid
import datetime
from ..database import get_db
from ..models import DeliveryHistory, Dispatch, Shipment, Vehicle
from ..schemas import DeliveryHistoryOut, DispatchCreate, DispatchOut, DeliveryStatusUpdate
from ..auth import require_roles

router = APIRouter(tags=["deliveries"])

@router.get("/api/deliveries", response_model=List[DeliveryHistoryOut])
def list_deliveries(db: Session = Depends(get_db)):
    return db.query(DeliveryHistory).all()

@router.get("/api/deliveries/{delivery_id}", response_model=DeliveryHistoryOut)
def get_delivery(delivery_id: str, db: Session = Depends(get_db)):
    delivery = db.query(DeliveryHistory).filter(DeliveryHistory.id == delivery_id).first()
    if not delivery:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Delivery record not found")
    return delivery

@router.put("/api/deliveries/{delivery_id}/status")
def update_delivery_status(
    delivery_id: str,
    payload: DeliveryStatusUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles(["ADMIN", "FLEET_MANAGER", "DISPATCHER", "DRIVER"]))
):
    # Try finding in Dispatch first, then Shipment
    dispatch = db.query(Dispatch).filter(Dispatch.id == delivery_id).first()
    if not dispatch:
        # Check if delivery_id is a shipment_id in dispatches or shipments
        dispatch = db.query(Dispatch).filter(Dispatch.shipment_id == delivery_id).first()

    shipment = db.query(Shipment).filter(Shipment.id == delivery_id).first()
    if not shipment and dispatch:
        shipment = db.query(Shipment).filter(Shipment.id == dispatch.shipment_id).first()

    if dispatch:
        dispatch.status = payload.status
        if payload.notes:
            dispatch.notes = payload.notes
    
    if shipment:
        shipment.status = payload.status

    # If completed, free up the vehicle if linked
    if payload.status in ["DELIVERED", "COMPLETED", "SUCCESS"]:
        vehicle_id = dispatch.vehicle_id if dispatch else None
        if vehicle_id:
            vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
            if vehicle:
                vehicle.availability = "AVAILABLE"
                vehicle.current_load_kg = 0.0

    db.commit()
    return {
        "status": "success",
        "delivery_id": delivery_id,
        "new_status": payload.status,
        "notes": payload.notes,
        "updated_at": datetime.datetime.now().isoformat()
    }

@router.post("/api/dispatch", response_model=DispatchOut, status_code=status.HTTP_201_CREATED)
def create_dispatch(payload: DispatchCreate, db: Session = Depends(get_db)):
    shipment = db.query(Shipment).filter(Shipment.id == payload.shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shipment not found")

    vehicle = db.query(Vehicle).filter(Vehicle.id == payload.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")

    dispatch_id = f"DSP-{uuid.uuid4().hex[:6].upper()}"
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")

    # Update shipment status
    shipment.status = "DISPATCHED"
    shipment.recommended_vehicle = vehicle.name

    # Update vehicle availability
    vehicle.availability = "ON_DELIVERY"
    vehicle.current_load_kg = shipment.weight

    dispatch = Dispatch(
        id=dispatch_id,
        shipment_id=payload.shipment_id,
        vehicle_id=payload.vehicle_id,
        destination_id=payload.destination_id or shipment.destination_id,
        pool_id=payload.pool_id,
        dispatch_time=now_str,
        status="DISPATCHED",
        notes=payload.notes or f"Dispatched via {vehicle.name}"
    )

    db.add(dispatch)
    db.commit()
    db.refresh(dispatch)
    return dispatch

