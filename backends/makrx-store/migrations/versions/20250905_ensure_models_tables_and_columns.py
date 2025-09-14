"""create brand/tag/collection tables and extend product/category

Revision ID: add_store_models_extension
Revises: add_metadata_jsonb_to_orders
Create Date: 2025-09-05 00:10:00

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = "add_store_models_extension"
down_revision = "create_store_orders_tables"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # store_brands
    op.create_table(
        "store_brands",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("logo", sa.String(length=500), nullable=True),
        sa.Column("banner_image", sa.String(length=500), nullable=True),
        sa.Column("website", sa.String(length=255), nullable=True),
        sa.Column("founded", sa.Integer(), nullable=True),
        sa.Column("headquarters", sa.String(length=255), nullable=True),
        sa.Column(
            "specialties",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
        ),
        sa.Column(
            "is_active",
            sa.Boolean(),
            server_default=sa.text("true"),
            nullable=False,
        ),
        sa.Column(
            "is_featured",
            sa.Boolean(),
            server_default=sa.text("false"),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("NOW()"),
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("name"),
        sa.UniqueConstraint("slug"),
    )
    # ...existing code for creating store_tags, store_product_tags, store_collections, store_collection_products...

    # store_tags
    op.create_table(
        "store_tags",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("slug", sa.String(length=120), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("usage_count", sa.Integer(), server_default="0", nullable=False),
        sa.Column(
            "is_active",
            sa.Boolean(),
            server_default=sa.text("true"),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("NOW()"),
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("name"),
        sa.UniqueConstraint("slug"),
    )

    # store_product_tags
    op.create_table(
        "store_product_tags",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("tag_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["product_id"],
            ["store_products.id"],
            name="fk_product_tags_product",
        ),
        sa.ForeignKeyConstraint(
            ["tag_id"], ["store_tags.id"], name="fk_product_tags_tag"
        ),
        sa.UniqueConstraint("product_id", "tag_id", name="uq_product_tag"),
    )

    # store_collections
    op.create_table(
        "store_collections",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("banner_image", sa.String(length=500), nullable=True),
        sa.Column("curator_name", sa.String(length=255), nullable=True),
        sa.Column("curator_bio", sa.Text(), nullable=True),
        sa.Column("tags", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column(
            "featured_categories",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
        ),
        sa.Column(
            "is_active",
            sa.Boolean(),
            server_default=sa.text("true"),
            nullable=False,
        ),
        sa.Column(
            "is_featured",
            sa.Boolean(),
            server_default=sa.text("false"),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("NOW()"),
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("slug"),
    )

    # store_collection_products
    op.create_table(
        "store_collection_products",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("collection_id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column(
            "is_featured",
            sa.Boolean(),
            server_default=sa.text("false"),
            nullable=False,
        ),
        sa.Column("sort_order", sa.Integer(), server_default="0", nullable=False),
        sa.ForeignKeyConstraint(
            ["collection_id"],
            ["store_collections.id"],
            name="fk_collection_products_collection",
        ),
        sa.ForeignKeyConstraint(
            ["product_id"],
            ["store_products.id"],
            name="fk_collection_products_product",
        ),
        sa.UniqueConstraint(
            "collection_id", "product_id", name="uq_collection_product"
        ),
    )


def downgrade() -> None:
    op.drop_table("store_collection_products")
    op.drop_table("store_collections")
    op.drop_table("store_product_tags")
    op.drop_table("store_tags")
    with op.batch_alter_table("store_products") as batch_op:
        batch_op.drop_constraint("fk_products_brand", type_="foreignkey")
        batch_op.drop_column("is_active")
        batch_op.drop_column("tags")
        batch_op.drop_column("videos")
        batch_op.drop_column("images")
        batch_op.drop_column("compatibility")
        batch_op.drop_column("specifications")
        batch_op.drop_column("attributes")
        batch_op.drop_column("allow_backorder")
        batch_op.drop_column("track_inventory")
        batch_op.drop_column("currency")
        batch_op.drop_column("brand_id")
        batch_op.drop_column("brand")
    with op.batch_alter_table("store_categories") as batch_op:
        batch_op.drop_column("image_url")
    op.drop_table("store_brands")
