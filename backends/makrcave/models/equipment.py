from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    Text,
    Boolean,
    ForeignKey,
    Enum,
    JSON,
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import ARRAY
from datetime import datetime
import enum
import uuid

from ..database import Base
from .skill import skill_equipment


class EquipmentStatus(enum.Enum):
    AVAILABLE = "available"
    IN_USE = "in_use"
    UNDER_MAINTENANCE = "under_maintenance"
    OFFLINE = "offline"


class EquipmentCategory(enum.Enum):
    PRINTER_3D = "printer_3d"
    LASER_CUTTER = "laser_cutter"
    CNC_MACHINE = "cnc_machine"
    TESTING_TOOL = "testing_tool"
    SOLDERING_STATION = "soldering_station"
    WORKSTATION = "workstation"
    HAND_TOOL = "hand_tool"
    MEASURING_TOOL = "measuring_tool"
    GENERAL_TOOL = "general_tool"


class MaintenanceType(enum.Enum):
    ROUTINE = "routine"
    REPAIR = "repair"
    CALIBRATION = "calibration"
    CLEANING = "cleaning"
    REPLACEMENT = "replacement"


class ReservationStatus(enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"


class Equipment(Base):
    __tablename__ = "equipment"

    # Primary identification
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    equipment_id = Column(String, unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)

    # Categorization
    category = Column(Enum(EquipmentCategory), nullable=False)
    sub_category = Column(String(100), nullable=True)

    # Status and location
    status = Column(Enum(EquipmentStatus), default=EquipmentStatus.AVAILABLE)
    location = Column(String(255), nullable=False)
    linked_makerspace_id = Column(String, nullable=False, index=True)

    # Scheduling and availability
    available_slots = Column(JSON, nullable=True)  # Weekly schedule as JSON

    # Access control
    requires_certification = Column(Boolean, default=False)
    certification_required = Column(String(100), nullable=True)  # Skill/Badge ID

    # Maintenance tracking
    last_maintenance_date = Column(DateTime, nullable=True)
    next_maintenance_date = Column(DateTime, nullable=True)
    maintenance_interval_hours = Column(
        Integer, nullable=True
    )  # Hours between maintenance

    # Usage tracking
    total_usage_hours = Column(Float, default=0.0)
    usage_count = Column(Integer, default=0)

    # Equipment details
    manufacturer = Column(String(100), nullable=True)
    model = Column(String(100), nullable=True)
    serial_number = Column(String(100), nullable=True)
    purchase_date = Column(DateTime, nullable=True)
    warranty_expiry = Column(DateTime, nullable=True)

    # Pricing and billing
    hourly_rate = Column(Float, nullable=True)
    deposit_required = Column(Float, nullable=True)

    # Additional information
    description = Column(Text, nullable=True)
    specifications = Column(JSON, nullable=True)  # Technical specs as JSON
    manual_url = Column(String(500), nullable=True)
    image_url = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)

    # Ratings and feedback
    average_rating = Column(Float, default=0.0)
    total_ratings = Column(Integer, default=0)

    # Record keeping
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String, nullable=False)

    # Relationships
    reservations = relationship("EquipmentReservation", back_populates="equipment")
    maintenance_logs = relationship(
        "EquipmentMaintenanceLog", back_populates="equipment", cascade="all, delete-orphan"
    )
    enhanced_reservations = relationship(
        "EnhancedEquipmentReservation",
        back_populates="equipment",
        cascade="all, delete-orphan",
    )
    usage_sessions = relationship(
        "EquipmentUsageSession",
        back_populates="equipment",
        cascade="all, delete-orphan",
    )

    # Pricing and access control relationships (defined in other modules)
    cost_rules = relationship(
        "EquipmentCostRule",
        back_populates="equipment",
        cascade="all, delete-orphan",
    )
    skill_gates = relationship(
        "EquipmentSkillGate",
        back_populates="equipment",
        cascade="all, delete-orphan",
    )

    # Machine access module relationships
    access_rules = relationship(
        "MachineAccessRule",
        back_populates="equipment",
        cascade="all, delete-orphan",
    )
    certifications = relationship(
        "UserCertification",
        back_populates="equipment",
        cascade="all, delete-orphan",
    )
    access_attempts = relationship(
        "MachineAccessAttempt",
        back_populates="equipment",
        cascade="all, delete-orphan",
    )
    safety_incidents = relationship(
        "SafetyIncident",
        back_populates="equipment",
        cascade="all, delete-orphan",
    )
    assessments = relationship(
        "SkillAssessment",
        back_populates="equipment",
        cascade="all, delete-orphan",
    )

    # Skills required to operate this equipment (many-to-many via association table)
    required_skills = relationship(
        "Skill",
        secondary=skill_equipment,
        back_populates="equipment",
    )


class EquipmentReservation(Base):
    __tablename__ = "equipment_reservations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    equipment_id = Column(String, ForeignKey("equipment.id"), nullable=False)
    member_id = Column(String, nullable=False, index=True)

    # Reservation details
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    status = Column(Enum(ReservationStatus), default=ReservationStatus.PENDING)

    # Additional information
    purpose = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)

    # Record keeping
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    equipment = relationship("Equipment", back_populates="reservations")


class EquipmentMaintenanceLog(Base):
    __tablename__ = "equipment_maintenance_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    equipment_id = Column(String, ForeignKey("equipment.id"), nullable=False, index=True)

    # Maintenance metadata
    maintenance_type = Column(Enum(MaintenanceType), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    scheduled_date = Column(DateTime, nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    duration_hours = Column(Float, nullable=True)
    supervised_by = Column(String(255), nullable=True)

    # Personnel information
    performed_by_user_id = Column(String, nullable=False)
    performed_by_name = Column(String(255), nullable=False)

    # Cost and parts tracking
    parts_used = Column(JSON, nullable=True)
    labor_cost = Column(Float, nullable=True)
    parts_cost = Column(Float, nullable=True)
    total_cost = Column(Float, nullable=True)

    # Maintenance outcomes
    issues_found = Column(Text, nullable=True)
    actions_taken = Column(Text, nullable=True)
    recommendations = Column(Text, nullable=True)
    next_maintenance_due = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)

    # Compliance tracking
    certification_valid = Column(Boolean, default=True)
    is_completed = Column(Boolean, default=False)

    # Record keeping
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    equipment = relationship("Equipment", back_populates="maintenance_logs")


class EquipmentUsageSession(Base):
    __tablename__ = "equipment_usage_sessions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    equipment_id = Column(String, ForeignKey("equipment.id"), nullable=False, index=True)
    reservation_id = Column(
        String, ForeignKey("equipment_reservations.id"), nullable=True, index=True
    )

    # User context
    user_id = Column(String, nullable=False, index=True)
    user_name = Column(String(255), nullable=False)

    # Timing
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    duration_hours = Column(Float, nullable=True)

    # Project linkage
    project_id = Column(String, nullable=True)
    project_name = Column(String(255), nullable=True)

    # Session details
    materials_used = Column(JSON, nullable=True)
    settings_used = Column(JSON, nullable=True)
    job_successful = Column(Boolean, nullable=True)
    output_quality = Column(String(32), nullable=True)
    issues_encountered = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)

    # Metrics
    power_consumed_kwh = Column(Float, nullable=True)
    material_consumed = Column(JSON, nullable=True)
    efficiency_score = Column(Float, nullable=True)
    cost_incurred = Column(Float, nullable=True)

    # Record keeping
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    equipment = relationship("Equipment", back_populates="usage_sessions")
    reservation = relationship("EquipmentReservation", backref="usage_sessions")


# New: Equipment Rating model to back user ratings/feedback
class EquipmentRating(Base):
    __tablename__ = "equipment_ratings"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    equipment_id = Column(
        String, ForeignKey("equipment.id"), nullable=False, index=True
    )
    user_id = Column(String, nullable=False, index=True)
    user_name = Column(String(255), nullable=False)
    reservation_id = Column(
        String, ForeignKey("equipment_reservations.id"), nullable=True
    )

    overall_rating = Column(Integer, nullable=False)
    reliability_rating = Column(Integer, nullable=True)
    ease_of_use_rating = Column(Integer, nullable=True)
    condition_rating = Column(Integer, nullable=True)

    feedback_text = Column(Text, nullable=True)
    pros = Column(Text, nullable=True)
    cons = Column(Text, nullable=True)
    suggestions = Column(Text, nullable=True)
    issues_encountered = Column(Text, nullable=True)
    would_recommend = Column(Boolean, nullable=True)
    difficulty_level = Column(
        String(32), nullable=True
    )  # beginner|intermediate|advanced

    is_approved = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    admin_response = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    equipment = relationship("Equipment", backref="ratings")
    reservation = relationship("EquipmentReservation", backref="rating", uselist=False)
