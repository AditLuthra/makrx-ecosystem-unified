from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from .common import CamelModel
from .enums import EventStatus, RegistrationStatus


class EventCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class EventUpdate(CamelModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: Optional[EventStatus] = None


class EventRead(CamelModel):
    id: str
    slug: str
    title: Optional[str]
    organizer_id: Optional[str]
    status: str
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]


class RegistrationCreate(BaseModel):
    # Optional association hints for future expansion
    microsite_id: Optional[str] = None
    sub_event_id: Optional[str] = None


class RegistrationRead(CamelModel):
    id: str
    event_id: Optional[str]
    user_id: str
    status: Optional[RegistrationStatus]
    registered_at: Optional[datetime]
