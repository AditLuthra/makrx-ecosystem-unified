import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import QueuePool

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://makrx:makrx_dev_password@localhost:5433/makrx_ecosystem",
)

enable_sql_logging = os.getenv("ENVIRONMENT", "production") == "development"

engine_kwargs = {
    "echo": enable_sql_logging,
    "hide_parameters": not enable_sql_logging,
}

if not DATABASE_URL.startswith("sqlite"):
    pool_size = int(os.getenv("DB_POOL_SIZE", "5"))
    max_overflow = int(os.getenv("DB_MAX_OVERFLOW", "10"))
    pool_recycle = int(os.getenv("DB_POOL_RECYCLE", "1800"))
    engine_kwargs.update(
        {
            "poolclass": QueuePool,
            "pool_size": pool_size,
            "max_overflow": max_overflow,
            "pool_pre_ping": True,
            "pool_recycle": pool_recycle,
        }
    )

engine = create_engine(DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    from . import models  # register models
    Base.metadata.create_all(bind=engine)
