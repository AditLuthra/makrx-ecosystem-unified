"""
Core feature flags definitions and models.
"""

from enum import Enum
from datetime import datetime, timezone
from typing import Dict, List, Optional, Set, Any
from pydantic import BaseModel, Field
import os
import json


class AccessLevel(str, Enum):
    """Feature access levels."""
    DISABLED = "disabled"              # Feature completely disabled
    BETA = "beta"                     # Beta users only
    PASSWORD_ONLY = "password_only"   # Requires specific password
    ROLE_BASED = "role_based"         # Based on user roles
    ENABLED = "enabled"               # Fully available
    A_B_TEST = "a_b_test"            # A/B testing enabled


class FeatureFlag(BaseModel):
    """Individual feature flag configuration."""
    key: str = Field(..., description="Unique feature identifier")
    name: str = Field(..., description="Human readable name")
    description: str = Field(..., description="Feature description")
    access_level: AccessLevel = Field(default=AccessLevel.DISABLED)
    
    # Access control
    allowed_roles: Set[str] = Field(default_factory=set)
    allowed_users: Set[str] = Field(default_factory=set)
    password: Optional[str] = Field(default=None)
    
    # A/B Testing
    ab_percentage: float = Field(default=0.0, ge=0.0, le=100.0)
    ab_variant: Optional[str] = Field(default=None)
    
    # Scheduling
    start_date: Optional[datetime] = Field(default=None)
    end_date: Optional[datetime] = Field(default=None)
    
    # Metadata
    created_by: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    tags: Set[str] = Field(default_factory=set)
    
    # Dependencies
    depends_on: Set[str] = Field(default_factory=set)  # Other feature keys
    conflicts_with: Set[str] = Field(default_factory=set)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            set: lambda v: list(v)
        }
    
    def is_active(self, 
                  user_id: Optional[str] = None,
                  user_roles: Optional[Set[str]] = None,
                  password: Optional[str] = None,
                  check_dependencies: bool = True) -> bool:
        """Check if feature is active for given context."""
        
        # Check if feature is disabled
        if self.access_level == AccessLevel.DISABLED:
            return False
        
        # Check date constraints
        now = datetime.now(timezone.utc)
        if self.start_date and now < self.start_date:
            return False
        if self.end_date and now > self.end_date:
            return False
        
        # Check access level
        if self.access_level == AccessLevel.ENABLED:
            return True
            
        if self.access_level == AccessLevel.BETA:
            if not user_roles or "beta_user" not in user_roles:
                return False
                
        if self.access_level == AccessLevel.PASSWORD_ONLY:
            if not password or password != self.password:
                return False
                
        if self.access_level == AccessLevel.ROLE_BASED:
            if not user_roles or not self.allowed_roles.intersection(user_roles):
                # Also check if user is explicitly allowed
                if not user_id or user_id not in self.allowed_users:
                    return False
                    
        if self.access_level == AccessLevel.A_B_TEST:
            if not user_id:
                return False
            # Simple hash-based assignment
            user_hash = hash(user_id + self.key) % 100
            if user_hash >= self.ab_percentage:
                return False
        
        return True
    
    def update_timestamp(self):
        """Update the updated_at timestamp."""
        self.updated_at = datetime.now(timezone.utc)


class FeatureFlags:
    """Central feature flags manager."""
    
    # Core Platform Features
    CORE_FEATURES = {
        # Authentication & User Management
        "USER_REGISTRATION": FeatureFlag(
            key="USER_REGISTRATION",
            name="User Registration",
            description="Allow new user registration",
            access_level=AccessLevel.ENABLED,
            tags={"core", "auth"}
        ),
        "GUEST_CHECKOUT": FeatureFlag(
            key="GUEST_CHECKOUT",
            name="Guest Checkout",
            description="Allow checkout without registration",
            access_level=AccessLevel.ENABLED,
            tags={"core", "checkout"}
        ),
        "SOCIAL_LOGIN": FeatureFlag(
            key="SOCIAL_LOGIN",
            name="Social Media Login",
            description="Login with Google, Facebook, etc.",
            access_level=AccessLevel.BETA,
            tags={"auth", "social"}
        ),
        
        # 3D Printing Services
        "SERVICE_3D_PRINTING": FeatureFlag(
            key="SERVICE_3D_PRINTING",
            name="3D Printing Services",
            description="Complete 3D printing service platform",
            access_level=AccessLevel.ENABLED,
            tags={"service", "3d-printing", "core"}
        ),
        "3D_PRINT_MATERIAL_CALCULATOR": FeatureFlag(
            key="3D_PRINT_MATERIAL_CALCULATOR",
            name="Material Cost Calculator",
            description="Advanced material cost calculation for 3D printing",
            access_level=AccessLevel.ENABLED,
            tags={"3d-printing", "calculator"}
        ),
        "3D_PRINT_BULK_ORDERS": FeatureFlag(
            key="3D_PRINT_BULK_ORDERS",
            name="Bulk 3D Printing Orders",
            description="Support for bulk printing orders with discounts",
            access_level=AccessLevel.BETA,
            tags={"3d-printing", "bulk"}
        ),
        "3D_PRINT_RUSH_ORDERS": FeatureFlag(
            key="3D_PRINT_RUSH_ORDERS",
            name="Rush 3D Printing Orders",
            description="Expedited printing with premium pricing",
            access_level=AccessLevel.ENABLED,
            tags={"3d-printing", "rush"}
        ),
        
        # Laser Engraving Services
        "SERVICE_LASER_ENGRAVING": FeatureFlag(
            key="SERVICE_LASER_ENGRAVING",
            name="Laser Engraving Services",
            description="Laser cutting and engraving services",
            access_level=AccessLevel.ENABLED,
            tags={"service", "laser", "core"}
        ),
        "LASER_CUSTOM_MATERIALS": FeatureFlag(
            key="LASER_CUSTOM_MATERIALS",
            name="Custom Material Support",
            description="Support for custom materials in laser services",
            access_level=AccessLevel.BETA,
            tags={"laser", "materials"}
        ),
        
        # CNC Services
        "SERVICE_CNC": FeatureFlag(
            key="SERVICE_CNC",
            name="CNC Machining Services",
            description="CNC milling and turning services",
            access_level=AccessLevel.BETA,
            tags={"service", "cnc"}
        ),
        "CNC_CUSTOM_TOOLING": FeatureFlag(
            key="CNC_CUSTOM_TOOLING",
            name="Custom CNC Tooling",
            description="Support for custom tooling in CNC operations",
            access_level=AccessLevel.PASSWORD_ONLY,
            password="cnc-tools-2024",
            tags={"cnc", "tooling"}
        ),
        
        # Injection Molding
        "SERVICE_INJECTION_MOLDING": FeatureFlag(
            key="SERVICE_INJECTION_MOLDING",
            name="Injection Molding Services",
            description="Plastic injection molding services",
            access_level=AccessLevel.PASSWORD_ONLY,
            password="injection-beta-2024",
            tags={"service", "injection-molding"}
        ),
        
        # File Processing
        "FILE_UPLOAD_3D": FeatureFlag(
            key="FILE_UPLOAD_3D",
            name="3D File Upload",
            description="Upload and process STL, OBJ, 3MF files",
            access_level=AccessLevel.ENABLED,
            tags={"file-processing", "3d"}
        ),
        "FILE_UPLOAD_2D": FeatureFlag(
            key="FILE_UPLOAD_2D",
            name="2D File Upload",
            description="Upload and process SVG, DXF, AI files",
            access_level=AccessLevel.ENABLED,
            tags={"file-processing", "2d"}
        ),
        "FILE_PREVIEW_3D": FeatureFlag(
            key="FILE_PREVIEW_3D",
            name="3D File Preview",
            description="Interactive 3D model preview",
            access_level=AccessLevel.ENABLED,
            tags={"file-processing", "preview", "3d"}
        ),
        "FILE_ANALYSIS": FeatureFlag(
            key="FILE_ANALYSIS",
            name="Advanced File Analysis",
            description="Volume, surface area, complexity analysis",
            access_level=AccessLevel.ENABLED,
            tags={"file-processing", "analysis"}
        ),
        "FILE_AUTO_REPAIR": FeatureFlag(
            key="FILE_AUTO_REPAIR",
            name="Automatic File Repair",
            description="Automatically fix common file issues",
            access_level=AccessLevel.BETA,
            tags={"file-processing", "repair"}
        ),
        
        # Provider Features
        "PROVIDER_DASHBOARD": FeatureFlag(
            key="PROVIDER_DASHBOARD",
            name="Provider Dashboard",
            description="Complete provider management interface",
            access_level=AccessLevel.ENABLED,
            allowed_roles={"provider", "admin"},
            tags={"provider", "dashboard"}
        ),
        "PROVIDER_REAL_TIME_JOBS": FeatureFlag(
            key="PROVIDER_REAL_TIME_JOBS",
            name="Real-Time Job Notifications",
            description="WebSocket-based job notifications",
            access_level=AccessLevel.ENABLED,
            allowed_roles={"provider", "admin"},
            tags={"provider", "realtime"}
        ),
        "PROVIDER_INVENTORY_MANAGEMENT": FeatureFlag(
            key="PROVIDER_INVENTORY_MANAGEMENT",
            name="Inventory Management",
            description="Material tracking and management",
            access_level=AccessLevel.ENABLED,
            allowed_roles={"provider", "admin"},
            tags={"provider", "inventory"}
        ),
        "PROVIDER_ANALYTICS": FeatureFlag(
            key="PROVIDER_ANALYTICS",
            name="Provider Analytics",
            description="Performance metrics and analytics",
            access_level=AccessLevel.BETA,
            allowed_roles={"provider", "admin"},
            tags={"provider", "analytics"}
        ),
        "PROVIDER_MULTI_SERVICE": FeatureFlag(
            key="PROVIDER_MULTI_SERVICE",
            name="Multi-Service Providers",
            description="Providers can offer multiple service types",
            access_level=AccessLevel.BETA,
            allowed_roles={"provider", "admin"},
            tags={"provider", "multi-service"}
        ),
        
        # Order Management
        "CROSS_PLATFORM_ORDERS": FeatureFlag(
            key="CROSS_PLATFORM_ORDERS",
            name="Cross-Platform Order Sync",
            description="Sync orders between services and main store",
            access_level=AccessLevel.ENABLED,
            tags={"orders", "sync", "core"}
        ),
        "REAL_TIME_ORDER_UPDATES": FeatureFlag(
            key="REAL_TIME_ORDER_UPDATES",
            name="Real-Time Order Updates",
            description="Live order status updates via WebSocket",
            access_level=AccessLevel.ENABLED,
            tags={"orders", "realtime"}
        ),
        "ORDER_TRACKING_ADVANCED": FeatureFlag(
            key="ORDER_TRACKING_ADVANCED",
            name="Advanced Order Tracking",
            description="Detailed tracking with photos and updates",
            access_level=AccessLevel.ENABLED,
            tags={"orders", "tracking"}
        ),
        "ORDER_MODIFICATION": FeatureFlag(
            key="ORDER_MODIFICATION",
            name="Order Modification",
            description="Allow order changes before production",
            access_level=AccessLevel.BETA,
            tags={"orders", "modification"}
        ),
        
        # Pricing & Payments
        "DYNAMIC_PRICING": FeatureFlag(
            key="DYNAMIC_PRICING",
            name="Dynamic Pricing Engine",
            description="AI-powered dynamic pricing",
            access_level=AccessLevel.ENABLED,
            tags={"pricing", "core"}
        ),
        "BULK_PRICING": FeatureFlag(
            key="BULK_PRICING",
            name="Bulk Order Pricing",
            description="Automatic discounts for bulk orders",
            access_level=AccessLevel.ENABLED,
            tags={"pricing", "bulk"}
        ),
        "SUBSCRIPTION_PRICING": FeatureFlag(
            key="SUBSCRIPTION_PRICING",
            name="Subscription Plans",
            description="Monthly subscription plans for services",
            access_level=AccessLevel.BETA,
            tags={"pricing", "subscription"}
        ),
        
        # Communication
        "CUSTOMER_PROVIDER_CHAT": FeatureFlag(
            key="CUSTOMER_PROVIDER_CHAT",
            name="Customer-Provider Chat",
            description="Direct messaging between customers and providers",
            access_level=AccessLevel.ENABLED,
            tags={"communication", "chat"}
        ),
        "VIDEO_CONSULTATIONS": FeatureFlag(
            key="VIDEO_CONSULTATIONS",
            name="Video Consultations",
            description="Video calls for complex projects",
            access_level=AccessLevel.BETA,
            tags={"communication", "video"}
        ),
        "PHOTO_UPDATES": FeatureFlag(
            key="PHOTO_UPDATES",
            name="Photo Progress Updates",
            description="Providers can share progress photos",
            access_level=AccessLevel.ENABLED,
            tags={"communication", "photos"}
        ),
        
        # Quality & Reviews
        "REVIEW_SYSTEM": FeatureFlag(
            key="REVIEW_SYSTEM",
            name="Review & Rating System",
            description="Customer reviews and provider ratings",
            access_level=AccessLevel.ENABLED,
            tags={"quality", "reviews"}
        ),
        "QUALITY_ASSURANCE": FeatureFlag(
            key="QUALITY_ASSURANCE",
            name="Quality Assurance Checks",
            description="Automated quality validation",
            access_level=AccessLevel.BETA,
            tags={"quality", "assurance"}
        ),
        "DISPUTE_RESOLUTION": FeatureFlag(
            key="DISPUTE_RESOLUTION",
            name="Dispute Resolution System",
            description="Structured dispute handling process",
            access_level=AccessLevel.BETA,
            tags={"quality", "disputes"}
        ),
        
        # Admin Features
        "ADMIN_FEATURE_FLAGS": FeatureFlag(
            key="ADMIN_FEATURE_FLAGS",
            name="Feature Flag Management",
            description="Admin interface for managing feature flags",
            access_level=AccessLevel.ROLE_BASED,
            allowed_roles={"admin", "super_admin"},
            tags={"admin", "flags"}
        ),
        "ADMIN_ANALYTICS": FeatureFlag(
            key="ADMIN_ANALYTICS",
            name="Platform Analytics",
            description="Comprehensive platform analytics dashboard",
            access_level=AccessLevel.ROLE_BASED,
            allowed_roles={"admin", "super_admin"},
            tags={"admin", "analytics"}
        ),
        "ADMIN_USER_MANAGEMENT": FeatureFlag(
            key="ADMIN_USER_MANAGEMENT",
            name="User Management",
            description="Advanced user management tools",
            access_level=AccessLevel.ROLE_BASED,
            allowed_roles={"admin", "super_admin"},
            tags={"admin", "users"}
        ),
        
        # Experimental Features
        "AI_DESIGN_SUGGESTIONS": FeatureFlag(
            key="AI_DESIGN_SUGGESTIONS",
            name="AI Design Suggestions",
            description="AI-powered design optimization suggestions",
            access_level=AccessLevel.PASSWORD_ONLY,
            password="ai-design-2024",
            tags={"experimental", "ai"}
        ),
        "AR_PREVIEW": FeatureFlag(
            key="AR_PREVIEW",
            name="AR Model Preview",
            description="Augmented reality model preview",
            access_level=AccessLevel.PASSWORD_ONLY,
            password="ar-preview-2024",
            tags={"experimental", "ar"}
        ),
        "BLOCKCHAIN_TRACKING": FeatureFlag(
            key="BLOCKCHAIN_TRACKING",
            name="Blockchain Order Tracking",
            description="Blockchain-based order verification",
            access_level=AccessLevel.DISABLED,
            tags={"experimental", "blockchain"}
        ),
    }
    
    def __init__(self, config_file: Optional[str] = None):
        """Initialize with optional config file override."""
        self.flags: Dict[str, FeatureFlag] = {}
        self.config_file = config_file or os.getenv("FEATURE_FLAGS_CONFIG")
        
        # Load default flags
        self.flags.update(self.CORE_FEATURES)
        
        # Load from config file if provided
        if self.config_file and os.path.exists(self.config_file):
            self.load_from_file(self.config_file)
    
    def load_from_file(self, file_path: str):
        """Load feature flags from JSON file."""
        try:
            with open(file_path, 'r') as f:
                config = json.load(f)
                for key, flag_data in config.items():
                    if isinstance(flag_data, dict):
                        flag = FeatureFlag(**flag_data)
                        self.flags[key] = flag
        except Exception as e:
            print(f"Error loading feature flags from {file_path}: {e}")
    
    def save_to_file(self, file_path: str):
        """Save current feature flags to JSON file."""
        config = {}
        for key, flag in self.flags.items():
            config[key] = flag.dict()
        
        with open(file_path, 'w') as f:
            json.dump(config, f, indent=2, default=str)
    
    def get_flag(self, key: str) -> Optional[FeatureFlag]:
        """Get a specific feature flag."""
        return self.flags.get(key)
    
    def set_flag(self, key: str, flag: FeatureFlag):
        """Set or update a feature flag."""
        flag.update_timestamp()
        self.flags[key] = flag
    
    def is_enabled(self, 
                   key: str,
                   user_id: Optional[str] = None,
                   user_roles: Optional[Set[str]] = None,
                   password: Optional[str] = None) -> bool:
        """Check if a feature is enabled."""
        flag = self.flags.get(key)
        if not flag:
            return False
        
        return flag.is_active(user_id, user_roles, password)
    
    def get_enabled_features(self,
                           user_id: Optional[str] = None,
                           user_roles: Optional[Set[str]] = None,
                           password: Optional[str] = None,
                           tags: Optional[Set[str]] = None) -> List[str]:
        """Get all enabled features for a user context."""
        enabled = []
        for key, flag in self.flags.items():
            if tags and not flag.tags.intersection(tags):
                continue
                
            if flag.is_active(user_id, user_roles, password):
                enabled.append(key)
        
        return enabled
    
    def get_flags_by_tag(self, tag: str) -> List[FeatureFlag]:
        """Get all flags with a specific tag."""
        return [flag for flag in self.flags.values() if tag in flag.tags]
    
    def get_beta_features(self) -> List[FeatureFlag]:
        """Get all beta features."""
        return [flag for flag in self.flags.values() 
                if flag.access_level == AccessLevel.BETA]
    
    def get_password_features(self) -> List[FeatureFlag]:
        """Get all password-protected features."""
        return [flag for flag in self.flags.values() 
                if flag.access_level == AccessLevel.PASSWORD_ONLY]


# Global feature flags instance
feature_flags = FeatureFlags()