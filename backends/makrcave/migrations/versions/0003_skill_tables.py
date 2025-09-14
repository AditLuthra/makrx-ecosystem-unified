"""
Create skill management tables via legacy helper
"""

from alembic import op  # noqa: F401
import sqlalchemy as sa  # noqa: F401


revision = "0003_skill_tables"
down_revision = "0002_member_tables"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # No-op: superseded by canonical model baseline
    pass


def downgrade() -> None:
    # No-op (define drops if needed)
    pass
