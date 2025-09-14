"""
Provider Management API Routes
Handles provider dashboard, job management, and inventory
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user, require_service_provider
from app.models.orders import ServiceOrder, StatusUpdate
from app.models.providers import Provider, ProviderInventory
from app.models.users import User

router = APIRouter()

@router.get("/provider/dashboard")
def get_provider_dashboard(
    current_user: User = Depends(require_service_provider),
    db: Session = Depends(get_db)
):
    """Get provider dashboard stats and notifications"""
    try:
        provider = db.query(Provider).filter(Provider.user_id == current_user.id).first()
        
        if not provider:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Provider profile not found"
            )
        
        # Get basic stats
        stats = {
            "total_jobs": provider.total_jobs,
            "completed_jobs": provider.completed_jobs,
            "rating": provider.average_rating,
            "monthly_revenue": provider.monthly_revenue,
            "available_capacity": provider.available_capacity,
            "response_time_minutes": provider.response_time_minutes,
            "completion_rate": (provider.completed_jobs / max(provider.total_jobs, 1)) * 100,
            "this_week_jobs": 5,  # Mock data
            "pending_jobs": db.query(ServiceOrder).filter(
                ServiceOrder.provider_id == provider.id,
                ServiceOrder.status.in_(["accepted", "in_progress"])
            ).count()
        }
        
        # Get notifications (mock data)
        notifications = [
            {
                "id": "1",
                "type": "job_available",
                "title": "New Job Available",
                "message": "A new 3D printing job matching your capabilities is available",
                "timestamp": datetime.utcnow().isoformat(),
                "read": False
            }
        ]
        
        return {
            "stats": stats,
            "notifications": notifications
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get dashboard data: {str(e)}"
        )

@router.get("/provider/jobs/available")
def get_available_jobs(
    current_user: User = Depends(require_service_provider),
    db: Session = Depends(get_db)
):
    """Get available jobs for provider"""
    try:
        # Mock available jobs - in production, this would be filtered by provider capabilities
        available_jobs = [
            {
                "id": "job-1",
                "service_type": "printing",
                "material": "PLA",
                "quantity": 1,
                "estimated_value": 250.0,
                "priority": "normal",
                "dispatched_at": datetime.utcnow().isoformat(),
                "customer_notes": "Please ensure high quality finish",
                "file_url": "/uploads/stl/sample.stl",
                "preview_url": "/uploads/previews/sample.png",
                "dimensions": {
                    "x": 50.0,
                    "y": 50.0,
                    "z": 25.0
                }
            }
        ]
        
        return available_jobs
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get available jobs: {str(e)}"
        )

@router.post("/provider/jobs/{job_id}/accept")
def accept_job(
    job_id: str,
    current_user: User = Depends(require_service_provider),
    db: Session = Depends(get_db)
):
    """Accept a job"""
    try:
        provider = db.query(Provider).filter(Provider.user_id == current_user.id).first()
        
        if not provider:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Provider profile not found"
            )
        
        # Find the order
        order = db.query(ServiceOrder).filter(ServiceOrder.id == job_id).first()
        
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found"
            )
        
        if order.status != "dispatched":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Job is not available for acceptance"
            )
        
        # Accept the job
        order.provider_id = provider.id
        order.status = "accepted"
        order.accepted_at = datetime.utcnow()
        order.updated_at = datetime.utcnow()
        
        # Add status update
        status_update = StatusUpdate(
            id=str(uuid.uuid4()),
            order_id=order.id,
            status="accepted",
            message=f"Job accepted by {provider.business_name}",
            timestamp=datetime.utcnow(),
            user_type="provider"
        )
        
        db.add(status_update)
        db.commit()
        
        return {"message": "Job accepted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to accept job: {str(e)}"
        )

@router.get("/provider/jobs")
def get_provider_jobs(
    current_user: User = Depends(require_service_provider),
    db: Session = Depends(get_db)
):
    """Get provider's active jobs"""
    try:
        provider = db.query(Provider).filter(Provider.user_id == current_user.id).first()
        
        if not provider:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Provider profile not found"
            )
        
        jobs = db.query(ServiceOrder).filter(
            ServiceOrder.provider_id == provider.id
        ).order_by(ServiceOrder.accepted_at.desc()).all()
        
        jobs_data = []
        for job in jobs:
            status_updates = db.query(StatusUpdate).filter(
                StatusUpdate.order_id == job.id
            ).order_by(StatusUpdate.timestamp.desc()).limit(5).all()
            
            job_dict = {
                "id": job.id,
                "service_type": job.service_type,
                "status": job.status,
                "customer_id": job.user_id,
                "material": job.material,
                "quantity": job.quantity,
                "price": float(job.total_price),
                "accepted_at": job.accepted_at.isoformat() if job.accepted_at else None,
                "estimated_completion": job.estimated_completion.isoformat() if job.estimated_completion else None,
                "customer_notes": job.customer_notes,
                "provider_notes": job.provider_notes,
                "file_url": job.file_url,
                "preview_url": job.preview_url,
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
            jobs_data.append(job_dict)
        
        return {"jobs": jobs_data}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get jobs: {str(e)}"
        )

@router.patch("/provider/jobs/{job_id}/status")
def update_job_status(
    job_id: str,
    status_data: dict,
    current_user: User = Depends(require_service_provider),
    db: Session = Depends(get_db)
):
    """Update job status"""
    try:
        provider = db.query(Provider).filter(Provider.user_id == current_user.id).first()
        
        if not provider:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Provider profile not found"
            )
        
        order = db.query(ServiceOrder).filter(
            ServiceOrder.id == job_id,
            ServiceOrder.provider_id == provider.id
        ).first()
        
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found"
            )
        
        # Update order status
        new_status = status_data.get("status")
        notes = status_data.get("notes", "")
        
        if new_status:
            order.status = new_status
            order.updated_at = datetime.utcnow()
            
            if new_status == "completed":
                order.completed_at = datetime.utcnow()
        
        if notes:
            order.provider_notes = notes
        
        # Add status update
        status_update = StatusUpdate(
            id=str(uuid.uuid4()),
            order_id=order.id,
            status=new_status or "info",
            message=notes or f"Status updated to {new_status}",
            timestamp=datetime.utcnow(),
            user_type="provider"
        )
        
        db.add(status_update)
        db.commit()
        
        return {"message": "Status updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update status: {str(e)}"
        )

@router.get("/provider/inventory")
def get_provider_inventory(
    current_user: User = Depends(require_service_provider),
    db: Session = Depends(get_db)
):
    """Get provider inventory"""
    try:
        provider = db.query(Provider).filter(Provider.user_id == current_user.id).first()
        
        if not provider:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Provider profile not found"
            )
        
        inventory_items = db.query(ProviderInventory).filter(
            ProviderInventory.provider_id == provider.id
        ).all()
        
        # Mock inventory data if none exists
        if not inventory_items:
            mock_inventory = [
                {
                    "id": "inv-1",
                    "material_type": "PLA",
                    "color_finish": "Black",
                    "current_stock": 2.5,
                    "reserved_stock": 0.5,
                    "minimum_stock": 1.0,
                    "cost_per_unit": 150.0,
                    "reorder_url": "https://makrx.store/products/pla-black",
                    "supplier_name": "MakrX Store",
                    "last_updated": datetime.utcnow().isoformat()
                },
                {
                    "id": "inv-2",
                    "material_type": "ABS",
                    "color_finish": "White",
                    "current_stock": 0.8,
                    "reserved_stock": 0.2,
                    "minimum_stock": 1.0,
                    "cost_per_unit": 180.0,
                    "reorder_url": "https://makrx.store/products/abs-white",
                    "supplier_name": "MakrX Store",
                    "last_updated": datetime.utcnow().isoformat()
                }
            ]
            return {"inventory": mock_inventory}
        
        inventory_data = []
        for item in inventory_items:
            inventory_data.append({
                "id": item.id,
                "material_type": item.material_type,
                "color_finish": item.color_finish,
                "current_stock": item.current_stock,
                "reserved_stock": item.reserved_stock,
                "minimum_stock": item.minimum_stock,
                "cost_per_unit": item.cost_per_unit,
                "reorder_url": item.reorder_url,
                "supplier_name": item.supplier_name,
                "last_updated": item.updated_at.isoformat()
            })
        
        return {"inventory": inventory_data}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get inventory: {str(e)}"
        )

@router.patch("/provider/inventory/{material_id}")
def update_provider_inventory(
    material_id: str,
    inventory_data: dict,
    current_user: User = Depends(require_service_provider),
    db: Session = Depends(get_db)
):
    """Update provider inventory"""
    try:
        provider = db.query(Provider).filter(Provider.user_id == current_user.id).first()
        
        if not provider:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Provider profile not found"
            )
        
        quantity = inventory_data.get("quantity", 0)
        action = inventory_data.get("action", "add")  # 'add' or 'subtract'
        
        # Mock inventory update - in production, this would update real inventory
        return {"message": f"Inventory {'increased' if action == 'add' else 'decreased'} by {quantity}"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update inventory: {str(e)}"
        )