from __future__ import annotations

from datetime import datetime
import enum
import uuid

from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..database import Base


def _generate_id() -> str:
    return str(uuid.uuid4())


class ProjectStatus(str, enum.Enum):
    DRAFT = "draft"
    PLANNING = "planning"
    IN_PROGRESS = "in-progress"
    COMPLETE = "complete"
    COMPLETED = "completed"
    ON_HOLD = "on-hold"
    CANCELLED = "cancelled"


class ProjectVisibility(str, enum.Enum):
    PUBLIC = "public"
    PRIVATE = "private"
    TEAM_ONLY = "team-only"


class ProjectType(str, enum.Enum):
    INTERNAL = "internal"
    OPEN_COLLAB = "open-collab"
    SPONSORED = "sponsored"


class ProjectPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class CollaboratorRole(str, enum.Enum):
    VIEWER = "viewer"
    EDITOR = "editor"
    OWNER = "owner"


class ActivityType(str, enum.Enum):
    PROJECT_CREATED = "project_created"
    PROJECT_UPDATED = "project_updated"
    PROJECT_FORKED = "project_forked"
    MEMBER_ADDED = "member_added"
    MEMBER_REMOVED = "member_removed"
    MEMBER_ROLE_CHANGED = "member_role_changed"
    BOM_ITEM_ADDED = "bom_item_added"
    BOM_ITEM_REMOVED = "bom_item_removed"
    BOM_ITEM_UPDATED = "bom_item_updated"
    EQUIPMENT_RESERVED = "equipment_reserved"
    EQUIPMENT_UNRESERVED = "equipment_unreserved"
    FILE_UPLOADED = "file_uploaded"
    FILE_REMOVED = "file_removed"
    MILESTONE_ADDED = "milestone_added"
    MILESTONE_COMPLETED = "milestone_completed"
    STATUS_CHANGED = "status_changed"
    # GitHub integration
    GITHUB_REPO_CONNECTED = "github_repo_connected"
    GITHUB_REPO_DISCONNECTED = "github_repo_disconnected"
    GITHUB_COMMIT_PUSHED = "github_commit_pushed"
    GITHUB_PULL_REQUEST_OPENED = "github_pull_request_opened"
    GITHUB_PULL_REQUEST_MERGED = "github_pull_request_merged"
    GITHUB_ISSUE_CREATED = "github_issue_created"
    GITHUB_ISSUE_CLOSED = "github_issue_closed"
    GITHUB_RELEASE_CREATED = "github_release_created"
    GITHUB_FILE_ADDED = "github_file_added"
    GITHUB_FILE_MODIFIED = "github_file_modified"
    GITHUB_FILE_DELETED = "github_file_deleted"


class Project(Base):
    __tablename__ = "projects"

    id = Column(String(100), primary_key=True, default=_generate_id)
    project_id = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    objectives = Column(Text, nullable=True)
    category = Column(String(100), nullable=True)
    subcategories = Column(JSON, nullable=True, default=list)

    project_type = Column(
        Enum(ProjectType), nullable=False, default=ProjectType.INTERNAL, index=True
    )
    owner_id = Column(String(100), nullable=True, index=True)
    creator_id = Column(String(100), nullable=False, index=True)
    makerspace_id = Column(String(100), nullable=True, index=True)
    visibility = Column(
        Enum(ProjectVisibility), nullable=False, default=ProjectVisibility.PRIVATE
    )
    status = Column(Enum(ProjectStatus), nullable=False, default=ProjectStatus.DRAFT)
    priority = Column(
        Enum(ProjectPriority), nullable=False, default=ProjectPriority.MEDIUM
    )

    start_date = Column(DateTime(timezone=True), nullable=True)
    due_date = Column(DateTime(timezone=True), nullable=True)
    end_date = Column(DateTime(timezone=True), nullable=True)
    completion_date = Column(DateTime(timezone=True), nullable=True)

    progress_percentage = Column(Integer, default=0)
    estimated_hours = Column(Float, nullable=True)
    actual_hours = Column(Float, default=0.0)
    estimated_cost = Column(Float, nullable=True)
    actual_cost = Column(Float, default=0.0)

    assigned_members = Column(JSON, nullable=True, default=list)
    equipment_needed = Column(JSON, nullable=True, default=list)
    materials_needed = Column(JSON, nullable=True, default=list)
    skills_required = Column(JSON, nullable=True, default=list)
    required_equipment = Column(JSON, nullable=True, default=list)
    space_requirements = Column(Text, nullable=True)
    safety_considerations = Column(Text, nullable=True)

    documentation_url = Column(String(500), nullable=True)
    files_attached = Column(JSON, nullable=True, default=list)

    allow_collaboration = Column(Boolean, default=True)
    is_public = Column(Boolean, default=False)
    is_featured = Column(Boolean, default=False)
    is_approved = Column(Boolean, default=True)

    tags = Column(JSON, nullable=True, default=list)
    custom_fields = Column(JSON, nullable=True, default=dict)

    difficulty_level = Column(String(20), default="beginner")
    estimated_duration = Column(String(50), nullable=True)
    learning_objectives = Column(JSON, nullable=True, default=list)
    license_type = Column(String(50), default="cc-by-sa")
    required_tools = Column(JSON, nullable=True, default=list)
    budget_breakdown = Column(JSON, nullable=True, default=list)
    sustainability_notes = Column(Text, nullable=True)
    awards = Column(JSON, nullable=True, default=list)

    view_count = Column(Integer, default=0)
    fork_count = Column(Integer, default=0)
    like_count = Column(Integer, default=0)
    comment_count = Column(Integer, default=0)
    download_count = Column(Integer, default=0)

    thumbnail_url = Column(String(500), nullable=True)
    gallery_images = Column(JSON, nullable=True, default=list)
    demo_video_url = Column(String(500), nullable=True)
    showcase_description = Column(Text, nullable=True)
    showcase_highlights = Column(JSON, nullable=True, default=list)

    github_repo_url = Column(String(500), nullable=True)
    github_repo_name = Column(String(200), nullable=True)
    github_access_token = Column(String(500), nullable=True)
    github_webhook_secret = Column(String(200), nullable=True)
    github_integration_enabled = Column(Boolean, default=False)
    github_default_branch = Column(String(100), default="main")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    collaborators = relationship(
        "ProjectCollaborator",
        back_populates="project",
        cascade="all, delete-orphan",
    )
    bom_items = relationship(
        "ProjectBOM",
        back_populates="project",
        cascade="all, delete-orphan",
    )
    equipment_reservations = relationship(
        "ProjectEquipmentReservation",
        back_populates="project",
        cascade="all, delete-orphan",
    )
    files = relationship(
        "ProjectFile",
        back_populates="project",
        cascade="all, delete-orphan",
    )
    milestones = relationship(
        "ProjectMilestone",
        back_populates="project",
        cascade="all, delete-orphan",
    )
    activity_logs = relationship(
        "ProjectActivityLog",
        back_populates="project",
        cascade="all, delete-orphan",
    )
    tasks = relationship(
        "ProjectTask",
        back_populates="project",
        cascade="all, delete-orphan",
    )
    team_roles = relationship(
        "ProjectTeamRole",
        back_populates="project",
        cascade="all, delete-orphan",
    )

    # Collaboration relationships
    collaboration_messages = relationship(
        "CollaborationMessage",
        back_populates="project",
        cascade="all, delete-orphan",
    )

    def __init__(self, **kwargs):  # type: ignore[override]
        provided_project_id = kwargs.get("project_id")
        provided_id = kwargs.get("id")
        if not provided_project_id and not provided_id:
            generated = _generate_id()
            kwargs["project_id"] = generated
            kwargs["id"] = generated
        elif provided_project_id and not provided_id:
            kwargs["id"] = provided_project_id
        elif provided_id and not provided_project_id:
            kwargs["project_id"] = provided_id
        super().__init__(**kwargs)
        if self.owner_id is None:
            self.owner_id = self.creator_id


class ProjectCollaborator(Base):
    __tablename__ = "project_collaborators"

    id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(
        String(100), ForeignKey("projects.project_id"), nullable=False, index=True
    )
    user_id = Column(String(100), nullable=False, index=True)

    role = Column(
        Enum(CollaboratorRole), nullable=False, default=CollaboratorRole.VIEWER
    )
    invited_by = Column(String(100), nullable=False)
    invited_at = Column(DateTime(timezone=True), server_default=func.now())
    accepted_at = Column(DateTime(timezone=True), nullable=True)

    invitation_message = Column(Text, nullable=True)
    email = Column(String(255), nullable=True)
    skills_contributed = Column(JSON, nullable=True, default=list)
    responsibilities = Column(JSON, nullable=True, default=list)
    is_external = Column(Boolean, default=False)
    contribution_hours = Column(Float, nullable=True)

    last_activity_at = Column(DateTime(timezone=True), nullable=True)
    activity_score = Column(Integer, default=0)

    project = relationship(
        "Project",
        back_populates="collaborators",
        primaryjoin="ProjectCollaborator.project_id == Project.project_id",
    )


class ProjectBOM(Base):
    __tablename__ = "project_bom"

    id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(
        String(100), ForeignKey("projects.project_id"), nullable=False, index=True
    )

    item_type = Column(String(50), nullable=False)
    item_id = Column(String(100), nullable=False)
    item_name = Column(String(200), nullable=False)
    part_code = Column(String(100), nullable=True)
    quantity = Column(Integer, nullable=False, default=1)
    unit_cost = Column(Float, nullable=True)
    total_cost = Column(Float, nullable=True)

    makrx_product_code = Column(String(100), nullable=True)
    makrx_store_url = Column(String(500), nullable=True)
    auto_reorder_enabled = Column(Boolean, default=False)
    auto_reorder_quantity = Column(Integer, nullable=True)
    preferred_supplier = Column(String(200), nullable=True)

    usage_notes = Column(Text, nullable=True)
    alternatives = Column(JSON, nullable=True, default=list)
    is_critical = Column(Boolean, default=False)
    procurement_status = Column(String(50), default="needed")
    availability_status = Column(String(50), default="unknown")
    stock_level = Column(Integer, nullable=True)
    reorder_point = Column(Integer, nullable=True)

    category = Column(String(100), nullable=True)
    specifications = Column(JSON, nullable=True)
    compatibility_notes = Column(Text, nullable=True)

    added_by = Column(String(100), nullable=False)
    added_at = Column(DateTime(timezone=True), server_default=func.now())

    project = relationship(
        "Project",
        back_populates="bom_items",
        primaryjoin="ProjectBOM.project_id == Project.project_id",
    )


class ProjectEquipmentReservation(Base):
    __tablename__ = "project_equipment_reservations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(
        String(100), ForeignKey("projects.project_id"), nullable=False, index=True
    )
    equipment_id = Column(String(100), nullable=False)
    reservation_id = Column(String(100), nullable=True)

    requested_start = Column(DateTime(timezone=True), nullable=False)
    requested_end = Column(DateTime(timezone=True), nullable=False)
    actual_start = Column(DateTime(timezone=True), nullable=True)
    actual_end = Column(DateTime(timezone=True), nullable=True)

    status = Column(String(50), default="requested")
    usage_notes = Column(Text, nullable=True)

    requested_by = Column(String(100), nullable=False)
    requested_at = Column(DateTime(timezone=True), server_default=func.now())

    project = relationship(
        "Project",
        back_populates="equipment_reservations",
        primaryjoin="ProjectEquipmentReservation.project_id == Project.project_id",
    )


class ProjectFile(Base):
    __tablename__ = "project_files"

    id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(
        String(100), ForeignKey("projects.project_id"), nullable=False, index=True
    )

    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_type = Column(String(100), nullable=False)
    file_size = Column(Integer, nullable=False)
    file_url = Column(String(500), nullable=False)

    description = Column(Text, nullable=True)
    is_public = Column(Boolean, default=False)
    version = Column(String(20), default="1.0")

    uploaded_by = Column(String(100), nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    project = relationship(
        "Project",
        back_populates="files",
        primaryjoin="ProjectFile.project_id == Project.project_id",
    )


class ProjectMilestone(Base):
    __tablename__ = "project_milestones"

    id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(
        String(100), ForeignKey("projects.project_id"), nullable=False, index=True
    )

    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    target_date = Column(DateTime(timezone=True), nullable=True)
    completion_date = Column(DateTime(timezone=True), nullable=True)

    is_completed = Column(Boolean, default=False)
    priority = Column(String(20), default="medium")
    order_index = Column(Integer, default=0)

    deliverables = Column(JSON, nullable=True)
    success_criteria = Column(Text, nullable=True)

    created_by = Column(String(100), nullable=False)
    completed_by = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    project = relationship(
        "Project",
        back_populates="milestones",
        primaryjoin="ProjectMilestone.project_id == Project.project_id",
    )


class ProjectActivityLog(Base):
    __tablename__ = "project_activity_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(
        String(100), ForeignKey("projects.project_id"), nullable=False, index=True
    )

    activity_type = Column(Enum(ActivityType), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)

    _metadata = Column("metadata", JSON, nullable=True)

    user_id = Column(String(100), nullable=False)
    user_name = Column(String(100), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    project = relationship(
        "Project",
        back_populates="activity_logs",
        primaryjoin="ProjectActivityLog.project_id == Project.project_id",
    )


class ProjectTeamRole(Base):
    __tablename__ = "project_team_roles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(
        String(100), ForeignKey("projects.project_id"), nullable=False, index=True
    )
    user_id = Column(String(100), nullable=False, index=True)

    role_name = Column(String(100), nullable=False)
    role_description = Column(Text, nullable=True)
    permissions = Column(JSON, nullable=True, default=list)

    assigned_by = Column(String(100), nullable=False)
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)

    project = relationship(
        "Project",
        back_populates="team_roles",
        primaryjoin="ProjectTeamRole.project_id == Project.project_id",
    )


class ProjectTask(Base):
    __tablename__ = "project_tasks"

    id = Column(String(100), primary_key=True, default=_generate_id)
    project_id = Column(
        String(100), ForeignKey("projects.project_id"), nullable=False, index=True
    )

    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="pending")
    priority = Column(Enum(ProjectPriority), default=ProjectPriority.MEDIUM)

    assigned_to = Column(String(100), nullable=True, index=True)

    due_date = Column(DateTime(timezone=True), nullable=True)
    completion_date = Column(DateTime(timezone=True), nullable=True)

    estimated_hours = Column(Float, nullable=True)
    actual_hours = Column(Float, default=0.0)
    depends_on = Column(JSON, nullable=True)

    created_by = Column(String(100), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    project = relationship(
        "Project",
        back_populates="tasks",
        primaryjoin="ProjectTask.project_id == Project.project_id",
    )


class ProjectFork(Base):
    __tablename__ = "project_forks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    original_project_id = Column(
        String(100), ForeignKey("projects.project_id"), nullable=False, index=True
    )
    forked_project_id = Column(
        String(100), ForeignKey("projects.project_id"), nullable=False, index=True
    )

    forked_by = Column(String(100), nullable=False, index=True)
    fork_reason = Column(Text, nullable=True)
    modifications_planned = Column(Text, nullable=True)
    forked_at = Column(DateTime(timezone=True), server_default=func.now())

    original_project = relationship("Project", foreign_keys=[original_project_id])
    forked_project = relationship("Project", foreign_keys=[forked_project_id])


class ProjectLike(Base):
    __tablename__ = "project_likes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(
        String(100), ForeignKey("projects.project_id"), nullable=False, index=True
    )
    user_id = Column(String(100), nullable=False, index=True)
    liked_at = Column(DateTime(timezone=True), server_default=func.now())


class ProjectBookmark(Base):
    __tablename__ = "project_bookmarks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(
        String(100), ForeignKey("projects.project_id"), nullable=False, index=True
    )
    user_id = Column(String(100), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ProjectFollow(Base):
    __tablename__ = "project_follows"

    id = Column(Integer, primary_key=True, autoincrement=True)
    owner_id = Column(String(100), nullable=False, index=True)
    follower_id = Column(String(100), nullable=False, index=True)
    project_id = Column(
        String(100), ForeignKey("projects.project_id"), nullable=False, index=True
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ProjectBOMOrder(Base):
    __tablename__ = "project_bom_orders"

    id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(
        String(100), ForeignKey("projects.project_id"), nullable=False, index=True
    )
    bom_item_id = Column(Integer, ForeignKey("project_bom.id"), nullable=False)

    makrx_order_id = Column(String(100), nullable=True)
    quantity_ordered = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=True)
    total_price = Column(Float, nullable=True)

    order_status = Column(String(50), default="pending")
    tracking_number = Column(String(100), nullable=True)
    estimated_delivery = Column(DateTime(timezone=True), nullable=True)
    actual_delivery = Column(DateTime(timezone=True), nullable=True)

    ordered_by = Column(String(100), nullable=False)
    ordered_at = Column(DateTime(timezone=True), server_default=func.now())

    project = relationship("Project", foreign_keys=[project_id])
    bom_item = relationship("ProjectBOM", foreign_keys=[bom_item_id])


class ProjectResourceSharing(Base):
    __tablename__ = "project_resource_sharing"

    id = Column(Integer, primary_key=True, autoincrement=True)
    source_project_id = Column(
        String(100), ForeignKey("projects.project_id"), nullable=False, index=True
    )
    target_project_id = Column(
        String(100), ForeignKey("projects.project_id"), nullable=False, index=True
    )

    resource_type = Column(String(50), nullable=False)
    resource_id = Column(String(100), nullable=False)

    shared_by = Column(String(100), nullable=False)
    sharing_notes = Column(Text, nullable=True)
    is_approved = Column(Boolean, default=False)
    approved_by = Column(String(100), nullable=True)

    shared_at = Column(DateTime(timezone=True), server_default=func.now())
    approved_at = Column(DateTime(timezone=True), nullable=True)

    source_project = relationship("Project", foreign_keys=[source_project_id])
    target_project = relationship("Project", foreign_keys=[target_project_id])


def _get_activity_metadata(self: ProjectActivityLog):
    return self._metadata


def _set_activity_metadata(self: ProjectActivityLog, value: dict | None) -> None:
    self._metadata = value


ProjectActivityLog.metadata = property(  # type: ignore[attr-defined]
    _get_activity_metadata, _set_activity_metadata
)
