from sqlalchemy import Column, String, Text, DateTime, UniqueConstraint, Index
from sqlalchemy.sql import func
from ..database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    username = Column(Text)
    email = Column(Text, index=True)
    keycloak_id = Column(String, index=True)
    first_name = Column(Text)
    last_name = Column(Text)
    profile_image_url = Column(Text)
    role = Column(String, default="user")
    status = Column(String, default="active")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint("email", name="uq_users_email"),
        UniqueConstraint("keycloak_id", name="uq_users_keycloak_id"),
        Index("ix_users_status", "status"),
    )
