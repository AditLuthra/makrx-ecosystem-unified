"""
Database Models for MakrX Services
"""

from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# Import all models to register them with SQLAlchemy
from .orders import ServiceOrder, StatusUpdate, Quote
from .providers import Provider, ProviderCapability, ProviderInventory
from .users import User