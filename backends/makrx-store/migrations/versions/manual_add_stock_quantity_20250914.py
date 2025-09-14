"""Add stock_quantity column to store_products

Revision ID: manual_add_stock_quantity_20250914
Revises: manual_add_sale_price_20250914
Create Date: 2025-09-14 18:45:00

"""

from alembic import op
import sqlalchemy as sa

revision = "manual_add_stock_quantity_20250914"
down_revision = "manual_add_sale_price_20250914"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("store_products") as batch_op:
        batch_op.add_column(sa.Column("stock_quantity", sa.Integer(), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table("store_products") as batch_op:
        batch_op.drop_column("stock_quantity")
