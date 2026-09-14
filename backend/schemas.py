from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

# --- USER SCHEMAS ---
class UserLogin(BaseModel):
    email: str
    password: str

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None
    role: Optional[str] = "operator"

class UserOut(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    role: str
    is_active: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# --- VEHICLE SCHEMAS ---
class VehicleBase(BaseModel):
    type: str
    name: str
    plate: str
    capacity_kg: float
    base_cost: float
    cost_per_km: float
    ground_clearance_mm: int
    drivetrain: str
    road_compatibility: Dict[str, int]
    rural_suitability: int
    availability: Optional[str] = "AVAILABLE"
    current_load_kg: Optional[float] = 0.0
    current_location: Optional[str] = None
    assigned_driver: Optional[str] = None

class VehicleCreate(VehicleBase):
    id: Optional[str] = None

class VehicleOut(VehicleBase):
    id: str

    class Config:
        from_attributes = True


# --- DESTINATION SCHEMAS ---
class DestinationBase(BaseModel):
    name: str
    district: str
    latitude: float
    longitude: float
    road_access_score: Optional[int] = 50
    address_confidence_score: Optional[int] = 70
    connectivity_score: Optional[int] = 75
    historical_success_rate: Optional[int] = 70
    final_segment_distance: Optional[float] = 2.0
    road_surface: Optional[str] = "mixed"
    road_width_category: Optional[str] = "standard"
    local_evidence: Optional[str] = None
    risk_notes: Optional[str] = None
    prototype_risk_level: Optional[str] = "MEDIUM"
    default_landmark: Optional[str] = None

class DestinationCreate(DestinationBase):
    id: Optional[str] = None

class DestinationOut(DestinationBase):
    id: str

    class Config:
        from_attributes = True


# --- SHIPMENT SCHEMAS ---
class ShipmentBase(BaseModel):
    sender: str
    destination: str
    destination_id: Optional[str] = None
    weight: float
    volume_m3: Optional[float] = 1.0
    category: Optional[str] = "General"
    priority: Optional[str] = "Standard"
    delivery_window: Optional[str] = "09:00 - 17:00 IST"
    status: Optional[str] = "PRE_DISPATCH_EVALUATION"
    risk_level: Optional[str] = "MEDIUM"
    failure_probability: Optional[float] = 0.3
    conventional_vehicle: Optional[str] = None
    recommended_vehicle: Optional[str] = None

class ShipmentCreate(ShipmentBase):
    id: Optional[str] = None

class ShipmentOut(ShipmentBase):
    id: str
    created_at: str

    class Config:
        from_attributes = True


# --- DELIVERY HISTORY SCHEMAS ---
class DeliveryHistoryOut(BaseModel):
    id: str
    shipment_id: str
    destination_id: str
    vehicle_id: str
    outcome: str
    failure_reason: Optional[str] = None
    delivery_time: Optional[str] = None
    cost: float
    timestamp: str
    location: Optional[str] = None
    driver_notes: Optional[str] = None
    evidence_tagged: Optional[str] = None

    class Config:
        from_attributes = True


# --- POOL SCHEMAS ---
class PoolOut(BaseModel):
    id: str
    corridor_name: str
    primary_shipment_id: str
    secondary_shipment_id: str
    destination_a: str
    destination_b: str
    shared_corridor_km: float
    time_window_overlap: str
    vehicle_capacity_before: str
    vehicle_capacity_after: str
    combined_weight_kg: float
    vehicle_assigned_id: Optional[str] = None
    vehicle_assigned_name: Optional[str] = None
    expected_loss_individual: float
    expected_loss_pooled: float
    total_savings: Optional[str] = None
    status: str
    compatibility_scores: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


# --- DISPATCH SCHEMAS ---
class DispatchCreate(BaseModel):
    shipment_id: str
    vehicle_id: str
    destination_id: Optional[str] = None
    pool_id: Optional[str] = None
    notes: Optional[str] = None

class DispatchOut(BaseModel):
    id: str
    shipment_id: str
    vehicle_id: str
    destination_id: Optional[str] = None
    pool_id: Optional[str] = None
    dispatch_time: str
    status: str
    notes: Optional[str] = None

    class Config:
        from_attributes = True


class DeliveryStatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = None



# --- OUTCOME SCHEMAS ---
class OutcomeCreate(BaseModel):
    delivery_id: str
    destination_id: str
    vehicle_id: str
    outcome: str  # SUCCESS, FAILURE_REATTEMPT, DELAYED
    failure_reason: Optional[str] = None
    notes: Optional[str] = ""
    actual_cost: Optional[float] = None
    delivery_time: Optional[str] = None

class OutcomeOut(BaseModel):
    id: str
    delivery_id: str
    destination_id: str
    vehicle_id: str
    outcome: str
    failure_reason: Optional[str] = None
    notes: Optional[str] = None
    actual_cost: float
    delivery_time: Optional[str] = None
    timestamp: str
    location: Optional[str] = None
    evidence_added: Optional[str] = None
    reliability_impact: Optional[str] = None

    class Config:
        from_attributes = True


# --- ANALYSIS SCHEMAS ---
class ReliabilityAnalysisRequest(BaseModel):
    destination_id: Optional[str] = None
    vehicle_id: Optional[str] = None
    shipment_id: Optional[str] = None
    # Direct object payloads if requested dynamically
    destination: Optional[Dict[str, Any]] = None
    vehicle: Optional[Dict[str, Any]] = None
    shipment: Optional[Dict[str, Any]] = None

class PlanAnalysisRequest(BaseModel):
    shipment_id: Optional[str] = None
    destination_id: Optional[str] = None
    vehicle_id: Optional[str] = None
    shipment: Optional[Dict[str, Any]] = None
    destination: Optional[Dict[str, Any]] = None
    vehicle: Optional[Dict[str, Any]] = None

class PoolAnalysisRequest(BaseModel):
    shipment_id: Optional[str] = None
    shipment: Optional[Dict[str, Any]] = None


# --- DASHBOARD SUMMARY SCHEMA ---
class DashboardSummary(BaseModel):
    systemStats: Dict[str, Any]
    deliveryAlerts: List[Dict[str, Any]]
    recentDeliveries: List[Dict[str, Any]]
    impactMetrics: Dict[str, Any]
