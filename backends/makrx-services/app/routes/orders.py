"""
Service Orders API Routes
Handles order creation, updates, and tracking
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user, require_roles
from app.models.orders import ServiceOrder, StatusUpdate
from app.models.users import User
from app.services.store_integration import sync_order_with_store

router = APIRouter()

@router.post("/orders", response_model=dict)
async def create_order(
    order_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new service order"""
    try:
        # Create service order
        order = ServiceOrder(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            service_type=order_data.get('service_type'),
            file_name=order_data.get('file_name'),
            file_size=order_data.get('file_size'),
            file_type=order_data.get('file_type'),
            material=order_data.get('material'),
            color_finish=order_data.get('color_finish'),
            quantity=order_data.get('quantity', 1),
            priority=order_data.get('priority', 'normal'),
            dimensions_x=order_data.get('dimensions_x'),
            dimensions_y=order_data.get('dimensions_y'),
            dimensions_z=order_data.get('dimensions_z'),
            base_price=order_data.get('base_price'),
            material_cost=order_data.get('material_cost'),
            labor_cost=order_data.get('labor_cost'),
            setup_fee=order_data.get('setup_fee'),
            rush_fee=order_data.get('rush_fee', 0),
            total_price=order_data.get('total_price'),
            customer_notes=order_data.get('customer_notes'),
            status='pending',
            sync_status='pending',
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.add(order)
        db.commit()
        db.refresh(order)
        
        # Create initial status update
        status_update = StatusUpdate(
            id=str(uuid.uuid4()),
            order_id=order.id,
            status='pending',
            message='Order created successfully and awaiting review',
            timestamp=datetime.utcnow(),
            user_type='system'
        )
        
        db.add(status_update)
        db.commit()
        
        # Sync with main store (async)
        await sync_order_with_store(order.id, current_user.id)
        
        return {
            "id": order.id,
            "status": order.status,
            "total_price": float(order.total_price),
            "created_at": order.created_at.isoformat(),
            "message": "Order created successfully"
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create order: {str(e)}"
        )

@router.get("/orders", response_model=List[dict])
def get_user_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    status_filter: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
):
    """Get user's service orders"""
    try:
        query = db.query(ServiceOrder).filter(ServiceOrder.user_id == current_user.id)
        
        if status_filter:
            query = query.filter(ServiceOrder.status == status_filter)
        
        orders = query.order_by(ServiceOrder.created_at.desc()).offset(offset).limit(limit).all()
        
        result = []
        for order in orders:
            # Get status updates
            status_updates = db.query(StatusUpdate).filter(
                StatusUpdate.order_id == order.id
            ).order_by(StatusUpdate.timestamp.desc()).limit(10).all()
            
            order_dict = {
                "id": order.id,
                "service_type": order.service_type,
                "status": order.status,
                "file_name": order.file_name,
                "material": order.material,
                "color_finish": order.color_finish,
                "quantity": order.quantity,
                "priority": order.priority,
                "total_price": float(order.total_price),
                "provider_name": getattr(order.provider, 'business_name', None) if order.provider else None,
                "estimated_completion": order.estimated_completion.isoformat() if order.estimated_completion else None,
                "created_at": order.created_at.isoformat(),
                "updated_at": order.updated_at.isoformat(),
                "sync_status": order.sync_status,
                "store_order_id": order.store_order_id,
                "status_updates": [
                    {
                        "id": update.id,
                        "status": update.status,
                        "message": update.message,
                        "timestamp": update.timestamp.isoformat(),
                        "user_type": update.user_type
                    }
                    for update in status_updates
                ]
            }
            result.append(order_dict)
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get orders: {str(e)}"
        )

@router.get("/orders/{order_id}", response_model=dict)
def get_order(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific order details"""
    try:
        order = db.query(ServiceOrder).filter(
            ServiceOrder.id == order_id,
            ServiceOrder.user_id == current_user.id
        ).first()
        
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        # Get status updates
        status_updates = db.query(StatusUpdate).filter(
            StatusUpdate.order_id == order.id
        ).order_by(StatusUpdate.timestamp.desc()).all()
        
        return {
            "id": order.id,
            "service_type": order.service_type,
            "status": order.status,
            "file_name": order.file_name,
            "file_size": order.file_size,
            "file_type": order.file_type,
            "file_url": order.file_url,
            "preview_url": order.preview_url,
            "material": order.material,
            "color_finish": order.color_finish,
            "quantity": order.quantity,
            "priority": order.priority,
            "dimensions": {
                "x": order.dimensions_x,
                "y": order.dimensions_y,
                "z": order.dimensions_z
            } if order.dimensions_x else None,
            "pricing": {
                "base_price": float(order.base_price),
                "material_cost": float(order.material_cost),
                "labor_cost": float(order.labor_cost),
                "setup_fee": float(order.setup_fee),
                "rush_fee": float(order.rush_fee),
                "total_price": float(order.total_price)
            },
            "provider": {
                "id": order.provider.id,
                "business_name": order.provider.business_name,
                "contact_name": order.provider.contact_name,
                "email": order.provider.email,
                "phone": order.provider.phone,
                "rating": order.provider.average_rating,
                "address": order.provider.address
            } if order.provider else None,
            "estimated_completion": order.estimated_completion.isoformat() if order.estimated_completion else None,
            "customer_notes": order.customer_notes,
            "provider_notes": order.provider_notes,
            "created_at": order.created_at.isoformat(),
            "updated_at": order.updated_at.isoformat(),
            "sync_status": order.sync_status,
            "store_order_id": order.store_order_id,
            "status_updates": [
                {
                    "id": update.id,
                    "status": update.status,
                    "message": update.message,
                    "timestamp": update.timestamp.isoformat(),
                    "user_type": update.user_type,
                    "images": update.images
                }
                for update in status_updates
            ]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get order: {str(e)}"
        )

@router.patch("/orders/{order_id}", response_model=dict)
async def update_order(
    order_id: str,
    updates: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update order details"""
    try:
        order = db.query(ServiceOrder).filter(
            ServiceOrder.id == order_id,
            ServiceOrder.user_id == current_user.id
        ).first()
        
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        # Define fields that only admins/service providers can update
        admin_updatable_fields = ['status', 'provider_id', 'estimated_completion', 'provider_notes']

        for field, value in updates.items():
            if field in admin_updatable_fields:
                # Check if user has admin or service_provider role
                if not (current_user.has_role("admin") or current_user.has_role("service_provider")):
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail=f"Insufficient permissions to update {field}"
                    )
                setattr(order, field, value)
            else:
                # Allow regular users to update only non-sensitive fields
                if field not in ['customer_notes', 'priority']:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail=f"Cannot update field: {field}"
                    )
                setattr(order, field, value)
        
        order.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(order)
        
        # Sync with store if needed
        if any(field in updates for field in ['status', 'provider_id']):
            await sync_order_with_store(order.id, current_user.id)
        
        return {"message": "Order updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update order: {str(e)}"
        )

@router.post("/orders/{order_id}/status", response_model=dict)
async def add_status_update(
    order_id: str,
    status_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add status update to order"""
    try:
        order = db.query(ServiceOrder).filter(
            ServiceOrder.id == order_id,
            ServiceOrder.user_id == current_user.id
        ).first()
        
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        # Only allow admin or service_provider to change the status field
        if 'status' in status_data:
            if not (current_user.has_role("admin") or current_user.has_role("service_provider")):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Insufficient permissions to change order status"
                )

        # Create status update
        status_update = StatusUpdate(
            id=str(uuid.uuid4()),
            order_id=order.id,
            status=status_data.get('status', 'info'),
            message=status_data.get('message'),
            timestamp=datetime.utcnow(),
            user_type='customer',
            images=status_data.get('images', [])
        )
        
        db.add(status_update)
        db.commit()
        
        # Sync with store
        await sync_order_with_store(order.id, current_user.id)
        
        return {
            "id": status_update.id,
            "message": "Status update added successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add status update: {str(e)}"
        )

@router.post("/orders/{order_id}/quote", response_model=dict)
def request_quote(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Request quote for order"""
    try:
        order = db.query(ServiceOrder).filter(
            ServiceOrder.id == order_id,
            ServiceOrder.user_id == current_user.id
        ).first()
        
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        if order.status != 'pending':
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Quote can only be requested for pending orders"
            )
        
        # Update order status
        order.status = 'quoted'
        order.updated_at = datetime.utcnow()
        
        # Create status update
        status_update = StatusUpdate(
            id=str(uuid.uuid4()),
            order_id=order.id,
            status='quoted',
            message='Quote generated and ready for review',
            timestamp=datetime.utcnow(),
            user_type='system'
        )
        
        db.add(status_update)
        db.commit()
        
        # Mock quote data - in production this would be calculated
        quote = {
            "id": str(uuid.uuid4()),
            "service_order_id": order.id,
            "base_price": float(order.base_price),
            "material_cost": float(order.material_cost),
            "labor_cost": float(order.labor_cost),
            "setup_fee": float(order.setup_fee),
            "rush_fee": float(order.rush_fee),
            "total_price": float(order.total_price),
            "estimated_completion": "2-3 business days",
            "valid_until": (datetime.utcnow().replace(hour=23, minute=59, second=59)).isoformat(),
            "breakdown": {
                "material_usage": order.quantity,
                "complexity_score": 5.0,
                "estimated_time": "4-6 hours"
            },
            "created_at": datetime.utcnow().isoformat()
        }
        
        return quote
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to request quote: {str(e)}"
        )