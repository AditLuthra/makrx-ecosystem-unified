from sqlalchemy import (
    Column,
    String,
    Text,
    DateTime,
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.sql import func
from ..database import Base


class Sponsor(Base):
    __tablename__ = "sponsors"

    id = Column(String, primary_key=True)
    event_id = Column(
        String,
        ForeignKey("events.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    name = Column(Text, nullable=False)
    tier = Column(String)
    status = Column(String, default="active")
    created_at = Column(DateTime, server_default=func.now())

    __table_args__ = (
        UniqueConstraint("event_id", "name", name="uq_sponsors_event_name"),
    )
