"""Create store_orders and store_order_items tables

Revision ID: create_store_orders_tables
Revises: create_core_store_tables
Create Date: 2025-09-14 13:00:00

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "create_store_orders_tables"
down_revision = "create_core_store_tables"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "store_orders",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("total", sa.Numeric(10, 2), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("NOW()"),
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "metadata", postgresql.JSONB(astext_type=sa.Text()), nullable=True
        ),
    )

    op.create_table(
        "store_order_items",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("order_id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("price", sa.Numeric(10, 2), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("NOW()"),
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "metadata", postgresql.JSONB(astext_type=sa.Text()), nullable=True
        ),
        sa.ForeignKeyConstraint(
            ["order_id"], ["store_orders.id"], name="fk_order_item_order"
        ),
        sa.ForeignKeyConstraint(
            ["product_id"], ["store_products.id"], name="fk_order_item_product"
        ),
    )


def downgrade() -> None:
    op.drop_table("store_order_items")
    op.drop_table("store_orders")
