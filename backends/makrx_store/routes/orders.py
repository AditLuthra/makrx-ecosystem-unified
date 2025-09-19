"""
Orders API routes - Order management and processing
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime

from ..database import get_db
from ..models.commerce import Order, OrderItem, Product, Cart, CartItem
from ..core.security import require_auth, AuthUser

router = APIRouter()


class CheckoutRequest(BaseModel):
    shipping_address: dict
    billing_address: Optional[dict] = None
    payment_method: str = "stripe"
    notes: Optional[str] = None


class CheckoutResponse(BaseModel):
    order_id: int
    order_number: str
    total: float
    currency: str = "USD"
    payment_required: bool = True


@router.get("/api/orders")
async def get_user_orders(
    current_user: AuthUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
    status_filter: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
):
    """Get user's order history"""
    user_id = current_user.user_id

    query = (
        select(Order)
        .options(selectinload(Order.items).selectinload(OrderItem.product))
        .where(Order.user_id == user_id)
        .order_by(Order.created_at.desc())
    )

    result = await db.execute(query)
    orders = result.scalars().all()

    return {
        "orders": [
            {
                "id": order.id,
                "order_number": order.order_number,
                "status": order.status,
                "payment_status": order.payment_status,
                "total_amount": float(order.total_amount),
                "subtotal": float(order.subtotal),
                "tax_amount": float(order.tax_amount),
                "shipping_amount": float(order.shipping_amount),
                "items_count": len(order.items),
                "created_at": (
                    order.created_at.isoformat() if order.created_at else None
                ),
                "items": [
                    {
                        "product_name": (
                            item.product.name
                            if item.product
                            else "Unknown Product"
                        ),
                        "quantity": item.quantity,
                        "price": float(item.price_at_time),
                        "total": float(item.total_price),
                    }
                    for item in order.items
                ],
            }
            for order in orders
        ],
        "total": len(orders),
    }


@router.get("/api/orders/{order_id}")
async def get_order_details(
    order_id: int,
    current_user: AuthUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    """Get detailed order information"""
    user_id = current_user.user_id

    query = (
        select(Order)
        .options(selectinload(Order.items).selectinload(OrderItem.product))
        .where(Order.id == order_id, Order.user_id == user_id)
    )

    result = await db.execute(query)
    order = result.scalar_one_or_none()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return {
        "order": {
            "id": order.id,
            "order_number": order.order_number,
            "status": order.status,
            "payment_status": order.payment_status,
            "subtotal": float(order.subtotal),
            "tax_amount": float(order.tax_amount),
            "shipping_amount": float(order.shipping_amount),
            "total_amount": float(order.total_amount),
            "customer_email": order.customer_email,
            "customer_phone": order.customer_phone,
            "shipping_address": order.shipping_address,
            "billing_address": order.billing_address,
            "notes": order.notes,
            "created_at": (
                order.created_at.isoformat() if order.created_at else None
            ),
            "updated_at": (
                order.updated_at.isoformat() if order.updated_at else None
            ),
            "items": [
                {
                    "id": item.id,
                    "product": (
                        {
                            "id": item.product.id,
                            "name": item.product.name,
                            "slug": item.product.slug,
                            "featured_image": item.product.featured_image,
                        }
                        if item.product
                        else None
                    ),
                    "quantity": item.quantity,
                    "price_at_time": float(item.price_at_time),
                    "total_price": float(item.total_price),
                    "created_at": (
                        item.created_at.isoformat()
                        if item.created_at
                        else None
                    ),
                }
                for item in order.items
            ],
        }
    }


@router.post("/api/orders/checkout")
async def checkout(
    request: CheckoutRequest,
    current_user: AuthUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    """Process checkout and create order from cart"""
    user_id = current_user.user_id

    try:
        # Get user's cart
        cart_query = (
            select(Cart)
            .options(selectinload(Cart.items).selectinload(CartItem.product))
            .where(Cart.user_id == user_id, Cart.status == "active")
        )

        cart_result = await db.execute(cart_query)
        cart = cart_result.scalar_one_or_none()

        if not cart or not cart.items:
            raise HTTPException(status_code=400, detail="Cart is empty")

        # Calculate totals
        subtotal = sum(
            float(item.price_at_time) * item.quantity for item in cart.items
        )
        tax_rate = 0.08  # 8% tax (configurable)
        tax_amount = subtotal * tax_rate
        shipping_amount = (
            10.00 if subtotal < 100 else 0.00
        )  # Free shipping over $100
        total_amount = subtotal + tax_amount + shipping_amount

        # Generate order number
        order_number = f"MX-{datetime.utcnow().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"

        # Create order
        new_order = Order(
            order_number=order_number,
            user_id=user_id,
            subtotal=subtotal,
            tax_amount=tax_amount,
            shipping_amount=shipping_amount,
            total_amount=total_amount,
            customer_email=user_id
            + "@demo.com",  # Would come from user profile
            shipping_address=request.shipping_address,
            billing_address=request.billing_address
            or request.shipping_address,
            notes=request.notes,
            status="pending",
            payment_status="pending",
        )

        db.add(new_order)
        await db.flush()  # Get order ID

        # Create order items from cart items
        for cart_item in cart.items:
            order_item = OrderItem(
                order_id=new_order.id,
                product_id=cart_item.product_id,
                quantity=cart_item.quantity,
                price_at_time=cart_item.price_at_time,
                total_price=cart_item.price_at_time * cart_item.quantity,
            )
            db.add(order_item)

        # Clear cart (mark as converted)
        cart.status = "converted"

        await db.commit()

        # In a real implementation, this would integrate with payment gateway
        return CheckoutResponse(
            order_id=new_order.id,
            order_number=new_order.order_number,
            total=float(total_amount),
            currency="USD",
            payment_required=True,
        )

    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Checkout failed: {str(e)}"
        )


@router.put("/api/orders/{order_id}/status")
async def update_order_status(
    order_id: int,
    status_data: dict,
    current_user: AuthUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    """Update order status (for admin use)"""
    query = select(Order).where(Order.id == order_id)
    result = await db.execute(query)
    order = result.scalar_one_or_none()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    try:
        new_status = status_data.get("status")
        new_payment_status = status_data.get("payment_status")

        if new_status:
            order.status = new_status
        if new_payment_status:
            order.payment_status = new_payment_status

        order.updated_at = datetime.utcnow()
        await db.commit()

        return {"message": "Order status updated successfully"}

    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Failed to update order status: {str(e)}"
        )


@router.get("/api/orders/{order_id}/tracking")
async def get_order_tracking(
    order_id: int,
    current_user: AuthUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    """Get order tracking information"""
    user_id = current_user.user_id

    query = select(Order).where(Order.id == order_id, Order.user_id == user_id)
    result = await db.execute(query)
    order = result.scalar_one_or_none()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Mock tracking data - in real implementation, this would integrate with shipping providers
    tracking_events = [
        {
            "status": "order_placed",
            "description": "Order placed successfully",
            "timestamp": (
                order.created_at.isoformat() if order.created_at else None
            ),
            "location": "Online Store",
        }
    ]

    if order.status in ["processing", "shipped", "delivered"]:
        tracking_events.append(
            {
                "status": "processing",
                "description": "Order is being processed",
                "timestamp": (
                    order.updated_at.isoformat() if order.updated_at else None
                ),
                "location": "Fulfillment Center",
            }
        )

    if order.status in ["shipped", "delivered"]:
        tracking_events.append(
            {
                "status": "shipped",
                "description": "Order has been shipped",
                "timestamp": (
                    order.updated_at.isoformat() if order.updated_at else None
                ),
                "location": "Shipping Partner",
            }
        )

    if order.status == "delivered":
        tracking_events.append(
            {
                "status": "delivered",
                "description": "Order delivered successfully",
                "timestamp": (
                    order.updated_at.isoformat() if order.updated_at else None
                ),
                "location": "Destination",
            }
        )

    return {
        "order_id": order.id,
        "order_number": order.order_number,
        "current_status": order.status,
        "tracking_events": tracking_events,
        "estimated_delivery": None,  # Would calculate based on shipping method
    }
