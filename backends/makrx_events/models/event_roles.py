from sqlalchemy import (
    Column,
    String,
    Text,
    DateTime,
    Boolean,
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.sql import func
from ..database import Base


class EventRole(Base):
    __tablename__ = "event_roles"

    id = Column(String, primary_key=True)
    event_id = Column(
        String,
        ForeignKey("events.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    user_id = Column(
        String,
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    role = Column(String, nullable=False)
    permissions = Column(Text)
    assigned_by = Column(String, ForeignKey("users.id", ondelete="SET NULL"))
    assigned_at = Column(DateTime, server_default=func.now())
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint("event_id", "user_id", "role", name="uq_event_roles_event_user_role"),
    )
