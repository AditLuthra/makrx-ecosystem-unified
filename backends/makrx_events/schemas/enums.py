from enum import Enum


class EventStatus(str, Enum):
    draft = "draft"
    published = "published"


class SubEventStatus(str, Enum):
    draft = "draft"
    published = "published"
    closed = "closed"
    cancelled = "cancelled"


class SponsorStatus(str, Enum):
    active = "active"
    inactive = "inactive"


class TournamentStatus(str, Enum):
    scheduled = "scheduled"
    ongoing = "ongoing"
    completed = "completed"
    cancelled = "cancelled"


class TeamRole(str, Enum):
    member = "member"
    admin = "admin"
    owner = "owner"


class RegistrationStatus(str, Enum):
    confirmed = "confirmed"
    pending = "pending"
    cancelled = "cancelled"
    checked_in = "checked_in"
