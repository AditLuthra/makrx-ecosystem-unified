"""CRUD operations package for MakrCave backend."""

import importlib

from . import access_control
from . import analytics
from . import billing
from . import enhanced_analytics
from . import equipment
from . import makerspace_settings
from . import project
from . import skill

__all__ = [
    "access_control",
    "analytics",
    "billing",
    "enhanced_analytics",
    "equipment",
    "makerspace_settings",
    "project",
    "skill",
    "notifications",
]


def __getattr__(name: str):
    if name == "notifications":
        module = importlib.import_module(f".{name}", __name__)
        globals()[name] = module
        return module
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
