"""
Service Orders Database Models
"""

from sqlalchemy import Column, String, Integer, Float, DateTime, Text, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from . import Base

class ServiceOrder(Base):
    __tablename__ = "service_orders"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False, index=True)
    service_type = Column(String, nullable=False)  # 'printing', 'engraving', 'cnc', etc.
    status = Column(String, nullable=False, default='pending', index=True)
    priority = Column(String, nullable=False, default='normal')  # 'normal', 'rush'
    
    # File information
    file_name = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    file_type = Column(String, nullable=False)
    file_url = Column(String)
    preview_url = Column(String)
    
    # Service specifications
    material = Column(String, nullable=False)
    color_finish = Column(String)
    quantity = Column(Integer, nullable=False, default=1)
    dimensions_x = Column(Float)
    dimensions_y = Column(Float)
    dimensions_z = Column(Float)
    
    # Pricing
    base_price = Column(Float, nullable=False)
    material_cost = Column(Float, nullable=False, default=0)
    labor_cost = Column(Float, nullable=False, default=0)
    setup_fee = Column(Float, nullable=False, default=0)
    rush_fee = Column(Float, nullable=False, default=0)
    total_price = Column(Float, nullable=False)
    
    # Provider assignment
    provider_id = Column(String, ForeignKey('providers.id'), index=True)
    estimated_completion = Column(DateTime)
    dispatched_at = Column(DateTime)
    accepted_at = Column(DateTime)
    completed_at = Column(DateTime)
    delivered_at = Column(DateTime)
    
    # Communication
    customer_notes = Column(Text)
    provider_notes = Column(Text)
    
    # Cross-platform integration
    store_order_id = Column(String, index=True)  # Links to main makrx-store order
    sync_status = Column(String, nullable=False, default='pending')  # 'pending', 'synced', 'error'
    
    # Timestamps
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    provider = relationship("Provider", back_populates="orders")
    status_updates = relationship("StatusUpdate", back_populates="order", order_by="StatusUpdate.timestamp.desc()")
    quotes = relationship("Quote", back_populates="order")

class StatusUpdate(Base):
    __tablename__ = "status_updates"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String, ForeignKey('service_orders.id'), nullable=False, index=True)
    status = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    user_type = Column(String, nullable=False)  # 'customer', 'provider', 'system'
    images = Column(JSON)  # Array of image URLs
    
    # Relationships
    order = relationship("ServiceOrder", back_populates="status_updates")

class Quote(Base):
    __tablename__ = "quotes"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    service_order_id = Column(String, ForeignKey('service_orders.id'), nullable=False, index=True)
    
    # Pricing breakdown
    base_price = Column(Float, nullable=False)
    material_cost = Column(Float, nullable=False)
    labor_cost = Column(Float, nullable=False)
    setup_fee = Column(Float, nullable=False)
    rush_fee = Column(Float, nullable=False, default=0)
    total_price = Column(Float, nullable=False)
    
    # Timeline
    estimated_completion = Column(String, nullable=False)
    valid_until = Column(DateTime, nullable=False)
    
    # Analysis breakdown
    breakdown = Column(JSON)  # Detailed analysis data
    
    # Status
    status = Column(String, nullable=False, default='pending')  # 'pending', 'accepted', 'rejected', 'expired'
    
    # Timestamps
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    accepted_at = Column(DateTime)
    
    # Relationships
    order = relationship("ServiceOrder", back_populates="quotes")