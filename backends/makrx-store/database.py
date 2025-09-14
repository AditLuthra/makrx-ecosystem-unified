"""
Database configuration for MakrX Store Backend
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from base import Base
from core.config import settings

# Database URL from environment
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://makrx:makrx_dev_password@localhost:5433/makrx_ecosystem",
)

# Convert to async URL for SQLAlchemy async support
ASYNC_DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

# Create async engine
engine = create_async_engine(
    ASYNC_DATABASE_URL,
    echo=True if os.getenv("ENVIRONMENT") == "development" else False,
    future=True,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_timeout=settings.DB_POOL_TIMEOUT,
    pool_recycle=settings.DB_POOL_RECYCLE,
)

# Create async session maker
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def create_tables():
    """Create database tables"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db():
    """Dependency to get database session"""
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()
