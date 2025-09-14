"""add metadata JSONB columns on orders and order_items

Revision ID: add_metadata_jsonb_to_orders
Revises:
Create Date: 2025-09-05 00:00:00

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = "add_metadata_jsonb_to_orders"
down_revision = "add_store_models_extension"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add JSONB 'metadata' columns if not exists (idempotent)
    op.execute("ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS metadata JSONB")
    op.execute("ALTER TABLE store_order_items ADD COLUMN IF NOT EXISTS metadata JSONB")


def downgrade() -> None:
    # Downgrade will drop columns if present
    op.execute("ALTER TABLE store_order_items DROP COLUMN IF EXISTS metadata")
    op.execute("ALTER TABLE store_orders DROP COLUMN IF EXISTS metadata")
