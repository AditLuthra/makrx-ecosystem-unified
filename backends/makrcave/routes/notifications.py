from ..schemas.notifications import (
    NotificationResponse,
    NotificationRuleResponse,
    NotificationRuleUpdate,
    NotificationStats,
    NotificationSystemHealth,
    NotificationTemplateResponse,
    NotificationTest,
    NotificationType,
    NotificationUpdate,
    PushTokenRegister,
    TemplateRenderRequest,
    TemplateRenderResponse,
    UnreadNotificationsSummary,
    NotificationChannel,
    NotificationCreate,
    NotificationTemplateCreate,
    NotificationTemplateUpdate,
    NotificationPreferenceResponse,
    NotificationPreferenceCreate,
    NotificationPreferenceUpdate,
    NotificationRuleCreate,
    NotificationAnalyticsResponse,
    NotificationExport
)
from ..models.notifications import Notification
from ..models.notifications import Notification
from jose import jwt, JWTError
from sqlalchemy.orm import Session
import json
from datetime import datetime
from typing import List, Optional
from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    HTTPException,
    Query,
    WebSocket,
    status,
    WebSocketDisconnect
)
from ..crud import notifications as crud_notifications
from ..crud import notifications_stubs as crud_notifications_stubs
from ..database import get_db
from ..dependencies import get_current_user
from ..dependencies import (
    get_jwks_pem, get_keycloak_public_key, KEYCLOAK_USE_JWKS,
    KEYCLOAK_ISSUER, KEYCLOAK_CLIENT_ID, KEYCLOAK_VERIFY_AUD
)
import logging
logger = logging.getLogger(__name__)

# Patch missing attributes from stubs if not present in crud_notifications
for _name in [
    "get_notification", "update_notification", "delete_notification",
    "get_analytics", "send_test_notification", "get_system_health",
    "create_export_request", "process_export",
    "register_websocket_connection", "unregister_websocket_connection"
]:
    if not hasattr(crud_notifications, _name):
        setattr(crud_notifications, _name, getattr(crud_notifications_stubs, _name))
logger = logging.getLogger(__name__)
# Patch missing attributes from stubs if not present in crud_notifications
for _name in [
    "get_notification", "update_notification", "delete_notification",
    "get_analytics", "send_test_notification", "get_system_health",
    "create_export_request", "process_export",
    "register_websocket_connection", "unregister_websocket_connection"
]:
    if not hasattr(crud_notifications, _name):
        setattr(crud_notifications, _name, getattr(crud_notifications_stubs, _name))

# Helper functions


def _has_notification_permission(user: dict, action: str) -> bool:
    """Check if user has notification permission"""
    user_permissions = user.get("permissions", [])
    user_role = user.get("role", "")

    # Super admins have all permissions
    if user_role == "super_admin":
        return True

    # Permission mapping
    permission_map = {
        "create": ["send_notifications", "create_notifications"],
        "view_all": ["view_all_notifications", "admin_notifications"],
        "update": ["manage_notifications", "admin_notifications"],
        "delete": ["manage_notifications", "admin_notifications"],
        "manage_templates": ["manage_notification_templates", "admin_notifications"],
        "view_templates": [
            "view_notification_templates",
            "manage_notification_templates"
        ],
        "manage_rules": ["manage_notification_rules", "admin_notifications"],
        "view_rules": ["view_notification_rules", "manage_notification_rules"],
        "view_analytics": ["view_notification_analytics", "admin_notifications"],
        "test": ["test_notifications", "admin_notifications"],
        "system_admin": ["system_admin", "notification_system_admin"],
        "export": ["export_notifications", "admin_notifications"],
        "resend": ["resend_notifications", "manage_notifications"],
    }
    required_permissions = permission_map.get(action, [])
    return any(perm in user_permissions for perm in required_permissions)


def _get_user_makerspace_id(user: dict) -> str:
    """Get user's makerspace ID"""
    return user.get("makerspace_id", "default_makerspace")


router = APIRouter()

# List notifications for the current user
@router.get("/", response_model=List[NotificationResponse])
async def list_notifications(
    skip: int = 0,
    limit: int = 50,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List notifications for the current user"""
    import uuid
    try:
        user_uuid = uuid.UUID(str(current_user.user_id))
    except Exception:
        # fallback to string if not a valid UUID, but this will likely fail DB query
        user_uuid = current_user.user_id
    notifications = db.query(Notification).filter(
        Notification.recipient_id == user_uuid
    ).order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()
    return notifications


# Core Notification Routes
@router.post(
    "/",
    response_model=NotificationResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_notification(
    notification: NotificationCreate,
    background_tasks: BackgroundTasks,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create and send a notification"""
    if not _has_notification_permission(current_user, "create"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to create notification."
        )
    # ... function body continues ...


@router.get("/unread/summary", response_model=UnreadNotificationsSummary)
async def get_unread_summary(
    current_user=Depends(get_current_user), db: Session = Depends(get_db)
):
    """Get unread notifications summary"""
    try:
        summary = crud_notifications.get_unread_summary(db, current_user.user_id)
        return summary
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get unread summary: {str(e)}",
        )


@router.get("/stats", response_model=NotificationStats)
async def get_notification_stats(
    current_user=Depends(get_current_user), db: Session = Depends(get_db)
):
    """Get notification statistics"""
    try:
        user_id = (
            current_user.user_id
            if not _has_notification_permission(current_user, "view_all")
            else None
        )
        stats = crud_notifications.get_notification_stats(
            db, _get_user_makerspace_id(current_user), user_id
        )
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get notification stats: {str(e)}",
        )


@router.get("/{notification_id}", response_model=NotificationResponse)
async def get_notification(
    notification_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get specific notification"""
    notification = crud_notifications.get_notification(db, notification_id)
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )

    # Check if user can access this notification
    if (
        notification.recipient_id != current_user.user_id
        and not _has_notification_permission(current_user, "view_all")
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Access denied"
        )

    return notification


@router.put("/{notification_id}", response_model=NotificationResponse)
async def update_notification(
    notification_id: str,
    notification_update: NotificationUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update notification (mainly for marking as read)"""
    notification = crud_notifications.get_notification(db, notification_id)
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )

    # Check if user can update this notification
    if (
        notification.recipient_id != current_user.user_id
        and not _has_notification_permission(current_user, "update")
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Access denied"
        )

    updated_notification = crud_notifications.update_notification(
        db, notification_id, notification_update
    )
    return updated_notification


@router.post("/{notification_id}/read")
async def mark_as_read(
    notification_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mark notification as read"""
    notification = crud_notifications.get_notification(db, notification_id)
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )

    if notification.recipient_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Access denied"
        )

    crud_notifications.mark_as_read(db, notification_id)
    return {"message": "Notification marked as read"}


@router.post("/mark-all-read")
async def mark_all_as_read(
    current_user=Depends(get_current_user), db: Session = Depends(get_db)
):
    """Mark all notifications as read for current user"""
    try:
        count = crud_notifications.mark_all_as_read(db, current_user.user_id)
        return {"message": f"Marked {count} notifications as read"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to mark notifications as read: {str(e)}",
        )


@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete notification"""
    if not _has_notification_permission(current_user, "delete"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to delete notifications",
        )

    success = crud_notifications.delete_notification(db, notification_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )

    return {"message": "Notification deleted"}


# Template Management Routes
@router.post(
    "/templates/",
    response_model=NotificationTemplateResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_notification_template(
    template: NotificationTemplateCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create notification template"""
    if not _has_notification_permission(current_user, "manage_templates"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to create templates",
        )

    try:
        db_template = crud_notifications.create_template(db, template)
        return db_template
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create template: {str(e)}",
        )


@router.get("/templates/", response_model=List[NotificationTemplateResponse])
async def get_notification_templates(
    notification_type: Optional[NotificationType] = Query(None),
    channel: Optional[NotificationChannel] = Query(None),
    is_active: Optional[bool] = Query(None),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get notification templates"""
    if not _has_notification_permission(current_user, "view_templates"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to view templates",
        )

    templates = crud_notifications.get_templates(
        db,
        _get_user_makerspace_id(current_user)
    )
    return templates


@router.put("/templates/{template_id}", response_model=NotificationTemplateResponse)
async def update_notification_template(
    template_id: str,
    template_update: NotificationTemplateUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update notification template"""
    if not _has_notification_permission(current_user, "manage_templates"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to update templates",
        )

    template = crud_notifications.update_template(db, template_id, template_update)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Template not found"
        )
    return template


@router.post("/templates/{template_id}/render", response_model=TemplateRenderResponse)
async def render_template(
    template_id: str,
    render_request: TemplateRenderRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Render template with variables"""
    if not _has_notification_permission(current_user, "view_templates"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to render templates",
        )

    try:
        rendered = crud_notifications.render_template(db, template_id, render_request)
        return rendered
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to render template: {str(e)}",
        )


# Preference Management Routes
@router.get("/preferences/", response_model=NotificationPreferenceResponse)
async def get_notification_preferences(
    current_user=Depends(get_current_user), db: Session = Depends(get_db)
):
    """Get notification preferences for current user"""
    preferences = crud_notifications.get_user_preferences(db, current_user.user_id)
    if not preferences:
        # Create default preferences
        default_prefs = NotificationPreferenceCreate()
        preferences = crud_notifications.create_user_preferences(
            db,
            current_user.user_id,
            default_prefs
        )
    return preferences


@router.put("/preferences/", response_model=NotificationPreferenceResponse)
async def update_notification_preferences(
    preferences_update: NotificationPreferenceUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update notification preferences"""
    preferences = crud_notifications.update_user_preferences(
        db, current_user.user_id, preferences_update
    )
    if not preferences:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Preferences not found",
        )
    return preferences


@router.post("/preferences/push-token")
async def register_push_token(
    token_data: PushTokenRegister,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Register push notification token"""
    try:
        crud_notifications.register_push_token(db, current_user.user_id, token_data)
        return {"message": "Push token registered successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to register push token: {str(e)}",
        )


# Rule Management Routes
@router.post(
    "/rules/",
    response_model=NotificationRuleResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_notification_rule(
    rule: NotificationRuleCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create notification rule"""
    if not _has_notification_permission(current_user, "manage_rules"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to create rules",
        )

    try:
        makerspace_id = _get_user_makerspace_id(current_user)
        db_rule = crud_notifications.create_rule(db, makerspace_id, rule)
        return db_rule
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create rule: {str(e)}",
        )


@router.get("/rules/", response_model=List[NotificationRuleResponse])
async def get_notification_rules(
    notification_type: Optional[NotificationType] = Query(None),
    is_active: Optional[bool] = Query(None),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get notification rules"""
    if not _has_notification_permission(current_user, "view_rules"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to view rules",
        )

    rules = crud_notifications.get_rules(
        db, _get_user_makerspace_id(current_user)
    )
    return rules


@router.put("/rules/{rule_id}", response_model=NotificationRuleResponse)
async def update_notification_rule(
    rule_id: str,
    rule_update: NotificationRuleUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update notification rule"""
    if not _has_notification_permission(current_user, "manage_rules"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to update rules",
        )

    rule = crud_notifications.update_rule(db, rule_id, rule_update)
    if not rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Rule not found"
        )
    return rule


@router.delete("/rules/{rule_id}")
async def delete_notification_rule(
    rule_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete notification rule"""
    if not _has_notification_permission(current_user, "manage_rules"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to delete rules",
        )

    success = crud_notifications.delete_rule(db, rule_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Rule not found"
        )
    return {"message": "Rule deleted"}


# Analytics Routes
@router.get("/analytics/", response_model=List[NotificationAnalyticsResponse])
async def get_notification_analytics(
    period_type: str = Query("daily", pattern="^(hourly|daily|weekly|monthly)$"),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get notification analytics"""
    if not _has_notification_permission(current_user, "view_analytics"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to view analytics",
        )

    analytics = crud_notifications.get_analytics(
        db,
        _get_user_makerspace_id(current_user),
        period_type,
        start_date,
        end_date,
    )
    return analytics


# Testing and Debug Routes
@router.post("/test")
async def test_notification(
    test_data: NotificationTest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Send test notification"""
    if not _has_notification_permission(current_user, "test"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to send test notifications",
        )

    try:
        result = crud_notifications.send_test_notification(
            db, test_data, _get_user_makerspace_id(current_user)
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send test notification: {str(e)}",
        )


@router.get("/system/health", response_model=NotificationSystemHealth)
async def get_system_health(
    current_user=Depends(get_current_user), db: Session = Depends(get_db)
):
    """Get notification system health"""
    if not _has_notification_permission(current_user, "system_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to view system health",
        )

    health = crud_notifications.get_system_health(db)
    return health


# Export Routes
@router.post("/export")
async def export_notifications(
    export_request: NotificationExport,
    background_tasks: BackgroundTasks,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Export notifications data"""
    if not _has_notification_permission(current_user, "export"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to export notifications",
        )

    try:
        export_id = crud_notifications.create_export_request(
            db,
            export_request,
            _get_user_makerspace_id(current_user),
            current_user.user_id,
        )

        background_tasks.add_task(crud_notifications.process_export, db, export_id)

        return {"export_id": export_id, "message": "Export request created"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create export: {str(e)}",
        )


# Real-time WebSocket endpoint

@router.websocket("/api/v1/notifications/ws/{user_id}")
async def websocket_endpoint(
    websocket: WebSocket, user_id: str, db: Session = Depends(get_db)
):
    """WebSocket endpoint for real-time notifications with JWT verification"""
    # Expect token in query params or headers
    token = None
    # Try to get token from query params
    if "token" in websocket.query_params:
        token = websocket.query_params["token"]
    # Try to get token from headers (Authorization: Bearer ...)
    elif "authorization" in websocket.headers:
        auth_header = websocket.headers["authorization"]
        if auth_header.lower().startswith("bearer "):
            token = auth_header[7:]

    if not token:
        await websocket.close(code=4401)
        return

    # Verify JWT
    try:
        header = jwt.get_unverified_header(token)
        key_to_use = None
        if KEYCLOAK_USE_JWKS:
            kid = header.get("kid")
            if kid:
                key_to_use = await get_jwks_pem(kid)
        if not key_to_use:
            key_to_use = await get_keycloak_public_key()
        decode_kwargs = {
            "algorithms": ["RS256"],
            "issuer": KEYCLOAK_ISSUER,
        }
        if KEYCLOAK_VERIFY_AUD:
            decode_kwargs["audience"] = KEYCLOAK_CLIENT_ID
        payload = jwt.decode(token, key_to_use, **decode_kwargs)
        # Optionally, check that user_id matches token subject
        if payload.get("sub") != user_id:
            await websocket.close(code=4403)
            return
    except JWTError:
        await websocket.close(code=4401)
        return

    await websocket.accept()
    try:
        crud_notifications.register_websocket_connection(user_id, websocket)
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            if message.get("type") == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
            elif message.get("type") == "mark_read":
                notification_id = message.get("notification_id")
                if notification_id:
                    crud_notifications.mark_as_read(db, notification_id)
    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.error("WebSocket error", exc_info=e)
    finally:
        crud_notifications.unregister_websocket_connection(user_id)



