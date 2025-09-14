"""
Manual migration to add seo_title column to store_products
"""

from alembic import op
import sqlalchemy as sa

revision = "manual_add_seo_title_20250914"
down_revision = "manual_add_is_digital_20250914"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "store_products",
        sa.Column("seo_title", sa.String(length=255), nullable=True),
    )


def downgrade():
    op.drop_column("store_products", "seo_title")
