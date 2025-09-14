"""
Pydantic schemas for commerce entities
Request/response models for products, categories, cart, orders
"""

from pydantic import BaseModel, Field, model_validator, ConfigDict
from typing import List, Optional, Dict, Any, Union
from decimal import Decimal
from datetime import datetime
from enum import Enum
import uuid


# Enums
class OrderStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


class PaymentStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"


# Base schemas
class TimestampMixin(BaseModel):
    created_at: datetime
    updated_at: Optional[datetime] = None


# Category schemas
class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    slug: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    parent_id: Optional[int] = None
    image_url: Optional[str] = None
    sort_order: int = 0
    is_active: bool = True


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    parent_id: Optional[int] = None
    image_url: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


class Category(CategoryBase, TimestampMixin):
    id: int
    children: List["Category"] = []

    model_config = ConfigDict(from_attributes=True)


# Product schemas
class ProductBase(BaseModel):
    slug: str = Field(..., min_length=1, max_length=255)
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    short_description: Optional[str] = Field(None, max_length=500)
    brand: Optional[str] = Field(None, max_length=100)
    category_id: int
    price: Decimal = Field(..., gt=0, decimal_places=2)
    sale_price: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    currency: str = Field("INR", min_length=3, max_length=3)
    stock_qty: int = Field(0, ge=0)
    track_inventory: bool = True
    allow_backorder: bool = False
    attributes: Dict[str, Any] = {}
    specifications: Dict[str, Any] = {}
    compatibility: List[str] = []
    images: List[str] = []
    videos: List[str] = []
    meta_title: Optional[str] = Field(None, max_length=255)
    meta_description: Optional[str] = Field(None, max_length=500)
    tags: List[str] = []
    is_active: bool = True
    is_featured: bool = False
    is_digital: bool = False
    weight: Optional[Decimal] = Field(None, gt=0, decimal_places=3)
    dimensions: Dict[str, float] = {}

    # Validation moved to business logic or omitted for Pydantic v2 migration


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    short_description: Optional[str] = Field(None, max_length=500)
    brand: Optional[str] = Field(None, max_length=100)
    category_id: Optional[int] = None
    price: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    sale_price: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    stock_qty: Optional[int] = Field(None, ge=0)
    track_inventory: Optional[bool] = None
    allow_backorder: Optional[bool] = None
    attributes: Optional[Dict[str, Any]] = None
    specifications: Optional[Dict[str, Any]] = None
    compatibility: Optional[List[str]] = None
    images: Optional[List[str]] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    weight: Optional[Decimal] = Field(None, gt=0, decimal_places=3)
    dimensions: Optional[Dict[str, float]] = None


class Product(ProductBase, TimestampMixin):
    id: int
    category: Optional[Category] = None
    effective_price: Decimal
    in_stock: bool

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="after")
    def compute_derived_fields(self):
        self.effective_price = self.sale_price if self.sale_price else self.price
        if not self.track_inventory or self.allow_backorder:
            self.in_stock = True
        else:
            self.in_stock = (self.stock_qty or 0) > 0
        return self


class ProductList(BaseModel):
    products: List[Product]
    total: int
    page: int
    per_page: int
    pages: int


# Public API response schemas matching wire format
class ProductCategoryOut(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None


class ProductOut(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    short_description: Optional[str] = None
    price: float
    sale_price: Optional[float] = None
    effective_price: float
    currency: str = "INR"
    in_stock: bool
    stock_qty: Optional[int] = None
    sku: Optional[str] = None
    weight: Optional[float] = None
    dimensions: Dict[str, float] = {}
    featured_image: Optional[str] = None
    gallery_images: Optional[List[str]] = None
    is_featured: bool = False
    is_digital: bool = False
    category: Optional[ProductCategoryOut] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class ProductListOut(BaseModel):
    products: List[ProductOut]
    total: int
    page: int
    per_page: int
    pages: int


# Cart schemas
class CartItemBase(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)
    meta: Dict[str, Any] = {}


class CartItemCreate(CartItemBase):
    pass


class CartItemUpdate(BaseModel):
    quantity: int = Field(..., gt=0)
    meta: Optional[Dict[str, Any]] = None


class CartItem(CartItemBase, TimestampMixin):
    id: int
    cart_id: uuid.UUID
    unit_price: Decimal
    total_price: Decimal
    product: Optional[Product] = None

    model_config = ConfigDict(from_attributes=True)


class CartBase(BaseModel):
    currency: str = Field("INR", min_length=3, max_length=3)


class Cart(CartBase, TimestampMixin):
    id: uuid.UUID
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    items: List[CartItem] = []
    subtotal: Decimal = Decimal("0.00")
    item_count: int = 0

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="after")
    def compute_totals(self):
        items = self.items or []
        self.subtotal = sum((item.total_price for item in items), start=Decimal("0.00"))
        self.item_count = sum((item.quantity for item in items), start=0)
        return self


# Address schemas
class Address(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    line1: str = Field(..., min_length=1, max_length=255)
    line2: Optional[str] = Field(None, max_length=255)
    city: str = Field(..., min_length=1, max_length=100)
    state: str = Field(..., min_length=1, max_length=100)
    postal_code: str = Field(..., min_length=1, max_length=20)
    country: str = Field(..., min_length=2, max_length=3)
    phone: Optional[str] = Field(None, max_length=20)


# Order schemas
class OrderItemBase(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)
    meta: Dict[str, Any] = {}


class OrderItem(OrderItemBase, TimestampMixin):
    id: int
    order_id: int
    unit_price: Decimal
    total_price: Decimal
    product_name: str
    product_sku: Optional[str] = None
    product: Optional[Product] = None

    model_config = ConfigDict(from_attributes=True)


class OrderBase(BaseModel):
    email: str = Field(..., pattern=r"^[^@]+@[^@]+\.[^@]+$")
    currency: str = Field("INR", min_length=3, max_length=3)
    addresses: Dict[str, Address]
    shipping_method: Optional[str] = None
    notes: Optional[str] = None


class OrderCreate(OrderBase):
    items: List[OrderItemBase]


class Order(OrderBase, TimestampMixin):
    id: int
    order_number: str
    user_id: Optional[str] = None
    status: OrderStatus
    subtotal: Decimal
    tax_amount: Decimal = Decimal("0.00")
    shipping_amount: Decimal = Decimal("0.00")
    discount_amount: Decimal = Decimal("0.00")
    total: Decimal
    payment_id: Optional[str] = None
    payment_status: PaymentStatus
    payment_method: Optional[str] = None
    tracking_number: Optional[str] = None
    items: List[OrderItem] = []
    shipped_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class OrderList(BaseModel):
    orders: List[Order]
    total: int
    page: int
    per_page: int
    pages: int


# Checkout schemas
class CheckoutRequest(BaseModel):
    cart_id: Optional[uuid.UUID] = None
    items: Optional[List[OrderItemBase]] = None
    shipping_address: Address
    billing_address: Optional[Address] = None
    shipping_method: str = "standard"
    payment_method: str = "card"  # card, upi, netbanking, wallet
    coupon_code: Optional[str] = None
    notes: Optional[str] = None

    @model_validator(mode="after")
    def validate_cart_or_items(self):
        if not self.cart_id and not self.items:
            raise ValueError("Either cart_id or items must be provided")
        if self.cart_id and self.items:
            raise ValueError("Provide either cart_id or items, not both")
        return self


class CheckoutResponse(BaseModel):
    order_id: int
    order_number: str
    total: Decimal
    currency: str
    payment_intent: Dict[str, Any]  # Payment provider specific data


# Coupon schemas
class CouponValidation(BaseModel):
    code: str
    cart_total: Decimal
    user_id: Optional[str] = None


class CouponDiscount(BaseModel):
    code: str
    type: str  # percentage, fixed_amount, free_shipping
    value: Decimal
    discount_amount: Decimal
    is_valid: bool
    error_message: Optional[str] = None


# Search and filter schemas
class ProductFilter(BaseModel):
    category_id: Optional[int] = None
    brand: Optional[str] = None
    price_min: Optional[Decimal] = Field(None, ge=0)
    price_max: Optional[Decimal] = Field(None, ge=0)
    in_stock: Optional[bool] = None
    is_featured: Optional[bool] = None
    tags: Optional[List[str]] = None

    @model_validator(mode="after")
    def validate_price_range(self):
        if self.price_max is not None and self.price_min is not None:
            if self.price_max <= self.price_min:
                raise ValueError("price_max must be greater than price_min")
        return self


class ProductSort(str, Enum):
    NAME_ASC = "name_asc"
    NAME_DESC = "name_desc"
    PRICE_ASC = "price_asc"
    PRICE_DESC = "price_desc"
    CREATED_ASC = "created_asc"
    CREATED_DESC = "created_desc"
    POPULARITY = "popularity"
    RATING = "rating"


class ProductSearch(BaseModel):
    q: Optional[str] = Field(None, max_length=255)  # Search query
    filters: Optional[ProductFilter] = None
    sort: ProductSort = ProductSort.CREATED_DESC
    page: int = Field(1, ge=1)
    per_page: int = Field(20, ge=1, le=100)


# Update forward references
Category.update_forward_refs()
