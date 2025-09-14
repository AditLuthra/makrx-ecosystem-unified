#!/usr/bin/env python3
"""
Create project interaction tables (likes and bookmarks).

This script ensures the `project_likes` and `project_bookmarks` tables exist in the
database. Run after the main database initialization when enabling project
interaction features.
"""

import os
import sys
import logging

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import engine
from models.project import Base, ProjectLike, ProjectBookmark

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_project_interaction_tables() -> bool:
    """Create tables used for project likes and bookmarks."""
    try:
        logger.info("Creating project interaction tables...")
        Base.metadata.create_all(
            bind=engine,
            tables=[
                ProjectLike.__table__,
                ProjectBookmark.__table__,
            ],
        )
        logger.info("Project interaction tables created successfully!")
        return True
    except Exception as exc:
        logger.error(f"Error creating project interaction tables: {exc}")
        return False


if __name__ == "__main__":
    create_project_interaction_tables()
