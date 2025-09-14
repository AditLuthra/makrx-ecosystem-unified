import os
from logging.config import fileConfig
from pathlib import Path
import sys
import types

from sqlalchemy import engine_from_config, pool
from alembic import context

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# When running in the service container, the app root is /app
# so we can import directly from the local database module.
# Bootstrap alias so hyphenated folder can be imported as backends.makrx_events
app_root = Path(__file__).resolve().parent.parent  # /app
back_mod = types.ModuleType("backends")
back_mod.__path__ = [str(app_root.parent)]  # not used but required
sys.modules.setdefault("backends", back_mod)
pkg_name = "backends.makrx_events"
pkg_mod = types.ModuleType(pkg_name)
pkg_mod.__path__ = [str(app_root)]
sys.modules.setdefault(pkg_name, pkg_mod)

from backends.makrx_events.database import Base  # type: ignore

# Ensure models are imported so Base.metadata is populated
from importlib import import_module

for module in (
    "backends.makrx_events.models.users",
    "backends.makrx_events.models.events",
    "backends.makrx_events.models.registrations",
    "backends.makrx_events.models.activities",
    "backends.makrx_events.models.teams",
    "backends.makrx_events.models.tournaments",
    "backends.makrx_events.models.sponsors",
    "backends.makrx_events.models.microsites",
    "backends.makrx_events.models.sub_events",
):
    try:
        import_module(module)
    except Exception:
        pass
target_metadata = Base.metadata


def run_migrations_offline():
    url = os.getenv("DATABASE_URL", config.get_main_option("sqlalchemy.url"))
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,
        compare_server_default=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    configuration = config.get_section(config.config_ini_section)
    configuration["sqlalchemy.url"] = os.getenv(
        "DATABASE_URL", configuration.get("sqlalchemy.url")
    )
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
            compare_server_default=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
