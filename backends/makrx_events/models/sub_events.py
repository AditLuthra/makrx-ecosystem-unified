from sqlalchemy import (
    Column,
    String,
    Text,
    DateTime,
    Integer,
    Numeric,
    Boolean,
    ForeignKey,
    UniqueConstraint,
    Index,
)
from sqlalchemy.sql import func
from ..database import Base


class SubEvent(Base):
    __tablename__ = "sub_events"

    id = Column(String, primary_key=True)
    microsite_id = Column(
        String,
        ForeignKey("microsites.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    slug = Column(Text, index=True)
    title = Column(Text, nullable=False)
    type = Column(String)
    track = Column(String)
    capacity = Column(Integer)
    price = Column(Numeric)
    currency = Column(String)
    registration_type = Column(String)
    status = Column(String, default="draft")
    registration_deadline = Column(DateTime)
    starts_at = Column(DateTime)
    ends_at = Column(DateTime)
    location = Column(Text)
    short_desc = Column(Text)
    long_desc = Column(Text)
    rules_md = Column(Text)
    prizes_md = Column(Text)
    waitlist = Column(Boolean)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    __table_args__ = (
        UniqueConstraint(
            "microsite_id", "slug", name="uq_sub_events_microsite_slug"
        ),
        Index("ix_sub_events_status", "status"),
    )
