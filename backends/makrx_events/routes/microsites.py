from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from uuid import uuid4

from backends.makrx_events.database import get_db
from backends.makrx_events.models import Microsite, SubEvent, EventRegistration
from backends.makrx_events.schemas.microsites import (
    MicrositeRead,
    MicrositeCreate,
    MicrositeUpdate,
)
from backends.makrx_events.schemas.sub_events import SubEventRead
from backends.makrx_events.security import get_current_user, CurrentUser

router = APIRouter()


@router.get("/microsites/{slug}", response_model=MicrositeRead)
def get_microsite(slug: str, db: Session = Depends(get_db)):
    m = db.query(Microsite).filter(Microsite.slug == slug).first()
    if not m:
        raise HTTPException(status_code=404, detail="Microsite not found")
    return m


@router.get("/microsites/{slug}/events", response_model=List[SubEventRead])
def list_microsite_events(slug: str, db: Session = Depends(get_db)):
    m = db.query(Microsite).filter(Microsite.slug == slug).first()
    if not m:
        raise HTTPException(status_code=404, detail="Microsite not found")
    return db.query(SubEvent).filter(SubEvent.microsite_id == m.id).all()


@router.post("/microsites", response_model=MicrositeRead, status_code=201)
def create_microsite(
    payload: MicrositeCreate,
    _user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    title = payload.title
    slug = payload.slug
    if not slug and not title:
        raise HTTPException(status_code=400, detail="title or slug is required")
    if not slug:
        import re

        slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    existing = db.query(Microsite).filter(Microsite.slug == slug).first()
    if existing:
        raise HTTPException(status_code=409, detail="Microsite slug already exists")
    m = Microsite(id=str(uuid4()), slug=slug, title=title)
    db.add(m)
    db.commit()
    db.refresh(m)
    return m


@router.patch("/microsites/{slug}", response_model=MicrositeRead)
def update_microsite(
    slug: str,
    payload: MicrositeUpdate,
    _user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    m = db.query(Microsite).filter(Microsite.slug == slug).first()
    if not m:
        raise HTTPException(status_code=404, detail="Microsite not found")
    if payload.title is not None:
        m.title = payload.title
    if payload.slug and payload.slug != slug:
        # ensure unique
        exists = db.query(Microsite).filter(Microsite.slug == payload.slug).first()
        if exists:
            raise HTTPException(status_code=409, detail="Microsite slug already exists")
        m.slug = payload.slug
    db.add(m)
    db.commit()
    db.refresh(m)
    return m


@router.get("/microsites/{slug}/analytics")
def microsite_analytics(slug: str, db: Session = Depends(get_db)):
    m = db.query(Microsite).filter(Microsite.slug == slug).first()
    if not m:
        raise HTTPException(status_code=404, detail="Microsite not found")
    events_count = (
        db.query(func.count(SubEvent.id)).filter(SubEvent.microsite_id == m.id).scalar()
        or 0
    )
    regs_count = (
        db.query(func.count(EventRegistration.id))
        .filter(EventRegistration.microsite_id == m.id)
        .scalar()
        or 0
    )
    return {
        "slug": m.slug,
        "title": m.title,
        "overview": {
            "totalRegistrations": regs_count,
            "eventsCount": events_count,
        },
    }
