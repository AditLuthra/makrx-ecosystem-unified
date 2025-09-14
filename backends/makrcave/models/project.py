from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
import uuid

from ..database import Base

class ProjectStatus(enum.Enum):
    PLANNING = "planning"
    IN_PROGRESS = "in_progress"
    ON_HOLD = "on_hold"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class ProjectPriority(enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class Project(Base):
    __tablename__ = "projects"
    
    # Primary identification
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    
    # Project details
    description = Column(Text, nullable=True)
    objectives = Column(Text, nullable=True)
    category = Column(String(100), nullable=True)
    
    # Status and priority
    status = Column(Enum(ProjectStatus), default=ProjectStatus.PLANNING)
    priority = Column(Enum(ProjectPriority), default=ProjectPriority.MEDIUM)
    
    # Timeline
    start_date = Column(DateTime, nullable=True)
    due_date = Column(DateTime, nullable=True)
    completion_date = Column(DateTime, nullable=True)
    
    # Project ownership
    creator_id = Column(String, nullable=False, index=True)
    assigned_members = Column(JSON, nullable=True)  # List of member IDs
    makerspace_id = Column(String, nullable=False, index=True)
    
    # Progress tracking
    progress_percentage = Column(Integer, default=0)
    estimated_hours = Column(Float, nullable=True)
    actual_hours = Column(Float, default=0.0)
    
    # Budget tracking
    estimated_cost = Column(Float, nullable=True)
    actual_cost = Column(Float, default=0.0)
    
    # Resources and requirements
    equipment_needed = Column(JSON, nullable=True)  # List of equipment IDs
    materials_needed = Column(JSON, nullable=True)  # List of materials
    skills_required = Column(JSON, nullable=True)   # List of skill IDs
    
    # Documentation
    documentation_url = Column(String(500), nullable=True)
    files_attached = Column(JSON, nullable=True)  # List of file URLs
    
    # Collaboration
    is_public = Column(Boolean, default=False)
    allow_collaboration = Column(Boolean, default=True)
    
    # Tags and metadata
    tags = Column(JSON, nullable=True)
    custom_fields = Column(JSON, nullable=True)
    
    # Record keeping
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    tasks = relationship("ProjectTask", back_populates="project", cascade="all, delete-orphan")
    milestones = relationship("ProjectMilestone", back_populates="project", cascade="all, delete-orphan")

# --- Social Features: Likes, Bookmarks, Follows ---
class ProjectLike(Base):
    __tablename__ = "project_likes"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.id"), nullable=False, index=True)
    user_id = Column(String, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ProjectBookmark(Base):
    __tablename__ = "project_bookmarks"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.id"), nullable=False, index=True)
    user_id = Column(String, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ProjectFollow(Base):
    __tablename__ = "project_follows"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_id = Column(String, nullable=False, index=True)  # The project owner's user_id
    follower_id = Column(String, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ProjectTask(Base):
    __tablename__ = "project_tasks"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    
    # Task details
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="pending")  # pending, in_progress, completed
    priority = Column(Enum(ProjectPriority), default=ProjectPriority.MEDIUM)
    
    # Assignment
    assigned_to = Column(String, nullable=True, index=True)  # Member ID
    
    # Timeline
    due_date = Column(DateTime, nullable=True)
    completion_date = Column(DateTime, nullable=True)
    
    # Progress
    estimated_hours = Column(Float, nullable=True)
    actual_hours = Column(Float, default=0.0)
    
    # Dependencies
    depends_on = Column(JSON, nullable=True)  # List of task IDs
    
    # Record keeping
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String, nullable=False)
    
    # Relationships
    project = relationship("Project", back_populates="tasks")

class ProjectMilestone(Base):
    __tablename__ = "project_milestones"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    
    # Milestone details
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    target_date = Column(DateTime, nullable=False)
    completion_date = Column(DateTime, nullable=True)
    is_completed = Column(Boolean, default=False)
    
    # Requirements
    deliverables = Column(JSON, nullable=True)  # List of deliverables
    success_criteria = Column(Text, nullable=True)
    
    # Record keeping
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String, nullable=False)
    
    # Relationships
    project = relationship("Project", back_populates="milestones")
