from sqlalchemy import Column, String, Integer, Float, Boolean, JSON, ForeignKey, DateTime
from sqlalchemy.orm import relationship
import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    role = Column(String, default="operator")
    is_active = Column(Boolean, default=True)
    created_at = Column(String, default=lambda: datetime.datetime.now().isoformat())


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(String, primary_key=True, index=True)
    type = Column(String, nullable=False)  # motorcycle, mini_truck, van, pickup
    name = Column(String, nullable=False)
    plate = Column(String, nullable=False)
    capacity_kg = Column(Float, nullable=False)
    base_cost = Column(Float, nullable=False)
    cost_per_km = Column(Float, nullable=False)
    ground_clearance_mm = Column(Integer, nullable=False)
    drivetrain = Column(String, nullable=False)
    road_compatibility = Column(JSON, nullable=False)  # e.g. {"paved_asphalt": 95, ...}
    rural_suitability = Column(Integer, nullable=False)
    availability = Column(String, default="AVAILABLE")  # AVAILABLE, ON_DELIVERY, MAINTENANCE
    current_load_kg = Column(Float, default=0.0)
    current_location = Column(String, nullable=True)
    assigned_driver = Column(String, nullable=True)


class Destination(Base):
    __tablename__ = "destinations"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    district = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    road_access_score = Column(Integer, default=50)
    address_confidence_score = Column(Integer, default=70)
    connectivity_score = Column(Integer, default=75)
    historical_success_rate = Column(Integer, default=70)
    final_segment_distance = Column(Float, default=2.0)
    road_surface = Column(String, default="mixed")
    road_width_category = Column(String, default="standard")
    local_evidence = Column(String, nullable=True)
    risk_notes = Column(String, nullable=True)
    prototype_risk_level = Column(String, default="MEDIUM")
    default_landmark = Column(String, nullable=True)


class Shipment(Base):
    __tablename__ = "shipments"

    id = Column(String, primary_key=True, index=True)
    sender = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    destination_id = Column(String, ForeignKey("destinations.id"), nullable=True)
    weight = Column(Float, nullable=False)
    volume_m3 = Column(Float, default=1.0)
    category = Column(String, default="General")
    priority = Column(String, default="Standard")
    delivery_window = Column(String, default="09:00 - 17:00 IST")
    status = Column(String, default="PRE_DISPATCH_EVALUATION")
    risk_level = Column(String, default="MEDIUM")
    failure_probability = Column(Float, default=0.3)
    conventional_vehicle = Column(String, nullable=True)
    recommended_vehicle = Column(String, nullable=True)
    created_at = Column(String, default=lambda: datetime.datetime.now().strftime("%Y-%m-%d %H:%M"))


class DeliveryHistory(Base):
    __tablename__ = "delivery_history"

    id = Column(String, primary_key=True, index=True)
    shipment_id = Column(String, nullable=False)
    destination_id = Column(String, nullable=False)
    vehicle_id = Column(String, nullable=False)
    outcome = Column(String, nullable=False)  # SUCCESS, FAILURE_REATTEMPT, DELAYED
    failure_reason = Column(String, nullable=True)
    delivery_time = Column(String, nullable=True)
    cost = Column(Float, default=0.0)
    timestamp = Column(String, default=lambda: datetime.datetime.now().strftime("%Y-%m-%d %H:%M"))
    location = Column(String, nullable=True)
    driver_notes = Column(String, nullable=True)
    evidence_tagged = Column(String, nullable=True)


class Pool(Base):
    __tablename__ = "pools"

    id = Column(String, primary_key=True, index=True)
    corridor_name = Column(String, nullable=False)
    primary_shipment_id = Column(String, ForeignKey("shipments.id"), nullable=False)
    secondary_shipment_id = Column(String, ForeignKey("shipments.id"), nullable=False)
    destination_a = Column(String, nullable=False)
    destination_b = Column(String, nullable=False)
    shared_corridor_km = Column(Float, default=10.0)
    time_window_overlap = Column(String, default="90%")
    vehicle_capacity_before = Column(String, default="40%")
    vehicle_capacity_after = Column(String, default="85%")
    combined_weight_kg = Column(Float, default=500.0)
    vehicle_assigned_id = Column(String, ForeignKey("vehicles.id"), nullable=True)
    vehicle_assigned_name = Column(String, nullable=True)
    expected_loss_individual = Column(Float, default=500.0)
    expected_loss_pooled = Column(Float, default=150.0)
    total_savings = Column(String, nullable=True)
    status = Column(String, default="MATCH_SUGGESTED")
    compatibility_scores = Column(JSON, nullable=True)


class PoolShipment(Base):
    __tablename__ = "pool_shipments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    pool_id = Column(String, ForeignKey("pools.id"), nullable=False)
    shipment_id = Column(String, ForeignKey("shipments.id"), nullable=False)
    role = Column(String, default="primary")  # primary or secondary


class Dispatch(Base):
    __tablename__ = "dispatches"

    id = Column(String, primary_key=True, index=True)
    shipment_id = Column(String, ForeignKey("shipments.id"), nullable=False)
    vehicle_id = Column(String, ForeignKey("vehicles.id"), nullable=False)
    destination_id = Column(String, ForeignKey("destinations.id"), nullable=True)
    pool_id = Column(String, ForeignKey("pools.id"), nullable=True)
    dispatch_time = Column(String, default=lambda: datetime.datetime.now().strftime("%Y-%m-%d %H:%M"))
    status = Column(String, default="DISPATCHED")
    notes = Column(String, nullable=True)


class DeliveryOutcome(Base):
    __tablename__ = "delivery_outcomes"

    id = Column(String, primary_key=True, index=True)
    delivery_id = Column(String, nullable=False)
    destination_id = Column(String, nullable=False)
    vehicle_id = Column(String, nullable=False)
    outcome = Column(String, nullable=False)
    failure_reason = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    actual_cost = Column(Float, default=0.0)
    delivery_time = Column(String, nullable=True)
    timestamp = Column(String, default=lambda: datetime.datetime.now().strftime("%Y-%m-%d %H:%M"))
    location = Column(String, nullable=True)
    evidence_added = Column(String, nullable=True)
    reliability_impact = Column(String, nullable=True)
