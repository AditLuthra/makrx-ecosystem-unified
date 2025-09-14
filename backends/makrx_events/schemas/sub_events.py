from pydantic import BaseModel, field_validator, Field
from typing import Optional
from datetime import datetime
from .common import CamelModel
from .enums import SubEventStatus


class SubEventCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    slug: Optional[str] = Field(default=None, min_length=1, max_length=100, pattern=r"^[a-z0-9-]+$")
    type: Optional[str] = Field(default=None, max_length=50)
    track: Optional[str] = Field(default=None, max_length=50)
    capacity: Optional[int] = None
    price: Optional[float] = None
    currency: Optional[str] = None
    registration_type: Optional[str] = None
    status: Optional[SubEventStatus] = None
    registration_deadline: Optional[datetime] = None
    starts_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None
    location: Optional[str] = Field(default=None, max_length=200)
    short_desc: Optional[str] = Field(default=None, max_length=500)
    long_desc: Optional[str] = None
    rules_md: Optional[str] = None
    prizes_md: Optional[str] = None
    waitlist: Optional[bool] = None

    @field_validator('slug')
    @classmethod
    def normalize_slug(cls, v):
        if not v:
            return v
        return v.strip().lower()


class SubEventUpdate(CamelModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    type: Optional[str] = Field(default=None, max_length=50)
    track: Optional[str] = Field(default=None, max_length=50)
    capacity: Optional[int] = None
    price: Optional[float] = None
    currency: Optional[str] = None
    registration_type: Optional[str] = None
    status: Optional[SubEventStatus] = None
    registration_deadline: Optional[datetime] = None
    starts_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None
    location: Optional[str] = Field(default=None, max_length=200)
    short_desc: Optional[str] = Field(default=None, max_length=500)
    long_desc: Optional[str] = None
    rules_md: Optional[str] = None
    prizes_md: Optional[str] = None
    waitlist: Optional[bool] = None


class SubEventRead(CamelModel):
    id: str
    microsite_id: str
    slug: Optional[str]
    title: str
    type: Optional[str]
    track: Optional[str]
    capacity: Optional[int]
    price: Optional[float]
    currency: Optional[str]
    registration_type: Optional[str]
    status: Optional[SubEventStatus]
    registration_deadline: Optional[datetime]
    starts_at: Optional[datetime]
    ends_at: Optional[datetime]
    location: Optional[str]
    short_desc: Optional[str]
    long_desc: Optional[str]
    rules_md: Optional[str]
    prizes_md: Optional[str]
    waitlist: Optional[bool]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
