"""Admin API routes"""

from datetime import datetime, timedelta
from decimal import Decimal
from typing import Any, Dict, List

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..core.config import settings
from ..core.security import AuthUser, require_admin
from ..database import get_db
from ..models.commerce import Order, OrderItem, Product

router = APIRouter()


@router.get("/dashboard")
async def get_admin_dashboard(current_user: AuthUser = Depends(require_admin)):
    return {"message": "Admin dashboard - implementation needed"}


def _to_number(value: Any) -> float:
    if value is None:
        return 0.0
    if isinstance(value, Decimal):
        return float(value)
    return float(value)


@router.get("/stats")
async def get_admin_stats(
    current_admin: AuthUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Aggregate store metrics for the admin dashboard."""

    if not settings.ADMIN_STATS_ENABLED:
        return {
            "total_orders": 0,
            "total_revenue": 0,
            "total_products": 0,
            "total_users": 0,
            "total_customers": 0,
            "pending_orders": 0,
            "active_orders": 0,
            "low_stock_products": 0,
            "recent_orders": [],
            "top_products": [],
            "revenue_chart": [],
            "notice": "Admin stats are disabled via feature flag.",
        }

    total_products = await db.scalar(select(func.count(Product.id))) or 0
    total_orders = await db.scalar(select(func.count(Order.id))) or 0
    total_revenue = await db.scalar(
        select(func.coalesce(func.sum(Order.total_amount), 0))
    )
    total_customers = await db.scalar(
        select(func.count(func.distinct(Order.user_id))).where(Order.user_id.isnot(None))
    ) or 0

    pending_orders = await db.scalar(
        select(func.count(Order.id)).where(Order.status == "pending")
    ) or 0
    active_orders = await db.scalar(
        select(func.count(Order.id)).where(
            Order.status.in_(["processing", "shipped"])
        )
    ) or 0

    low_stock_products = await db.scalar(
        select(func.count(Product.id)).where(
            Product.track_inventory.is_(True),
            Product.stock_quantity <= 5,
        )
    ) or 0

    recent_orders_result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .order_by(Order.created_at.desc())
        .limit(5)
    )
    recent_orders: List[Dict[str, Any]] = []
    for order in recent_orders_result.scalars().all():
        recent_orders.append(
            {
                "id": order.id,
                "order_number": order.order_number,
                "status": order.status,
                "payment_status": order.payment_status,
                "subtotal": _to_number(order.subtotal),
                "tax_amount": _to_number(order.tax_amount),
                "shipping_amount": _to_number(order.shipping_amount),
                "total_amount": _to_number(order.total_amount),
                "created_at": order.created_at.isoformat() if order.created_at else None,
                "items_count": len(order.items or []),
            }
        )

    top_products_stmt = (
        select(
            Product.id,
            Product.name,
            Product.slug,
            Product.featured_image,
            func.sum(OrderItem.quantity).label("quantity_sold"),
            func.sum(OrderItem.total_price).label("revenue"),
        )
        .join(OrderItem, OrderItem.product_id == Product.id)
        .join(Order, Order.id == OrderItem.order_id)
        .where(Order.status != "cancelled")
        .group_by(Product.id)
        .order_by(func.sum(OrderItem.total_price).desc())
        .limit(5)
    )
    top_products_result = await db.execute(top_products_stmt)
    top_products: List[Dict[str, Any]] = []
    for row in top_products_result.all():
        top_products.append(
            {
                "product": {
                    "id": row.id,
                    "name": row.name,
                    "slug": row.slug,
                    "featured_image": row.featured_image,
                },
                "quantity_sold": int(row.quantity_sold or 0),
                "revenue": _to_number(row.revenue),
            }
        )

    days = 7
    start_date = datetime.utcnow() - timedelta(days=days - 1)
    revenue_chart_stmt = (
        select(
            func.date_trunc("day", Order.created_at).label("chart_day"),
            func.coalesce(func.sum(Order.total_amount), 0).label("day_revenue"),
            func.count(Order.id).label("day_orders"),
        )
        .where(Order.created_at >= start_date)
        .group_by("chart_day")
        .order_by("chart_day")
    )
    revenue_chart_result = await db.execute(revenue_chart_stmt)
    revenue_chart: List[Dict[str, Any]] = []
    for row in revenue_chart_result.all():
        chart_day: datetime | None = row.chart_day
        revenue_chart.append(
            {
                "date": chart_day.date().isoformat() if chart_day else None,
                "revenue": _to_number(row.day_revenue),
                "orders": int(row.day_orders or 0),
            }
        )

    return {
        "total_orders": int(total_orders),
        "total_revenue": _to_number(total_revenue),
        "total_products": int(total_products),
        "total_users": int(total_customers),
        "total_customers": int(total_customers),
        "pending_orders": int(pending_orders),
        "active_orders": int(active_orders),
        "low_stock_products": int(low_stock_products),
        "recent_orders": recent_orders,
        "top_products": top_products,
        "revenue_chart": revenue_chart,
    }
