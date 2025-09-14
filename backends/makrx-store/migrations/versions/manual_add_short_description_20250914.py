"""Add short_description column to store_products

Revision ID: manual_add_short_description_20250914
Revises: manual_add_sort_order_20250914
Create Date: 2025-09-14 18:00:00

"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "manual_add_short_description_20250914"
down_revision = "manual_add_sort_order_20250914"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("store_products") as batch_op:
        batch_op.add_column(
            sa.Column("short_description", sa.String(length=500), nullable=True)
        )


def downgrade() -> None:
    with op.batch_alter_table("store_products") as batch_op:
        batch_op.drop_column("short_description")
