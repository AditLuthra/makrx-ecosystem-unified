from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from datetime import datetime

from ..database import get_db
from ..dependencies import (
    get_current_user,
    require_roles,
    check_permission,
    CurrentUser,
)
from ..models.project import (
    Project,
    ProjectTask,
    ProjectMilestone,
    ProjectStatus,
    ProjectPriority,
)
from ..security.input_validation import InputSanitizer

router = APIRouter()
security = HTTPBearer()


@router.get("/", response_model=List[dict])
async def get_projects(
    makerspace_id: Optional[str] = Query(None),
    status: Optional[ProjectStatus] = Query(None),
    creator_id: Optional[str] = Query(None),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get projects with optional filtering"""
    try:
        query = db.query(Project)

        if makerspace_id:
            query = query.filter(Project.makerspace_id == makerspace_id)
        if status:
            query = query.filter(Project.status == status)
        if creator_id:
            query = query.filter(Project.creator_id == creator_id)

        # Filter by visibility - show public projects or user's own projects
        user_id = current_user.user_id
        query = query.filter(
            (Project.is_public.is_(True))
            | (Project.creator_id == user_id)
            | (Project.assigned_members.contains([user_id]))
        )

        projects = query.all()

        return [
            {
                "id": project.id,
                "project_id": project.project_id,
                "name": project.name,
                "description": project.description,
                "status": project.status.value,
                "priority": project.priority.value,
                "progress_percentage": project.progress_percentage,
                "start_date": project.start_date,
                "due_date": project.due_date,
                "creator_id": project.creator_id,
                "makerspace_id": project.makerspace_id,
                "is_public": project.is_public,
                "created_at": project.created_at,
                "updated_at": project.updated_at,
            }
            for project in projects
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve projects: {str(e)}",
        )


@router.get("/{project_id}")
async def get_project_details(
    project_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get detailed project information"""
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )

    # Check access permissions
    user_id = current_user.user_id
    if not (
        project.is_public
        or project.creator_id == user_id
        or (project.assigned_members and user_id in project.assigned_members)
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Access denied"
        )

    # Get tasks and milestones
    tasks = db.query(ProjectTask).filter(ProjectTask.project_id == project_id).all()
    milestones = (
        db.query(ProjectMilestone)
        .filter(ProjectMilestone.project_id == project_id)
        .all()
    )

    return {
        "id": project.id,
        "project_id": project.project_id,
        "name": project.name,
        "description": project.description,
        "objectives": project.objectives,
        "category": project.category,
        "status": project.status.value,
        "priority": project.priority.value,
        "start_date": project.start_date,
        "due_date": project.due_date,
        "completion_date": project.completion_date,
        "creator_id": project.creator_id,
        "assigned_members": project.assigned_members or [],
        "makerspace_id": project.makerspace_id,
        "progress_percentage": project.progress_percentage,
        "estimated_hours": project.estimated_hours,
        "actual_hours": project.actual_hours,
        "estimated_cost": project.estimated_cost,
        "actual_cost": project.actual_cost,
        "equipment_needed": project.equipment_needed or [],
        "materials_needed": project.materials_needed or [],
        "skills_required": project.skills_required or [],
        "is_public": project.is_public,
        "allow_collaboration": project.allow_collaboration,
        "tags": project.tags or [],
        "created_at": project.created_at,
        "updated_at": project.updated_at,
        "tasks": [
            {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "status": task.status,
                "priority": task.priority.value,
                "assigned_to": task.assigned_to,
                "due_date": task.due_date,
                "completion_date": task.completion_date,
                "estimated_hours": task.estimated_hours,
                "actual_hours": task.actual_hours,
                "created_at": task.created_at,
            }
            for task in tasks
        ],
        "milestones": [
            {
                "id": milestone.id,
                "title": milestone.title,
                "description": milestone.description,
                "target_date": milestone.target_date,
                "completion_date": milestone.completion_date,
                "is_completed": milestone.is_completed,
                "deliverables": milestone.deliverables or [],
                "success_criteria": milestone.success_criteria,
            }
            for milestone in milestones
        ],
    }


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: dict,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create new project"""
    try:
        # Generate project ID
        project_id = f"PRJ-{str(uuid.uuid4())[:8].upper()}"

        new_project = Project(
            project_id=project_id,
            name=InputSanitizer.sanitize_text(project_data["name"]),
            description=(
                InputSanitizer.sanitize_html(project_data.get("description", ""))
                if project_data.get("description")
                else None
            ),
            objectives=(
                InputSanitizer.sanitize_text(project_data.get("objectives", ""))
                if project_data.get("objectives")
                else None
            ),
            category=(
                InputSanitizer.sanitize_text(project_data.get("category", ""))
                if project_data.get("category")
                else None
            ),
            makerspace_id=project_data["makerspace_id"],
            creator_id=current_user.user_id,
            priority=ProjectPriority(project_data.get("priority", "medium")),
            start_date=(
                datetime.fromisoformat(project_data["start_date"])
                if project_data.get("start_date")
                else None
            ),
            due_date=(
                datetime.fromisoformat(project_data["due_date"])
                if project_data.get("due_date")
                else None
            ),
            estimated_hours=project_data.get("estimated_hours"),
            estimated_cost=project_data.get("estimated_cost"),
            is_public=project_data.get("is_public", False),
            allow_collaboration=project_data.get("allow_collaboration", True),
            tags=[
                InputSanitizer.sanitize_text(t) for t in project_data.get("tags", [])
            ],
        )

        db.add(new_project)
        db.commit()
        db.refresh(new_project)

        return {
            "message": "Project created successfully",
            "project_id": new_project.id,
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create project: {str(e)}",
        )


@router.put("/{project_id}")
async def update_project(
    project_id: str,
    project_data: dict,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update project"""
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )

    # Check permissions - only creator or assigned members can update
    user_id = current_user.user_id
    if not (
        project.creator_id == user_id
        or (project.assigned_members and user_id in project.assigned_members)
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Access denied"
        )

    try:
        # Update fields
        for field, value in project_data.items():
            if hasattr(project, field) and field not in [
                "id",
                "project_id",
                "creator_id",
                "created_at",
            ]:
                if field in ["start_date", "due_date", "completion_date"] and value:
                    value = datetime.fromisoformat(value)
                elif field in ["status", "priority"]:
                    value = getattr(
                        (ProjectStatus if field == "status" else ProjectPriority),
                        value.upper(),
                    )
                elif field in ["name", "objectives", "category"] and value:
                    value = InputSanitizer.sanitize_text(value)
                elif field in ["description"] and value:
                    value = InputSanitizer.sanitize_html(value)
                elif field in ["tags"] and value:
                    value = [InputSanitizer.sanitize_text(t) for t in value]
                setattr(project, field, value)

        project.updated_at = datetime.utcnow()
        db.commit()

        return {"message": "Project updated successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update project: {str(e)}",
        )


@router.post("/{project_id}/tasks")
async def create_project_task(
    project_id: str,
    task_data: dict,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create project task"""
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )

    try:
        new_task = ProjectTask(
            project_id=project_id,
            title=task_data["title"],
            description=task_data.get("description"),
            assigned_to=task_data.get("assigned_to"),
            priority=ProjectPriority(task_data.get("priority", "medium")),
            due_date=(
                datetime.fromisoformat(task_data["due_date"])
                if task_data.get("due_date")
                else None
            ),
            estimated_hours=task_data.get("estimated_hours"),
            created_by=current_user.user_id,
        )

        db.add(new_task)
        db.commit()

        return {"message": "Task created successfully", "task_id": new_task.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create task: {str(e)}",
        )
