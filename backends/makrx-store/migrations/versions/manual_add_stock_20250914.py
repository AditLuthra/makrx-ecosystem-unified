"""
Manual migration to add stock column to store_products
"""

from alembic import op
import sqlalchemy as sa

revision = "manual_add_stock_20250914"
down_revision = "manual_add_seo_description_20250914"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("store_products", sa.Column("stock", sa.Integer(), nullable=True))


def downgrade():
    op.drop_column("store_products", "stock")
