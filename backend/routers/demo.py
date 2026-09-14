import os
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..services.seed_service import reset_demo_database

router = APIRouter(prefix="/api/demo", tags=["demo"])

@router.post("/reset")
def reset_demo_data(db: Session = Depends(get_db)):
    """
    Restores RouteNova to the prepared clean expo demonstration scenario.
    Deletes shipments, pools, dispatches, outcomes, vehicle statuses/loads.
    User accounts are preserved.
    Protected to only run in development / demo mode.
    """
    # Environment check: ensure reset is permitted in dev/demo environment
    env = os.getenv("ENVIRONMENT", "development").lower()
    demo_mode = os.getenv("DEMO_MODE", "true").lower()

    if env == "production" and demo_mode != "true":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Demo reset is disabled in production environments."
        )

    try:
        reset_demo_database(db)
        return {
            "status": "success",
            "message": "Demo Ready ✅",
            "details": "RouteNova restored to prepared expo demonstration scenario."
        }
    except Exception as e:
        print(f"Error resetting demo database: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to reset demonstration scenario. Please try again."
        )
