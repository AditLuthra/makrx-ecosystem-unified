"""
Alternative database configuration for Python 3.13 compatibility
Uses synchronous psycopg2 instead of asyncpg
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from .base import Base
from sqlalchemy.pool import StaticPool
from sqlalchemy.engine import make_url

# Database URL from environment (use psycopg3 driver by default)
_RAW_DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://makrx:makrx_dev_password@localhost:5433/makrx_ecosystem",
)

if (
    _RAW_DATABASE_URL.startswith("postgresql://")
    and "+" not in _RAW_DATABASE_URL.split("://", 1)[0]
):
    DATABASE_URL = _RAW_DATABASE_URL.replace(
        "postgresql://", "postgresql+psycopg://", 1
    )
else:
    DATABASE_URL = _RAW_DATABASE_URL

_parsed_url = make_url(DATABASE_URL)

# Create synchronous engine
engine = create_engine(
    DATABASE_URL,
    poolclass=StaticPool,
    pool_pre_ping=True,
    echo=False,  # Set to True for SQL logging
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Session:
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Create all tables"""
    # Ensure models are imported so their metadata is registered
    try:
        import models.commerce  # noqa: F401
        import models.services  # noqa: F401
        import models.admin  # noqa: F401
        import models.reviews  # noqa: F401
        import models.subscriptions  # noqa: F401
    except Exception:
        pass
    if _parsed_url.get_backend_name() != "sqlite":
        print(
            "ℹ️ Skipping Base.metadata.create_all for non-SQLite backend; run Alembic migrations instead."
        )
        return

    Base.metadata.create_all(bind=engine)
    print("✅ SQLite database tables created/verified")


def test_connection():
    """Test database connection"""
    try:
        from sqlalchemy import text

        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        print("✅ Database connection successful")
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False
