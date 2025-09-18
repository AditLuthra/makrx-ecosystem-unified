from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timedelta

from ..database import get_db

# Models
from ..models.project import Project, ProjectCollaborator, ProjectVisibility
from ..models.enhanced_member import Member

# Schemas
from ..schemas.project_showcase import (
    ShowcaseProjectResponse,
    ShowcaseBOMItem,
    ProjectAward,
    ProjectStatsResponse,
    ShowcaseFiltersResponse,
)
from ..dependencies import get_current_user
from ..crud.project_social_async import (
    get_project_like,
    get_project_bookmark,
    get_project_follow,
)

router = APIRouter(prefix="/api/v1/projects", tags=["project-showcase"])


@router.get("/showcase", response_model=List[ShowcaseProjectResponse])
async def get_showcase_projects(
    category: Optional[str] = Query(None, description="Filter by category"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty level"),
    tags: Optional[str] = Query(None, description="Filter by tags (comma-separated)"),
    sort_by: str = Query(
        "trending",
        description="Sort by: trending, newest, popular, most_liked, most_forked",
    ),
    limit: int = Query(50, ge=1, le=100, description="Number of projects to return"),
    offset: int = Query(0, ge=0, description="Number of projects to skip"),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get showcase projects with filtering and sorting options"""
    showcase_projects = []
    # Build base query for public projects
    stmt = select(Project).where(
        Project.visibility == ProjectVisibility.PUBLIC, Project.is_approved
    )
    # Apply filters
    if category:
        stmt = stmt.where(Project.category == category)
    if difficulty:
        stmt = stmt.where(Project.difficulty_level == difficulty)
    if tags:
        tag_list = [tag.strip() for tag in tags.split(",")]
        for tag in tag_list:
            stmt = stmt.where(Project.tags.contains([tag]))
    # Apply sorting
    if sort_by == "newest":
        stmt = stmt.order_by(Project.created_at.desc())
    elif sort_by == "popular":
        stmt = stmt.order_by(Project.view_count.desc())
    elif sort_by == "most_liked":
        stmt = stmt.order_by(Project.like_count.desc())
    elif sort_by == "most_forked":
        stmt = stmt.order_by(Project.fork_count.desc())
    elif sort_by == "recently_updated":
        stmt = stmt.order_by(Project.updated_at.desc())
    else:  # trending
        stmt = stmt.order_by(
            (Project.like_count + Project.view_count + Project.fork_count).desc(),
            Project.updated_at.desc(),
        )
    # Apply pagination
    stmt = stmt.offset(offset).limit(limit)
    result = await db.execute(stmt)
    projects = result.scalars().all()
    for project in projects:
        try:
            # Get project owner info
            owner_result = await db.execute(
                select(Member).where(Member.id == project.owner_id)
            )
            owner = (
                owner_result.scalars().first() if hasattr(project, "owner_id") else None
            )
            # Get collaborator count
            collab_result = await db.execute(
                select(ProjectCollaborator).where(
                    ProjectCollaborator.project_id == project.project_id
                )
            )
            # collaborator_count = len(collab_result.scalars().all()) if hasattr(project, 'project_id') else 0 # Removed unused variable
            # Calculate completion rate (mock calculation)
            completion_rate = min(
                95, max(10, 50 + (getattr(project, "like_count", 0) * 2))
            )
            # Generate mock BOM data
            bom_items = [
                {
                    "name": f"Component {i + 1}",
                    "quantity": i + 1,
                    "estimated_cost": (i + 1) * 5,
                    "supplier": ("MakrX Store" if i % 2 == 0 else "Local Supplier"),
                }
                for i in range(min(5, getattr(project, "bom_items_count", 0) or 0))
            ]
            skills_required = (
                getattr(project, "required_skills", None)
                or ["3D Printing", "Electronics", "Programming"][:3]
            )
            equipment_used = ["3D Printer", "Soldering Station", "Multimeter"][:3]
            awards = []
            if getattr(project, "is_featured", False):
                awards.append(
                    {
                        "type": "featured",
                        "name": "Featured Project",
                        "icon": "⭐",
                        "awarded_at": (
                            project.featured_at.isoformat()
                            if getattr(project, "featured_at", None)
                            else datetime.utcnow().isoformat()
                        ),
                    }
                )
            is_liked = bool(
                await get_project_like(db, project.id, current_user["user_id"])
            )
            is_bookmarked = bool(
                await get_project_bookmark(db, project.id, current_user["user_id"])
            )
            is_following_owner = bool(
                owner
                and await get_project_follow(db, str(owner.id), current_user["user_id"])
            )
            showcase_project = ShowcaseProjectResponse(
                project_id=project.project_id,
                name=project.name,
                description=project.description,
                owner_id=project.owner_id,
                owner_name=(
                    f"{owner.first_name} {owner.last_name}"
                    if owner
                    else "Unknown Maker"
                ),
                owner_avatar=(
                    getattr(owner, "profile_image_url", None) if owner else None
                ),
                makerspace_name=None,
                makerspace_id=project.makerspace_id,
                visibility="public",
                status=project.status,
                difficulty_level=getattr(project, "difficulty_level", "intermediate"),
                estimated_time=getattr(project, "estimated_time", "2-4 hours"),
                category=getattr(project, "category", "Electronics"),
                subcategories=getattr(project, "subcategories", []),
                tags=getattr(project, "tags", []),
                skills_required=skills_required,
                equipment_used=equipment_used,
                view_count=getattr(project, "view_count", 0),
                like_count=getattr(project, "like_count", 0),
                fork_count=getattr(project, "fork_count", 0),
                comment_count=getattr(project, "comment_count", 0),
                download_count=getattr(project, "download_count", 0),
                completion_rate=completion_rate,
                thumbnail_url=getattr(project, "thumbnail_url", None),
                gallery_images=getattr(project, "gallery_images", []),
                demo_video_url=getattr(project, "demo_video_url", None),
                bill_of_materials=[ShowcaseBOMItem(**item) for item in bom_items],
                total_estimated_cost=sum(
                    item["estimated_cost"] * item["quantity"] for item in bom_items
                ),
                is_featured=getattr(project, "is_featured", False),
                is_staff_pick=getattr(project, "is_staff_pick", False),
                is_trending=getattr(project, "is_trending", False),
                awards=[ProjectAward(**award) for award in awards],
                created_at=project.created_at.isoformat(),
                updated_at=project.updated_at.isoformat(),
                featured_at=(
                    project.featured_at.isoformat()
                    if getattr(project, "featured_at", None)
                    else None
                ),
                is_liked=is_liked,
                is_bookmarked=is_bookmarked,
                is_following_owner=is_following_owner,
            )
            showcase_projects.append(showcase_project)
        except Exception as e:
            import logging

            logging.warning(
                f"Error processing project {getattr(project, 'id', None)}: {e}"
            )
            continue
    return showcase_projects


@router.get("/showcase/filters", response_model=ShowcaseFiltersResponse)
async def get_showcase_filters(
    current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    """Get available filter options for showcase"""
    categories_stmt = (
        select(Project.category)
        .where(
            Project.visibility == ProjectVisibility.PUBLIC,
            Project.category.isnot(None),
        )
        .distinct()
    )
    categories_result = await db.execute(categories_stmt)
    categories = [cat for cat in categories_result.scalars().all() if cat]
    tags_stmt = select(Project.tags).where(
        Project.visibility == ProjectVisibility.PUBLIC,
        Project.tags.isnot(None),
    )
    tags_result = await db.execute(tags_stmt)
    all_tags = []
    for project_tags in tags_result.scalars().all():
        if project_tags:
            all_tags.extend(project_tags)
    unique_tags = list(set(all_tags))
    skills_stmt = select(Project.required_skills).where(
        Project.visibility == ProjectVisibility.PUBLIC,
        Project.required_skills.isnot(None),
    )
    skills_result = await db.execute(skills_stmt)
    all_skills = []
    for project_skills in skills_result.scalars().all():
        if project_skills:
            all_skills.extend(project_skills)
    unique_skills = list(set(all_skills))
    if not categories:
        categories = [
            "3D Printing",
            "Electronics",
            "Woodworking",
            "Robotics",
            "IoT",
            "Art & Design",
            "Automation",
            "Tools",
        ]
    if not unique_tags:
        unique_tags = [
            "Arduino",
            "Raspberry Pi",
            "CAD",
            "LED",
            "Sensors",
            "Motors",
            "WiFi",
            "Bluetooth",
            "3D Printed",
            "Open Source",
        ]
    if not unique_skills:
        unique_skills = [
            "Soldering",
            "3D Modeling",
            "Programming",
            "Circuit Design",
            "Woodworking",
            "CAD Design",
            "Electronics",
        ]
    return ShowcaseFiltersResponse(
        categories=sorted(categories),
        tags=sorted(unique_tags),
        skills=sorted(unique_skills),
        difficulty_levels=["beginner", "intermediate", "advanced", "expert"],
    )


@router.get("/showcase/featured", response_model=List[ShowcaseProjectResponse])
async def get_featured_projects(
    limit: int = Query(10, ge=1, le=20),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get featured projects for carousel"""
    stmt = (
        select(Project)
        .where(
            Project.visibility == ProjectVisibility.PUBLIC,
            Project.is_featured,
            Project.is_approved,
        )
        .order_by(Project.featured_at.desc())
        .limit(limit)
    )
    result = await db.execute(stmt)
    featured_projects = result.scalars().all()
    showcase_projects = []
    for project in featured_projects:
        owner_result = await db.execute(
            select(Member).where(Member.id == project.owner_id)
        )
        owner = owner_result.scalars().first() if hasattr(project, "owner_id") else None
        showcase_project = ShowcaseProjectResponse(
            project_id=project.project_id,
            name=project.name,
            description=project.description,
            owner_id=project.owner_id,
            owner_name=(
                f"{owner.first_name} {owner.last_name}" if owner else "Unknown Maker"
            ),
            owner_avatar=(getattr(owner, "profile_image_url", None) if owner else None),
            makerspace_name=None,
            makerspace_id=project.makerspace_id,
            visibility="public",
            status=project.status,
            difficulty_level=getattr(project, "difficulty_level", "intermediate"),
            estimated_time=getattr(project, "estimated_time", "2-4 hours"),
            category=getattr(project, "category", "Electronics"),
            subcategories=getattr(project, "subcategories", []),
            tags=getattr(project, "tags", []),
            skills_required=getattr(
                project, "required_skills", ["3D Printing", "Electronics"]
            ),
            equipment_used=["3D Printer", "Soldering Station"],
            view_count=getattr(project, "view_count", 0),
            like_count=getattr(project, "like_count", 0),
            fork_count=getattr(project, "fork_count", 0),
            comment_count=getattr(project, "comment_count", 0),
            download_count=getattr(project, "download_count", 0),
            completion_rate=75,
            thumbnail_url=getattr(project, "thumbnail_url", None),
            gallery_images=getattr(project, "gallery_images", []),
            demo_video_url=getattr(project, "demo_video_url", None),
            bill_of_materials=[],
            total_estimated_cost=getattr(project, "estimated_cost", 50),
            is_featured=True,
            is_staff_pick=getattr(project, "is_staff_pick", False),
            is_trending=getattr(project, "is_trending", False),
            awards=[
                ProjectAward(
                    type="featured",
                    name="Featured Project",
                    icon="⭐",
                    awarded_at=(
                        project.featured_at.isoformat()
                        if project.featured_at
                        else datetime.utcnow().isoformat()
                    ),
                )
            ],
            created_at=project.created_at.isoformat(),
            updated_at=project.updated_at.isoformat(),
            featured_at=(
                project.featured_at.isoformat()
                if getattr(project, "featured_at", None)
                else None
            ),
            is_liked=False,
            is_bookmarked=False,
            is_following_owner=False,
        )
        showcase_projects.append(showcase_project)
    return showcase_projects


@router.get("/showcase/trending", response_model=List[ShowcaseProjectResponse])
async def get_trending_projects(
    limit: int = Query(10, ge=1, le=20),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get trending projects for widget"""

    # Get projects with high recent activity
    recent_date = datetime.utcnow() - timedelta(days=7)

    stmt = (
        select(Project)
        .filter(
            Project.visibility == ProjectVisibility.PUBLIC,
            Project.updated_at >= recent_date,
            Project.is_approved,
        )
        .order_by((Project.like_count + Project.view_count + Project.fork_count).desc())
        .limit(limit)
    )
    result = await db.execute(stmt)
    trending_projects_data = result.scalars().all()

    # Convert to showcase format
    showcase_projects = []
    for project in trending_projects_data:
        owner_result = await db.execute(
            select(Member).where(Member.id == project.owner_id)
        )
        owner = owner_result.scalars().first() if hasattr(project, "owner_id") else None
        showcase_project = ShowcaseProjectResponse(
            project_id=project.project_id,
            name=project.name,
            description=project.description,
            owner_id=project.owner_id,
            owner_name=(
                f"{owner.first_name} {owner.last_name}" if owner else "Unknown Maker"
            ),
            owner_avatar=(getattr(owner, "profile_image_url", None) if owner else None),
            makerspace_name=None,
            makerspace_id=project.makerspace_id,
            visibility="public",
            status=project.status,
            difficulty_level=getattr(project, "difficulty_level", "intermediate"),
            estimated_time=getattr(project, "estimated_time", "2-4 hours"),
            category=getattr(project, "category", "Electronics"),
            subcategories=getattr(project, "subcategories", []),
            tags=getattr(project, "tags", []),
            skills_required=getattr(
                project, "required_skills", ["3D Printing", "Electronics"]
            ),
            equipment_used=["3D Printer", "Soldering Station"],
            view_count=getattr(project, "view_count", 0),
            like_count=getattr(project, "like_count", 0),
            fork_count=getattr(project, "fork_count", 0),
            comment_count=getattr(project, "comment_count", 0),
            download_count=getattr(project, "download_count", 0),
            completion_rate=75,
            thumbnail_url=getattr(project, "thumbnail_url", None),
            gallery_images=getattr(project, "gallery_images", []),
            demo_video_url=getattr(project, "demo_video_url", None),
            bill_of_materials=[],
            total_estimated_cost=getattr(project, "estimated_cost", 50),
            is_featured=getattr(project, "is_featured", False),
            is_staff_pick=getattr(project, "is_staff_pick", False),
            is_trending=getattr(project, "is_trending", False),
            awards=[
                ProjectAward(
                    type="trending",
                    name="Trending Project",
                    icon="🔥",
                    awarded_at=datetime.utcnow().isoformat(),
                )
            ],
            created_at=project.created_at.isoformat(),
            updated_at=project.updated_at.isoformat(),
            featured_at=(
                project.featured_at.isoformat()
                if getattr(project, "featured_at", None)
                else None
            ),
            is_liked=False,
            is_bookmarked=False,
            is_following_owner=False,
        )
        showcase_projects.append(showcase_project)
    return showcase_projects


@router.get("/showcase/stats", response_model=ProjectStatsResponse)
async def get_project_stats(db: AsyncSession = Depends(get_db)):
    """Get overall project statistics for the showcase dashboard"""
    total_projects_stmt = select(func.count(Project.id)).where(
        Project.visibility == ProjectVisibility.PUBLIC, Project.is_approved
    )
    total_projects = (await db.execute(total_projects_stmt)).scalar_one_or_none() or 0

    featured_projects_stmt = select(func.count(Project.id)).where(
        Project.visibility == ProjectVisibility.PUBLIC,
        Project.is_featured,
        Project.is_approved,
    )
    featured_projects = (
        await db.execute(featured_projects_stmt)
    ).scalar_one_or_none() or 0

    trending_projects_stmt = select(func.count(Project.id)).where(
        Project.visibility == ProjectVisibility.PUBLIC,
        Project.is_trending,
        Project.is_approved,
    )
    trending_projects = (
        await db.execute(trending_projects_stmt)
    ).scalar_one_or_none() or 0

    total_makers_stmt = select(func.count(Member.id))
    total_makers = (await db.execute(total_makers_stmt)).scalar_one_or_none() or 0

    total_likes_stmt = select(func.sum(Project.like_count)).where(
        Project.visibility == ProjectVisibility.PUBLIC, Project.is_approved
    )
    total_likes = (await db.execute(total_likes_stmt)).scalar_one_or_none() or 0

    total_views_stmt = select(func.sum(Project.view_count)).where(
        Project.visibility == ProjectVisibility.PUBLIC, Project.is_approved
    )
    total_views = (await db.execute(total_views_stmt)).scalar_one_or_none() or 0

    return ProjectStatsResponse(
        total_projects=total_projects,
        featured_projects=featured_projects,
        trending_projects=trending_projects,
        total_makers=total_makers,
        total_likes=total_likes,
        total_views=total_views,
    )


@router.post("/{project_id}/like")
async def like_project(
    project_id: str,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Like a project"""
    from sqlalchemy import select
    from ..crud.project_social_async import add_project_like

    project_result = await db.execute(
        select(Project).where(Project.project_id == project_id)
    )
    project = project_result.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    await add_project_like(db, project.id, current_user["user_id"])
    return {"status": "liked"}


@router.delete("/{project_id}/like")
async def unlike_project(
    project_id: str,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Unlike a project"""
    from sqlalchemy import select
    from ..crud.project_social_async import remove_project_like

    project_result = await db.execute(
        select(Project).where(Project.project_id == project_id)
    )
    project = project_result.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    await remove_project_like(db, project.id, current_user["user_id"])
    return {"status": "unliked"}


@router.post("/{project_id}/bookmark")
async def bookmark_project(
    project_id: str,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Bookmark a project"""
    from sqlalchemy import select
    from ..crud.project_social_async import add_project_bookmark

    project_result = await db.execute(
        select(Project).where(Project.project_id == project_id)
    )
    project = project_result.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    await add_project_bookmark(db, project.id, current_user["user_id"])
    return {"status": "bookmarked"}


@router.delete("/{project_id}/bookmark")
async def unbookmark_project(
    project_id: str,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Remove bookmark from a project"""
    from sqlalchemy import select
    from ..crud.project_social_async import remove_project_bookmark

    project_result = await db.execute(
        select(Project).where(Project.project_id == project_id)
    )
    project = project_result.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    await remove_project_bookmark(db, project.id, current_user["user_id"])
    return {"status": "unbookmarked"}
