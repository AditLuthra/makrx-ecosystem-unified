"""
API endpoints for feature flag management and access.
"""

from typing import Dict, List, Optional, Set, Any
from fastapi import APIRouter, HTTPException, Request, Query, Body
from pydantic import BaseModel, Field

from ..features import (
    FeatureFlags, FeatureFlag, AccessLevel, 
    feature_flags, feature_manager,
    admin_required, feature_required
)


router = APIRouter(prefix="/api/v1/feature-flags", tags=["Feature Flags"])


# Request/Response Models
class FeatureFlagResponse(BaseModel):
    """Response model for feature flag data."""
    key: str
    name: str
    description: str
    access_level: str
    tags: List[str]
    is_override: bool = False
    created_at: str
    updated_at: str


class FeatureFlagCreateRequest(BaseModel):
    """Request model for creating feature flags."""
    key: str = Field(..., regex=r'^[A-Z_][A-Z0-9_]*$')
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1, max_length=500)
    access_level: AccessLevel = AccessLevel.DISABLED
    allowed_roles: Set[str] = Field(default_factory=set)
    allowed_users: Set[str] = Field(default_factory=set)
    password: Optional[str] = None
    tags: Set[str] = Field(default_factory=set)


class FeatureFlagUpdateRequest(BaseModel):
    """Request model for updating feature flags."""
    access_level: Optional[AccessLevel] = None
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, min_length=1, max_length=500)
    allowed_roles: Optional[Set[str]] = None
    allowed_users: Optional[Set[str]] = None
    password: Optional[str] = None
    tags: Optional[Set[str]] = None


class BulkUpdateRequest(BaseModel):
    """Request model for bulk updates."""
    flags: Dict[str, AccessLevel] = Field(..., description="Flag key to access level mapping")


class UserAccessRequest(BaseModel):
    """Request model for checking user access."""
    user_id: Optional[str] = None
    user_roles: Set[str] = Field(default_factory=set)
    password: Optional[str] = None


# Public endpoints (no authentication required)
@router.get("/check/{feature_key}")
async def check_feature_availability(
    feature_key: str,
    request: Request,
    user_id: Optional[str] = Query(None),
    password: Optional[str] = Query(None)
):
    """Check if a specific feature is available for a user."""
    
    # Get user context from request or parameters
    user_context = {
        'user_id': user_id or getattr(request.state, 'user_id', None),
        'user_roles': set(getattr(request.state, 'user_roles', [])),
        'feature_password': password or request.headers.get('X-Feature-Password')
    }
    
    flag = feature_manager.get_effective_flag(feature_key)
    if not flag:
        raise HTTPException(status_code=404, detail="Feature not found")
    
    is_available = flag.is_active(
        user_id=user_context['user_id'],
        user_roles=user_context['user_roles'],
        password=user_context['feature_password']
    )
    
    response = {
        "feature_key": feature_key,
        "available": is_available,
        "access_level": flag.access_level.value,
        "name": flag.name
    }
    
    # Add helpful information for unavailable features
    if not is_available:
        if flag.access_level == AccessLevel.BETA:
            response["help"] = "Beta access required"
        elif flag.access_level == AccessLevel.PASSWORD_ONLY:
            response["help"] = "Password required"
        elif flag.access_level == AccessLevel.ROLE_BASED:
            response["help"] = f"Required roles: {list(flag.allowed_roles)}"
        elif flag.access_level == AccessLevel.DISABLED:
            response["help"] = "Feature is currently disabled"
    
    return response


@router.get("/available")
async def get_available_features(
    request: Request,
    user_id: Optional[str] = Query(None),
    password: Optional[str] = Query(None),
    tags: Optional[str] = Query(None, description="Comma-separated tags to filter by")
):
    """Get all features available to the current user."""
    
    # Get user context
    user_context = {
        'user_id': user_id or getattr(request.state, 'user_id', None),
        'user_roles': set(getattr(request.state, 'user_roles', [])),
        'feature_password': password or request.headers.get('X-Feature-Password')
    }
    
    # Parse tags filter
    tag_filter = set(tags.split(',')) if tags else None
    
    accessible_features = feature_manager.get_user_accessible_features(
        user_id=user_context['user_id'],
        user_roles=user_context['user_roles'],
        password=user_context['feature_password']
    )
    
    # Apply tag filter if provided
    if tag_filter:
        filtered_features = {}
        for category, feature_list in accessible_features.items():
            if category in ['total']:
                filtered_features[category] = accessible_features[category]
                continue
                
            filtered_list = []
            for feature_key in feature_list:
                flag = feature_manager.get_effective_flag(feature_key)
                if flag and flag.tags.intersection(tag_filter):
                    filtered_list.append(feature_key)
            filtered_features[category] = filtered_list
        
        accessible_features = filtered_features
    
    return accessible_features


@router.get("/public/summary")
async def get_public_features_summary():
    """Get public summary of available features (no auth required)."""
    summary = feature_manager.get_flags_summary()
    
    # Remove sensitive information for public endpoint
    public_summary = {
        'total_flags': summary['total_flags'],
        'by_access_level': summary['by_access_level'],
        'by_tag': summary['by_tag'],
        'public_features': []
    }
    
    # Only include publicly available features
    for key, flag_info in summary['flags'].items():
        if flag_info['access_level'] == 'enabled':
            public_summary['public_features'].append({
                'key': key,
                'name': flag_info.get('name', key),
                'tags': flag_info['tags']
            })
    
    return public_summary


# Admin endpoints (authentication required)
@router.get("/admin/all")
@admin_required
@feature_required("ADMIN_FEATURE_FLAGS")
async def get_all_feature_flags(request: Request):
    """Get all feature flags with full details (admin only)."""
    
    all_flags = {}
    
    # Get base flags
    for key, flag in feature_flags.flags.items():
        all_flags[key] = FeatureFlagResponse(
            key=flag.key,
            name=flag.name,
            description=flag.description,
            access_level=flag.access_level.value,
            tags=list(flag.tags),
            is_override=False,
            created_at=flag.created_at.isoformat(),
            updated_at=flag.updated_at.isoformat()
        )
    
    # Apply overrides
    for key, flag in feature_manager.runtime_overrides.items():
        all_flags[key] = FeatureFlagResponse(
            key=flag.key,
            name=flag.name,
            description=flag.description,
            access_level=flag.access_level.value,
            tags=list(flag.tags),
            is_override=True,
            created_at=flag.created_at.isoformat(),
            updated_at=flag.updated_at.isoformat()
        )
    
    return {"flags": list(all_flags.values())}


@router.get("/admin/{feature_key}")
@admin_required
@feature_required("ADMIN_FEATURE_FLAGS")
async def get_feature_flag_details(feature_key: str, request: Request):
    """Get detailed information about a specific feature flag."""
    
    flag = feature_manager.get_effective_flag(feature_key)
    if not flag:
        raise HTTPException(status_code=404, detail="Feature flag not found")
    
    return {
        "flag": flag.dict(),
        "is_override": feature_key in feature_manager.runtime_overrides,
        "usage_analytics": feature_manager.analytics_data.get('feature_usage', {}).get(feature_key, {})
    }


@router.post("/admin/create")
@admin_required
@feature_required("ADMIN_FEATURE_FLAGS")
async def create_feature_flag(request: Request, flag_data: FeatureFlagCreateRequest):
    """Create a new feature flag."""
    
    try:
        flag = feature_manager.create_feature_flag(
            key=flag_data.key,
            name=flag_data.name,
            description=flag_data.description,
            access_level=flag_data.access_level,
            allowed_roles=flag_data.allowed_roles,
            allowed_users=flag_data.allowed_users,
            password=flag_data.password,
            tags=flag_data.tags
        )
        
        feature_manager.save_configuration()
        
        return {"message": "Feature flag created successfully", "flag": flag.dict()}
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/admin/{feature_key}")
@admin_required
@feature_required("ADMIN_FEATURE_FLAGS")
async def update_feature_flag(
    feature_key: str, 
    request: Request, 
    updates: FeatureFlagUpdateRequest
):
    """Update a feature flag."""
    
    try:
        # Only include non-None values in the update
        update_data = {k: v for k, v in updates.dict().items() if v is not None}
        
        updated_flag = feature_manager.update_flag(feature_key, **update_data)
        feature_manager.save_configuration()
        
        return {"message": "Feature flag updated successfully", "flag": updated_flag.dict()}
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/admin/bulk-update")
@admin_required
@feature_required("ADMIN_FEATURE_FLAGS")
async def bulk_update_feature_flags(request: Request, bulk_update: BulkUpdateRequest):
    """Bulk update access levels for multiple feature flags."""
    
    try:
        updated_flags = feature_manager.bulk_update_access_level(
            bulk_update.flags, persist=True
        )
        
        return {
            "message": f"Updated {len(updated_flags)} feature flags",
            "updated_flags": updated_flags
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/admin/{feature_key}/override")
@admin_required
@feature_required("ADMIN_FEATURE_FLAGS")
async def create_runtime_override(
    feature_key: str,
    request: Request,
    access_level: AccessLevel = Body(..., embed=True)
):
    """Create a runtime override for a feature flag."""
    
    base_flag = feature_flags.get_flag(feature_key)
    if not base_flag:
        raise HTTPException(status_code=404, detail="Base feature flag not found")
    
    # Create override flag with new access level
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
    
    feature_manager.set_runtime_override(feature_key, override_flag, persist=True)
    
    return {
        "message": "Runtime override created successfully",
        "override": override_flag.dict()
    }


@router.delete("/admin/{feature_key}/override")
@admin_required
@feature_required("ADMIN_FEATURE_FLAGS")
async def remove_runtime_override(feature_key: str, request: Request):
    """Remove a runtime override for a feature flag."""
    
    if feature_key not in feature_manager.runtime_overrides:
        raise HTTPException(status_code=404, detail="Runtime override not found")
    
    feature_manager.remove_runtime_override(feature_key, persist=True)
    
    return {"message": "Runtime override removed successfully"}


@router.delete("/admin/{feature_key}")
@admin_required
@feature_required("ADMIN_FEATURE_FLAGS")
async def delete_feature_flag(feature_key: str, request: Request):
    """Delete a feature flag completely."""
    
    flag = feature_manager.get_effective_flag(feature_key)
    if not flag:
        raise HTTPException(status_code=404, detail="Feature flag not found")
    
    feature_manager.delete_feature_flag(feature_key)
    feature_manager.save_configuration()
    
    return {"message": "Feature flag deleted successfully"}


@router.get("/admin/analytics")
@admin_required
@feature_required("ADMIN_FEATURE_FLAGS")
async def get_feature_flag_analytics(request: Request):
    """Get analytics data for feature flag usage."""
    
    return {
        "analytics": feature_manager.analytics_data,
        "summary": feature_manager.get_flags_summary()
    }


@router.post("/admin/export")
@admin_required
@feature_required("ADMIN_FEATURE_FLAGS")
async def export_feature_flags(
    request: Request,
    include_analytics: bool = Query(False, description="Include analytics data in export")
):
    """Export complete feature flag configuration."""
    
    export_data = feature_manager.export_configuration(include_analytics=include_analytics)
    
    return export_data


@router.post("/admin/import")
@admin_required
@feature_required("ADMIN_FEATURE_FLAGS")
async def import_feature_flags(
    request: Request,
    config_data: Dict[str, Any] = Body(...),
    merge: bool = Query(True, description="Merge with existing configuration")
):
    """Import feature flag configuration."""
    
    try:
        feature_manager.import_configuration(config_data, merge=merge)
        
        return {
            "message": "Feature flags imported successfully",
            "summary": feature_manager.get_flags_summary()
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Import failed: {str(e)}")


# Beta user management endpoints
@router.post("/admin/beta-access")
@admin_required
@feature_required("ADMIN_FEATURE_FLAGS")
async def grant_beta_access(
    request: Request,
    user_id: str = Body(..., embed=True),
    feature_keys: List[str] = Body(..., embed=True)
):
    """Grant beta access to specific features for a user."""
    
    feature_manager.enable_beta_features_for_user(user_id, feature_keys)
    feature_manager.save_configuration()
    
    return {
        "message": f"Beta access granted to user {user_id}",
        "features": feature_keys
    }


@router.post("/test-access")
async def test_feature_access(
    request: Request,
    access_request: UserAccessRequest
):
    """Test feature access for specific user context (for development/testing)."""
    
    accessible_features = feature_manager.get_user_accessible_features(
        user_id=access_request.user_id,
        user_roles=access_request.user_roles,
        password=access_request.password
    )
    
    return {
        "test_context": access_request.dict(),
        "accessible_features": accessible_features
    }