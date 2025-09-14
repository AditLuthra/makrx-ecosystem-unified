from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import uuid4

from backends.makrx_events.database import get_db
from backends.makrx_events.models import Sponsor
from backends.makrx_events.schemas.sponsors import SponsorCreate, SponsorRead

router = APIRouter()


@router.get("/sponsors", response_model=List[SponsorRead])
def list_all_sponsors(db: Session = Depends(get_db)):
    return db.query(Sponsor).filter(Sponsor.status == "active").order_by(Sponsor.name.asc()).all()


@router.post("/sponsors", response_model=SponsorRead, status_code=201)
def create_sponsor(payload: SponsorCreate, db: Session = Depends(get_db)):
    # Require event_id for now to keep schema consistent
    # If truly global (no event), adjust model to allow null
    if not hasattr(payload, "event_id"):
        raise HTTPException(status_code=400, detail="event_id is required")
    s = Sponsor(
        id=str(uuid4()),
        event_id=getattr(payload, "event_id"),
        name=payload.name,
        tier=payload.tier,
        status="active",
    )
    db.add(s)
    db.commit()
    db.refresh(s)
    return s
