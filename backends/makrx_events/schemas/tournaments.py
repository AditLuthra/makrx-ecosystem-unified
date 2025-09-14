from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from .common import CamelModel
from .enums import TournamentStatus


class TournamentCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)


class TournamentRead(CamelModel):
    id: str
    event_id: str
    name: str
    description: Optional[str] = None
    format: Optional[str] = None
    status: Optional[TournamentStatus] = None
    max_participants: Optional[int] = None
    current_round: Optional[int] = None
    activity_id: Optional[str] = None
    created_at: Optional[datetime]
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class TournamentUpdate(CamelModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=120)
    description: Optional[str] = Field(default=None, max_length=1000)
    format: Optional[str] = Field(default=None, max_length=80)
    status: Optional[TournamentStatus] = None
    max_participants: Optional[int] = None
    current_round: Optional[int] = None
    activity_id: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
