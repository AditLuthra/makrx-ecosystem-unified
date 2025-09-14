"""
Service Providers Database Models
"""

from sqlalchemy import Column, String, Integer, Float, DateTime, Text, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from . import Base

class Provider(Base):
    __tablename__ = "providers"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False, unique=True, index=True)  # Links to user account
    
    # Business information
    business_name = Column(String, nullable=False)
    contact_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String)
    address = Column(Text, nullable=False)
    
    # Operational details
    max_concurrent_jobs = Column(Integer, nullable=False, default=5)
    response_time_minutes = Column(Integer, nullable=False, default=30)
    working_hours = Column(String, nullable=False, default='9:00-18:00')
    available_capacity = Column(Integer, nullable=False, default=100)  # Percentage
    
    # Performance metrics
    total_jobs = Column(Integer, nullable=False, default=0)
    completed_jobs = Column(Integer, nullable=False, default=0)
    average_rating = Column(Float, nullable=False, default=5.0)
    total_reviews = Column(Integer, nullable=False, default=0)
    monthly_revenue = Column(Float, nullable=False, default=0)
    
    # Status
    is_active = Column(Boolean, nullable=False, default=True)
    is_verified = Column(Boolean, nullable=False, default=False)
    last_seen = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    # Notification preferences
    email_notifications = Column(Boolean, nullable=False, default=True)
    sms_notifications = Column(Boolean, nullable=False, default=False)
    
    # Timestamps
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    capabilities = relationship("ProviderCapability", back_populates="provider", cascade="all, delete-orphan")
    inventory = relationship("ProviderInventory", back_populates="provider", cascade="all, delete-orphan")
    orders = relationship("ServiceOrder", back_populates="provider")

class ProviderCapability(Base):
    __tablename__ = "provider_capabilities"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    provider_id = Column(String, ForeignKey('providers.id'), nullable=False, index=True)
    
    # Service capability
    service_type = Column(String, nullable=False)  # 'printing', 'engraving', 'cnc', etc.
    materials = Column(JSON, nullable=False)  # List of supported materials
    max_dimensions = Column(JSON)  # {'x': 200, 'y': 200, 'z': 200} in mm
    min_dimensions = Column(JSON)  # {'x': 1, 'y': 1, 'z': 0.1} in mm
    
    # Quality and features
    quality_levels = Column(JSON)  # ['draft', 'standard', 'high', 'ultra']
    special_features = Column(JSON)  # ['multi-color', 'support-free', etc.]
    
    # Pricing
    base_price_per_unit = Column(Float)  # Base pricing model
    setup_fee = Column(Float, nullable=False, default=0)
    
    # Status
    is_enabled = Column(Boolean, nullable=False, default=True)
    
    # Timestamps
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    provider = relationship("Provider", back_populates="capabilities")

class ProviderInventory(Base):
    __tablename__ = "provider_inventory"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    provider_id = Column(String, ForeignKey('providers.id'), nullable=False, index=True)
    
    # Material details
    material_type = Column(String, nullable=False)  # 'PLA', 'ABS', 'Wood', 'Acrylic', etc.
    color_finish = Column(String, nullable=False)  # 'Black', 'White', '3mm', etc.
    
    # Stock levels
    current_stock = Column(Float, nullable=False, default=0)  # Current available stock
    reserved_stock = Column(Float, nullable=False, default=0)  # Stock reserved for orders
    minimum_stock = Column(Float, nullable=False, default=1)  # Minimum stock level
    
    # Pricing and sourcing
    cost_per_unit = Column(Float, nullable=False)  # Cost per kg/liter/sheet
    reorder_url = Column(String)  # URL to reorder from MakrX Store
    supplier_name = Column(String)  # Supplier name
    
    # Status
    is_available = Column(Boolean, nullable=False, default=True)
    low_stock_alert_sent = Column(Boolean, nullable=False, default=False)
    
    # Timestamps
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_restock = Column(DateTime)
    
    # Relationships
    provider = relationship("Provider", back_populates="inventory")