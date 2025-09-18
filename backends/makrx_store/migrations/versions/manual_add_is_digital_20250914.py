"""
Manual migration to add is_digital column to store_products
"""

from alembic import op
import sqlalchemy as sa

revision = "manual_add_is_digital_20250914"
down_revision = "manual_add_is_featured_20250914"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "store_products", sa.Column("is_digital", sa.Boolean(), nullable=True)
    )


def downgrade():
    op.drop_column("store_products", "is_digital")
