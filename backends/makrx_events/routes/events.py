from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import uuid4

from backends.makrx_events.database import get_db
from backends.makrx_events.models import Event, EventRegistration
from backends.makrx_events.schemas.events import (
    EventCreate,
    EventUpdate,
    EventRead,
    RegistrationCreate,
    RegistrationRead,
)
from backends.makrx_events.security import get_current_user, CurrentUser, require_roles

router = APIRouter()


@router.get("/events", response_model=List[EventRead])
def list_events(db: Session = Depends(get_db)):
    items = (
        db.query(Event)
        .filter(Event.status == "published")
        .order_by(Event.start_date.desc().nullslast())
        .all()
    )
    return items


@router.get("/events/{event_id}", response_model=EventRead)
def get_event(event_id: str, db: Session = Depends(get_db)):
    ev = db.query(Event).filter(Event.id == event_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")
    return ev


def make_slug(title: str) -> str:
    import re

    slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    return slug


@router.post("/events", response_model=EventRead, status_code=201, dependencies=[Depends(require_roles(["event_organizer", "admin"]))])
def create_event(
    payload: EventCreate,
    user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ev = Event(
        id=str(uuid4()),
        slug=make_slug(payload.title),
        title=payload.title,
        organizer_id=user.user_id,
        status="published",
        start_date=payload.start_date,
        end_date=payload.end_date,
    )
    db.add(ev)
    db.commit()
    db.refresh(ev)
    return ev


@router.patch("/events/{event_id}", response_model=EventRead)
def update_event(
    event_id: str,
    payload: EventUpdate,
    user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ev = db.query(Event).filter(Event.id == event_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")

    # Check if the current user is the organizer or an admin
    if not (user.user_id == ev.organizer_id or "admin" in user.roles):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to update this event",
        )

    data = payload.model_dump(exclude_unset=True)
    # Keep slug stable on update for compatibility
    for k, v in data.items():
        if k == "title":
            ev.title = v
        elif k == "start_date":
            ev.start_date = v
        elif k == "end_date":
            ev.end_date = v
        elif k == "status":
            ev.status = getattr(v, "value", v)
    db.add(ev)
    db.commit()
    db.refresh(ev)
    return ev


@router.post(
    "/events/{event_id}/register",
    response_model=RegistrationRead,
    status_code=201,
)
def register_event(
    event_id: str,
    _payload: RegistrationCreate,
    user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # ensure event exists
    ev = db.query(Event).filter(Event.id == event_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")
    reg = EventRegistration(
        id=str(uuid4()),
        event_id=event_id,
        user_id=user.user_id,
        status="confirmed",
    )
    db.add(reg)
    db.commit()
    db.refresh(reg)
    return reg


@router.get("/my-events", response_model=List[EventRead])
def my_events(
    user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    items = (
        db.query(Event)
        .filter(Event.organizer_id == user.user_id)
        .order_by(Event.created_at.desc())
        .all()
    )
    return items


@router.get("/my-registrations", response_model=List[RegistrationRead])
def my_registrations(
    user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    regs = (
        db.query(EventRegistration)
        .filter(EventRegistration.user_id == user.user_id)
        .all()
    )
    return regs
