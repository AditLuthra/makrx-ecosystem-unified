"""
SQLAlchemy models for commerce entities - Simplified for unified ecosystem
Products, Categories, Cart, Orders
"""

from sqlalchemy import (
    Column,
    Integer,
    String,
    Numeric,
    Boolean,
    DateTime,
    Text,
    ForeignKey,
    UniqueConstraint,
    Index,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship, synonym
from sqlalchemy.sql import func
from ..base import Base
import uuid


class Brand(Base):
    __tablename__ = "store_brands"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True, index=True)
    slug = Column(String(255), nullable=False, unique=True, index=True)
    description = Column(Text)
    logo = Column(String(500))
    banner_image = Column(String(500))
    website = Column(String(255))
    founded = Column(Integer)
    headquarters = Column(String(255))
    specialties = Column(JSONB, default=[])
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Category(Base):
    __tablename__ = "store_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    slug = Column(String(255), nullable=False, index=True)
    description = Column(Text)
    image_url = Column(String(500))
    parent_id = Column(Integer, ForeignKey("store_categories.id"), nullable=True)

    # Display
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    parent = relationship("Category", remote_side=[id], back_populates="children")
    children = relationship("Category", back_populates="parent")
    products = relationship("Product", back_populates="category")


class Product(Base):
    __tablename__ = "store_products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    slug = Column(String(255), nullable=False, index=True)
    description = Column(Text)
    short_description = Column(String(500))
    brand = Column(String(100))
    brand_id = Column(Integer, ForeignKey("store_brands.id"), nullable=True)
    currency = Column(String(3), default="INR")

    # Pricing
    price = Column(Numeric(10, 2), nullable=False)
    sale_price = Column(Numeric(10, 2), nullable=True)

    # Inventory
    stock_quantity = Column(Integer, default=0)
    stock = Column(Integer, nullable=True)
    stock_qty = synonym("stock_quantity")
    track_inventory = Column(Boolean, default=True)
    allow_backorder = Column(Boolean, default=False)

    # Category
    category_id = Column(Integer, ForeignKey("store_categories.id"), nullable=True)

    # Product data
    sku = Column(String(100), unique=True, index=True)
    weight = Column(Numeric(8, 3))
    dimensions = Column(JSONB)  # {"length": 10, "width": 5, "height": 2}
    attributes = Column(JSONB, default={})
    specifications = Column(JSONB, default={})
    compatibility = Column(JSONB, default=[])

    # Images
    featured_image = Column(String(500))
    gallery_images = Column(JSONB)  # ["image1.jpg", "image2.jpg"]
    images = Column(JSONB, default=[])
    videos = Column(JSONB, default=[])

    # Status
    status = Column(String(20), default="active")  # active, draft, archived
    is_featured = Column(Boolean, default=False)
    is_digital = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    tags = Column(JSONB, default=[])

    # SEO
    seo_title = Column(String(255))
    seo_description = Column(String(500))

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    category = relationship("Category", back_populates="products")
    brand_rel = relationship("Brand", primaryjoin="Product.brand_id==Brand.id")
    cart_items = relationship("CartItem", back_populates="product")
    order_items = relationship("OrderItem", back_populates="product")

    __table_args__ = (
        Index("ix_store_products_status", "status"),
        Index("ix_store_products_status_category", "status", "category_id"),
    )


class Tag(Base):
    __tablename__ = "store_tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True, index=True)
    slug = Column(String(120), nullable=False, unique=True, index=True)
    description = Column(Text)
    usage_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class ProductTag(Base):
    __tablename__ = "store_product_tags"
    id = Column(Integer, primary_key=True)
    product_id = Column(
        Integer, ForeignKey("store_products.id"), nullable=False, index=True
    )
    tag_id = Column(Integer, ForeignKey("store_tags.id"), nullable=False, index=True)
    __table_args__ = (UniqueConstraint("product_id", "tag_id", name="uq_product_tag"),)


class Collection(Base):
    __tablename__ = "store_collections"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), nullable=False, unique=True, index=True)
    description = Column(Text)
    banner_image = Column(String(500))
    curator_name = Column(String(255))
    curator_bio = Column(Text)
    tags = Column(JSONB, default=[])
    featured_categories = Column(JSONB, default=[])
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class CollectionProduct(Base):
    __tablename__ = "store_collection_products"

    id = Column(Integer, primary_key=True)
    collection_id = Column(
        Integer, ForeignKey("store_collections.id"), nullable=False, index=True
    )
    product_id = Column(
        Integer, ForeignKey("store_products.id"), nullable=False, index=True
    )
    is_featured = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)
    __table_args__ = (
        UniqueConstraint("collection_id", "product_id", name="uq_collection_product"),
    )


class Cart(Base):
    __tablename__ = "store_carts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(255), nullable=False, index=True)  # From Keycloak
    session_id = Column(String(255), nullable=True, index=True)  # For guest carts

    # Status
    status = Column(String(20), default="active")  # active, abandoned, converted

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    items = relationship(
        "CartItem", back_populates="cart", cascade="all, delete-orphan"
    )


class CartItem(Base):
    __tablename__ = "store_cart_items"

    id = Column(Integer, primary_key=True, index=True)
    cart_id = Column(Integer, ForeignKey("store_carts.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("store_products.id"), nullable=False)

    quantity = Column(Integer, nullable=False, default=1)
    price_at_time = Column(Numeric(10, 2), nullable=False)  # Price when added to cart

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    cart = relationship("Cart", back_populates="items")
    product = relationship("Product", back_populates="cart_items")


class Order(Base):
    __tablename__ = "store_orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True, nullable=False, index=True)
    user_id = Column(String(255), nullable=False, index=True)  # From Keycloak

    # Status
    status = Column(
        String(20), default="pending"
    )  # pending, processing, shipped, delivered, cancelled
    payment_status = Column(
        String(20), default="pending"
    )  # pending, paid, failed, refunded

    # Totals
    subtotal = Column(Numeric(10, 2), nullable=False)
    tax_amount = Column(Numeric(10, 2), default=0)
    shipping_amount = Column(Numeric(10, 2), default=0)
    total_amount = Column(Numeric(10, 2), nullable=False)

    # Customer info
    customer_email = Column(String(255), nullable=False)
    customer_phone = Column(String(20))

    # Shipping address
    shipping_address = Column(JSONB)
    billing_address = Column(JSONB)

    # Notes
    notes = Column(Text)
    # Flexible metadata for payments/webhooks (stored as column name 'metadata')
    meta = Column("metadata", JSONB)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    items = relationship(
        "OrderItem", back_populates="order", cascade="all, delete-orphan"
    )


class OrderItem(Base):
    __tablename__ = "store_order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("store_orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("store_products.id"), nullable=True)

    quantity = Column(Integer, nullable=False)
    price_at_time = Column(Numeric(10, 2), nullable=False)
    total_price = Column(Numeric(10, 2), nullable=False)
    # Flexible metadata for integration (stored as column name 'metadata')
    meta = Column("metadata", JSONB)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")
