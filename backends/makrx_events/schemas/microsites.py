from pydantic import BaseModel, field_validator, Field
from typing import Optional
from datetime import datetime
from .common import CamelModel


class MicrositeCreate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    slug: Optional[str] = Field(
        default=None, min_length=1, max_length=100, pattern=r"^[a-z0-9-]+$"
    )

    @field_validator("slug")
    @classmethod
    def normalize_slug(cls, v):
        if not v:
            return v
        return v.strip().lower()


class MicrositeUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    slug: Optional[str] = Field(
        default=None, min_length=1, max_length=100, pattern=r"^[a-z0-9-]+$"
    )

    @field_validator("slug")
    @classmethod
    def normalize_slug(cls, v):
        if not v:
            return v
        return v.strip().lower()


class MicrositeRead(CamelModel):
    id: str
    slug: str
    title: Optional[str]
    created_at: Optional[datetime]
