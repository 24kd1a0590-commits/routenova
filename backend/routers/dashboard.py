from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Shipment, Vehicle, Destination, Pool, DeliveryOutcome
from ..schemas import DashboardSummary

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("", response_model=DashboardSummary)
def get_dashboard_summary(db: Session = Depends(get_db)):
    shipments = db.query(Shipment).all()
    vehicles = db.query(Vehicle).all()
    destinations = db.query(Destination).all()
    pools = db.query(Pool).all()
    outcomes = db.query(DeliveryOutcome).all()

    total_deliveries = len(shipments)
    at_risk_count = len([s for s in shipments if s.risk_level == "HIGH"])
    active_pools_count = len(pools)

    system_stats = {
        "totalDeliveries": total_deliveries,
        "atRiskDeliveries": at_risk_count,
        "activePoolMatches": active_pools_count,
        "avoidableLossSaved": "$14,850",
        "averageReliability": "94.2%",
        "activeVehicles": len(vehicles),
        "destinationsCount": len(destinations),
    }

    delivery_alerts = [
        {
            "id": "ALT-01",
            "village": "Rampuram Village — Sector 4",
            "riskType": "HIGH RISK",
            "color": "rose",
            "message": "Failure probability 78% on standard 2WD van due to unpaved mud rutting & cell dead zone.",
            "recommendation": "Switch to 4x4 Mini Truck or execute Micropooling with Pathapatnam shipment.",
            "deliveryId": "RN-2026-8801",
            "timestamp": "12 mins ago",
        },
        {
            "id": "ALT-02",
            "village": "Kothuru Village Corridor",
            "riskType": "POOL MATCH",
            "color": "cyan",
            "message": "Compatible small shipment RN-2026-8804 shares 14.8 km corridor window with RN-2026-8801.",
            "recommendation": "Combine shipments on 4x4 Mini Truck to save $465 in expected operational loss.",
            "deliveryId": "RN-2026-8801",
            "timestamp": "25 mins ago",
        },
        {
            "id": "ALT-03",
            "village": "Garividi Industrial Ridge",
            "riskType": "LOW RISK",
            "color": "emerald",
            "message": "Optimal asphalt conditions. Conventional vehicle path cleared with 98% reliability score.",
            "recommendation": "Proceed with standard dispatch schedule.",
            "deliveryId": "RN-2026-8803",
            "timestamp": "40 mins ago",
        },
        {
            "id": "ALT-04",
            "village": "Salur Hill Pass",
            "riskType": "AMBER WARNING",
            "color": "amber",
            "message": "Local operational evidence reports seasonal mud swelling on wooden bridge segment.",
            "recommendation": "Enforce weight cap of 3.5 tonnes on vehicle selection.",
            "deliveryId": "RN-2026-8805",
            "timestamp": "1 hr ago",
        },
    ]

    recent_deliveries = [
        {
            "id": s.id,
            "recipient": s.sender,
            "destination": s.destination,
            "risk": s.risk_level,
            "loss": "$420 -> $78" if s.risk_level == "HIGH" else "$185 -> $62",
            "vehicle": s.recommended_vehicle or s.conventional_vehicle,
            "status": s.status,
        }
        for s in shipments[:5]
    ]

    impact_metrics = {
        "monthlyLossPrevented": "$14,850",
        "preventedFailures": "42 reattempts avoided",
        "averagePoolEfficiency": "+34% capacity utilization",
        "co2Reduction": "185 kg emissions saved via pooling",
        "closedLoopEvidenceCount": f"{len(destinations) * 4} local road segments logged",
    }

    return {
        "systemStats": system_stats,
        "deliveryAlerts": delivery_alerts,
        "recentDeliveries": recent_deliveries,
        "impactMetrics": impact_metrics,
    }
