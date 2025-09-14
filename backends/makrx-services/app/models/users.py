"""
User Database Models for Services Platform
"""

from sqlalchemy import Column, String, DateTime, Boolean
from datetime import datetime

from . import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)  # Keycloak user ID
    email = Column(String, nullable=False, unique=True, index=True)
    first_name = Column(String)
    last_name = Column(String)
    
    # Role information
    roles = Column(String)  # Comma-separated roles from Keycloak
    
    # Status
    is_active = Column(Boolean, nullable=False, default=True)
    
    # Timestamps
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime)