from pydantic import BaseModel, Field
from typing import Optional
from .common import CamelModel
from .enums import SponsorStatus


class SponsorCreate(BaseModel):
    event_id: str
    name: str = Field(min_length=1, max_length=150)
    tier: Optional[str] = Field(default=None, max_length=50)


class SponsorRead(CamelModel):
    id: str
    event_id: str
    name: str
    tier: Optional[str]
    status: Optional[SponsorStatus] = None


class SponsorUpdate(CamelModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=150)
    tier: Optional[str] = Field(default=None, max_length=50)
    status: Optional[SponsorStatus] = None
