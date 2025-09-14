"""Admin API routes"""
from fastapi import APIRouter, Depends
from core.security import require_admin
from schemas.admin import MessageResponse

router = APIRouter()

@router.get("/dashboard", response_model=MessageResponse)
async def get_admin_dashboard(current_user = Depends(require_admin)):
    return MessageResponse(message="Admin dashboard - implementation needed")

@router.get("/stats")
async def get_admin_stats(current_user = Depends(require_admin)):
    """Minimal stats payload to unblock Admin UI.
    Returns zeros and empty arrays; replace with real aggregation when ready.
    """
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
    }
