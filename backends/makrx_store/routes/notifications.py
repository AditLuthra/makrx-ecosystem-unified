"""
User notifications and settings endpoints (DB-backed)
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.dialects.postgresql import JSONB

from ..core.security import get_current_user, AuthUser, require_admin
from ..database import get_db
from ..models.admin import Notification as NotificationModel, SystemConfig
import os

router = APIRouter()

DEFAULT_SETTINGS = {
    "email_notifications": True,
    "push_notifications": False,
    "sms_notifications": False,
    "marketing_emails": False,
    "order_updates": True,
    "product_updates": True,
    "security_alerts": True,
    "processing_updates": True,
}


@router.get("/user/notifications")
async def get_user_notification_settings(
    current_user: AuthUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    key = f"notifications:{current_user.user_id}"
    stmt = select(SystemConfig).where(SystemConfig.key == key)
    row = (await db.execute(stmt)).scalars().first()
    return row.value if row else DEFAULT_SETTINGS


@router.put("/user/notifications")
async def update_user_notification_settings(
    settings: Dict[str, Any],
    current_user: AuthUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    # Merge with defaults to ensure all keys present
    updated = {**DEFAULT_SETTINGS, **settings}
    key = f"notifications:{current_user.user_id}"
    stmt = select(SystemConfig).where(SystemConfig.key == key)
    existing = (await db.execute(stmt)).scalars().first()
    if existing:
        existing.value = updated
    else:
        cfg = SystemConfig(
            key=key,
            value=updated,
            description="User notification settings",
            category="notifications",
        )
        db.add(cfg)
    await db.commit()
    return {"message": "Settings updated"}


@router.get("/notifications")
async def list_notifications(
    current_user: AuthUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    type: str | None = Query(None),
    status: str | None = Query(None),
    read: bool | None = Query(None),
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    base = select(NotificationModel).where(
        NotificationModel.user_id == current_user.user_id
    )
    if type:
        base = base.where(NotificationModel.type == type)
    if status:
        base = base.where(NotificationModel.status == status)
    if read is not None:
        # Filter by meta->>'read' JSON flag
        base = base.where(
            (
                NotificationModel.meta["read"].astext
                == ("true" if read else "false")
            )
        )

    # Count
    count_stmt = base.with_only_columns(
        func.count(NotificationModel.id)
    ).order_by(None)
    total = (await db.execute(count_stmt)).scalar_one()

    # Page
    offset = (page - 1) * per_page
    rows = (
        (
            await db.execute(
                base.order_by(NotificationModel.created_at.desc())
                .offset(offset)
                .limit(per_page)
            )
        )
        .scalars()
        .all()
    )
    items = [
        {
            "id": str(n.id),
            "type": n.type,
            "title": n.subject or n.template,
            "message": n.message,
            "timestamp": (
                n.created_at.isoformat()
                if n.created_at
                else datetime.utcnow().isoformat()
            ),
            "read": bool((n.meta or {}).get("read", False)),
            "related_type": n.related_type,
            "related_id": n.related_id,
        }
        for n in rows
    ]
    unread_stmt = select(func.count(NotificationModel.id)).where(
        NotificationModel.user_id == current_user.user_id,
        (NotificationModel.meta["read"].astext != "true"),
    )
    unread_count = (await db.execute(unread_stmt)).scalar_one()
    pages = max(1, (total + per_page - 1) // per_page)
    return {
        "notifications": items,
        "unread_count": unread_count,
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": pages,
    }


@router.get("/admin/notifications")
async def admin_list_notifications(
    current_admin=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    user_id: Optional[str] = Query(None),
    email: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    read: Optional[bool] = Query(None),
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
):
    base = select(NotificationModel)
    if user_id:
        base = base.where(NotificationModel.user_id == user_id)
    if email:
        base = base.where(NotificationModel.email == email)
    if type:
        base = base.where(NotificationModel.type == type)
    if status:
        base = base.where(NotificationModel.status == status)
    if read is not None:
        base = base.where(
            (
                NotificationModel.meta["read"].astext
                == ("true" if read else "false")
            )
        )
    if date_from:
        base = base.where(NotificationModel.created_at >= date_from)
    if date_to:
        base = base.where(NotificationModel.created_at <= date_to)

    count_stmt = base.with_only_columns(
        func.count(NotificationModel.id)
    ).order_by(None)
    total = (await db.execute(count_stmt)).scalar_one()

    offset = (page - 1) * per_page
    rows = (
        (
            await db.execute(
                base.order_by(NotificationModel.created_at.desc())
                .offset(offset)
                .limit(per_page)
            )
        )
        .scalars()
        .all()
    )
    items = [
        {
            "id": str(n.id),
            "user_id": n.user_id,
            "email": n.email,
            "type": n.type,
            "status": n.status,
            "subject": n.subject,
            "message": n.message,
            "timestamp": n.created_at.isoformat() if n.created_at else None,
            "read": bool((n.meta or {}).get("read", False)),
            "related_type": n.related_type,
            "related_id": n.related_id,
            "provider": n.provider,
        }
        for n in rows
    ]
    pages = max(1, (total + per_page - 1) // per_page)
    return {
        "notifications": items,
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": pages,
    }


@router.post("/admin/notifications/seed")
async def seed_notifications(
    current_admin=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
    user_id: Optional[str] = Query(
        None, description="Target user_id; defaults to admin user"
    ),
    count: int = Query(5, ge=1, le=50),
):
    # Only allow seeding in non-production environments
    if os.getenv("ENVIRONMENT", "development") == "production":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seeding disabled in production",
        )

    target_user = user_id or getattr(current_admin, "user_id", None)
    if not target_user:
        raise HTTPException(
            status_code=400, detail="Unable to resolve user_id for seeding"
        )

    now = datetime.utcnow()
    created = 0
    types = ["info", "warning", "email", "push"]
    statuses = ["pending", "sent", "delivered"]
    for i in range(count):
        n = NotificationModel(
            user_id=target_user,
            type=types[i % len(types)],
            template="seed-notification",
            subject=f"Seed Notification {i + 1}",
            message=f"This is a seeded notification #{i + 1}",
            status=statuses[i % len(statuses)],
            meta={"read": i % 3 == 0},
            provider="internal",
            created_at=now - timedelta(minutes=5 * i),
        )
        db.add(n)
        created += 1
    await db.commit()
    return {
        "message": "Notifications seeded",
        "created": created,
        "user_id": target_user,
    }


@router.post("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user: AuthUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    stmt = select(NotificationModel).where(
        NotificationModel.id == notification_id,
        NotificationModel.user_id == current_user.user_id,
    )
    notif = (await db.execute(stmt)).scalars().first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    meta = notif.meta or {}
    meta["read"] = True
    notif.meta = meta
    await db.commit()
    return {"message": "Notification marked as read"}


@router.post("/notifications/mark-all-read")
async def mark_all_notifications_read(
    current_user: AuthUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    stmt = select(NotificationModel).where(
        NotificationModel.user_id == current_user.user_id
    )
    rows = (await db.execute(stmt)).scalars().all()
    for notif in rows:
        meta = notif.meta or {}
        meta["read"] = True
        notif.meta = meta
    await db.commit()
    return {"message": "All notifications marked as read"}
