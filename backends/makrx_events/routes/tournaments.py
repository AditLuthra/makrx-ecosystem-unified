from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import uuid4

from backends.makrx_events.database import get_db
from backends.makrx_events.models import Tournament
from backends.makrx_events.schemas.tournaments import (
    TournamentCreate,
    TournamentUpdate,
    TournamentRead,
)
from backends.makrx_events.security import get_current_user, CurrentUser

router = APIRouter()


@router.get(
    "/events/{event_id}/tournaments", response_model=List[TournamentRead]
)
def list_tournaments(event_id: str, db: Session = Depends(get_db)):
    return (
        db.query(Tournament)
        .filter(Tournament.event_id == event_id)
        .order_by(Tournament.created_at.desc())
        .all()
    )


@router.post(
    "/events/{event_id}/tournaments",
    response_model=TournamentRead,
    status_code=201,
)
def create_tournament(
    event_id: str,
    payload: TournamentCreate,
    _user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    t = Tournament(id=str(uuid4()), event_id=event_id, name=payload.name)
    db.add(t)
    db.commit()
    db.refresh(t)
    return t


@router.patch(
    "/events/{event_id}/tournaments/{tournament_id}",
    response_model=TournamentRead,
)
def update_tournament(
    event_id: str,
    tournament_id: str,
    payload: TournamentUpdate,
    _user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    t = (
        db.query(Tournament)
        .filter(
            Tournament.id == tournament_id, Tournament.event_id == event_id
        )
        .first()
    )
    if not t:
        raise HTTPException(status_code=404, detail="Tournament not found")
    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        if k in {
            "name",
            "description",
            "format",
            "activity_id",
            "max_participants",
            "current_round",
            "started_at",
            "completed_at",
        }:
            setattr(t, k, v)
        elif k == "status":
            t.status = getattr(v, "value", v)
    db.add(t)
    db.commit()
    db.refresh(t)
    return t
