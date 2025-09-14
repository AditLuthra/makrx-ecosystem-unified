"""
Feature flag management system for runtime control and administration.
"""

import os
import json
import asyncio
from datetime import datetime, timezone
from typing import Dict, List, Optional, Set, Any
from pathlib import Path

from .flags import FeatureFlags, FeatureFlag, AccessLevel, feature_flags


class FeatureFlagManager:
    """
    Advanced feature flag management with persistence, caching, and real-time updates.
    """
    
    def __init__(self, 
                 config_dir: Optional[str] = None,
                 auto_reload: bool = True,
                 reload_interval: int = 30):
        """
        Initialize feature flag manager.
        
        Args:
            config_dir: Directory to store feature flag configurations
            auto_reload: Whether to automatically reload config changes
            reload_interval: Seconds between config reloads
        """
        self.config_dir = Path(config_dir or os.getenv("FEATURE_FLAGS_DIR", "./config/features"))
        self.config_dir.mkdir(parents=True, exist_ok=True)
        
        self.config_file = self.config_dir / "feature_flags.json"
        self.overrides_file = self.config_dir / "overrides.json"
        self.analytics_file = self.config_dir / "analytics.json"
        
        self.auto_reload = auto_reload
        self.reload_interval = reload_interval
        self.last_reload = datetime.now(timezone.utc)
        
        # Runtime overrides (highest priority)
        self.runtime_overrides: Dict[str, FeatureFlag] = {}
        
        # Analytics data
        self.analytics_data = {
            'feature_usage': {},
            'user_access_patterns': {},
            'error_counts': {},
            'performance_metrics': {}
        }
        
        # Initialize
        self.load_configuration()
        
        if auto_reload:
            asyncio.create_task(self._auto_reload_task())
    
    async def _auto_reload_task(self):
        """Background task for auto-reloading configuration."""
        while True:
            try:
                await asyncio.sleep(self.reload_interval)
                await self.reload_if_changed()
            except Exception as e:
                print(f"Error in auto-reload task: {e}")
    
    def load_configuration(self):
        """Load feature flags from persistent storage."""
        # Load main configuration
        if self.config_file.exists():
            with open(self.config_file, 'r') as f:
                config = json.load(f)
                for key, flag_data in config.items():
                    if isinstance(flag_data, dict):
                        # Convert string sets back to sets
                        for set_field in ['allowed_roles', 'allowed_users', 'tags', 'depends_on', 'conflicts_with']:
                            if set_field in flag_data and isinstance(flag_data[set_field], list):
                                flag_data[set_field] = set(flag_data[set_field])
                        
                        # Convert datetime strings back to datetime objects
                        for date_field in ['start_date', 'end_date', 'created_at', 'updated_at']:
                            if flag_data.get(date_field):
                                flag_data[date_field] = datetime.fromisoformat(
                                    flag_data[date_field].replace('Z', '+00:00')
                                )
                        
                        flag = FeatureFlag(**flag_data)
                        feature_flags.set_flag(key, flag)
        
        # Load overrides
        if self.overrides_file.exists():
            with open(self.overrides_file, 'r') as f:
                overrides = json.load(f)
                for key, flag_data in overrides.items():
                    if isinstance(flag_data, dict):
                        # Apply same conversions as above
                        for set_field in ['allowed_roles', 'allowed_users', 'tags', 'depends_on', 'conflicts_with']:
                            if set_field in flag_data and isinstance(flag_data[set_field], list):
                                flag_data[set_field] = set(flag_data[set_field])
                        
                        for date_field in ['start_date', 'end_date', 'created_at', 'updated_at']:
                            if flag_data.get(date_field):
                                flag_data[date_field] = datetime.fromisoformat(
                                    flag_data[date_field].replace('Z', '+00:00')
                                )
                        
                        flag = FeatureFlag(**flag_data)
                        self.runtime_overrides[key] = flag
        
        # Load analytics
        if self.analytics_file.exists():
            with open(self.analytics_file, 'r') as f:
                self.analytics_data.update(json.load(f))
    
    def save_configuration(self):
        """Save current feature flags to persistent storage."""
        # Save main configuration
        config = {}
        for key, flag in feature_flags.flags.items():
            config[key] = flag.dict()
        
        with open(self.config_file, 'w') as f:
            json.dump(config, f, indent=2, default=str)
        
        # Save overrides
        overrides = {}
        for key, flag in self.runtime_overrides.items():
            overrides[key] = flag.dict()
        
        with open(self.overrides_file, 'w') as f:
            json.dump(overrides, f, indent=2, default=str)
        
        # Save analytics
        with open(self.analytics_file, 'w') as f:
            json.dump(self.analytics_data, f, indent=2, default=str)
    
    async def reload_if_changed(self):
        """Reload configuration if files have changed."""
        if self.config_file.exists():
            file_mtime = datetime.fromtimestamp(
                self.config_file.stat().st_mtime, tz=timezone.utc
            )
            if file_mtime > self.last_reload:
                self.load_configuration()
                self.last_reload = datetime.now(timezone.utc)
                print("Feature flags configuration reloaded")
    
    def get_effective_flag(self, key: str) -> Optional[FeatureFlag]:
        """Get effective feature flag considering all override levels."""
        # Runtime overrides have highest priority
        if key in self.runtime_overrides:
            return self.runtime_overrides[key]
        
        # Then regular flags
        return feature_flags.get_flag(key)
    
    def set_runtime_override(self, key: str, flag: FeatureFlag, persist: bool = False):
        """Set a runtime override for a feature flag."""
        flag.update_timestamp()
        self.runtime_overrides[key] = flag
        
        if persist:
            self.save_configuration()
        
        # Log the change
        self.log_flag_change(key, 'runtime_override', flag.access_level.value)
    
    def remove_runtime_override(self, key: str, persist: bool = False):
        """Remove a runtime override."""
        if key in self.runtime_overrides:
            del self.runtime_overrides[key]
            
            if persist:
                self.save_configuration()
            
            self.log_flag_change(key, 'override_removed', 'default')
    
    def update_flag(self, key: str, **updates):
        """Update a feature flag with new values."""
        flag = self.get_effective_flag(key)
        if not flag:
            raise ValueError(f"Feature flag '{key}' not found")
        
        # Create updated flag
        flag_data = flag.dict()
        flag_data.update(updates)
        
        # Handle set fields properly
        for set_field in ['allowed_roles', 'allowed_users', 'tags', 'depends_on', 'conflicts_with']:
            if set_field in flag_data and isinstance(flag_data[set_field], list):
                flag_data[set_field] = set(flag_data[set_field])
        
        updated_flag = FeatureFlag(**flag_data)
        updated_flag.update_timestamp()
        
        # Update in appropriate location
        if key in self.runtime_overrides:
            self.runtime_overrides[key] = updated_flag
        else:
            feature_flags.set_flag(key, updated_flag)
        
        # Log the change
        self.log_flag_change(key, 'updated', updated_flag.access_level.value)
        
        return updated_flag
    
    def bulk_update_access_level(self, 
                                flags_with_levels: Dict[str, AccessLevel],
                                persist: bool = True):
        """Bulk update access levels for multiple flags."""
        updated_flags = []
        
        for flag_key, new_level in flags_with_levels.items():
            try:
                updated_flag = self.update_flag(flag_key, access_level=new_level)
                updated_flags.append(flag_key)
            except Exception as e:
                print(f"Error updating flag {flag_key}: {e}")
        
        if persist:
            self.save_configuration()
        
        return updated_flags
    
    def enable_beta_features_for_user(self, user_id: str, feature_keys: List[str]):
        """Enable specific beta features for a user."""
        for key in feature_keys:
            flag = self.get_effective_flag(key)
            if flag and flag.access_level == AccessLevel.BETA:
                updated_flag = self.update_flag(
                    key,
                    allowed_users=flag.allowed_users | {user_id}
                )
                self.log_flag_change(key, 'user_beta_access', user_id)
    
    def create_feature_flag(self, 
                           key: str,
                           name: str,
                           description: str,
                           access_level: AccessLevel = AccessLevel.DISABLED,
                           **kwargs) -> FeatureFlag:
        """Create a new feature flag."""
        if feature_flags.get_flag(key) or key in self.runtime_overrides:
            raise ValueError(f"Feature flag '{key}' already exists")
        
        flag_data = {
            'key': key,
            'name': name,
            'description': description,
            'access_level': access_level,
            **kwargs
        }
        
        flag = FeatureFlag(**flag_data)
        feature_flags.set_flag(key, flag)
        
        self.log_flag_change(key, 'created', access_level.value)
        
        return flag
    
    def delete_feature_flag(self, key: str):
        """Delete a feature flag."""
        if key in feature_flags.flags:
            del feature_flags.flags[key]
        
        if key in self.runtime_overrides:
            del self.runtime_overrides[key]
        
        self.log_flag_change(key, 'deleted', 'removed')
    
    def get_flags_summary(self) -> Dict[str, Any]:
        """Get summary of all feature flags."""
        all_flags = {}
        
        # Start with base flags
        for key, flag in feature_flags.flags.items():
            all_flags[key] = flag
        
        # Apply overrides
        for key, flag in self.runtime_overrides.items():
            all_flags[key] = flag
        
        summary = {
            'total_flags': len(all_flags),
            'by_access_level': {},
            'by_tag': {},
            'flags': {}
        }
        
        for key, flag in all_flags.items():
            # Count by access level
            level = flag.access_level.value
            summary['by_access_level'][level] = summary['by_access_level'].get(level, 0) + 1
            
            # Count by tags
            for tag in flag.tags:
                summary['by_tag'][tag] = summary['by_tag'].get(tag, 0) + 1
            
            # Flag details
            summary['flags'][key] = {
                'name': flag.name,
                'access_level': flag.access_level.value,
                'tags': list(flag.tags),
                'updated_at': flag.updated_at.isoformat(),
                'has_override': key in self.runtime_overrides
            }
        
        return summary
    
    def get_user_accessible_features(self,
                                   user_id: Optional[str] = None,
                                   user_roles: Optional[Set[str]] = None,
                                   password: Optional[str] = None) -> Dict[str, Any]:
        """Get detailed information about features accessible to a user."""
        accessible = {
            'enabled': [],
            'beta': [],
            'password_protected': [],
            'role_restricted': [],
            'disabled': [],
            'total': 0
        }
        
        all_flags = {}
        for key, flag in feature_flags.flags.items():
            all_flags[key] = flag
        for key, flag in self.runtime_overrides.items():
            all_flags[key] = flag
        
        for key, flag in all_flags.items():
            accessible['total'] += 1
            
            if flag.is_active(user_id, user_roles, password):
                if flag.access_level == AccessLevel.ENABLED:
                    accessible['enabled'].append(key)
                elif flag.access_level == AccessLevel.BETA:
                    accessible['beta'].append(key)
                elif flag.access_level == AccessLevel.PASSWORD_ONLY:
                    accessible['password_protected'].append(key)
                elif flag.access_level == AccessLevel.ROLE_BASED:
                    accessible['role_restricted'].append(key)
            else:
                accessible['disabled'].append(key)
        
        return accessible
    
    def log_flag_change(self, key: str, action: str, value: str):
        """Log feature flag changes for audit trail."""
        timestamp = datetime.now(timezone.utc).isoformat()
        
        if 'change_log' not in self.analytics_data:
            self.analytics_data['change_log'] = []
        
        self.analytics_data['change_log'].append({
            'timestamp': timestamp,
            'flag_key': key,
            'action': action,
            'value': value
        })
        
        # Keep only last 1000 log entries
        if len(self.analytics_data['change_log']) > 1000:
            self.analytics_data['change_log'] = self.analytics_data['change_log'][-1000:]
    
    def record_feature_usage(self, feature_key: str, user_id: str, success: bool = True):
        """Record feature usage for analytics."""
        if 'feature_usage' not in self.analytics_data:
            self.analytics_data['feature_usage'] = {}
        
        if feature_key not in self.analytics_data['feature_usage']:
            self.analytics_data['feature_usage'][feature_key] = {
                'total_requests': 0,
                'successful_requests': 0,
                'unique_users': set(),
                'last_used': None
            }
        
        usage = self.analytics_data['feature_usage'][feature_key]
        usage['total_requests'] += 1
        if success:
            usage['successful_requests'] += 1
        usage['unique_users'].add(user_id)
        usage['last_used'] = datetime.now(timezone.utc).isoformat()
        
        # Convert set to list for JSON serialization
        usage['unique_users'] = list(usage['unique_users'])
    
    def export_configuration(self, include_analytics: bool = False) -> Dict[str, Any]:
        """Export complete feature flag configuration."""
        export_data = {
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'flags': {},
            'overrides': {},
            'metadata': {
                'total_flags': len(feature_flags.flags),
                'total_overrides': len(self.runtime_overrides)
            }
        }
        
        # Export flags
        for key, flag in feature_flags.flags.items():
            export_data['flags'][key] = flag.dict()
        
        # Export overrides
        for key, flag in self.runtime_overrides.items():
            export_data['overrides'][key] = flag.dict()
        
        # Export analytics if requested
        if include_analytics:
            export_data['analytics'] = self.analytics_data
        
        return export_data
    
    def import_configuration(self, config_data: Dict[str, Any], merge: bool = True):
        """Import feature flag configuration."""
        if not merge:
            # Clear existing configuration
            feature_flags.flags.clear()
            self.runtime_overrides.clear()
        
        # Import flags
        if 'flags' in config_data:
            for key, flag_data in config_data['flags'].items():
                # Convert list fields back to sets
                for set_field in ['allowed_roles', 'allowed_users', 'tags', 'depends_on', 'conflicts_with']:
                    if set_field in flag_data and isinstance(flag_data[set_field], list):
                        flag_data[set_field] = set(flag_data[set_field])
                
                flag = FeatureFlag(**flag_data)
                feature_flags.set_flag(key, flag)
        
        # Import overrides
        if 'overrides' in config_data:
            for key, flag_data in config_data['overrides'].items():
                for set_field in ['allowed_roles', 'allowed_users', 'tags', 'depends_on', 'conflicts_with']:
                    if set_field in flag_data and isinstance(flag_data[set_field], list):
                        flag_data[set_field] = set(flag_data[set_field])
                
                flag = FeatureFlag(**flag_data)
                self.runtime_overrides[key] = flag
        
        # Save the imported configuration
        self.save_configuration()


# Global feature flag manager
feature_manager = FeatureFlagManager()