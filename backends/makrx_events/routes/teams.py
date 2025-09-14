from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import uuid4

from backends.makrx_events.database import get_db
from backends.makrx_events.models import Team, TeamMember
from backends.makrx_events.schemas.teams import (
    TeamCreate,
    TeamUpdate,
    TeamRead,
    TeamMemberCreate,
    TeamMemberRead,
)
from backends.makrx_events.security import get_current_user, CurrentUser

router = APIRouter()


@router.get("/events/{event_id}/teams", response_model=List[TeamRead])
def list_teams(event_id: str, db: Session = Depends(get_db)):
    return (
        db.query(Team)
        .filter(Team.event_id == event_id)
        .order_by(Team.created_at.desc())
        .all()
    )


@router.post("/events/{event_id}/teams", response_model=TeamRead, status_code=201)
def create_team(
    event_id: str,
    payload: TeamCreate,
    _user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    team = Team(id=str(uuid4()), event_id=event_id, name=payload.name)
    db.add(team)
    db.commit()
    db.refresh(team)
    return team


@router.patch("/events/{event_id}/teams/{team_id}", response_model=TeamRead)
def update_team(
    event_id: str,
    team_id: str,
    payload: TeamUpdate,
    _user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    team = db.query(Team).filter(Team.id == team_id, Team.event_id == event_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    data = payload.model_dump(exclude_unset=True)
    if "name" in data:
        team.name = data["name"]
    db.add(team)
    db.commit()
    db.refresh(team)
    return team


@router.get(
    "/events/{event_id}/teams/{team_id}/members",
    response_model=List[TeamMemberRead],
)
def list_team_members(event_id: str, team_id: str, db: Session = Depends(get_db)):
    # Event ID is not stored directly in team_members, but team is event-scoped
    team = db.query(Team).filter(Team.id == team_id, Team.event_id == event_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return db.query(TeamMember).filter(TeamMember.team_id == team_id).all()


@router.post(
    "/events/{event_id}/teams/{team_id}/members",
    response_model=TeamMemberRead,
    status_code=201,
)
def add_team_member(
    event_id: str,
    team_id: str,
    payload: TeamMemberCreate,
    _user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    team = db.query(Team).filter(Team.id == team_id, Team.event_id == event_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    member = TeamMember(
        id=str(uuid4()),
        team_id=team_id,
        user_id=payload.user_id,
        role=payload.role,
    )
    db.add(member)
    db.commit()
    db.refresh(member)
    return member
