"""
MakrCave Database Models - Unified Ecosystem Version

This package contains all SQLAlchemy database models for the MakrCave application.
Models are automatically imported to ensure they're registered with SQLAlchemy.
"""

# Import all models to register them with SQLAlchemy Base
from .inventory import *
from .equipment import *
from .project import *
from .billing import *
from .equipment_reservations import *
from .announcements import *
from .notifications import *
from .analytics import *
from .collaboration import *
from .filament_tracking import *
from .job_management import *
from .machine_access import *
from .makerspace_settings import *
from .membership_plans import *
from .skill import *
from .access_control import *
from .enhanced_analytics import *
from .enhanced_bom import *
from .enhanced_member import *
from .invites import *
