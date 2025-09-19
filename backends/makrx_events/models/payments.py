from sqlalchemy import (
    Column,
    String,
    Text,
    DateTime,
    Numeric,
    ForeignKey,
)
from sqlalchemy.sql import func
from ..database import Base


class Payment(Base):
    __tablename__ = "payments"

    id = Column(String, primary_key=True)
    registration_id = Column(
        String,
        ForeignKey("event_registrations.id", ondelete="SET NULL"),
        index=True,
    )
    user_id = Column(
        String,
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    event_id = Column(String, ForeignKey("events.id", ondelete="SET NULL"))
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String, default="USD")
    status = Column(String, default="pending")
    payment_method = Column(String)
    transaction_id = Column(String)
    payment_intent_id = Column(String)
    # NOTE: avoid using reserved name "metadata" on declarative models
    payment_metadata = Column("metadata", Text)
    processed_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
