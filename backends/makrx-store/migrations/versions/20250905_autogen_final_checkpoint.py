"""final autogenerate checkpoint (no schema changes)

Revision ID: autogen_final_checkpoint
Revises: add_gin_indexes_products_jsonb
Create Date: 2025-09-05 00:30:00

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "autogen_final_checkpoint"
down_revision = "add_gin_indexes_products_jsonb"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # No changes detected; checkpoint revision
    pass


def downgrade() -> None:
    # No changes to revert
    pass
