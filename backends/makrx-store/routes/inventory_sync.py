"""Inventory Synchronization with MakrX.Store Marketplace"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, and_, or_, func
from sqlalchemy.orm import selectinload

from database import get_db
from core.security import get_current_user
from models.providers import (
    Provider, ProviderInventory, MaterialCatalog, ServiceOrder
)
from schemas.admin import MessageResponse

router = APIRouter()

class InventoryUpdate(BaseModel):
    material_id: str
    quantity_used: float
    job_id: str
    update_type: str = Field(..., description="'consumed', 'reserved', 'released'")

class MaterialReorder(BaseModel):
    material_id: str
    quantity: float
    supplier_url: str
    notes: Optional[str] = None

class InventoryAlert(BaseModel):
    provider_id: str
    material_id: str
    current_stock: float
    minimum_stock: float
    alert_type: str  # 'low_stock', 'out_of_stock', 'reserved_exceeded'

@router.post("/inventory/update")
async def update_inventory(
    update: InventoryUpdate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Update provider inventory when materials are consumed
    """
    # Get provider
    provider_result = await db.execute(
        select(Provider).where(Provider.user_id == current_user.id)
    )
    provider = provider_result.scalar_one_or_none()
    
    if not provider:
        raise HTTPException(status_code=403, detail="Provider account required")
    
    # Get inventory item
    inventory_result = await db.execute(
        select(ProviderInventory).where(and_(
            ProviderInventory.provider_id == provider.id,
            ProviderInventory.id == update.material_id
        ))
    )
    inventory_item = inventory_result.scalar_one_or_none()
    
    if not inventory_item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    # Apply update based on type
    if update.update_type == "consumed":
        # Deduct from current stock and reserved stock
        new_current = max(0, inventory_item.current_stock - update.quantity_used)
        new_reserved = max(0, inventory_item.reserved_stock - update.quantity_used)
        
        await db.execute(
            update(ProviderInventory)
            .where(ProviderInventory.id == update.material_id)
            .values(
                current_stock=new_current,
                reserved_stock=new_reserved
            )
        )
        
    elif update.update_type == "reserved":
        # Add to reserved stock
        new_reserved = inventory_item.reserved_stock + update.quantity_used
        
        if new_reserved > inventory_item.current_stock:
            raise HTTPException(
                status_code=400, 
                detail="Cannot reserve more than available stock"
            )
        
        await db.execute(
            update(ProviderInventory)
            .where(ProviderInventory.id == update.material_id)
            .values(reserved_stock=new_reserved)
        )
        
    elif update.update_type == "released":
        # Remove from reserved stock
        new_reserved = max(0, inventory_item.reserved_stock - update.quantity_used)
        
        await db.execute(
            update(ProviderInventory)
            .where(ProviderInventory.id == update.material_id)
            .values(reserved_stock=new_reserved)
        )
    
    await db.commit()
    
    # Check for low stock alerts
    updated_inventory = await db.execute(
        select(ProviderInventory).where(ProviderInventory.id == update.material_id)
    )
    updated_item = updated_inventory.scalar_one()
    
    # Schedule alerts and reorder recommendations
    background_tasks.add_task(
        check_inventory_alerts, 
        provider.id, 
        updated_item,
        db
    )
    
    return {
        "message": "Inventory updated successfully",
        "current_stock": updated_item.current_stock,
        "reserved_stock": updated_item.reserved_stock
    }

@router.get("/inventory/low-stock")
async def get_low_stock_items(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get inventory items that are running low
    """
    # Get provider
    provider_result = await db.execute(
        select(Provider).where(Provider.user_id == current_user.id)
    )
    provider = provider_result.scalar_one_or_none()
    
    if not provider:
        raise HTTPException(status_code=403, detail="Provider account required")
    
    # Get low stock items
    result = await db.execute(
        select(ProviderInventory)
        .where(and_(
            ProviderInventory.provider_id == provider.id,
            ProviderInventory.current_stock <= ProviderInventory.minimum_stock
        ))
        .options(selectinload(ProviderInventory.provider))
    )
    low_stock_items = result.scalars().all()
    
    # Format response with reorder recommendations
    reorder_recommendations = []
    
    for item in low_stock_items:
        # Calculate recommended reorder quantity
        if item.reorder_quantity:
            recommended_qty = item.reorder_quantity
        else:
            # Estimate based on usage pattern (simplified)
            recommended_qty = item.minimum_stock * 3
        
        # Get material catalog info for reorder link
        catalog_result = await db.execute(
            select(MaterialCatalog)
            .where(MaterialCatalog.material_id == item.material_type)
        )
        catalog_item = catalog_result.scalar_one_or_none()
        
        reorder_recommendations.append({
            "inventory_id": item.id,
            "material_type": item.material_type,
            "color_finish": item.color_finish,
            "current_stock": item.current_stock,
            "minimum_stock": item.minimum_stock,
            "recommended_quantity": recommended_qty,
            "estimated_cost": recommended_qty * (catalog_item.base_cost if catalog_item else item.cost_per_unit),
            "reorder_url": item.supplier_url or (catalog_item.reorder_url if catalog_item else None),
            "supplier_name": item.supplier_name or "MakrX Store",
            "urgency": "critical" if item.current_stock == 0 else "high" if item.current_stock < item.minimum_stock * 0.5 else "medium"
        })
    
    return {
        "low_stock_items": reorder_recommendations,
        "total_items": len(reorder_recommendations),
        "critical_count": sum(1 for item in reorder_recommendations if item["urgency"] == "critical")
    }

@router.post("/inventory/reorder")
async def create_reorder_request(
    reorder: MaterialReorder,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Create a reorder request and redirect to MakrX.Store
    """
    # Get provider and inventory item
    provider_result = await db.execute(
        select(Provider).where(Provider.user_id == current_user.id)
    )
    provider = provider_result.scalar_one_or_none()
    
    if not provider:
        raise HTTPException(status_code=403, detail="Provider account required")
    
    inventory_result = await db.execute(
        select(ProviderInventory).where(and_(
            ProviderInventory.provider_id == provider.id,
            ProviderInventory.id == reorder.material_id
        ))
    )
    inventory_item = inventory_result.scalar_one_or_none()
    
    if not inventory_item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    # Update last reorder date
    await db.execute(
        update(ProviderInventory)
        .where(ProviderInventory.id == reorder.material_id)
        .values(last_reorder_date=datetime.utcnow())
    )
    
    await db.commit()
    
    # Generate reorder URL with pre-filled cart
    base_reorder_url = reorder.supplier_url
    if "makrx.store" in base_reorder_url.lower():
        # Add provider context and quantity to MakrX Store URL
        reorder_url = f"{base_reorder_url}?qty={reorder.quantity}&provider_id={provider.id}&reorder=true"
    else:
        reorder_url = base_reorder_url
    
    # Log reorder activity (in real system, might create order tracking)
    background_tasks.add_task(
        log_reorder_activity,
        provider.id,
        inventory_item.id,
        reorder.quantity,
        reorder_url
    )
    
    return {
        "message": "Reorder request created",
        "reorder_url": reorder_url,
        "material": inventory_item.material_type,
        "quantity": reorder.quantity,
        "estimated_cost": reorder.quantity * inventory_item.cost_per_unit
    }

@router.get("/inventory/usage-analytics")
async def get_usage_analytics(
    days: int = 30,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get inventory usage analytics for the provider
    """
    # Get provider
    provider_result = await db.execute(
        select(Provider).where(Provider.user_id == current_user.id)
    )
    provider = provider_result.scalar_one_or_none()
    
    if not provider:
        raise HTTPException(status_code=403, detail="Provider account required")
    
    # Calculate date range
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Get completed jobs in the period to analyze material usage
    jobs_result = await db.execute(
        select(ServiceOrder)
        .join(ServiceOrder.quote)
        .where(and_(
            ServiceOrder.provider_id == provider.id,
            ServiceOrder.status == "completed",
            ServiceOrder.actual_completion >= start_date,
            ServiceOrder.actual_completion <= end_date
        ))
    )
    completed_jobs = jobs_result.scalars().all()
    
    # Analyze material usage
    material_usage = {}
    total_jobs = len(completed_jobs)
    total_revenue = sum(job.customer_price * 0.7 for job in completed_jobs)  # Provider gets ~70%
    
    for job in completed_jobs:
        material = job.quote.material
        if material not in material_usage:
            material_usage[material] = {
                "jobs_count": 0,
                "total_quantity": 0,
                "estimated_material_used": 0,
                "revenue": 0
            }
        
        material_usage[material]["jobs_count"] += 1
        material_usage[material]["total_quantity"] += job.quote.quantity
        material_usage[material]["revenue"] += job.customer_price * 0.7
        
        # Estimate material consumption based on job type
        if job.quote.service_type == "printing" and job.quote.estimated_weight_g:
            material_usage[material]["estimated_material_used"] += job.quote.estimated_weight_g / 1000  # kg
        elif job.quote.service_type == "engraving" and job.quote.estimated_area_cm2:
            material_usage[material]["estimated_material_used"] += job.quote.estimated_area_cm2 / 10000  # m²
    
    # Get current inventory levels
    inventory_result = await db.execute(
        select(ProviderInventory).where(ProviderInventory.provider_id == provider.id)
    )
    current_inventory = inventory_result.scalars().all()
    
    inventory_summary = {}
    for item in current_inventory:
        inventory_summary[item.material_type] = {
            "current_stock": item.current_stock,
            "reserved_stock": item.reserved_stock,
            "minimum_stock": item.minimum_stock,
            "days_remaining": (item.current_stock / (material_usage.get(item.material_type, {}).get("estimated_material_used", 0.1) / days)) if material_usage.get(item.material_type, {}).get("estimated_material_used", 0) > 0 else 999
        }
    
    return {
        "period": {
            "days": days,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        },
        "summary": {
            "total_jobs": total_jobs,
            "total_revenue": total_revenue,
            "avg_job_value": total_revenue / max(total_jobs, 1)
        },
        "material_usage": material_usage,
        "inventory_status": inventory_summary,
        "recommendations": generate_inventory_recommendations(material_usage, inventory_summary)
    }

def generate_inventory_recommendations(usage_data, inventory_data):
    """Generate inventory management recommendations"""
    recommendations = []
    
    for material, usage in usage_data.items():
        if material in inventory_data:
            inventory = inventory_data[material]
            
            # Check if running low
            if inventory["days_remaining"] < 7:
                recommendations.append({
                    "type": "urgent_reorder",
                    "material": material,
                    "message": f"Critical: Only {inventory['days_remaining']:.1f} days of {material} remaining",
                    "priority": "high"
                })
            elif inventory["days_remaining"] < 14:
                recommendations.append({
                    "type": "reorder_soon",
                    "material": material,
                    "message": f"Consider reordering {material} ({inventory['days_remaining']:.1f} days remaining)",
                    "priority": "medium"
                })
            
            # Check for high-value materials
            if usage["revenue"] > 1000:  # High revenue materials
                recommendations.append({
                    "type": "priority_material",
                    "material": material,
                    "message": f"{material} generates high revenue (₹{usage['revenue']:.0f}), ensure adequate stock",
                    "priority": "medium"
                })
    
    return recommendations

async def check_inventory_alerts(provider_id: str, inventory_item: ProviderInventory, db: AsyncSession):
    """Check and send inventory alerts (background task)"""
    alerts = []
    
    # Low stock alert
    if inventory_item.current_stock <= inventory_item.minimum_stock:
        alerts.append(InventoryAlert(
            provider_id=provider_id,
            material_id=inventory_item.id,
            current_stock=inventory_item.current_stock,
            minimum_stock=inventory_item.minimum_stock,
            alert_type="low_stock" if inventory_item.current_stock > 0 else "out_of_stock"
        ))
    
    # Reserved stock exceeds current stock (error condition)
    if inventory_item.reserved_stock > inventory_item.current_stock:
        alerts.append(InventoryAlert(
            provider_id=provider_id,
            material_id=inventory_item.id,
            current_stock=inventory_item.current_stock,
            minimum_stock=inventory_item.minimum_stock,
            alert_type="reserved_exceeded"
        ))
    
    # Send alerts (integrate with notification system)
    for alert in alerts:
        await send_inventory_alert(alert)

async def send_inventory_alert(alert: InventoryAlert):
    """Send inventory alert to provider"""
    # This would integrate with your notification system
    print(f"Inventory Alert: {alert.alert_type} for provider {alert.provider_id}")

async def log_reorder_activity(provider_id: str, material_id: str, quantity: float, reorder_url: str):
    """Log reorder activity for analytics"""
    # This would log to an activity/audit table
    print(f"Reorder logged: Provider {provider_id} reordered {quantity} units of {material_id}")

@router.post("/inventory/sync-with-marketplace")
async def sync_inventory_with_marketplace(
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Sync provider inventory with MakrX.Store marketplace catalog
    """
    # Get provider
    provider_result = await db.execute(
        select(Provider).where(Provider.user_id == current_user.id)
    )
    provider = provider_result.scalar_one_or_none()
    
    if not provider:
        raise HTTPException(status_code=403, detail="Provider account required")
    
    # Get latest material catalog from marketplace
    catalog_result = await db.execute(
        select(MaterialCatalog).where(MaterialCatalog.is_active == True)
    )
    catalog_items = catalog_result.scalars().all()
    
    # Update inventory items with latest pricing and reorder URLs
    updated_count = 0
    
    for catalog_item in catalog_items:
        # Find matching inventory items
        inventory_result = await db.execute(
            select(ProviderInventory).where(and_(
                ProviderInventory.provider_id == provider.id,
                ProviderInventory.material_type == catalog_item.material_id
            ))
        )
        inventory_items = inventory_result.scalars().all()
        
        for inventory_item in inventory_items:
            # Update with latest marketplace info
            await db.execute(
                update(ProviderInventory)
                .where(ProviderInventory.id == inventory_item.id)
                .values(
                    supplier_url=catalog_item.reorder_url,
                    supplier_name="MakrX Store",
                    cost_per_unit=catalog_item.base_cost
                )
            )
            updated_count += 1
    
    await db.commit()
    
    return {
        "message": f"Synchronized {updated_count} inventory items with marketplace",
        "catalog_items_processed": len(catalog_items),
        "inventory_items_updated": updated_count
    }