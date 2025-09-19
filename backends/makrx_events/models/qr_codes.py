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


class QRCode(Base):
    __tablename__ = "qr_codes"

    id = Column(String, primary_key=True)
    code = Column(String, nullable=False, unique=True, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    event_id = Column(String, ForeignKey("events.id", ondelete="CASCADE"), index=True)
    type = Column(String, nullable=False)
    data = Column(Text)
    expires_at = Column(DateTime)
    used_at = Column(DateTime)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
