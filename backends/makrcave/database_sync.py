import structlog
"""
Alternative database configuration for Python 3.13 compatibility
Uses synchronous psycopg2 instead of asyncpg
"""

import os

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

# Database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL environment variable must be set and "
        "not use a default in production."
    )

# Create synchronous engine
engine = create_engine(
    DATABASE_URL,
    poolclass=StaticPool,
    pool_pre_ping=True,
    echo=False,  # Set to True for SQL logging
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


def get_db() -> Session:
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Create all tables"""
    Base.metadata.create_all(bind=engine)
    log = structlog.get_logger(__name__)
    log.info("db_tables_created_verified")


def test_connection():
    """Test database connection"""
    log = structlog.get_logger(__name__)
    try:
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        log.info("db_connection_successful")
        return True
    except Exception as e:
        log.error("db_connection_failed", error=str(e))
        return False
