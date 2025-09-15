from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from ..database import Base


class UserActivity(Base):
    __tablename__ = "user_activities"

    id = Column(String, primary_key=True)
    user_id = Column(
        String,
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    event_id = Column(String, ForeignKey("events.id", ondelete="SET NULL"), index=True)
    activity = Column(String, nullable=False)
    timestamp = Column(DateTime, server_default=func.now())
    meta = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
