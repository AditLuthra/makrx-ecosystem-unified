from sqlalchemy import Column, String, Text, DateTime, ForeignKey, UniqueConstraint, Index
from sqlalchemy.sql import func
from ..database import Base


class EventRegistration(Base):
    __tablename__ = "event_registrations"

    id = Column(String, primary_key=True)
    event_id = Column(String, ForeignKey("events.id", ondelete="CASCADE"), index=True)
    microsite_id = Column(String, ForeignKey("microsites.id", ondelete="SET NULL"))
    sub_event_id = Column(String, ForeignKey("sub_events.id", ondelete="SET NULL"))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    status = Column(String, default="confirmed")
    payment_intent_id = Column(String)
    paid_at = Column(DateTime)
    checked_in_at = Column(DateTime)
    participant_info = Column(Text)
    answers = Column(Text)
    terms_accepted = Column(String)
    marketing_consent = Column(String)
    amount_paid = Column(String)
    payment_status = Column(String)
    registered_at = Column(DateTime, server_default=func.now())
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    meta = Column(Text)

    __table_args__ = (
        UniqueConstraint("event_id", "user_id", name="uq_event_registrations_event_user"),
        Index("ix_event_registrations_status", "status"),
    )
