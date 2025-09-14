from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
from sqlalchemy.pool import QueuePool

# Load environment variables
load_dotenv()

# Database configuration - Updated for unified ecosystem
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://makrx:makrx_dev_password@localhost:5433/makrx_ecosystem"
)

# Create SQLAlchemy engine
enable_sql_logging = os.getenv("ENVIRONMENT", "production") == "development"

# Engine options
engine_kwargs = {
    "echo": enable_sql_logging,
    "hide_parameters": not enable_sql_logging,
}

if DATABASE_URL.startswith("sqlite"):
    # SQLite-specific settings
    engine_kwargs.update({
        "connect_args": {"check_same_thread": False},
    })
else:
    # Postgres or other drivers
    pool_size = int(os.getenv("DB_POOL_SIZE", "5"))
    max_overflow = int(os.getenv("DB_MAX_OVERFLOW", "10"))
    pool_recycle = int(os.getenv("DB_POOL_RECYCLE", "1800"))  # seconds
    engine_kwargs.update({
        "poolclass": QueuePool,
        "pool_size": pool_size,
        "max_overflow": max_overflow,
        "pool_pre_ping": True,
        "pool_recycle": pool_recycle,
    })

engine = create_engine(DATABASE_URL, **engine_kwargs)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for models
Base = declarative_base()

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Initialize database tables
def init_db():
    """Initialize database tables"""
    # Import all models to register them with Base
    from . import models  # Import all models in the models package
    Base.metadata.create_all(bind=engine)

# Database utility functions
def reset_db():
    """Reset database (drop and recreate all tables)"""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

def get_db_session():
    """Get a database session for scripts/utilities"""
    return SessionLocal()
