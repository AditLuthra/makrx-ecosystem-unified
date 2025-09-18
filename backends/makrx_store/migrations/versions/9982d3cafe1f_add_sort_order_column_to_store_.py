"""add sort_order column to store_categories and fix FKs

Revision ID: 9982d3cafe1f
Revises: merge_heads_20250914
Create Date: 2025-09-14 16:11:43.908190

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "9982d3cafe1f"
down_revision = "merge_heads_20250914"
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
