from sqlalchemy import (
    Column,
    String,
    DateTime,
    Boolean,
    ForeignKey,
    Enum as SQLEnum,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from ..database import Base
from .enhanced_member import MemberRole, InviteStatus


class MemberInvite(Base):
    __tablename__ = "member_invites"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), nullable=False, index=True)
    role = Column(SQLEnum(MemberRole), nullable=False, default=MemberRole.USER)

    membership_plan_id = Column(
        UUID(as_uuid=True), ForeignKey("membership_plans.id"), nullable=False
    )
    invited_by = Column(UUID(as_uuid=True), ForeignKey("members.id"), nullable=False)
    makerspace_id = Column(UUID(as_uuid=True), nullable=False, index=True)

    invite_token = Column(String(128), unique=True, nullable=False, index=True)
    invite_message = Column(Text, nullable=True)

    status = Column(SQLEnum(InviteStatus), default=InviteStatus.PENDING)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    accepted_at = Column(DateTime(timezone=True), nullable=True)

    email_sent = Column(Boolean, default=False)
    email_sent_at = Column(DateTime(timezone=True), nullable=True)
    reminder_sent = Column(Boolean, default=False)
    reminder_sent_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    membership_plan = relationship("MembershipPlan")
    invited_by_user = relationship("Member", foreign_keys=[invited_by])
