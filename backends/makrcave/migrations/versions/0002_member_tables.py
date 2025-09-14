"""
Member tables (legacy placeholder)

This formalizes the legacy member-table setup as a no-op here, assuming
the current SQLAlchemy models capture the desired state. Prefer creating
an auto-generated revision against models for exact DDL.
"""
from alembic import op  # noqa: F401
import sqlalchemy as sa  # noqa: F401


revision = '0002_member_tables'
down_revision = '0001_initial'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Legacy script was a placeholder; handled by base model snapshot or later revisions.
    pass


def downgrade() -> None:
    pass

