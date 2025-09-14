"""
Middleware for automatic feature flag checking and context injection.
"""

import time
import json
from typing import Callable, Optional
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

from .flags import feature_flags, AccessLevel
from .manager import FeatureFlagManager


class FeatureFlagMiddleware(BaseHTTPMiddleware):
    """
    Middleware that automatically injects feature flag context into requests
    and can block access to disabled features.
    """
    
    def __init__(self, app: ASGIApp, manager: Optional[FeatureFlagManager] = None):
        super().__init__(app)
        self.manager = manager or FeatureFlagManager()
        
        # Define route patterns that require specific features
        self.route_feature_map = {
            # Service routes
            "/api/v1/services/3d-printing": "SERVICE_3D_PRINTING",
            "/api/v1/services/laser": "SERVICE_LASER_ENGRAVING", 
            "/api/v1/services/cnc": "SERVICE_CNC",
            "/api/v1/services/injection-molding": "SERVICE_INJECTION_MOLDING",
            
            # File processing routes
            "/api/v1/files/upload/3d": "FILE_UPLOAD_3D",
            "/api/v1/files/upload/2d": "FILE_UPLOAD_2D", 
            "/api/v1/files/preview": "FILE_PREVIEW_3D",
            "/api/v1/files/analyze": "FILE_ANALYSIS",
            "/api/v1/files/repair": "FILE_AUTO_REPAIR",
            
            # Provider routes
            "/api/v1/provider": "PROVIDER_DASHBOARD",
            "/api/v1/provider/jobs": "PROVIDER_REAL_TIME_JOBS",
            "/api/v1/provider/inventory": "PROVIDER_INVENTORY_MANAGEMENT",
            "/api/v1/provider/analytics": "PROVIDER_ANALYTICS",
            
            # Admin routes
            "/api/v1/admin/feature-flags": "ADMIN_FEATURE_FLAGS",
            "/api/v1/admin/analytics": "ADMIN_ANALYTICS",
            "/api/v1/admin/users": "ADMIN_USER_MANAGEMENT",
            
            # Experimental routes
            "/api/v1/ai/suggestions": "AI_DESIGN_SUGGESTIONS",
            "/api/v1/ar/preview": "AR_PREVIEW",
            "/api/v1/blockchain": "BLOCKCHAIN_TRACKING",
        }
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Process each request through feature flag checks."""
        start_time = time.time()
        
        # Extract user context from request
        user_context = await self.extract_user_context(request)
        
        # Inject feature flag context into request state
        request.state.feature_flags = await self.get_user_features(user_context)
        request.state.user_context = user_context
        
        # Check if route requires specific feature
        feature_required = self.get_required_feature(request.url.path)
        
        if feature_required:
            # Check if feature is enabled for this user
            is_enabled = feature_flags.is_enabled(
                feature_required,
                user_id=user_context.get('user_id'),
                user_roles=user_context.get('user_roles'),
                password=user_context.get('feature_password')
            )
            
            if not is_enabled:
                return await self.create_feature_disabled_response(
                    feature_required, request.url.path
                )
        
        # Log feature flag usage
        await self.log_feature_usage(request, user_context)
        
        # Process request
        response = await call_next(request)
        
        # Add feature flag headers to response
        await self.add_feature_headers(response, request.state.feature_flags)
        
        # Calculate processing time
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        
        return response
    
    async def extract_user_context(self, request: Request) -> dict:
        """Extract user context from request."""
        context = {
            'user_id': None,
            'user_roles': set(),
            'is_authenticated': False,
            'feature_password': None
        }
        
        # Extract from JWT token if present
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            # This would typically decode JWT token
            # For now, use mock data
            context.update({
                'user_id': 'user123',
                'user_roles': {'user', 'beta_user'},
                'is_authenticated': True
            })
        
        # Extract feature password from headers
        feature_password = request.headers.get('X-Feature-Password')
        if feature_password:
            context['feature_password'] = feature_password
        
        # Extract from query parameters for testing
        if request.query_params.get('test_user'):
            context.update({
                'user_id': request.query_params.get('test_user'),
                'user_roles': set(request.query_params.get('test_roles', '').split(',')),
                'is_authenticated': True
            })
        
        return context
    
    async def get_user_features(self, user_context: dict) -> dict:
        """Get all enabled features for user."""
        enabled_features = feature_flags.get_enabled_features(
            user_id=user_context.get('user_id'),
            user_roles=user_context.get('user_roles'),
            password=user_context.get('feature_password')
        )
        
        return {
            'enabled': enabled_features,
            'beta': [f.key for f in feature_flags.get_beta_features()],
            'password_protected': [f.key for f in feature_flags.get_password_features()],
            'total_count': len(feature_flags.flags)
        }
    
    def get_required_feature(self, path: str) -> Optional[str]:
        """Determine if a route requires a specific feature."""
        # Exact match first
        if path in self.route_feature_map:
            return self.route_feature_map[path]
        
        # Check for prefix matches
        for route_pattern, feature in self.route_feature_map.items():
            if path.startswith(route_pattern):
                return feature
        
        return None
    
    async def create_feature_disabled_response(self, feature_key: str, path: str) -> JSONResponse:
        """Create response for disabled feature access."""
        flag = feature_flags.get_flag(feature_key)
        
        response_data = {
            "error": "Feature not available",
            "feature": feature_key,
            "path": path,
            "message": f"The requested feature '{feature_key}' is not available"
        }
        
        # Provide helpful information based on access level
        if flag:
            if flag.access_level == AccessLevel.BETA:
                response_data["message"] = f"'{feature_key}' is currently in beta. Beta access required."
                response_data["help"] = "Contact support to request beta access"
                
            elif flag.access_level == AccessLevel.PASSWORD_ONLY:
                response_data["message"] = f"'{feature_key}' requires password access."
                response_data["help"] = "Provide password in X-Feature-Password header"
                
            elif flag.access_level == AccessLevel.ROLE_BASED:
                response_data["message"] = f"'{feature_key}' requires specific permissions."
                response_data["required_roles"] = list(flag.allowed_roles)
                
            elif flag.access_level == AccessLevel.DISABLED:
                response_data["message"] = f"'{feature_key}' is currently disabled."
        
        return JSONResponse(
            status_code=404,
            content=response_data
        )
    
    async def log_feature_usage(self, request: Request, user_context: dict):
        """Log feature flag usage for analytics."""
        # This would typically log to analytics system
        # For now, we'll just log to console in development
        if hasattr(request.state, 'feature_flags'):
            enabled_count = len(request.state.feature_flags.get('enabled', []))
            print(f"User {user_context.get('user_id', 'anonymous')} has access to {enabled_count} features")
    
    async def add_feature_headers(self, response: Response, feature_data: dict):
        """Add feature flag information to response headers."""
        # Add enabled features count
        response.headers["X-Features-Enabled"] = str(len(feature_data.get('enabled', [])))
        
        # Add beta features count
        response.headers["X-Features-Beta"] = str(len(feature_data.get('beta', [])))
        
        # Add total features count
        response.headers["X-Features-Total"] = str(feature_data.get('total_count', 0))
        
        # Don't expose sensitive feature lists in headers
        # These are available in the request state for the application to use


class FeatureFlagAnalyticsMiddleware(BaseHTTPMiddleware):
    """
    Specialized middleware for collecting feature flag analytics.
    """
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
        self.feature_usage_stats = {}
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Track feature flag usage."""
        
        # Get user context
        user_id = getattr(request.state, 'user_id', 'anonymous')
        
        # Process request
        response = await call_next(request)
        
        # Track feature usage if available
        if hasattr(request.state, 'feature_flags'):
            enabled_features = request.state.feature_flags.get('enabled', [])
            
            for feature in enabled_features:
                if feature not in self.feature_usage_stats:
                    self.feature_usage_stats[feature] = {
                        'total_requests': 0,
                        'unique_users': set(),
                        'last_used': None
                    }
                
                self.feature_usage_stats[feature]['total_requests'] += 1
                self.feature_usage_stats[feature]['unique_users'].add(user_id)
                self.feature_usage_stats[feature]['last_used'] = time.time()
        
        return response
    
    def get_analytics_data(self) -> dict:
        """Get current analytics data."""
        stats = {}
        for feature, data in self.feature_usage_stats.items():
            stats[feature] = {
                'total_requests': data['total_requests'],
                'unique_users_count': len(data['unique_users']),
                'last_used': data['last_used']
            }
        return stats