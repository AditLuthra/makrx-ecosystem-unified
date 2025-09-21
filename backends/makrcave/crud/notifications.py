import sys
from sqlalchemy.orm import Session
from ..models.notifications import Notification, NotificationStatus
import uuid
from typing import Optional
from . import notifications_stubs as _stubs

# Patch: Re-export missing stub functions if not present
_crud_missing = [
    "get_notification", "update_notification", "delete_notification",
    "get_analytics", "send_test_notification", "get_system_health",
    "create_export_request", "process_export",
    "register_websocket_connection", "unregister_websocket_connection"
]
_mod = sys.modules[__name__]
for _name in _crud_missing:
    if not hasattr(_mod, _name):
        setattr(_mod, _name, getattr(_stubs, _name))


def get_unread_summary(db: Session, user_id: str):
    """Return count of unread notifications for a user."""
    unread_count = db.query(Notification).filter(
        Notification.recipient_id == user_id,
        Notification.status == NotificationStatus.PENDING
    ).count()
    return {"unread_count": unread_count}


def get_notification_stats(
    db: Session, makerspace_id: str, user_id: Optional[str] = None
):
    """Return stats for notifications in a makerspace, optionally filtered by user."""
    q = db.query(Notification).filter(Notification.makerspace_id == makerspace_id)
    if user_id:
        q = q.filter(Notification.recipient_id == user_id)
    total = q.count()
    read = q.filter(Notification.status == NotificationStatus.READ).count()
    unread = q.filter(Notification.status == NotificationStatus.PENDING).count()
    return {"total": total, "read": read, "unread": unread}


def mark_as_read(db: Session, notification_id: str):
    """Mark a notification as read."""
    notification = db.query(Notification).filter(
        Notification.id == notification_id
    ).first()
    if notification:
        notification.status = NotificationStatus.READ
        db.commit()
        db.refresh(notification)
    return notification


def mark_all_as_read(db: Session, user_id: str):
    """Mark all notifications for a user as read."""
    q = db.query(Notification).filter(
        Notification.recipient_id == user_id,
        Notification.status != NotificationStatus.READ
    )
    count = q.count()
    q.update({"status": NotificationStatus.READ}, synchronize_session=False)
    db.commit()
    return count


# --- Template Management ---

def create_template(db: Session, template_create):
    from ..models.notifications import NotificationTemplate
    db_template = NotificationTemplate(
        id=uuid.uuid4(),
        makerspace_id=template_create.makerspace_id,
        template_name=template_create.template_name,
        notification_type=template_create.notification_type,
        channel=template_create.channel,
        language=template_create.language or "en",
        subject_template=template_create.subject_template,
        title_template=template_create.title_template,
        message_template=template_create.message_template,
        action_text_template=template_create.action_text_template,
        action_url_template=template_create.action_url_template,
        is_active=(
            template_create.is_active if template_create.is_active is not None else True
        ),
        is_default=(
            template_create.is_default if template_create.is_default is not None
            else False
        ),
        priority=template_create.priority,
        required_variables=template_create.required_variables,
        optional_variables=template_create.optional_variables,
        validation_schema=template_create.validation_schema,
        html_template=template_create.html_template,
        css_styles=template_create.css_styles,
        attachments=template_create.attachments,
        created_by=template_create.created_by,
    )
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template


def get_templates(db: Session, makerspace_id: str, skip=0, limit=50):
    from ..models.notifications import NotificationTemplate
    q = db.query(NotificationTemplate).filter(
        (NotificationTemplate.makerspace_id == makerspace_id) |
        (NotificationTemplate.makerspace_id is None)
    )
    return q.offset(skip).limit(limit).all()


def update_template(db: Session, template_id: str, template_update):
    from ..models.notifications import NotificationTemplate
    template = db.query(NotificationTemplate).filter(
        NotificationTemplate.id == template_id
    ).first()
    if not template:
        return None
    for field, value in template_update.dict(exclude_unset=True).items():
        setattr(template, field, value)
    db.commit()
    db.refresh(template)
    return template


def delete_template(db: Session, template_id: str):
    from ..models.notifications import NotificationTemplate
    template = db.query(NotificationTemplate).filter(
        NotificationTemplate.id == template_id
    ).first()
    if not template:
        return False
    db.delete(template)
    db.commit()
    return True


def render_template(db: Session, template_id: str, render_request):
    from ..models.notifications import NotificationTemplate
    template = db.query(NotificationTemplate).filter(
        NotificationTemplate.id == template_id
    ).first()
    if not template:
        return None
    # Simple string formatting for demonstration;
    # use a real template engine in production
    context = render_request.context if hasattr(render_request, 'context') else {}
    rendered = {
        "title": (
            template.title_template.format(**context)
            if template.title_template else None
        ),
        "message": (
            template.message_template.format(**context)
            if template.message_template else None
        ),
        "action_text": (
            template.action_text_template.format(**context)
            if template.action_text_template else None
        ),
        "action_url": (
            template.action_url_template.format(**context)
            if template.action_url_template else None
        ),
        "subject": (
            template.subject_template.format(**context)
            if template.subject_template else None
        ),
        "html": (
            template.html_template.format(**context)
            if template.html_template else None
        ),
    }
    return rendered


# --- User Preferences ---

def get_user_preferences(db: Session, user_id: str):
    from ..models.notifications import NotificationPreference
    return db.query(NotificationPreference).filter(
        NotificationPreference.user_id == user_id
    ).first()


def create_user_preferences(db: Session, user_id: str, prefs_create):
    from ..models.notifications import NotificationPreference
    db_pref = NotificationPreference(
        id=uuid.uuid4(),
        user_id=user_id,
        makerspace_id=prefs_create.makerspace_id,
        global_enabled=prefs_create.global_enabled,
        quiet_hours_enabled=prefs_create.quiet_hours_enabled,
        quiet_hours_start=prefs_create.quiet_hours_start,
        quiet_hours_end=prefs_create.quiet_hours_end,
        timezone=prefs_create.timezone,
        email_enabled=prefs_create.email_enabled,
        email_address=prefs_create.email_address,
        email_frequency=prefs_create.email_frequency,
        sms_enabled=prefs_create.sms_enabled,
        sms_number=prefs_create.sms_number,
        push_enabled=prefs_create.push_enabled,
        push_tokens=prefs_create.push_tokens,
        in_app_enabled=prefs_create.in_app_enabled,
        in_app_sound=prefs_create.in_app_sound,
        notification_type_preferences=prefs_create.notification_type_preferences,
        daily_digest_enabled=prefs_create.daily_digest_enabled,
        daily_digest_time=prefs_create.daily_digest_time,
        weekly_digest_enabled=prefs_create.weekly_digest_enabled,
        weekly_digest_day=prefs_create.weekly_digest_day,
    )
    db.add(db_pref)
    db.commit()
    db.refresh(db_pref)
    return db_pref


def update_user_preferences(db: Session, user_id: str, prefs_update):
    from ..models.notifications import NotificationPreference
    pref = db.query(NotificationPreference).filter(
        NotificationPreference.user_id == user_id
    ).first()
    if not pref:
        return None
    for field, value in prefs_update.dict(exclude_unset=True).items():
        setattr(pref, field, value)
    db.commit()
    db.refresh(pref)
    return pref


def register_push_token(db: Session, user_id: str, token_data):
    from ..models.notifications import NotificationPreference
    pref = db.query(NotificationPreference).filter(
        NotificationPreference.user_id == user_id
    ).first()
    if not pref:
        return None
    tokens = pref.push_tokens or []
    new_token = (
        token_data.token if hasattr(token_data, 'token')
        else token_data.get('token')
    )
    if new_token and new_token not in tokens:
        tokens.append(new_token)
        pref.push_tokens = tokens
        db.commit()
        db.refresh(pref)
    return pref


# --- Notification Rules ---

def create_rule(db: Session, makerspace_id: str, rule_create):
    from ..models.notifications import NotificationRule
    db_rule = NotificationRule(
        id=uuid.uuid4(),
        makerspace_id=makerspace_id,
        rule_name=rule_create.rule_name,
        description=rule_create.description,
        notification_type=rule_create.notification_type,
        trigger_event=rule_create.trigger_event,
        trigger_conditions=rule_create.trigger_conditions,
        is_active=(
            rule_create.is_active if rule_create.is_active is not None else True
        ),
        priority=rule_create.priority,
        channels=rule_create.channels,
        throttle_duration_minutes=rule_create.throttle_duration_minutes,
        max_notifications_per_day=rule_create.max_notifications_per_day,
        max_notifications_per_hour=rule_create.max_notifications_per_hour,
        recipient_type=rule_create.recipient_type,
        recipient_criteria=rule_create.recipient_criteria,
        schedule_type=rule_create.schedule_type,
        schedule_config=rule_create.schedule_config,
        triggered_count=0,
        last_triggered=None,
        created_by=rule_create.created_by,
    )
    db.add(db_rule)
    db.commit()
    db.refresh(db_rule)
    return db_rule


def get_rules(db: Session, makerspace_id: str, skip=0, limit=50):
    from ..models.notifications import NotificationRule
    q = db.query(NotificationRule).filter(
        NotificationRule.makerspace_id == makerspace_id
    )
    return q.offset(skip).limit(limit).all()


def update_rule(db: Session, rule_id: str, rule_update):
    from ..models.notifications import NotificationRule
    rule = db.query(NotificationRule).filter(
        NotificationRule.id == rule_id
    ).first()
    if not rule:
        return None
    for field, value in rule_update.dict(exclude_unset=True).items():
        setattr(rule, field, value)
    db.commit()
    db.refresh(rule)
    return rule


def delete_rule(db: Session, rule_id: str):
    from ..models.notifications import NotificationRule
    rule = db.query(NotificationRule).filter(
        NotificationRule.id == rule_id
    ).first()
    if not rule:
        return False
    db.delete(rule)
    db.commit()
    return True

