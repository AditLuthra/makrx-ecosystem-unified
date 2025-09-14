from sqlalchemy import Column, String, Text, DateTime, UniqueConstraint
from sqlalchemy.sql import func
from ..database import Base


class Microsite(Base):
    __tablename__ = "microsites"

    id = Column(String, primary_key=True)
    slug = Column(Text, nullable=False, index=True, unique=True)
    title = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
