from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..models.project import ProjectLike, ProjectBookmark, ProjectFollow
from datetime import datetime
from typing import Optional


# --- Project Like ---
async def get_project_like(
    db: AsyncSession, project_id: str, user_id: str
) -> Optional[ProjectLike]:
    result = await db.execute(
        select(ProjectLike).where(
            ProjectLike.project_id == project_id,
            ProjectLike.user_id == user_id,
        )
    )
    return result.scalars().first()


async def add_project_like(
    db: AsyncSession, project_id: str, user_id: str
) -> ProjectLike:
    like = ProjectLike(
        project_id=project_id, user_id=user_id, created_at=datetime.utcnow()
    )
    db.add(like)
    await db.commit()
    await db.refresh(like)
    return like


async def remove_project_like(db: AsyncSession, project_id: str, user_id: str) -> bool:
    like = await get_project_like(db, project_id, user_id)
    if like:
        await db.delete(like)
        await db.commit()
        return True
    return False


# --- Project Bookmark ---
async def get_project_bookmark(
    db: AsyncSession, project_id: str, user_id: str
) -> Optional[ProjectBookmark]:
    result = await db.execute(
        select(ProjectBookmark).where(
            ProjectBookmark.project_id == project_id,
            ProjectBookmark.user_id == user_id,
        )
    )
    return result.scalars().first()


async def add_project_bookmark(
    db: AsyncSession, project_id: str, user_id: str
) -> ProjectBookmark:
    bookmark = ProjectBookmark(
        project_id=project_id, user_id=user_id, created_at=datetime.utcnow()
    )
    db.add(bookmark)
    await db.commit()
    await db.refresh(bookmark)
    return bookmark


async def remove_project_bookmark(
    db: AsyncSession, project_id: str, user_id: str
) -> bool:
    bookmark = await get_project_bookmark(db, project_id, user_id)
    if bookmark:
        await db.delete(bookmark)
        await db.commit()
        return True
    return False


# --- Project Follow ---
async def get_project_follow(
    db: AsyncSession, owner_id: str, follower_id: str
) -> Optional[ProjectFollow]:
    result = await db.execute(
        select(ProjectFollow).where(
            ProjectFollow.owner_id == owner_id,
            ProjectFollow.follower_id == follower_id,
        )
    )
    return result.scalars().first()


async def add_project_follow(
    db: AsyncSession, owner_id: str, follower_id: str
) -> ProjectFollow:
    follow = ProjectFollow(
        owner_id=owner_id,
        follower_id=follower_id,
        created_at=datetime.utcnow(),
    )
    db.add(follow)
    await db.commit()
    await db.refresh(follow)
    return follow


async def remove_project_follow(
    db: AsyncSession, owner_id: str, follower_id: str
) -> bool:
    follow = await get_project_follow(db, owner_id, follower_id)
    if follow:
        await db.delete(follow)
        await db.commit()
        return True
    return False
