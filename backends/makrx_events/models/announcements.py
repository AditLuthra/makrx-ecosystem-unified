from sqlalchemy import (
    Column,
    String,
    Text,
    DateTime,
    Boolean,
    ForeignKey,
)
from sqlalchemy.sql import func
from ..database import Base


class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(String, primary_key=True)
    event_id = Column(
        String,
        ForeignKey("events.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    send_push_notification = Column(Boolean, default=False)
    title = Column(Text, nullable=False)
    content = Column(Text)
    priority = Column(String, default="normal")
    target_audience = Column(Text)
    status = Column(String, default="draft")
    scheduled_at = Column(DateTime)
    sent_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
