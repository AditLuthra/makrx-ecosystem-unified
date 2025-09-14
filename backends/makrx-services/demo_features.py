#!/usr/bin/env python3
"""
Feature Flags Demo Script
Demonstrates the feature flags system capabilities
"""

import sys
from pathlib import Path
import asyncio
import json

# Add the app directory to Python path
sys.path.append(str(Path(__file__).parent))

from app.features import (
    FeatureFlags, FeatureFlag, AccessLevel, 
    feature_flags, feature_manager
)


def demo_basic_feature_checking():
    """Demonstrate basic feature flag checking."""
    print("\n=== Basic Feature Checking Demo ===")
    
    # Check if 3D printing service is enabled
    is_3d_enabled = feature_flags.is_enabled("SERVICE_3D_PRINTING")
    print(f"3D Printing Service enabled: {is_3d_enabled}")
    
    # Check CNC service (should be beta)
    is_cnc_enabled = feature_flags.is_enabled("SERVICE_CNC")
    print(f"CNC Service enabled for anonymous user: {is_cnc_enabled}")
    
    # Check CNC service with beta user role
    is_cnc_beta = feature_flags.is_enabled(
        "SERVICE_CNC", 
        user_id="demo-user", 
        user_roles={"beta_user"}
    )
    print(f"CNC Service enabled for beta user: {is_cnc_beta}")
    
    # Check password-protected feature
    is_injection_enabled = feature_flags.is_enabled(
        "SERVICE_INJECTION_MOLDING",
        password="injection-beta-2024"
    )
    print(f"Injection Molding enabled with correct password: {is_injection_enabled}")
    
    is_injection_wrong_password = feature_flags.is_enabled(
        "SERVICE_INJECTION_MOLDING",
        password="wrong-password"
    )
    print(f"Injection Molding enabled with wrong password: {is_injection_wrong_password}")


def demo_user_accessible_features():
    """Demonstrate getting all accessible features for different user types."""
    print("\n=== User Accessible Features Demo ===")
    
    # Anonymous user
    anon_features = feature_manager.get_user_accessible_features()
    print(f"\nAnonymous user has access to {len(anon_features['enabled'])} features:")
    for feature in anon_features['enabled'][:5]:  # Show first 5
        print(f"  - {feature}")
    if len(anon_features['enabled']) > 5:
        print(f"  ... and {len(anon_features['enabled']) - 5} more")
    
    # Beta user
    beta_features = feature_manager.get_user_accessible_features(
        user_id="beta-user",
        user_roles={"user", "beta_user"}
    )
    print(f"\nBeta user has access to {len(beta_features['enabled'])} features:")
    beta_only = set(beta_features['enabled']) - set(anon_features['enabled'])
    if beta_only:
        print("  Beta-exclusive features:")
        for feature in beta_only:
            print(f"    - {feature}")
    
    # Provider user
    provider_features = feature_manager.get_user_accessible_features(
        user_id="provider-user",
        user_roles={"user", "provider"}
    )
    print(f"\nProvider user has access to {len(provider_features['enabled'])} features:")
    provider_only = set(provider_features['enabled']) - set(anon_features['enabled'])
    if provider_only:
        print("  Provider-exclusive features:")
        for feature in provider_only:
            print(f"    - {feature}")
    
    # Admin user
    admin_features = feature_manager.get_user_accessible_features(
        user_id="admin-user",
        user_roles={"user", "admin"}
    )
    print(f"\nAdmin user has access to {len(admin_features['enabled'])} features:")
    admin_only = set(admin_features['enabled']) - set(anon_features['enabled'])
    if admin_only:
        print("  Admin-exclusive features:")
        for feature in admin_only:
            print(f"    - {feature}")


def demo_runtime_overrides():
    """Demonstrate runtime feature flag overrides."""
    print("\n=== Runtime Overrides Demo ===")
    
    # Check initial state of CNC service
    original_state = feature_flags.is_enabled("SERVICE_CNC")
    print(f"CNC Service original state: {original_state}")
    
    # Create a runtime override to enable CNC for everyone
    cnc_flag = feature_flags.get_flag("SERVICE_CNC")
    if cnc_flag:
        override_flag = FeatureFlag(
            key=cnc_flag.key,
            name=cnc_flag.name,
            description=f"Override: {cnc_flag.description}",
            access_level=AccessLevel.ENABLED,  # Override to enabled
            tags=cnc_flag.tags | {"demo_override"}
        )
        
        feature_manager.set_runtime_override("SERVICE_CNC", override_flag)
        
        # Check state after override
        overridden_state = feature_flags.is_enabled("SERVICE_CNC")
        print(f"CNC Service after override: {overridden_state}")
        
        # Remove override
        feature_manager.remove_runtime_override("SERVICE_CNC")
        
        # Check state after removing override
        restored_state = feature_flags.is_enabled("SERVICE_CNC")
        print(f"CNC Service after removing override: {restored_state}")


def demo_feature_dependencies():
    """Demonstrate feature dependencies."""
    print("\n=== Feature Dependencies Demo ===")
    
    # Show features that depend on others
    summary = feature_manager.get_flags_summary()
    
    dependencies_found = False
    for key, flag_info in summary['flags'].items():
        flag = feature_manager.get_effective_flag(key)
        if flag and flag.depends_on:
            dependencies_found = True
            print(f"{key} depends on: {', '.join(flag.depends_on)}")
    
    if not dependencies_found:
        print("No feature dependencies configured in current setup")


def demo_feature_tags():
    """Demonstrate feature tag filtering."""
    print("\n=== Feature Tags Demo ===")
    
    # Get features by different tags
    service_features = feature_flags.get_flags_by_tag("service")
    print(f"Service features ({len(service_features)}):")
    for flag in service_features:
        print(f"  - {flag.name}")
    
    experimental_features = feature_flags.get_flags_by_tag("experimental")
    print(f"\nExperimental features ({len(experimental_features)}):")
    for flag in experimental_features:
        print(f"  - {flag.name}")
    
    beta_features = feature_flags.get_beta_features()
    print(f"\nBeta features ({len(beta_features)}):")
    for flag in beta_features:
        print(f"  - {flag.name}")


def demo_bulk_operations():
    """Demonstrate bulk feature flag operations."""
    print("\n=== Bulk Operations Demo ===")
    
    # Save current state of some features
    test_features = ["FILE_AUTO_REPAIR", "PROVIDER_ANALYTICS", "AR_PREVIEW"]
    original_states = {}
    
    for feature_key in test_features:
        flag = feature_manager.get_effective_flag(feature_key)
        if flag:
            original_states[feature_key] = flag.access_level
    
    print("Original states:")
    for key, level in original_states.items():
        print(f"  {key}: {level.value}")
    
    # Bulk enable all test features
    bulk_updates = {key: AccessLevel.ENABLED for key in test_features}
    updated = feature_manager.bulk_update_access_level(bulk_updates, persist=False)
    
    print(f"\nBulk enabled {len(updated)} features")
    print("New states:")
    for key in test_features:
        flag = feature_manager.get_effective_flag(key)
        if flag:
            print(f"  {key}: {flag.access_level.value}")
    
    # Restore original states
    restore_updates = {key: level for key, level in original_states.items()}
    feature_manager.bulk_update_access_level(restore_updates, persist=False)
    
    print("\nRestored original states")


def demo_export_import():
    """Demonstrate configuration export/import."""
    print("\n=== Export/Import Demo ===")
    
    # Export current configuration
    config = feature_manager.export_configuration(include_analytics=False)
    
    print(f"Exported configuration:")
    print(f"  - {len(config.get('flags', {}))} base flags")
    print(f"  - {len(config.get('overrides', {}))} overrides")
    
    # Show a sample of the exported data
    if config.get('flags'):
        sample_key = list(config['flags'].keys())[0]
        sample_flag = config['flags'][sample_key]
        print(f"\nSample exported flag ({sample_key}):")
        print(f"  Name: {sample_flag.get('name')}")
        print(f"  Access Level: {sample_flag.get('access_level')}")
        print(f"  Tags: {sample_flag.get('tags')}")


def demo_analytics_tracking():
    """Demonstrate analytics and usage tracking."""
    print("\n=== Analytics Demo ===")
    
    # Simulate some feature usage
    test_features = ["SERVICE_3D_PRINTING", "FILE_UPLOAD_3D", "SERVICE_LASER_ENGRAVING"]
    test_users = ["user1", "user2", "user3"]
    
    for feature in test_features:
        for user in test_users:
            feature_manager.record_feature_usage(feature, user, success=True)
    
    # Show analytics data
    analytics = feature_manager.analytics_data
    if 'feature_usage' in analytics:
        print("Feature usage analytics:")
        for feature, usage in analytics['feature_usage'].items():
            if isinstance(usage, dict):
                print(f"  {feature}:")
                print(f"    Total requests: {usage.get('total_requests', 0)}")
                print(f"    Unique users: {len(usage.get('unique_users', []))}")
                print(f"    Success rate: {usage.get('successful_requests', 0) / max(usage.get('total_requests', 1), 1) * 100:.1f}%")


def main():
    """Run all demos."""
    print("🚀 MakrX Services Feature Flags System Demo")
    print("=" * 50)
    
    try:
        # Load default configuration
        feature_manager.load_configuration()
        
        # Run all demos
        demo_basic_feature_checking()
        demo_user_accessible_features()
        demo_runtime_overrides()
        demo_feature_dependencies()
        demo_feature_tags()
        demo_bulk_operations()
        demo_export_import()
        demo_analytics_tracking()
        
        print("\n✅ Demo completed successfully!")
        
        # Show final summary
        summary = feature_manager.get_flags_summary()
        print(f"\n📊 Final Summary:")
        print(f"Total feature flags: {summary['total_flags']}")
        print(f"Access levels: {summary['by_access_level']}")
        print(f"Popular tags: {dict(list(summary['by_tag'].items())[:5])}")
        
    except Exception as e:
        print(f"\n❌ Demo failed: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()