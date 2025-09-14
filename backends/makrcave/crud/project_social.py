from sqlalchemy.orm import Session
from ..models.project import ProjectLike, ProjectBookmark, ProjectFollow
from datetime import datetime
from typing import Optional

# --- Project Like ---
def get_project_like(db: Session, project_id: str, user_id: str) -> Optional[ProjectLike]:
    return db.query(ProjectLike).filter_by(project_id=project_id, user_id=user_id).first()

def add_project_like(db: Session, project_id: str, user_id: str) -> ProjectLike:
    like = ProjectLike(project_id=project_id, user_id=user_id, created_at=datetime.utcnow())
    db.add(like)
    db.commit()
    db.refresh(like)
    return like

def remove_project_like(db: Session, project_id: str, user_id: str) -> bool:
    like = get_project_like(db, project_id, user_id)
    if like:
        db.delete(like)
        db.commit()
        return True
    return False

# --- Project Bookmark ---
def get_project_bookmark(db: Session, project_id: str, user_id: str) -> Optional[ProjectBookmark]:
    return db.query(ProjectBookmark).filter_by(project_id=project_id, user_id=user_id).first()

def add_project_bookmark(db: Session, project_id: str, user_id: str) -> ProjectBookmark:
    bookmark = ProjectBookmark(project_id=project_id, user_id=user_id, created_at=datetime.utcnow())
    db.add(bookmark)
    db.commit()
    db.refresh(bookmark)
    return bookmark

def remove_project_bookmark(db: Session, project_id: str, user_id: str) -> bool:
    bookmark = get_project_bookmark(db, project_id, user_id)
    if bookmark:
        db.delete(bookmark)
        db.commit()
        return True
    return False

# --- Project Follow ---
def get_project_follow(db: Session, owner_id: str, follower_id: str) -> Optional[ProjectFollow]:
    return db.query(ProjectFollow).filter_by(owner_id=owner_id, follower_id=follower_id).first()

def add_project_follow(db: Session, owner_id: str, follower_id: str) -> ProjectFollow:
    follow = ProjectFollow(owner_id=owner_id, follower_id=follower_id, created_at=datetime.utcnow())
    db.add(follow)
    db.commit()
    db.refresh(follow)
    return follow

def remove_project_follow(db: Session, owner_id: str, follower_id: str) -> bool:
    follow = get_project_follow(db, owner_id, follower_id)
    if follow:
        db.delete(follow)
        db.commit()
        return True
    return False
