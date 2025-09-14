from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import uuid4

from backends.makrx_events.database import get_db
from backends.makrx_events.models import Sponsor
from backends.makrx_events.schemas.sponsors import SponsorCreate, SponsorUpdate, SponsorRead
from backends.makrx_events.security import get_current_user, CurrentUser

router = APIRouter()


@router.get("/events/{event_id}/sponsors", response_model=List[SponsorRead])
def list_sponsors(event_id: str, db: Session = Depends(get_db)):
    return db.query(Sponsor).filter(Sponsor.event_id == event_id).order_by(Sponsor.name.asc()).all()


@router.post("/events/{event_id}/sponsors", response_model=SponsorRead, status_code=201)
def create_sponsor(event_id: str, payload: SponsorCreate, _user: CurrentUser = Depends(get_current_user), db: Session = Depends(get_db)):
    s = Sponsor(id=str(uuid4()), event_id=event_id, name=payload.name, tier=payload.tier)
    db.add(s)
    db.commit()
    db.refresh(s)
    return s


@router.patch("/events/{event_id}/sponsors/{sponsor_id}", response_model=SponsorRead)
def update_sponsor(event_id: str, sponsor_id: str, payload: SponsorUpdate, _user: CurrentUser = Depends(get_current_user), db: Session = Depends(get_db)):
    s = db.query(Sponsor).filter(Sponsor.id == sponsor_id, Sponsor.event_id == event_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Sponsor not found")
    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        if k == "name":
            s.name = v
        elif k == "tier":
            s.tier = v
        elif k == "status":
            s.status = getattr(v, 'value', v)
    db.add(s)
    db.commit()
    db.refresh(s)
    return s
