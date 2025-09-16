"""
Decorators for feature flag enforcement in API endpoints.
"""

from functools import wraps
from typing import Optional, Set, Callable, Any
from fastapi import HTTPException, status, Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from .flags import feature_flags, AccessLevel
from ..core.security import require_auth, AuthUser


security = HTTPBearer(auto_error=False)


def get_user_context(request: Request) -> dict:
    """Extract user context from request."""
    # This would typically get user info from JWT token
    # For now, return basic context
    user_context = {
        'user_id': getattr(request.state, 'user_id', None),
        'user_roles': set(getattr(request.state, 'user_roles', [])),
        'is_authenticated': getattr(request.state, 'is_authenticated', False)
    }
    
    # Get password from headers if provided
    password = request.headers.get('X-Feature-Password')
    if password:
        user_context['feature_password'] = password
    
    return user_context


def feature_required(feature_key: str, 
                    error_message: Optional[str] = None,
                    status_code: int = status.HTTP_404_NOT_FOUND):
    """
    Decorator to require a specific feature flag to be enabled.
    
    Args:
        feature_key: The feature flag key to check
        error_message: Custom error message if feature is disabled
        status_code: HTTP status code to return if disabled
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Get the feature flag definition
            flag = feature_flags.get_flag(feature_key)
            if not flag:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feature not found")

            # Ensure request is available in kwargs
            request: Request = kwargs.get("request")
            if not request:
                # If request is not in kwargs, it must be the first positional argument
                if args and isinstance(args[0], Request):
                    request = args[0]
                else:
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="Request context not available for feature flag check"
                    )

            # Get authenticated user (if any)
            user: Optional[AuthUser] = await get_current_user(request, Depends(HTTPBearer(auto_error=False)))

            # Check if authentication is required for this feature
            if flag.access_level not in [AccessLevel.PUBLIC, AccessLevel.DISABLED] and user is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required for this feature"
                )

            # Get user context for feature flag evaluation
            user_id = user.user_id if user else None
            user_roles = set(user.roles) if user else set()
            feature_password = request.headers.get('X-Feature-Password')
            
            # Check if feature is enabled
            is_enabled = feature_flags.is_enabled(
                feature_key,
                user_id=user_id,
                user_roles=user_roles,
                password=feature_password
            )
            
            if not is_enabled:
                message = error_message or f"Feature '{feature_key}' is not available"
                raise HTTPException(status_code=status_code, detail=message)
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator


def beta_access_required(feature_key: str,
                        error_message: Optional[str] = None):
    """
    Decorator to require beta access for a feature.
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Ensure user is authenticated and get their roles
            current_user: AuthUser = await require_auth(request=args[0]) # Assuming request is the first arg
            user_roles = set(current_user.roles)
            
            # Check if user has beta access
            if 'beta_user' not in user_roles and 'admin' not in user_roles:
                message = error_message or f"Beta access required for '{feature_key}'"
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=message
                )
            
            # Also check if the feature itself is enabled
            is_enabled = feature_flags.is_enabled(
                feature_key,
                user_id=current_user.user_id,
                user_roles=user_roles,
                password=request.headers.get('X-Feature-Password')
            )
            
            if not is_enabled:
                message = error_message or f"Feature '{feature_key}' is not available"
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=message
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator


def password_access_required(feature_key: str,
                           error_message: Optional[str] = None):
    """
    Decorator to require password access for a feature.
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Ensure user is authenticated and get their roles
            current_user: AuthUser = await require_auth(request=args[0]) # Assuming request is the first arg
            user_roles = set(current_user.roles)
            
            # Get the feature flag
            flag = feature_flags.get_flag(feature_key)
            if not flag:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Feature '{feature_key}' not found"
                )
            
            # Check if password is provided
            provided_password = request.headers.get('X-Feature-Password')
            if not provided_password:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Feature password required in X-Feature-Password header"
                )
            
            # Check if feature is enabled with the password
            is_enabled = feature_flags.is_enabled(
                feature_key,
                user_id=current_user.user_id,
                user_roles=user_roles,
                password=provided_password
            )
            
            if not is_enabled:
                message = error_message or "Invalid password or feature not available"
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=message
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator


def admin_required(func: Callable) -> Callable:
    """
    Decorator to require admin access.
    """
    @wraps(func)
    async def wrapper(*args, **kwargs):
        # Ensure user is authenticated and get their roles
        current_user: AuthUser = await require_auth(request=args[0]) # Assuming request is the first arg
        user_roles = set(current_user.roles)
        
        if 'admin' not in user_roles and 'super_admin' not in user_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        return await func(*args, **kwargs)
    return wrapper


def role_required(*required_roles: str):
    """
    Decorator to require specific roles.
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Ensure user is authenticated and get their roles
            current_user: AuthUser = await require_auth(request=args[0]) # Assuming request is the first arg
            user_roles = set(current_user.roles)
            
            if not any(role in user_roles for role in required_roles):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"One of the following roles required: {', '.join(required_roles)}"
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator


# Convenience decorators for common feature combinations
def service_feature(service_name: str):
    """Decorator for service-specific features."""
    return feature_required(f"SERVICE_{service_name.upper()}")


def provider_feature(feature_key: str):
    """Decorator for provider-only features."""
    def decorator(func: Callable) -> Callable:
        @role_required("provider", "admin")
        @feature_required(feature_key)
        @wraps(func)
        async def wrapper(*args, **kwargs):
            return await func(*args, **kwargs)
        return wrapper
    return decorator


def experimental_feature(feature_key: str, password_required: bool = True):
    """Decorator for experimental features."""
    if password_required:
        return password_access_required(feature_key)
    else:
        return beta_access_required(feature_key)