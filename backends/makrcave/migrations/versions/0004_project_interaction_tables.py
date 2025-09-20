"""
Create project interaction tables (likes, bookmarks) via legacy helper
"""

import sqlalchemy as sa  # noqa: F401
from alembic import op  # noqa: F401

revision = "0004_project_interaction_tables"
down_revision = "0003_skill_tables"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # No-op: superseded by canonical model baseline
    pass


def downgrade() -> None:
    # No-op: define drops if needed
    pass
