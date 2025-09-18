"""Add sort_order column to store_categories (manual fix)

Revision ID: manual_add_sort_order_20250914
Revises: 9982d3cafe1f
Create Date: 2025-09-14 18:00:00

"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "manual_add_sort_order_20250914"
down_revision = "9982d3cafe1f"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "store_categories",
        sa.Column("sort_order", sa.Integer(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("store_categories", "sort_order")
