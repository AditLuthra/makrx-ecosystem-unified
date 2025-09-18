"""
Product catalog routes
"""

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, func, and_, or_
from typing import List, Optional

from ..database import get_db
from ..models.commerce import Product, Category
from ..schemas.commerce import ProductOut, ProductListOut

router = APIRouter()


def _serialize_product(product: Product) -> dict:
    """Serialize Product ORM to API response with consistent shape/order."""
    return {
        "id": product.id,
        "name": product.name,
        "slug": product.slug,
        "description": product.description,
        "short_description": product.short_description,
        "price": float(product.price) if product.price else 0,
        "sale_price": (float(product.sale_price) if product.sale_price else None),
        "in_stock": product.in_stock,
        # normalized key
        "stock_qty": getattr(
            product, "stock_qty", getattr(product, "stock_quantity", None)
        ),
        "sku": product.sku,
        "weight": (float(product.weight) if getattr(product, "weight", None) else None),
        "dimensions": product.dimensions,
        "featured_image": getattr(product, "featured_image", None),
        "gallery_images": getattr(product, "gallery_images", None),
        "is_featured": getattr(product, "is_featured", False),
        "is_digital": getattr(product, "is_digital", False),
        # currency/effective_price
        "currency": getattr(product, "currency", "INR"),
        "effective_price": (
            float(product.sale_price or product.price) if product.price else 0
        ),
        "category": (
            {
                "id": product.category.id,
                "name": product.category.name,
                "slug": product.category.slug,
                "description": product.category.description,
            }
            if product.category
            else None
        ),
        "created_at": product.created_at if product.created_at else None,
        "updated_at": product.updated_at if product.updated_at else None,
    }


@router.get("/api/products", response_model=ProductListOut)
async def get_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    category_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Get products with pagination and filtering"""
    base = (
        select(Product)
        .options(selectinload(Product.category))
        .where(Product.status == "active")
    )
    if category_id:
        base = base.where(Product.category_id == category_id)
    if search:
        like = f"%{search}%"
        base = base.where(
            or_(Product.name.ilike(like), Product.description.ilike(like))
        )

    # Count total
    count_stmt = (
        select(func.count(Product.id))
        .select_from(Product)
        .where(Product.status == "active")
    )
    if category_id:
        count_stmt = count_stmt.where(Product.category_id == category_id)
    if search:
        like = f"%{search}%"
        count_stmt = count_stmt.where(
            or_(Product.name.ilike(like), Product.description.ilike(like))
        )
    total = (await db.execute(count_stmt)).scalar_one()

    # Fetch page
    page = (skip // limit) + 1 if limit else 1
    per_page = limit
    pages = max(1, (total + per_page - 1) // per_page)
    result = await db.execute(base.offset(skip).limit(limit))
    items = result.scalars().all()

    return {
        "products": [_serialize_product(p) for p in items],
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": pages,
    }


@router.get("/api/products/{product_id}", response_model=ProductOut)
async def get_product_by_id(product_id: int, db: AsyncSession = Depends(get_db)):
    """Get single product by ID (raw object)"""
    query = (
        select(Product)
        .options(selectinload(Product.category))
        .where(Product.id == product_id, Product.status == "active")
    )
    result = await db.execute(query)
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return _serialize_product(product)


@router.get("/api/products/slug/{slug}", response_model=ProductOut)
async def get_product_by_slug(slug: str, db: AsyncSession = Depends(get_db)):
    """Get single product by slug (fast lookup)"""
    query = (
        select(Product)
        .options(selectinload(Product.category))
        .where(Product.slug == slug, Product.status == "active")
    )
    result = await db.execute(query)
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return _serialize_product(product)


@router.get("/api/categories")
async def get_categories(db: AsyncSession = Depends(get_db)):
    """Get product categories"""
    query = (
        select(Category)
        .where(Category.is_active == True)
        .order_by(Category.sort_order, Category.name)
    )

    result = await db.execute(query)
    categories = result.scalars().all()

    return {
        "categories": [
            {
                "id": category.id,
                "name": category.name,
                "slug": category.slug,
                "description": category.description,
                "parent_id": category.parent_id,
                "sort_order": category.sort_order,
            }
            for category in categories
        ]
    }


@router.get("/api/categories/{category_id}/products")
async def get_category_products(
    category_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Get products for a specific category"""
    # Check if category exists
    category_query = select(Category).where(
        Category.id == category_id, Category.is_active == True
    )
    category_result = await db.execute(category_query)
    category = category_result.scalar_one_or_none()

    if not category:
        return {
            "error": "Category not found",
            "products": [],
            "category": None,
        }

    # Count total
    count_stmt = select(func.count(Product.id)).where(
        Product.category_id == category_id, Product.status == "active"
    )
    total = (await db.execute(count_stmt)).scalar_one()

    # Get products in category
    products_query = (
        select(Product)
        .where(Product.category_id == category_id, Product.status == "active")
        .offset(skip)
        .limit(limit)
    )
    products_result = await db.execute(products_query)
    products = products_result.scalars().all()
    page = (skip // limit) + 1 if limit else 1
    per_page = limit
    pages = max(1, (total + per_page - 1) // per_page)

    return {
        "category": {
            "id": category.id,
            "name": category.name,
            "slug": category.slug,
            "description": category.description,
        },
        "products": [_serialize_product(p) for p in products],
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": pages,
    }
