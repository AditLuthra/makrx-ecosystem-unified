#!/usr/bin/env python3
"""
Feature Flag Management Script
Provides CLI interface for managing feature flags
"""

import asyncio
import json
import sys
import argparse
from pathlib import Path
from typing import Dict, List, Optional
import os

# Add the app directory to Python path
sys.path.append(str(Path(__file__).parent.parent))

from app.features import feature_manager, feature_flags, AccessLevel, FeatureFlag


class FeatureFlagCLI:
    """Command-line interface for feature flag management."""
    
    def __init__(self):
        self.manager = feature_manager
        
    def list_features(self, filter_tag: Optional[str] = None, 
                     filter_level: Optional[str] = None) -> None:
        """List all feature flags with optional filtering."""
        summary = self.manager.get_flags_summary()
        
        print(f"\n=== Feature Flags Summary ===")
        print(f"Total flags: {summary['total_flags']}")
        print(f"By access level: {summary['by_access_level']}")
        
        if filter_tag:
            print(f"\nFiltering by tag: {filter_tag}")
        if filter_level:
            print(f"Filtering by level: {filter_level}")
            
        print(f"\n{'KEY':<30} {'NAME':<25} {'LEVEL':<15} {'TAGS'}")
        print("=" * 80)
        
        for key, info in summary['flags'].items():
            # Apply filters
            if filter_tag and filter_tag not in info['tags']:
                continue
            if filter_level and info['access_level'] != filter_level:
                continue
                
            tags_str = ', '.join(info['tags'][:3])  # Show first 3 tags
            if len(info['tags']) > 3:
                tags_str += '...'
                
            override_marker = " (O)" if info.get('has_override') else ""
            
            print(f"{key:<30} {info['name'][:24]:<25} {info['access_level']:<15} {tags_str}{override_marker}")
    
    def show_feature(self, feature_key: str) -> None:
        """Show detailed information about a specific feature."""
        flag = self.manager.get_effective_flag(feature_key)
        if not flag:
            print(f"Feature '{feature_key}' not found.")
            return
            
        print(f"\n=== Feature Details: {feature_key} ===")
        print(f"Name: {flag.name}")
        print(f"Description: {flag.description}")
        print(f"Access Level: {flag.access_level.value}")
        print(f"Tags: {', '.join(flag.tags)}")
        print(f"Created: {flag.created_at}")
        print(f"Updated: {flag.updated_at}")
        
        if flag.allowed_roles:
            print(f"Allowed Roles: {', '.join(flag.allowed_roles)}")
        if flag.allowed_users:
            print(f"Allowed Users: {', '.join(flag.allowed_users)}")
        if flag.password:
            print(f"Password Required: Yes (hidden)")
        if flag.depends_on:
            print(f"Depends On: {', '.join(flag.depends_on)}")
        if flag.conflicts_with:
            print(f"Conflicts With: {', '.join(flag.conflicts_with)}")
            
        # Check if it's an override
        is_override = feature_key in self.manager.runtime_overrides
        if is_override:
            print(f"\n⚠️  This is a runtime override")
    
    def set_access_level(self, feature_key: str, level: str) -> None:
        """Set the access level for a feature flag."""
        try:
            access_level = AccessLevel(level)
        except ValueError:
            print(f"Invalid access level: {level}")
            print(f"Valid levels: {[l.value for l in AccessLevel]}")
            return
            
        try:
            self.manager.update_flag(feature_key, access_level=access_level)
            self.manager.save_configuration()
            print(f"✅ Set {feature_key} to {access_level.value}")
        except ValueError as e:
            print(f"❌ Error: {e}")
    
    def create_override(self, feature_key: str, level: str) -> None:
        """Create a runtime override for a feature."""
        try:
            access_level = AccessLevel(level)
        except ValueError:
            print(f"Invalid access level: {level}")
            return
            
        base_flag = feature_flags.get_flag(feature_key)
        if not base_flag:
            print(f"Base feature '{feature_key}' not found.")
            return
            
        # Create override
        override_flag = FeatureFlag(
            key=base_flag.key,
            name=base_flag.name,
            description=f"Runtime override: {base_flag.description}",
            access_level=access_level,
            allowed_roles=base_flag.allowed_roles,
            allowed_users=base_flag.allowed_users,
            password=base_flag.password,
            tags=base_flag.tags | {"runtime_override"}
        )
        
        self.manager.set_runtime_override(feature_key, override_flag, persist=True)
        print(f"✅ Created runtime override for {feature_key}: {access_level.value}")
    
    def remove_override(self, feature_key: str) -> None:
        """Remove a runtime override."""
        if feature_key not in self.manager.runtime_overrides:
            print(f"No runtime override found for '{feature_key}'")
            return
            
        self.manager.remove_runtime_override(feature_key, persist=True)
        print(f"✅ Removed runtime override for {feature_key}")
    
    def bulk_update(self, updates_file: str) -> None:
        """Bulk update features from a JSON file."""
        try:
            with open(updates_file, 'r') as f:
                updates = json.load(f)
                
            # Convert string levels to AccessLevel enums
            converted_updates = {}
            for key, level in updates.items():
                try:
                    converted_updates[key] = AccessLevel(level)
                except ValueError:
                    print(f"⚠️  Skipping {key}: invalid level '{level}'")
                    continue
            
            updated = self.manager.bulk_update_access_level(converted_updates, persist=True)
            print(f"✅ Updated {len(updated)} feature flags")
            
        except FileNotFoundError:
            print(f"❌ File not found: {updates_file}")
        except json.JSONDecodeError:
            print(f"❌ Invalid JSON in file: {updates_file}")
        except Exception as e:
            print(f"❌ Error during bulk update: {e}")
    
    def export_config(self, output_file: str, include_analytics: bool = False) -> None:
        """Export feature flag configuration."""
        try:
            config = self.manager.export_configuration(include_analytics=include_analytics)
            
            with open(output_file, 'w') as f:
                json.dump(config, f, indent=2, default=str)
                
            print(f"✅ Configuration exported to {output_file}")
            
        except Exception as e:
            print(f"❌ Export failed: {e}")
    
    def import_config(self, input_file: str, merge: bool = True) -> None:
        """Import feature flag configuration."""
        try:
            with open(input_file, 'r') as f:
                config = json.load(f)
                
            self.manager.import_configuration(config, merge=merge)
            print(f"✅ Configuration imported from {input_file}")
            
        except FileNotFoundError:
            print(f"❌ File not found: {input_file}")
        except json.JSONDecodeError:
            print(f"❌ Invalid JSON in file: {input_file}")
        except Exception as e:
            print(f"❌ Import failed: {e}")
    
    def enable_service(self, service_name: str) -> None:
        """Enable a specific service and its dependencies."""
        service_map = {
            "3d-printing": ["SERVICE_3D_PRINTING", "FILE_UPLOAD_3D", "FILE_PREVIEW_3D"],
            "laser": ["SERVICE_LASER_ENGRAVING", "FILE_UPLOAD_2D"],
            "cnc": ["SERVICE_CNC"],
            "injection": ["SERVICE_INJECTION_MOLDING"]
        }
        
        features = service_map.get(service_name)
        if not features:
            print(f"Unknown service: {service_name}")
            print(f"Available services: {list(service_map.keys())}")
            return
            
        updates = {feature: AccessLevel.ENABLED for feature in features}
        self.manager.bulk_update_access_level(updates, persist=True)
        print(f"✅ Enabled {service_name} service ({len(features)} features)")
    
    def disable_service(self, service_name: str) -> None:
        """Disable a specific service."""
        service_map = {
            "3d-printing": ["SERVICE_3D_PRINTING"],
            "laser": ["SERVICE_LASER_ENGRAVING"],
            "cnc": ["SERVICE_CNC"],
            "injection": ["SERVICE_INJECTION_MOLDING"]
        }
        
        features = service_map.get(service_name)
        if not features:
            print(f"Unknown service: {service_name}")
            return
            
        updates = {feature: AccessLevel.DISABLED for feature in features}
        self.manager.bulk_update_access_level(updates, persist=True)
        print(f"⚠️  Disabled {service_name} service")
    
    def set_beta_mode(self, enabled: bool = True) -> None:
        """Enable/disable beta mode for experimental features."""
        experimental_features = [
            "AI_DESIGN_SUGGESTIONS",
            "AR_PREVIEW",
            "FILE_AUTO_REPAIR",
            "CNC_CUSTOM_TOOLING"
        ]
        
        new_level = AccessLevel.BETA if enabled else AccessLevel.DISABLED
        updates = {feature: new_level for feature in experimental_features}
        
        updated = self.manager.bulk_update_access_level(updates, persist=True)
        mode_str = "enabled" if enabled else "disabled"
        print(f"✅ Beta mode {mode_str} for {len(updated)} experimental features")
    
    def reset_to_defaults(self) -> None:
        """Reset all feature flags to default configuration."""
        print("⚠️  This will reset ALL feature flags to defaults.")
        confirm = input("Type 'CONFIRM' to proceed: ")
        
        if confirm != 'CONFIRM':
            print("❌ Reset cancelled")
            return
            
        # Clear overrides
        self.manager.runtime_overrides.clear()
        
        # Reset to core features defaults
        from app.features.flags import FeatureFlags
        default_flags = FeatureFlags()
        feature_flags.flags = default_flags.flags.copy()
        
        self.manager.save_configuration()
        print("✅ Reset to default configuration")


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(description="Feature Flag Management CLI")
    subparsers = parser.add_subparsers(dest='command', help='Available commands')
    
    # List command
    list_parser = subparsers.add_parser('list', help='List all feature flags')
    list_parser.add_argument('--tag', help='Filter by tag')
    list_parser.add_argument('--level', help='Filter by access level')
    
    # Show command
    show_parser = subparsers.add_parser('show', help='Show feature details')
    show_parser.add_argument('feature_key', help='Feature key to show')
    
    # Set command
    set_parser = subparsers.add_parser('set', help='Set feature access level')
    set_parser.add_argument('feature_key', help='Feature key to update')
    set_parser.add_argument('level', help='Access level', 
                           choices=[l.value for l in AccessLevel])
    
    # Override commands
    override_parser = subparsers.add_parser('override', help='Create runtime override')
    override_parser.add_argument('feature_key', help='Feature key')
    override_parser.add_argument('level', help='Access level',
                                choices=[l.value for l in AccessLevel])
    
    remove_override_parser = subparsers.add_parser('remove-override', help='Remove runtime override')
    remove_override_parser.add_argument('feature_key', help='Feature key')
    
    # Bulk operations
    bulk_parser = subparsers.add_parser('bulk', help='Bulk update from JSON file')
    bulk_parser.add_argument('file', help='JSON file with updates')
    
    # Import/Export
    export_parser = subparsers.add_parser('export', help='Export configuration')
    export_parser.add_argument('file', help='Output file')
    export_parser.add_argument('--include-analytics', action='store_true', 
                              help='Include analytics data')
    
    import_parser = subparsers.add_parser('import', help='Import configuration')
    import_parser.add_argument('file', help='Input file')
    import_parser.add_argument('--replace', action='store_true',
                              help='Replace instead of merge')
    
    # Service management
    enable_service_parser = subparsers.add_parser('enable-service', help='Enable a service')
    enable_service_parser.add_argument('service', help='Service name',
                                      choices=['3d-printing', 'laser', 'cnc', 'injection'])
    
    disable_service_parser = subparsers.add_parser('disable-service', help='Disable a service')
    disable_service_parser.add_argument('service', help='Service name',
                                       choices=['3d-printing', 'laser', 'cnc', 'injection'])
    
    # Special modes
    subparsers.add_parser('enable-beta', help='Enable beta mode')
    subparsers.add_parser('disable-beta', help='Disable beta mode')
    subparsers.add_parser('reset', help='Reset to defaults')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    cli = FeatureFlagCLI()
    
    # Execute commands
    if args.command == 'list':
        cli.list_features(args.tag, args.level)
    elif args.command == 'show':
        cli.show_feature(args.feature_key)
    elif args.command == 'set':
        cli.set_access_level(args.feature_key, args.level)
    elif args.command == 'override':
        cli.create_override(args.feature_key, args.level)
    elif args.command == 'remove-override':
        cli.remove_override(args.feature_key)
    elif args.command == 'bulk':
        cli.bulk_update(args.file)
    elif args.command == 'export':
        cli.export_config(args.file, args.include_analytics)
    elif args.command == 'import':
        cli.import_config(args.file, not args.replace)
    elif args.command == 'enable-service':
        cli.enable_service(args.service)
    elif args.command == 'disable-service':
        cli.disable_service(args.service)
    elif args.command == 'enable-beta':
        cli.set_beta_mode(True)
    elif args.command == 'disable-beta':
        cli.set_beta_mode(False)
    elif args.command == 'reset':
        cli.reset_to_defaults()


if __name__ == "__main__":
    main()