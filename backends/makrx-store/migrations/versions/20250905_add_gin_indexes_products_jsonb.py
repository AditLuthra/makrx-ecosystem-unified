"""add GIN indexes on products JSONB fields

Revision ID: add_gin_indexes_products_jsonb
Revises: add_store_models_extension
Create Date: 2025-09-05 00:20:00

"""
from alembic import op


# revision identifiers, used by Alembic.
revision = 'add_gin_indexes_products_jsonb'
down_revision = 'add_store_models_extension'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE INDEX IF NOT EXISTS ix_store_products_tags_gin ON store_products USING GIN (tags)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_store_products_attributes_gin ON store_products USING GIN (attributes)")


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_store_products_attributes_gin")
    op.execute("DROP INDEX IF EXISTS ix_store_products_tags_gin")

