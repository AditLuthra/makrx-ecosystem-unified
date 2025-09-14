"""Add columns to store_categories and store_products after table creation

Revision ID: add_columns_to_store_tables
Revises: add_store_models_extension
Create Date: 2025-09-14 12:00:00

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_columns_to_store_tables'
down_revision = 'add_store_models_extension'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Only add columns that do not already exist in base tables
    with op.batch_alter_table('store_categories') as batch_op:
        batch_op.add_column(sa.Column('image_url', sa.String(length=500), nullable=True))

    with op.batch_alter_table('store_products') as batch_op:
        batch_op.add_column(sa.Column('brand', sa.String(length=100), nullable=True))
        batch_op.add_column(sa.Column('brand_id', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('currency', sa.String(length=3), server_default='INR', nullable=False))
        batch_op.add_column(sa.Column('track_inventory', sa.Boolean(), server_default=sa.text('true'), nullable=False))
        batch_op.add_column(sa.Column('allow_backorder', sa.Boolean(), server_default=sa.text('false'), nullable=False))
        batch_op.add_column(sa.Column('attributes', postgresql.JSONB(astext_type=sa.Text()), nullable=True))
        batch_op.add_column(sa.Column('specifications', postgresql.JSONB(astext_type=sa.Text()), nullable=True))
        batch_op.add_column(sa.Column('compatibility', postgresql.JSONB(astext_type=sa.Text()), nullable=True))
        batch_op.add_column(sa.Column('images', postgresql.JSONB(astext_type=sa.Text()), nullable=True))
        batch_op.add_column(sa.Column('videos', postgresql.JSONB(astext_type=sa.Text()), nullable=True))
        batch_op.add_column(sa.Column('tags', postgresql.JSONB(astext_type=sa.Text()), nullable=True))
        batch_op.create_foreign_key('fk_products_brand', 'store_brands', ['brand_id'], ['id'])

def downgrade() -> None:
    with op.batch_alter_table('store_products') as batch_op:
        batch_op.drop_constraint('fk_products_brand', type_='foreignkey')
        batch_op.drop_column('is_active')
        batch_op.drop_column('tags')
        batch_op.drop_column('videos')
        batch_op.drop_column('images')
        batch_op.drop_column('compatibility')
        batch_op.drop_column('specifications')
        batch_op.drop_column('attributes')
        batch_op.drop_column('allow_backorder')
        batch_op.drop_column('track_inventory')
        batch_op.drop_column('currency')
        batch_op.drop_column('brand_id')
        batch_op.drop_column('brand')
    with op.batch_alter_table('store_categories') as batch_op:
        batch_op.drop_column('image_url')
