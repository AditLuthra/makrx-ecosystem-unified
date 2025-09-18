"""
Enhanced Catalog API Routes
Advanced search, filtering, maker-specific features, and integration capabilities
"""

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    Path,
    BackgroundTasks,
)
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func
from typing import List, Optional, Dict, Any
import logging
import json
from datetime import datetime, timedelta

from ..database import get_db
from ..models.commerce import Product, Category, Order, OrderItem
from ..models.subscriptions import QuickReorder, BOMIntegration
from ..models.reviews import Review, ProductRatingSummary
from pydantic import BaseModel, Field
from ..core.security import get_current_user_optional, AuthUser

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/catalog", tags=["Enhanced Catalog"])


# Enhanced Search Models
class AdvancedProductFilter(BaseModel):
    # Basic filters
    category_ids: Optional[List[int]] = None
    brands: Optional[List[str]] = None
    price_min: Optional[float] = None
    price_max: Optional[float] = None
    in_stock: Optional[bool] = None
    is_featured: Optional[bool] = None

    # Maker-specific filters
    material_types: Optional[List[str]] = None  # PLA, ABS, PETG, etc.
    printer_compatibility: Optional[List[str]] = None  # Ender 3, Prusa, etc.
    application_types: Optional[List[str]] = None  # Prototyping, Production, etc.
    diameter: Optional[List[str]] = None  # 1.75mm, 2.85mm

    # Advanced filters
    rating_min: Optional[float] = Field(None, ge=1, le=5)
    has_reviews: Optional[bool] = None
    new_arrivals_days: Optional[int] = None  # Products added in last N days
    sale_items_only: Optional[bool] = None

    # Technical specs
    technical_specs: Optional[Dict[str, Any]] = None
    dimensions: Optional[Dict[str, float]] = None  # max_x, max_y, max_z
    weight_range: Optional[Dict[str, float]] = None  # min_weight, max_weight


class AdvancedSearchRequest(BaseModel):
    query: Optional[str] = None
    filters: Optional[AdvancedProductFilter] = None
    sort_by: str = Field(
        "relevance",
        description="Sort by: relevance, price_asc, price_desc, rating, newest, popularity",
    )
    page: int = Field(1, ge=1)
    per_page: int = Field(20, ge=1, le=100)
    include_suggestions: bool = Field(True, description="Include search suggestions")
    include_facets: bool = Field(True, description="Include filter facets")


class SearchFacet(BaseModel):
    name: str
    type: str  # checkbox, range, select
    values: List[Dict[str, Any]]


class AdvancedSearchResponse(BaseModel):
    products: List[Dict[str, Any]]
    total_count: int
    page: int
    per_page: int
    total_pages: int
    search_time_ms: float
    suggestions: Optional[List[str]] = None
    facets: Optional[List[SearchFacet]] = None
    related_categories: Optional[List[Dict[str, Any]]] = None


class ProductRecommendationRequest(BaseModel):
    product_id: Optional[int] = None
    user_id: Optional[str] = None
    category_id: Optional[int] = None
    recommendation_type: str = Field(
        "similar", description="similar, complementary, trending, personalized"
    )
    limit: int = Field(10, ge=1, le=50)


@router.post("/search/advanced", response_model=AdvancedSearchResponse)
async def advanced_product_search(
    request: AdvancedSearchRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """
    Advanced product search with faceted search, filtering, and maker-specific features
    """
    start_time = datetime.now()

    try:
        # Build base query
        base_stmt = select(Product).where(Product.is_active == True)

        # Apply text search
        if request.query:
            search_terms = request.query.strip().split()
            search_conditions = []

            for term in search_terms:
                term_condition = or_(
                    Product.name.ilike(f"%{term}%"),
                    Product.description.ilike(f"%{term}%"),
                    Product.short_description.ilike(f"%{term}%"),
                    Product.brand.ilike(f"%{term}%"),
                    Product.tags.op("@>")([term.lower()]),  # JSONB contains
                    Product.attributes.op("@>")({f"material": term.lower()}),
                )
                search_conditions.append(term_condition)

            if search_conditions:
                base_stmt = base_stmt.where(and_(*search_conditions))

        # Apply filters
        if request.filters:
            filters = request.filters

            # Basic filters
            if filters.category_ids:
                base_stmt = base_stmt.where(
                    Product.category_id.in_(filters.category_ids)
                )

            if filters.brands:
                base_stmt = base_stmt.where(Product.brand.in_(filters.brands))

            if filters.price_min is not None:
                base_stmt = base_stmt.where(
                    func.coalesce(Product.sale_price, Product.price)
                    >= filters.price_min
                )

            if filters.price_max is not None:
                base_stmt = base_stmt.where(
                    func.coalesce(Product.sale_price, Product.price)
                    <= filters.price_max
                )

            if filters.in_stock is not None:
                if filters.in_stock:
                    base_stmt = base_stmt.where(Product.stock_qty > 0)
                else:
                    base_stmt = base_stmt.where(Product.stock_qty <= 0)

            if filters.is_featured is not None:
                base_stmt = base_stmt.where(Product.is_featured == filters.is_featured)

            # Maker-specific filters
            if filters.material_types:
                material_conditions = [
                    Product.attributes["material"].astext.ilike(f"%{material}%")
                    for material in filters.material_types
                ]
                base_stmt = base_stmt.where(or_(*material_conditions))

            if filters.printer_compatibility:
                compat_conditions = [
                    Product.compatibility.op("@>")([printer])
                    for printer in filters.printer_compatibility
                ]
                base_stmt = base_stmt.where(or_(*compat_conditions))

            if filters.diameter:
                diameter_conditions = [
                    Product.attributes["diameter"].astext == diameter
                    for diameter in filters.diameter
                ]
                base_stmt = base_stmt.where(or_(*diameter_conditions))

            # Advanced filters
            if filters.new_arrivals_days:
                cutoff_date = datetime.now() - timedelta(days=filters.new_arrivals_days)
                base_stmt = base_stmt.where(Product.created_at >= cutoff_date)

            if filters.sale_items_only:
                base_stmt = base_stmt.where(Product.sale_price.is_not(None))

            if filters.rating_min:
                # Join with rating summary
                base_stmt = base_stmt.join(
                    ProductRatingSummary,
                    Product.id == ProductRatingSummary.product_id,
                )
                base_stmt = base_stmt.where(
                    ProductRatingSummary.average_rating >= filters.rating_min
                )

            if filters.has_reviews:
                review_subquery = (
                    select(Review.target_id)
                    .where(
                        and_(
                            Review.target_type == "product",
                            Review.status == "published",
                        )
                    )
                    .distinct()
                )

                if filters.has_reviews:
                    base_stmt = base_stmt.where(Product.id.in_(review_subquery))
                else:
                    base_stmt = base_stmt.where(~Product.id.in_(review_subquery))

        # Get total count before pagination
        count_stmt = select(func.count()).select_from(base_stmt.subquery())
        total_count = (await db.execute(count_stmt)).scalar_one()

        # Apply sorting
        if request.sort_by == "price_asc":
            base_stmt = base_stmt.order_by(
                func.coalesce(Product.sale_price, Product.price).asc()
            )
        elif request.sort_by == "price_desc":
            base_stmt = base_stmt.order_by(
                func.coalesce(Product.sale_price, Product.price).desc()
            )
        elif request.sort_by == "newest":
            base_stmt = base_stmt.order_by(Product.created_at.desc())
        elif request.sort_by == "rating":
            base_stmt = base_stmt.outerjoin(
                ProductRatingSummary,
                Product.id == ProductRatingSummary.product_id,
            )
            base_stmt = base_stmt.order_by(
                ProductRatingSummary.average_rating.desc().nullslast()
            )
        elif request.sort_by == "popularity":
            # Order by total orders (simplified)
            popularity_subquery = (
                select(
                    OrderItem.product_id,
                    func.sum(OrderItem.quantity).label("total_orders"),
                )
                .group_by(OrderItem.product_id)
                .subquery()
            )
            base_stmt = base_stmt.outerjoin(
                popularity_subquery,
                Product.id == popularity_subquery.c.product_id,
            )
            base_stmt = base_stmt.order_by(
                popularity_subquery.c.total_orders.desc().nullslast()
            )
        else:  # relevance (default)
            base_stmt = base_stmt.order_by(
                Product.is_featured.desc(), Product.created_at.desc()
            )

        # Apply pagination
        offset = (request.page - 1) * request.per_page
        products_query = base_stmt.offset(offset).limit(request.per_page)
        products = (await db.execute(products_query)).scalars().all()

        # Convert to dict format with additional data
        product_list = []
        for product in products:
            product_dict = {
                "id": product.id,
                "slug": product.slug,
                "name": product.name,
                "description": product.description,
                "short_description": product.short_description,
                "brand": product.brand,
                "price": float(product.price),
                "sale_price": (
                    float(product.sale_price) if product.sale_price else None
                ),
                "effective_price": float(product.sale_price or product.price),
                "currency": product.currency,
                "stock_qty": product.stock_qty,
                "in_stock": product.stock_qty > 0,
                "is_featured": product.is_featured,
                "images": product.images or [],
                "attributes": product.attributes or {},
                "specifications": product.specifications or {},
                "compatibility": product.compatibility or [],
                "tags": product.tags or [],
                "created_at": (
                    product.created_at.isoformat() if product.created_at else None
                ),
            }

            # Add rating data if available
            rating_stmt = select(ProductRatingSummary).where(
                ProductRatingSummary.product_id == product.id
            )
            rating_summary = (await db.execute(rating_stmt)).scalars().first()

            if rating_summary:
                product_dict["rating"] = {
                    "average": float(rating_summary.average_rating),
                    "count": rating_summary.total_reviews,
                    "verified_count": rating_summary.verified_reviews,
                }

            product_list.append(product_dict)

        # Calculate response time
        search_time = (datetime.now() - start_time).total_seconds() * 1000

        # Build response
        response = AdvancedSearchResponse(
            products=product_list,
            total_count=total_count,
            page=request.page,
            per_page=request.per_page,
            total_pages=(total_count + request.per_page - 1) // request.per_page,
            search_time_ms=round(search_time, 2),
        )

        # Add suggestions if requested
        if request.include_suggestions and request.query:
            background_tasks.add_task(log_search_query, request.query, total_count)
            suggestions = await get_search_suggestions(db, request.query)
            response.suggestions = suggestions

        # Add facets if requested
        if request.include_facets:
            facets = await build_search_facets(db, request.filters)
            response.facets = facets

        return response

    except Exception as e:
        logger.error(f"Advanced search error: {e}")
        raise HTTPException(status_code=500, detail="Search failed")


@router.get("/recommendations", response_model=List[Dict[str, Any]])
async def get_product_recommendations(
    request: ProductRecommendationRequest = Depends(),
    user: Optional[AuthUser] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    """
    Get product recommendations based on various algorithms
    """
    try:
        recommendations = []

        # If personalized recommendations are requested, ensure user is authenticated
        if request.recommendation_type == "personalized":
            if user is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required for personalized recommendations",
                )
            user_id_for_recommendation = user.user_id
        else:
            user_id_for_recommendation = None

        if request.recommendation_type == "similar" and request.product_id:
            recommendations = await get_similar_products(
                db, request.product_id, request.limit
            )

        elif request.recommendation_type == "complementary" and request.product_id:
            recommendations = await get_complementary_products(
                db, request.product_id, request.limit
            )

        elif request.recommendation_type == "trending":
            recommendations = await get_trending_products(
                db, request.category_id, request.limit
            )

        elif request.recommendation_type == "personalized":
            recommendations = await get_personalized_recommendations(
                db, user_id_for_recommendation, request.limit
            )

        else:
            # Default to popular products
            recommendations = await get_popular_products(
                db, request.category_id, request.limit
            )

        return recommendations

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Recommendations error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get recommendations")


@router.get("/compatibility/{product_id}")
async def get_product_compatibility(
    product_id: int, db: AsyncSession = Depends(get_db)
):
    """
    Get compatibility information for a product
    """
    try:
        product = (
            (await db.execute(select(Product).where(Product.id == product_id)))
            .scalars()
            .first()
        )
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        compatibility_data = {
            "product_id": product_id,
            "product_name": product.name,
            "compatible_printers": product.compatibility or [],
            "specifications": product.specifications or {},
            "attributes": product.attributes or {},
            "recommended_settings": {},
        }

        # Add recommended print settings if it's a filament
        if "material" in product.attributes:
            material = product.attributes["material"].lower()
            compatibility_data["recommended_settings"] = get_material_settings(material)

        # Find compatible accessories
        compatible_products = await find_compatible_products(db, product)
        compatibility_data["compatible_accessories"] = compatible_products

        return compatibility_data

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Compatibility check error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get compatibility info")


@router.post("/bulk-search")
async def bulk_product_search(
    product_codes: List[str], db: AsyncSession = Depends(get_db)
):
    """
    Search for multiple products by SKU, name, or other identifiers
    Useful for BOM imports and bulk ordering
    """
    try:
        results = {"found": [], "not_found": [], "suggestions": {}}

        for code in product_codes:
            # Try different search strategies
            product = None

            # 1. Search by SKU in attributes
            stmt1 = select(Product).where(Product.attributes["sku"].astext == code)
            product = (await db.execute(stmt1)).scalars().first()

            # 2. Search by name exact match
            if not product:
                stmt2 = select(Product).where(Product.name.ilike(f"%{code}%"))
                product = (await db.execute(stmt2)).scalars().first()

            # 3. Search by brand + model
            if not product and " " in code:
                parts = code.split()
                if len(parts) >= 2:
                    brand, model = parts[0], " ".join(parts[1:])
                    stmt3 = select(Product).where(
                        and_(
                            Product.brand.ilike(f"%{brand}%"),
                            Product.name.ilike(f"%{model}%"),
                        )
                    )
                    product = (await db.execute(stmt3)).scalars().first()

            if product:
                results["found"].append(
                    {
                        "search_term": code,
                        "product": {
                            "id": product.id,
                            "name": product.name,
                            "brand": product.brand,
                            "price": float(product.price),
                            "sale_price": (
                                float(product.sale_price)
                                if product.sale_price
                                else None
                            ),
                            "in_stock": product.stock_qty > 0,
                            "stock_qty": product.stock_qty,
                        },
                    }
                )
            else:
                results["not_found"].append(code)

                # Generate suggestions
                sugg_stmt = (
                    select(Product)
                    .where(
                        or_(
                            Product.name.ilike(f"%{code[:5]}%"),
                            Product.brand.ilike(f"%{code[:5]}%"),
                        )
                    )
                    .limit(3)
                )
                suggestions = (await db.execute(sugg_stmt)).scalars().all()

                results["suggestions"][code] = [
                    {
                        "id": p.id,
                        "name": p.name,
                        "brand": p.brand,
                        "similarity_reason": "partial_match",
                    }
                    for p in suggestions
                ]

        return results

    except Exception as e:
        logger.error(f"Bulk search error: {e}")
        raise HTTPException(status_code=500, detail="Bulk search failed")


@router.get("/categories/tree")
async def get_category_tree(
    include_product_counts: bool = Query(False),
    db: AsyncSession = Depends(get_db),
):
    """
    Get complete category tree with optional product counts
    """
    try:
        # Get all categories
        categories = (
            (await db.execute(select(Category).where(Category.is_active == True)))
            .scalars()
            .all()
        )

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

            if category.parent_id:
                if category.parent_id in category_dict:
                    category_dict[category.parent_id]["children"].append(category_data)
            else:
                root_categories.append(category_data)

        # Sort categories by sort_order
        def sort_categories(cats):
            cats.sort(key=lambda x: x["sort_order"])
            for cat in cats:
                sort_categories(cat["children"])

        sort_categories(root_categories)

        return {
            "categories": root_categories,
            "total_categories": len(categories),
        }

    except Exception as e:
        logger.error(f"Category tree error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get category tree")


# Helper Functions


async def get_search_suggestions(
    db: AsyncSession, query: str, limit: int = 5
) -> List[str]:
    """Generate search suggestions based on query"""
    suggestions = []

    # Get suggestions from product names
    prod_stmt = (
        select(Product.name)
        .where(Product.name.ilike(f"%{query}%"))
        .distinct()
        .limit(limit)
    )
    products = (await db.execute(prod_stmt)).all()

    suggestions.extend([p[0] for p in products])

    # Get suggestions from brands
    brands_stmt = (
        select(Product.brand)
        .where(Product.brand.ilike(f"%{query}%"))
        .distinct()
        .limit(max(0, limit - len(suggestions)))
    )
    brands = (await db.execute(brands_stmt)).all()

    suggestions.extend([b[0] for b in brands])

    return suggestions[:limit]


async def build_search_facets(
    db: AsyncSession, filters: Optional[AdvancedProductFilter]
) -> List[SearchFacet]:
    """Build facets for search filtering"""
    facets = []

    # Category facet
    cats_stmt = (
        select(Category.id, Category.name, func.count(Product.id).label("count"))
        .join(Product, Category.id == Product.category_id)
        .where(Product.is_active == True)
        .group_by(Category.id, Category.name)
    )
    categories = (await db.execute(cats_stmt)).all()

    facets.append(
        SearchFacet(
            name="categories",
            type="checkbox",
            values=[{"id": c.id, "name": c.name, "count": c.count} for c in categories],
        )
    )

    # Brand facet
    brands_stmt = (
        select(Product.brand, func.count(Product.id).label("count"))
        .where(and_(Product.is_active == True, Product.brand.is_not(None)))
        .group_by(Product.brand)
    )
    brands = (await db.execute(brands_stmt)).all()

    facets.append(
        SearchFacet(
            name="brands",
            type="checkbox",
            values=[{"name": b.brand, "count": b.count} for b in brands],
        )
    )

    # Price range facet
    price_stats_stmt = select(
        func.min(func.coalesce(Product.sale_price, Product.price)).label("min_price"),
        func.max(func.coalesce(Product.sale_price, Product.price)).label("max_price"),
    ).where(Product.is_active == True)
    price_stats = (await db.execute(price_stats_stmt)).first()

    if price_stats.min_price and price_stats.max_price:
        facets.append(
            SearchFacet(
                name="price",
                type="range",
                values=[
                    {
                        "min": float(price_stats.min_price),
                        "max": float(price_stats.max_price),
                    }
                ],
            )
        )

    return facets


async def get_similar_products(
    db: AsyncSession, product_id: int, limit: int
) -> List[Dict[str, Any]]:
    """Get products similar to the given product"""
    base_product = (
        (await db.execute(select(Product).where(Product.id == product_id)))
        .scalars()
        .first()
    )
    if not base_product:
        return []

    # Find products in same category with similar attributes
    similar_stmt = (
        select(Product)
        .where(
            and_(
                Product.id != product_id,
                Product.category_id == base_product.category_id,
                Product.is_active == True,
            )
        )
        .limit(limit)
    )
    similar = (await db.execute(similar_stmt)).scalars().all()

    return [{"id": p.id, "name": p.name, "price": float(p.price)} for p in similar]


async def get_complementary_products(
    db: AsyncSession, product_id: int, limit: int
) -> List[Dict[str, Any]]:
    """Get products that complement the given product"""
    # This would analyze order patterns to find frequently bought together items
    # For now, return products from related categories
    base_product = (
        (await db.execute(select(Product).where(Product.id == product_id)))
        .scalars()
        .first()
    )
    if not base_product:
        return []

    comp_stmt = (
        select(Product)
        .where(and_(Product.id != product_id, Product.is_active == True))
        .limit(limit)
    )
    complementary = (await db.execute(comp_stmt)).scalars().all()

    return [
        {"id": p.id, "name": p.name, "price": float(p.price)} for p in complementary
    ]


async def get_trending_products(
    db: AsyncSession, category_id: Optional[int], limit: int
) -> List[Dict[str, Any]]:
    """Get trending products based on recent order activity"""
    stmt = select(Product).where(Product.is_active == True)

    if category_id:
        stmt = stmt.where(Product.category_id == category_id)

    # Order by recent creation date for trending effect
    trending = (
        (await db.execute(stmt.order_by(Product.created_at.desc()).limit(limit)))
        .scalars()
        .all()
    )

    return [{"id": p.id, "name": p.name, "price": float(p.price)} for p in trending]


async def get_personalized_recommendations(
    db: AsyncSession, user_id: str, limit: int
) -> List[Dict[str, Any]]:
    """Get personalized recommendations based on user behavior"""
    # This would analyze user's order history, browsing behavior, etc.
    # For now, return popular products
    return await get_popular_products(db, None, limit)


async def get_popular_products(
    db: AsyncSession, category_id: Optional[int], limit: int
) -> List[Dict[str, Any]]:
    """Get popular products based on order frequency"""
    # Join with order items to find most ordered products
    stmt = (
        select(Product, func.count(OrderItem.id).label("order_count"))
        .outerjoin(OrderItem, Product.id == OrderItem.product_id)
        .where(Product.is_active == True)
    )

    if category_id:
        stmt = stmt.where(Product.category_id == category_id)

    popular = (
        await db.execute(
            stmt.group_by(Product.id)
            .order_by(func.count(OrderItem.id).desc())
            .limit(limit)
        )
    ).all()

    return [
        {
            "id": p.Product.id,
            "name": p.Product.name,
            "price": float(p.Product.price),
        }
        for p in popular
    ]


def get_material_settings(material: str) -> Dict[str, Any]:
    """Get recommended print settings for material"""
    settings_map = {
        "pla": {
            "extruder_temp": "190-220°C",
            "bed_temp": "50-60°C",
            "print_speed": "40-80 mm/s",
            "cooling": "100%",
        },
        "abs": {
            "extruder_temp": "220-250°C",
            "bed_temp": "80-100°C",
            "print_speed": "30-60 mm/s",
            "cooling": "0-25%",
        },
        "petg": {
            "extruder_temp": "220-250°C",
            "bed_temp": "70-85°C",
            "print_speed": "30-50 mm/s",
            "cooling": "50-75%",
        },
    }

    return settings_map.get(material, {})


async def find_compatible_products(
    db: AsyncSession, product: Product
) -> List[Dict[str, Any]]:
    """Find products compatible with the given product"""
    compatible = []

    # If it's a filament, find compatible tools/accessories
    if "material" in (product.attributes or {}):
        tools_stmt = (
            select(Product)
            .where(and_(Product.name.ilike("%tool%"), Product.is_active == True))
            .limit(5)
        )
        tools = (await db.execute(tools_stmt)).scalars().all()

        compatible.extend([{"id": t.id, "name": t.name, "type": "tool"} for t in tools])

    return compatible


async def log_search_query(query: str, result_count: int):
    """Log search query for analytics (background task)"""
    # This would log to analytics system
    logger.info(f"Search query: '{query}' returned {result_count} results")
