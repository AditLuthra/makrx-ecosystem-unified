"""add status indexes to products

Revision ID: 20250913_add_status_indexes
Revises: 20250905_add_gin_indexes_products_jsonb
Create Date: 2025-09-13 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20250913_add_status_indexes"
down_revision = "add_gin_indexes_products_jsonb"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # btree indexes to speed up product listings
    op.create_index(
        "ix_store_products_status",
        "store_products",
        ["status"],
        unique=False,
    )
    op.create_index(
        "ix_store_products_status_category",
        "store_products",
        ["status", "category_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_store_products_status_category", table_name="store_products")
    op.drop_index("ix_store_products_status", table_name="store_products")
