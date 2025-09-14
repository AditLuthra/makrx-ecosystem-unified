from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from uuid import uuid4

from backends.makrx_events.database import get_db
from backends.makrx_events.models import Microsite, SubEvent
from backends.makrx_events.schemas.sub_events import (
    SubEventRead,
    SubEventCreate,
    SubEventUpdate,
)
from backends.makrx_events.security import get_current_user, CurrentUser

router = APIRouter()


@router.get(
    "/microsites/{slug}/events/{sub_slug}", response_model=SubEventRead
)
def get_sub_event(slug: str, sub_slug: str, db: Session = Depends(get_db)):
    m = db.query(Microsite).filter(Microsite.slug == slug).first()
    if not m:
        raise HTTPException(status_code=404, detail="Microsite not found")
    se = (
        db.query(SubEvent)
        .filter(SubEvent.microsite_id == m.id, SubEvent.slug == sub_slug)
        .first()
    )
    if not se:
        raise HTTPException(status_code=404, detail="Sub-event not found")
    return se


@router.patch(
    "/microsites/{slug}/events/{sub_slug}", response_model=SubEventRead
)
def update_sub_event(
    slug: str,
    sub_slug: str,
    payload: SubEventUpdate,
    _user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    m = db.query(Microsite).filter(Microsite.slug == slug).first()
    if not m:
        raise HTTPException(status_code=404, detail="Microsite not found")
    se = (
        db.query(SubEvent)
        .filter(SubEvent.microsite_id == m.id, SubEvent.slug == sub_slug)
        .first()
    )
    if not se:
        raise HTTPException(status_code=404, detail="Sub-event not found")
    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(se, k, v)
    db.add(se)
    db.commit()
    db.refresh(se)
    return se


@router.delete("/microsites/{slug}/events/{sub_slug}")
def delete_sub_event(
    slug: str,
    sub_slug: str,
    _user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    m = db.query(Microsite).filter(Microsite.slug == slug).first()
    if not m:
        raise HTTPException(status_code=404, detail="Microsite not found")
    se = (
        db.query(SubEvent)
        .filter(SubEvent.microsite_id == m.id, SubEvent.slug == sub_slug)
        .first()
    )
    if not se:
        raise HTTPException(status_code=404, detail="Sub-event not found")
    db.delete(se)
    db.commit()
    return {"message": "Sub-event deleted successfully"}


@router.post(
    "/microsites/{slug}/events", response_model=SubEventRead, status_code=201
)
def create_sub_event(
    slug: str,
    payload: SubEventCreate,
    _user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    m = db.query(Microsite).filter(Microsite.slug == slug).first()
    if not m:
        raise HTTPException(status_code=404, detail="Microsite not found")
    # required: title; optional slug
    title = payload.title
    sub_slug = payload.slug
    if not sub_slug:
        import re

        sub_slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    se = SubEvent(
        id=str(uuid4()),
        microsite_id=m.id,
        slug=sub_slug,
        title=title,
        type=payload.type,
        track=payload.track,
        capacity=payload.capacity,
        price=payload.price,
        currency=payload.currency,
        registration_type=payload.registration_type,
        status=payload.status or "draft",
        registration_deadline=payload.registration_deadline,
        starts_at=payload.starts_at,
        ends_at=payload.ends_at,
        location=payload.location,
        short_desc=payload.short_desc,
        long_desc=payload.long_desc,
        rules_md=payload.rules_md,
        prizes_md=payload.prizes_md,
        waitlist=payload.waitlist,
    )
    db.add(se)
    db.commit()
    db.refresh(se)
    return se
