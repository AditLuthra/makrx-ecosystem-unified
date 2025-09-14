"""
Shopping cart routes
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional

from database import get_db
from models.commerce import Cart, CartItem, Product

router = APIRouter()


class AddToCartRequest(BaseModel):
    product_id: int
    quantity: int = 1


@router.post("/api/cart/add")
async def add_to_cart(
    request: AddToCartRequest,
    user_id: Optional[str] = None,  # This would come from Keycloak JWT
    db: AsyncSession = Depends(get_db),
):
    """Add item to cart"""
    # For now, use a demo user ID if not provided
    if not user_id:
        user_id = "demo_user"

    # Check if product exists
    product_query = select(Product).where(Product.id == request.product_id)
    product_result = await db.execute(product_query)
    product = product_result.scalar_one_or_none()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if not product.in_stock:
        raise HTTPException(status_code=400, detail="Product is out of stock")

    # Get or create cart for user
    cart_query = select(Cart).where(Cart.user_id == user_id, Cart.status == "active")
    cart_result = await db.execute(cart_query)
    cart = cart_result.scalar_one_or_none()

    if not cart:
        cart = Cart(user_id=user_id, status="active")
        db.add(cart)
        await db.flush()  # Get the cart ID

    # Check if item already exists in cart
    cart_item_query = select(CartItem).where(
        CartItem.cart_id == cart.id, CartItem.product_id == request.product_id
    )
    cart_item_result = await db.execute(cart_item_query)
    cart_item = cart_item_result.scalar_one_or_none()

    if cart_item:
        # Update quantity
        cart_item.quantity += request.quantity
        cart_item.price_at_time = product.sale_price or product.price
    else:
        # Create new cart item
        cart_item = CartItem(
            cart_id=cart.id,
            product_id=request.product_id,
            quantity=request.quantity,
            price_at_time=product.sale_price or product.price,
        )
        db.add(cart_item)

    await db.commit()

    return {
        "message": "Item added to cart successfully",
        "success": True,
        "cart_item": {
            "id": cart_item.id,
            "product_id": cart_item.product_id,
            "quantity": cart_item.quantity,
            "price": float(cart_item.price_at_time),
        },
    }


@router.get("/api/cart")
async def get_cart(
    user_id: Optional[str] = None,  # This would come from Keycloak JWT
    db: AsyncSession = Depends(get_db),
):
    """Get user's cart"""
    if not user_id:
        user_id = "demo_user"

    # Get cart with items and products
    cart_query = (
        select(Cart)
        .options(selectinload(Cart.items).selectinload(CartItem.product))
        .where(Cart.user_id == user_id, Cart.status == "active")
    )

    cart_result = await db.execute(cart_query)
    cart = cart_result.scalar_one_or_none()

    if not cart:
        return {"cart": None, "items": [], "total_amount": 0, "total_items": 0}

    total_amount = 0
    total_items = 0
    items = []

    for item in cart.items:
        item_total = float(item.price_at_time) * item.quantity
        total_amount += item_total
        total_items += item.quantity

        items.append(
            {
                "id": item.id,
                "product": {
                    "id": item.product.id,
                    "name": item.product.name,
                    "slug": item.product.slug,
                    "featured_image": item.product.featured_image,
                    "current_price": float(
                        item.product.sale_price or item.product.price
                    ),
                    "in_stock": item.product.in_stock,
                },
                "quantity": item.quantity,
                "price_at_time": float(item.price_at_time),
                "item_total": item_total,
                "added_at": (item.created_at.isoformat() if item.created_at else None),
            }
        )

    return {
        "cart": {
            "id": cart.id,
            "user_id": cart.user_id,
            "status": cart.status,
            "created_at": (cart.created_at.isoformat() if cart.created_at else None),
            "updated_at": (cart.updated_at.isoformat() if cart.updated_at else None),
        },
        "items": items,
        "summary": {
            "total_amount": round(total_amount, 2),
            "total_items": total_items,
            "currency": "USD",
        },
    }


@router.delete("/api/cart/item/{item_id}")
async def remove_cart_item(
    item_id: int,
    user_id: Optional[str] = None,  # This would come from Keycloak JWT
    db: AsyncSession = Depends(get_db),
):
    """Remove item from cart"""
    if not user_id:
        user_id = "demo_user"

    # Find cart item belonging to user
    cart_item_query = (
        select(CartItem)
        .join(Cart)
        .where(
            CartItem.id == item_id,
            Cart.user_id == user_id,
            Cart.status == "active",
        )
    )

    cart_item_result = await db.execute(cart_item_query)
    cart_item = cart_item_result.scalar_one_or_none()

    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    await db.delete(cart_item)
    await db.commit()

    return {"message": "Item removed from cart successfully", "success": True}


class UpdateCartItemRequest(BaseModel):
    quantity: int


@router.put("/api/cart/item/{item_id}")
async def update_cart_item(
    item_id: int,
    request: UpdateCartItemRequest,
    user_id: Optional[str] = None,  # This would come from Keycloak JWT
    db: AsyncSession = Depends(get_db),
):
    """Update cart item quantity"""
    if not user_id:
        user_id = "demo_user"

    if request.quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be greater than 0")

    # Find cart item belonging to user
    cart_item_query = (
        select(CartItem)
        .join(Cart)
        .where(
            CartItem.id == item_id,
            Cart.user_id == user_id,
            Cart.status == "active",
        )
    )

    cart_item_result = await db.execute(cart_item_query)
    cart_item = cart_item_result.scalar_one_or_none()

    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    cart_item.quantity = request.quantity
    await db.commit()

    return {
        "message": "Cart item updated successfully",
        "success": True,
        "cart_item": {
            "id": cart_item.id,
            "quantity": cart_item.quantity,
            "price": float(cart_item.price_at_time),
        },
    }
