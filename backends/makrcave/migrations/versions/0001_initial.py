"""
Initial Alembic baseline revision.

Run `alembic revision --autogenerate -m "baseline"` to regenerate from models if needed.
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Baseline placeholder; prefer autogenerate for your DB.
    pass


def downgrade() -> None:
    # Baseline placeholder
    pass
