from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from ..database import get_db
from ..models import DeliveryOutcome
from ..schemas import OutcomeCreate, OutcomeOut
from ..services.outcome_service import record_delivery_outcome, get_learning_loop_summary
from ..auth import require_roles

router = APIRouter(prefix="/api/outcomes", tags=["outcomes"])

@router.get("", response_model=List[OutcomeOut])
def list_outcomes(db: Session = Depends(get_db)):
    return db.query(DeliveryOutcome).order_by(DeliveryOutcome.timestamp.desc()).all()

@router.get("/summary")
def get_summary(db: Session = Depends(get_db)):
    return get_learning_loop_summary(db)

@router.post("", response_model=OutcomeOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_roles(["ADMIN", "FLEET_MANAGER", "DISPATCHER", "DRIVER"]))])
def create_outcome(payload: OutcomeCreate, db: Session = Depends(get_db)):
    outcome_dict = payload.dict()
    result = record_delivery_outcome(outcome_dict, db)
    return result

