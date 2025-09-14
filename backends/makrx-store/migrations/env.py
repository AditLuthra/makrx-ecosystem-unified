import os
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from sqlalchemy import create_engine
from alembic import context

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Interpret the config file for Python logging.

# Add your model's MetaData object here for 'autogenerate' support.

# Patch sys.path to allow import from parent directory
import sys

sys.path.insert(
    0, os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
)
from base import Base  # noqa: E402
import models.commerce  # noqa: F401
import models.services  # noqa: F401
import models.admin  # noqa: F401
import models.reviews  # noqa: F401
import models.subscriptions  # noqa: F401
import models.providers  # noqa: F401

target_metadata = Base.metadata


def _get_database_url() -> str:
    # Prefer env var DATABASE_URL; fall back to alembic.ini value
    url = os.getenv("DATABASE_URL", config.get_main_option("sqlalchemy.url"))
    # Ensure sync driver for Alembic (strip asyncpg if present)
    if url and "+asyncpg" in url:
        url = url.replace("+asyncpg", "")
    return url


def run_migrations_offline() -> None:
    url = _get_database_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    configuration = config.get_section(config.config_ini_section) or {}
    configuration["sqlalchemy.url"] = _get_database_url()

    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
