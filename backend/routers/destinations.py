from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid
from ..database import get_db
from ..models import Destination
from ..schemas import DestinationCreate, DestinationOut
from ..auth import require_roles

router = APIRouter(prefix="/api/destinations", tags=["destinations"])

@router.get("", response_model=List[DestinationOut])
def list_destinations(db: Session = Depends(get_db)):
    return db.query(Destination).all()

@router.get("/{dest_id}", response_model=DestinationOut)
def get_destination(dest_id: str, db: Session = Depends(get_db)):
    dest = db.query(Destination).filter(Destination.id == dest_id).first()
    if not dest:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Destination not found")
    return dest

@router.post("", response_model=DestinationOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_roles(["ADMIN", "FLEET_MANAGER"]))])
def create_destination(payload: DestinationCreate, db: Session = Depends(get_db)):
    d_id = payload.id or f"DEST-{payload.name[:4].upper()}-{uuid.uuid4().hex[:4].upper()}"
    existing = db.query(Destination).filter(Destination.id == d_id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Destination ID already exists")

    dest = Destination(
        id=d_id,
        name=payload.name,
        district=payload.district,
        latitude=payload.latitude,
        longitude=payload.longitude,
        road_access_score=payload.road_access_score or 50,
        address_confidence_score=payload.address_confidence_score or 70,
        connectivity_score=payload.connectivity_score or 75,
        historical_success_rate=payload.historical_success_rate or 70,
        final_segment_distance=payload.final_segment_distance or 2.0,
        road_surface=payload.road_surface or "mixed",
        road_width_category=payload.road_width_category or "standard",
        local_evidence=payload.local_evidence,
        risk_notes=payload.risk_notes,
        prototype_risk_level=payload.prototype_risk_level or "MEDIUM",
        default_landmark=payload.default_landmark
    )
    db.add(dest)
    db.commit()
    db.refresh(dest)
    return dest

@router.put("/{dest_id}", response_model=DestinationOut, dependencies=[Depends(require_roles(["ADMIN", "FLEET_MANAGER"]))])
def update_destination(dest_id: str, payload: DestinationCreate, db: Session = Depends(get_db)):
    dest = db.query(Destination).filter(Destination.id == dest_id).first()
    if not dest:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Destination not found")

    for key, val in payload.dict(exclude_unset=True).items():
        if key != "id":
            setattr(dest, key, val)

    db.commit()
    db.refresh(dest)
    return dest

