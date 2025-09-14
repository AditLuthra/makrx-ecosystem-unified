"""merge autogen_final_checkpoint and 20250913_add_status_indexes heads

Revision ID: merge_heads_20250914
Revises: autogen_final_checkpoint, 20250913_add_status_indexes
Create Date: 2025-09-14 00:00:00
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "merge_heads_20250914"
down_revision = (
    "autogen_final_checkpoint",
    "20250913_add_status_indexes",
    "add_metadata_jsonb_to_orders",
    "add_columns_to_store_tables",
)
branch_labels = None
depends_on = None


def upgrade() -> None:
    # This is a merge migration; no schema changes
    pass


def downgrade() -> None:
    # This is a merge migration; no schema changes
    pass
