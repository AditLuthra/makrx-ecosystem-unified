"""
Enhanced Catalog API Routes
Brands, Collections, Tags, and enhanced category features
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from typing import List, Optional, Dict, Any
import logging

from database import get_db
from models.commerce import (
    Brand,
    Collection,
    CollectionProduct,
    Tag,
    ProductTag,
    Category,
    Product,
)
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/catalog", tags=["Enhanced Catalog"])


# Pydantic models for responses
class BrandResponse(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    logo: Optional[str] = None
    banner_image: Optional[str] = None
    website: Optional[str] = None
    founded: Optional[int] = None
    headquarters: Optional[str] = None
    specialties: List[str] = []
    product_count: int = 0
    featured_products: List[Dict[str, Any]] = []


class CollectionResponse(BaseModel):
    id: int
    name: str
    slug: str
    description: str
    banner_image: Optional[str] = None
    curator_name: Optional[str] = None
    curator_bio: Optional[str] = None
    tags: List[str] = []
    featured_categories: List[Dict[str, Any]] = []
    product_count: int = 0
    created_at: str
    updated_at: str
    is_featured: bool = False


class TagResponse(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    product_count: int = 0
    related_tags: List[str] = []
    category_distribution: List[Dict[str, Any]] = []


class CategoryTreeResponse(BaseModel):
    categories: List[Dict[str, Any]]
    total_categories: int


# Brand endpoints
@router.get("/brands", response_model=Dict[str, Any])
async def get_brands(
    include_products: bool = Query(
        False, description="Include featured products for each brand"
    ),
    featured_only: bool = Query(
        False, description="Only return featured brands"
    ),
    db: AsyncSession = Depends(get_db),
):
    """Get all brands with optional product information"""
    try:
        stmt = select(Brand).where(Brand.is_active == True)

        if featured_only:
            stmt = stmt.where(Brand.is_featured == True)

        stmt = stmt.order_by(Brand.name)
        brands = (await db.execute(stmt)).scalars().all()
        brand_list = []

        for brand in brands:
            # Count products for this brand
            count_stmt = select(func.count(Product.id)).where(
                and_(
                    Product.brand_id == brand.id,
                    Product.is_active == True,
                )
            )
            product_count = (await db.execute(count_stmt)).scalar_one()

            brand_data = {
                "name": brand.name,
                "slug": brand.slug,
                "description": brand.description,
                "logo": brand.logo,
                "banner_image": brand.banner_image,
                "website": brand.website,
                "founded": brand.founded,
                "headquarters": brand.headquarters,
                "specialties": brand.specialties or [],
                "product_count": product_count,
                "featured_products": [],
            }

            if include_products and product_count > 0:
                # Get featured products for this brand
                fp_stmt = (
                    select(Product)
                    .where(
                        and_(
                            Product.brand_id == brand.id,
                            Product.is_active == True,
                            Product.is_featured == True,
                        )
                    )
                    .limit(4)
                )
                featured_products = (await db.execute(fp_stmt)).scalars().all()

                if not featured_products:
                    # Fallback to recent products
                    fp_fallback = (
                        select(Product)
                        .where(
                            and_(
                                Product.brand_id == brand.id,
                                Product.is_active == True,
                            )
                        )
                        .order_by(Product.created_at.desc())
                        .limit(4)
                    )
                    featured_products = (
                        (await db.execute(fp_fallback)).scalars().all()
                    )

                brand_data["featured_products"] = [
                    {
                        "id": p.id,
                        "name": p.name,
                        "slug": p.slug,
                        "price": float(p.price),
                        "image": p.images[0] if p.images else None,
                    }
                    for p in featured_products
                ]

            brand_list.append(brand_data)

        return {"brands": brand_list}

    except Exception as e:
        logger.error(f"Failed to get brands: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to retrieve brands"
        )


@router.get("/brands/{slug}", response_model=BrandResponse)
async def get_brand_by_slug(
    slug: str = Path(..., description="Brand slug"),
    db: AsyncSession = Depends(get_db),
):
    """Get brand details by slug"""
    try:
        brand_stmt = select(Brand).where(
            and_(Brand.slug == slug, Brand.is_active == True)
        )
        brand = (await db.execute(brand_stmt)).scalars().first()

        if not brand:
            raise HTTPException(status_code=404, detail="Brand not found")

        # Count products
        count_stmt = select(func.count(Product.id)).where(
            and_(Product.brand_id == brand.id, Product.is_active == True)
        )
        product_count = (await db.execute(count_stmt)).scalar_one()

        return BrandResponse(
            name=brand.name,
            slug=brand.slug,
            description=brand.description,
            logo=brand.logo,
            banner_image=brand.banner_image,
            website=brand.website,
            founded=brand.founded,
            headquarters=brand.headquarters,
            specialties=brand.specialties or [],
            product_count=product_count,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get brand {slug}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve brand")


# Collection endpoints
@router.get("/collections", response_model=Dict[str, Any])
async def get_collections(
    featured_only: bool = Query(
        False, description="Only return featured collections"
    ),
    db: AsyncSession = Depends(get_db),
):
    """Get all collections"""
    try:
        stmt = select(Collection).where(Collection.is_active == True)
        if featured_only:
            stmt = stmt.where(Collection.is_featured == True)
        stmt = stmt.order_by(Collection.updated_at.desc())
        collections = (await db.execute(stmt)).scalars().all()
        collection_list = []

        for collection in collections:
            # Count products in collection
            count_stmt = select(
                func.count(CollectionProduct.product_id)
            ).where(CollectionProduct.collection_id == collection.id)
            product_count = (await db.execute(count_stmt)).scalar_one()

            collection_list.append(
                {
                    "id": collection.id,
                    "name": collection.name,
                    "slug": collection.slug,
                    "description": collection.description,
                    "banner_image": collection.banner_image,
                    "curator_name": collection.curator_name,
                    "is_featured": collection.is_featured,
                    "product_count": product_count,
                    "created_at": (
                        collection.created_at.isoformat()
                        if collection.created_at
                        else None
                    ),
                    "updated_at": (
                        collection.updated_at.isoformat()
                        if collection.updated_at
                        else None
                    ),
                }
            )

        return {"collections": collection_list}

    except Exception as e:
        logger.error(f"Failed to get collections: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to retrieve collections"
        )


@router.get("/collections/{slug}", response_model=CollectionResponse)
async def get_collection_by_slug(
    slug: str = Path(..., description="Collection slug"),
    db: AsyncSession = Depends(get_db),
):
    """Get collection details by slug"""
    try:
        coll_stmt = select(Collection).where(
            and_(Collection.slug == slug, Collection.is_active == True)
        )
        collection = (await db.execute(coll_stmt)).scalars().first()

        if not collection:
            raise HTTPException(status_code=404, detail="Collection not found")

        # Count products
        count_stmt = select(func.count(CollectionProduct.product_id)).where(
            CollectionProduct.collection_id == collection.id
        )
        product_count = (await db.execute(count_stmt)).scalar_one()

        # Get featured categories
        featured_categories = []
        if collection.featured_categories:
            cats_stmt = select(Category).where(
                Category.id.in_(collection.featured_categories)
            )
            categories = (await db.execute(cats_stmt)).scalars().all()
            featured_categories = [
                {"id": c.id, "name": c.name, "slug": c.slug}
                for c in categories
            ]

        return CollectionResponse(
            id=collection.id,
            name=collection.name,
            slug=collection.slug,
            description=collection.description,
            banner_image=collection.banner_image,
            curator_name=collection.curator_name,
            curator_bio=collection.curator_bio,
            tags=collection.tags or [],
            featured_categories=featured_categories,
            product_count=product_count,
            created_at=(
                collection.created_at.isoformat()
                if collection.created_at
                else ""
            ),
            updated_at=(
                collection.updated_at.isoformat()
                if collection.updated_at
                else ""
            ),
            is_featured=collection.is_featured,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get collection {slug}: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to retrieve collection"
        )


@router.get("/collections/{slug}/products", response_model=Dict[str, Any])
async def get_collection_products(
    slug: str = Path(..., description="Collection slug"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    sort: str = Query(
        "featured",
        description="Sort order: featured, newest, price_asc, price_desc",
    ),
    db: AsyncSession = Depends(get_db),
):
    """Get products in a collection"""
    try:
        coll_stmt = select(Collection).where(
            and_(Collection.slug == slug, Collection.is_active == True)
        )
        collection = (await db.execute(coll_stmt)).scalars().first()

        if not collection:
            raise HTTPException(status_code=404, detail="Collection not found")

        # Build query for collection products
        base_stmt = (
            select(Product)
            .join(
                CollectionProduct, Product.id == CollectionProduct.product_id
            )
            .where(
                and_(
                    CollectionProduct.collection_id == collection.id,
                    Product.is_active == True,
                )
            )
        )

        # Apply sorting
        if sort == "featured":
            base_stmt = base_stmt.order_by(
                CollectionProduct.is_featured.desc(),
                CollectionProduct.sort_order,
            )
        elif sort == "newest":
            base_stmt = base_stmt.order_by(Product.created_at.desc())
        elif sort == "price_asc":
            base_stmt = base_stmt.order_by(
                func.coalesce(Product.sale_price, Product.price).asc()
            )
        elif sort == "price_desc":
            base_stmt = base_stmt.order_by(
                func.coalesce(Product.sale_price, Product.price).desc()
            )
        else:
            base_stmt = base_stmt.order_by(CollectionProduct.sort_order)

        # Get total count
        count_stmt = select(func.count()).select_from(
            select(Product.id)
            .join(
                CollectionProduct, Product.id == CollectionProduct.product_id
            )
            .where(
                and_(
                    CollectionProduct.collection_id == collection.id,
                    Product.is_active == True,
                )
            )
            .subquery()
        )
        total_count = (await db.execute(count_stmt)).scalar_one()

        # Apply pagination
        offset = (page - 1) * per_page
        paged = base_stmt.offset(offset).limit(per_page)
        products = (await db.execute(paged)).scalars().all()

        # Format products
        product_list = []
        for product in products:
            product_list.append(
                {
                    "id": product.id,
                    "slug": product.slug,
                    "name": product.name,
                    "brand": product.brand,
                    "price": float(product.price),
                    "sale_price": (
                        float(product.sale_price)
                        if product.sale_price
                        else None
                    ),
                    "images": product.images or [],
                    "in_stock": product.stock_qty > 0,
                    "is_featured": product.is_featured,
                }
            )

        return {
            "products": product_list,
            "total_count": total_count,
            "page": page,
            "per_page": per_page,
            "total_pages": (total_count + per_page - 1) // per_page,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get collection products for {slug}: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to retrieve collection products"
        )


# Tag endpoints
@router.get("/tags/popular", response_model=Dict[str, Any])
async def get_popular_tags(
    limit: int = Query(
        20, ge=1, le=100, description="Number of tags to return"
    ),
    db: AsyncSession = Depends(get_db),
):
    """Get popular tags by usage count"""
    try:
        stmt = (
            select(Tag)
            .where(Tag.is_active == True)
            .order_by(Tag.usage_count.desc())
            .limit(limit)
        )
        tags = (await db.execute(stmt)).scalars().all()

        return {"tags": [tag.name for tag in tags]}

    except Exception as e:
        logger.error(f"Failed to get popular tags: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to retrieve popular tags"
        )


@router.get("/tags/{tag_name}", response_model=TagResponse)
async def get_tag_info(
    tag_name: str = Path(..., description="Tag name"),
    db: AsyncSession = Depends(get_db),
):
    """Get tag information and related data"""
    try:
        tag_stmt = select(Tag).where(
            and_(Tag.name == tag_name, Tag.is_active == True)
        )
        tag = (await db.execute(tag_stmt)).scalars().first()

        if not tag:
            # Create basic response even if tag doesn't exist in tags table
            return TagResponse(
                name=tag_name,
                slug=tag_name.lower().replace(" ", "-"),
                product_count=0,
                related_tags=[],
                category_distribution=[],
            )

        # Get category distribution
        cat_dist_stmt = (
            select(Category.name, func.count(Product.id).label("count"))
            .join(Product, Category.id == Product.category_id)
            .join(ProductTag, Product.id == ProductTag.product_id)
            .where(
                and_(
                    ProductTag.tag_id == tag.id,
                    Product.is_active == True,
                    Category.is_active == True,
                )
            )
            .group_by(Category.name)
        )
        category_dist = (await db.execute(cat_dist_stmt)).all()

        # Get related tags (tags that appear with this tag)
        product_ids_stmt = select(ProductTag.product_id).where(
            ProductTag.tag_id == tag.id
        )
        related_tags_stmt = (
            select(Tag.name)
            .join(ProductTag, Tag.id == ProductTag.tag_id)
            .where(
                and_(
                    ProductTag.product_id.in_(product_ids_stmt),
                    Tag.id != tag.id,
                    Tag.is_active == True,
                )
            )
            .group_by(Tag.name)
            .order_by(func.count(ProductTag.product_id).desc())
            .limit(10)
        )
        related_tags = (await db.execute(related_tags_stmt)).all()

        return TagResponse(
            name=tag.name,
            slug=tag.slug,
            description=tag.description,
            product_count=tag.usage_count,
            related_tags=[t.name for t in related_tags],
            category_distribution=[
                {"category": dist.name, "count": dist.count}
                for dist in category_dist
            ],
        )

    except Exception as e:
        logger.error(f"Failed to get tag info for {tag_name}: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to retrieve tag information"
        )


# Enhanced category endpoints
@router.get("/categories/tree", response_model=CategoryTreeResponse)
async def get_category_tree(
    include_product_counts: bool = Query(
        False, description="Include product counts"
    ),
    max_depth: Optional[int] = Query(
        None, description="Maximum depth to return"
    ),
    db: AsyncSession = Depends(get_db),
):
    """Get complete category tree with optional product counts"""
    try:
        # Get all categories
        stmt = select(Category).where(Category.is_active == True)
        # Current model doesn't track tree level; optional depth ignored
        stmt = stmt.order_by(Category.sort_order, Category.name)
        categories = (await db.execute(stmt)).scalars().all()

        # Build tree structure
        category_dict = {}
        root_categories = []

        for category in categories:
            category_data = {
                "id": category.id,
                "name": category.name,
                "slug": category.slug,
                "description": category.description,
                "image_url": category.image_url,
                "sort_order": category.sort_order,
                "children": [],
            }

            if include_product_counts:
                count_stmt = select(func.count(Product.id)).where(
                    and_(
                        Product.category_id == category.id,
                        Product.is_active == True,
                    )
                )
                product_count = (await db.execute(count_stmt)).scalar_one()
                category_data["product_count"] = product_count

            category_dict[category.id] = category_data

            if category.parent_id and category.parent_id in category_dict:
                category_dict[category.parent_id]["children"].append(
                    category_data
                )
            else:
                root_categories.append(category_data)

        return CategoryTreeResponse(
            categories=root_categories, total_categories=len(categories)
        )

    except Exception as e:
        logger.error(f"Failed to get category tree: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to retrieve category tree"
        )
