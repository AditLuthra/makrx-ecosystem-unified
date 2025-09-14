from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from .common import CamelModel
from .enums import TeamRole


class TeamCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)


class TeamRead(CamelModel):
    id: str
    event_id: str
    name: str
    created_at: Optional[datetime]


class TeamUpdate(CamelModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)


class TeamMemberCreate(BaseModel):
    user_id: str
    role: Optional[TeamRole] = TeamRole.member


class TeamMemberRead(CamelModel):
    id: str
    team_id: str
    user_id: str
    role: Optional[TeamRole]
