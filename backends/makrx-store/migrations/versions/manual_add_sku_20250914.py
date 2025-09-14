"""Add sku column to store_products

Revision ID: manual_add_sku_20250914
Revises: manual_add_stock_quantity_20250914
Create Date: 2025-09-14 19:00:00

"""

from alembic import op
import sqlalchemy as sa

revision = "manual_add_sku_20250914"
down_revision = "manual_add_stock_quantity_20250914"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("store_products") as batch_op:
        batch_op.add_column(
            sa.Column(
                "sku",
                sa.String(length=100),
                unique=True,
                index=True,
                nullable=True,
            )
        )


def downgrade() -> None:
    with op.batch_alter_table("store_products") as batch_op:
        batch_op.drop_column("sku")
