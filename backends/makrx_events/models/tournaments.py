from sqlalchemy import Column, String, Text, DateTime, Integer, ForeignKey
from sqlalchemy.sql import func
from ..database import Base


class Tournament(Base):
    __tablename__ = "tournaments"

    id = Column(String, primary_key=True)
    event_id = Column(String, ForeignKey("events.id", ondelete="CASCADE"), index=True, nullable=False)
    name = Column(Text, nullable=False)
    description = Column(Text)
    format = Column(String)
    status = Column(String, default="scheduled")
    max_participants = Column(Integer)
    current_round = Column(Integer)
    activity_id = Column(String)
    created_at = Column(DateTime, server_default=func.now())
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
