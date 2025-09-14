from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey, UniqueConstraint, Index
from sqlalchemy.sql import func
from ..database import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(String, primary_key=True)
    slug = Column(Text, nullable=False, index=True, unique=True)
    title = Column(Text)
    organizer_id = Column(String, index=True)
    status = Column(String, default="draft", index=True)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        Index("ix_events_status_created", "status", "created_at"),
    )


class EventFeatures(Base):
    __tablename__ = "event_features"

    event_id = Column(String, ForeignKey("events.id", ondelete="CASCADE"), primary_key=True)
    enable_teams = Column(Boolean, default=False)
    enable_sponsors = Column(Boolean, default=False)
    enable_tournaments = Column(Boolean, default=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
