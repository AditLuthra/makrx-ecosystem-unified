"""Service Provider Models for 3D Printing and Engraving Services"""

from sqlalchemy import (
    Column,
    String,
    Text,
    Integer,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Enum as SQLEnum,
    JSON,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from typing import Optional, Dict, Any

from base import Base


class ServiceType(str, enum.Enum):
    PRINTING = "printing"
    ENGRAVING = "engraving"


class ProviderStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"


class JobStatus(str, enum.Enum):
    CREATED = "created"
    DISPATCHED = "dispatched"
    ACCEPTED = "accepted"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class Provider(Base):
    """Service Provider Entity"""

    __tablename__ = "providers"

    id = Column(
        String,
        primary_key=True,
        default=lambda: f"prv_{func.gen_random_uuid()}",
    )
    user_id = Column(String, nullable=False)  # Link to user account
    business_name = Column(String(255), nullable=False)
    contact_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    phone = Column(String(50))

    # Location
    address = Column(Text)
    city = Column(String(100))
    state = Column(String(100))
    postal_code = Column(String(20))
    country = Column(String(100))
    latitude = Column(Float)
    longitude = Column(Float)

    # Business Info
    description = Column(Text)
    website = Column(String(255))
    logo_url = Column(String(500))

    # Service Capabilities
    services = Column(JSON)  # {"printing": True, "engraving": True}
    materials = Column(JSON)  # List of supported materials
    max_dimensions = Column(JSON)  # {"x": 200, "y": 200, "z": 200} in mm
    min_layer_height = Column(Float)  # for 3D printing

    # Business Metrics
    rating = Column(Float, default=0.0)
    total_jobs = Column(Integer, default=0)
    completed_jobs = Column(Integer, default=0)
    response_time_minutes = Column(
        Integer, default=30
    )  # average response time

    # Status and Verification
    status = Column(SQLEnum(ProviderStatus), default=ProviderStatus.ACTIVE)
    verified = Column(Boolean, default=False)
    verification_date = Column(DateTime)

    # Operational
    auto_accept_jobs = Column(Boolean, default=False)
    max_concurrent_jobs = Column(Integer, default=5)
    working_hours = Column(
        JSON
    )  # {"monday": {"start": "09:00", "end": "17:00"}}

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    inventory_items = relationship(
        "ProviderInventory", back_populates="provider"
    )
    service_orders = relationship("ServiceOrder", back_populates="provider")


class ProviderInventory(Base):
    """Provider Material Inventory"""

    __tablename__ = "provider_inventory"

    id = Column(
        String,
        primary_key=True,
        default=lambda: f"inv_{func.gen_random_uuid()}",
    )
    provider_id = Column(String, ForeignKey("providers.id"), nullable=False)

    # Material Info
    material_type = Column(
        String(100), nullable=False
    )  # "pla", "abs", "wood-mdf", etc.
    color_finish = Column(
        String(100)
    )  # color for printing, finish for engraving
    brand = Column(String(100))
    grade = Column(String(50))  # "premium", "standard", "economy"

    # Inventory
    current_stock = Column(
        Float, nullable=False
    )  # kg for printing, m² for engraving
    reserved_stock = Column(
        Float, default=0.0
    )  # temporarily allocated to jobs
    minimum_stock = Column(Float, default=0.0)  # reorder threshold
    cost_per_unit = Column(Float, nullable=False)  # cost to provider

    # Material Properties
    properties = Column(JSON)  # density, temperature, etc.

    # Reorder Info
    supplier_name = Column(String(255))
    supplier_url = Column(
        String(500)
    )  # Link back to MakrX.Store for reordering
    reorder_quantity = Column(Float)
    last_reorder_date = Column(DateTime)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    provider = relationship("Provider", back_populates="inventory_items")
    provider = relationship("Provider", back_populates="service_orders")


class JobDispatch(Base):
    """Job Dispatch Events - tracks which providers were notified"""

    __tablename__ = "job_dispatches"

    id = Column(
        String,
        primary_key=True,
        default=lambda: f"jd_{func.gen_random_uuid()}",
    )
    service_order_id = Column(
        String, ForeignKey("service_orders.id"), nullable=False
    )
    provider_id = Column(String, ForeignKey("providers.id"), nullable=False)

    # Dispatch Info
    dispatched_at = Column(DateTime, server_default=func.now())
    notification_method = Column(String(50))  # "email", "push", "sms"

    # Response Tracking
    viewed_at = Column(DateTime)
    responded_at = Column(DateTime)
    response = Column(String(20))  # "accepted", "declined", "ignored"
    response_reason = Column(String(255))

    # Provider Context at Dispatch Time
    provider_rating = Column(Float)
    provider_capacity = Column(Integer)  # available slots at dispatch time
    estimated_response_time = Column(Integer)  # minutes

    created_at = Column(DateTime, server_default=func.now())


class ProviderReview(Base):
    """Customer Reviews for Providers"""

    __tablename__ = "provider_reviews"

    id = Column(
        String,
        primary_key=True,
        default=lambda: f"rv_{func.gen_random_uuid()}",
    )
    service_order_id = Column(
        String, ForeignKey("service_orders.id"), nullable=False
    )
    customer_id = Column(String, nullable=False)
    provider_id = Column(String, ForeignKey("providers.id"), nullable=False)

    # Review Content
    rating = Column(Integer, nullable=False)  # 1-5 stars
    title = Column(String(255))
    review_text = Column(Text)

    # Aspects
    quality_rating = Column(Integer)
    speed_rating = Column(Integer)
    communication_rating = Column(Integer)
    value_rating = Column(Integer)

    # Photos
    review_images = Column(JSON, default=list)

    # Verification
    verified_purchase = Column(Boolean, default=True)
    helpful_votes = Column(Integer, default=0)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )


class MaterialCatalog(Base):
    """Master catalog of materials with properties and pricing"""

    __tablename__ = "material_catalog"

    id = Column(
        String,
        primary_key=True,
        default=lambda: f"mat_{func.gen_random_uuid()}",
    )

    # Basic Info
    material_id = Column(
        String(100), unique=True, nullable=False
    )  # "pla", "abs", etc.
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)  # "printing", "engraving"
    subcategory = Column(String(100))  # "filament", "resin", "wood", etc.

    # Physical Properties
    density = Column(Float)  # g/cm³
    melting_point = Column(Integer)  # °C
    glass_transition = Column(Integer)  # °C

    # Printing Properties (for 3D materials)
    print_temperature = Column(Integer)  # °C
    bed_temperature = Column(Integer)  # °C
    supports_required = Column(Boolean, default=False)
    difficulty_level = Column(Integer, default=1)  # 1-5

    # Engraving Properties (for 2D materials)
    laser_settings = Column(JSON)  # power, speed settings
    thickness_options = Column(JSON)  # available thicknesses

    # Pricing and Availability
    base_cost = Column(Float, nullable=False)  # base cost to providers
    markup_percentage = Column(Float, default=0.3)  # platform markup
    available_colors = Column(JSON, default=list)
    available_finishes = Column(JSON, default=list)

    # Marketplace Integration
    store_product_id = Column(String)  # Link to MakrX.Store product
    reorder_url = Column(String(500))  # Direct reorder link

    # Status
    is_active = Column(Boolean, default=True)
    is_premium = Column(Boolean, default=False)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )
