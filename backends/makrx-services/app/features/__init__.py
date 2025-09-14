"""
Feature flags system for MakrX Services Platform.
Provides centralized control over feature availability with multiple access levels.
"""

from .flags import FeatureFlags, AccessLevel, FeatureFlag
from .middleware import FeatureFlagMiddleware
from .decorators import feature_required, beta_access_required, password_access_required
from .manager import FeatureFlagManager

__all__ = [
    'FeatureFlags',
    'AccessLevel', 
    'FeatureFlag',
    'FeatureFlagMiddleware',
    'feature_required',
    'beta_access_required', 
    'password_access_required',
    'FeatureFlagManager'
]