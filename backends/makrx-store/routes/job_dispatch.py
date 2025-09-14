"""Job Dispatch System - Fair Provider Assignment"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import asyncio
import math
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, update
from sqlalchemy.orm import selectinload

from database import get_db
from core.security import get_current_user
from models.providers import (
    Provider, ServiceOrder, JobDispatch, ProviderInventory,
    MaterialCatalog, ServiceType, JobStatus, ProviderStatus
)
from models.services import Quote
from schemas.admin import MessageResponse

router = APIRouter()

class JobDispatchRequest(BaseModel):
    service_order_id: str
    max_providers: int = Field(5, description="Maximum providers to notify")
    radius_km: int = Field(50, description="Search radius in kilometers")
    priority: int = Field(1, description="Job priority (1=normal, 2=rush)")

class ProviderMatch(BaseModel):
    provider_id: str
    business_name: str
    rating: float
    distance_km: float
    response_time_minutes: int
    capacity_available: int
    match_score: float
    materials_available: bool

class DispatchResponse(BaseModel):
    service_order_id: str
    providers_notified: List[ProviderMatch]
    expected_response_time: int
    dispatch_id: str

@router.post("/dispatch", response_model=DispatchResponse)
async def dispatch_job_to_providers(
    request: JobDispatchRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Dispatch a job to available providers using fair assignment algorithm
    """
    # Get the service order
    result = await db.execute(
        select(ServiceOrder)
        .options(selectinload(ServiceOrder.quote))
        .where(ServiceOrder.id == request.service_order_id)
    )
    service_order = result.scalar_one_or_none()
    
    if not service_order:
        raise HTTPException(status_code=404, detail="Service order not found")
    
    if service_order.status != JobStatus.CREATED:
        raise HTTPException(status_code=400, detail="Job has already been dispatched")
    
    # Find matching providers
    matching_providers = await find_matching_providers(
        db, service_order, request.radius_km, request.max_providers
    )
    
    if not matching_providers:
        raise HTTPException(status_code=404, detail="No available providers found")
    
    # Update service order status
    await db.execute(
        update(ServiceOrder)
        .where(ServiceOrder.id == request.service_order_id)
        .values(
            status=JobStatus.DISPATCHED,
            dispatched_at=datetime.utcnow(),
            priority=request.priority
        )
    )
    
    # Create dispatch records
    dispatch_id = f"dispatch_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
    
    for provider in matching_providers:
        dispatch_record = JobDispatch(
            service_order_id=request.service_order_id,
            provider_id=provider.provider_id,
            notification_method="email",
            provider_rating=provider.rating,
            provider_capacity=provider.capacity_available,
            estimated_response_time=provider.response_time_minutes
        )
        db.add(dispatch_record)
    
    await db.commit()
    
    # Send notifications in background
    background_tasks.add_task(
        notify_providers,
        matching_providers,
        service_order,
        dispatch_id
    )
    
    return DispatchResponse(
        service_order_id=request.service_order_id,
        providers_notified=matching_providers,
        expected_response_time=min(p.response_time_minutes for p in matching_providers),
        dispatch_id=dispatch_id
    )

async def find_matching_providers(
    db: AsyncSession,
    service_order: ServiceOrder,
    radius_km: int,
    max_providers: int
) -> List[ProviderMatch]:
    """
    Find and score providers based on various criteria
    """
    quote = service_order.quote
    service_type = ServiceType.PRINTING if quote.service_type == "printing" else ServiceType.ENGRAVING
    
    # Base query for active providers
    query = select(Provider).where(
        and_(
            Provider.status == ProviderStatus.ACTIVE,
            Provider.services[service_type.value].astext.cast(bool) == True
        )
    ).options(selectinload(Provider.inventory_items))
    
    result = await db.execute(query)
    providers = result.scalars().all()
    
    matches = []
    for provider in providers:
        # Check material availability
        materials_available = check_material_availability(
            provider.inventory_items, quote.material, quote.quantity
        )
        
        if not materials_available:
            continue
        
        # Calculate distance (simplified - in real implementation use proper geolocation)
        distance = calculate_distance_km(provider)  # Placeholder
        if distance > radius_km:
            continue
        
        # Check capacity
        capacity_available = await get_provider_capacity(db, provider.id)
        if capacity_available <= 0:
            continue
        
        # Calculate match score
        match_score = calculate_match_score(
            provider, quote, distance, capacity_available
        )
        
        matches.append(ProviderMatch(
            provider_id=provider.id,
            business_name=provider.business_name,
            rating=provider.rating,
            distance_km=distance,
            response_time_minutes=provider.response_time_minutes,
            capacity_available=capacity_available,
            match_score=match_score,
            materials_available=True
        ))
    
    # Sort by match score and return top providers
    matches.sort(key=lambda x: x.match_score, reverse=True)
    return matches[:max_providers]

def check_material_availability(
    inventory_items: List[ProviderInventory],
    required_material: str,
    quantity: int
) -> bool:
    """Check if provider has sufficient material in stock"""
    for item in inventory_items:
        if (item.material_type == required_material and 
            item.current_stock - item.reserved_stock >= quantity * 0.1):  # Rough estimate
            return True
    return False

def calculate_distance_km(provider: Provider) -> float:
    """Calculate distance - placeholder implementation"""
    # In real implementation, use customer location vs provider location
    # For now, return random distance for demo
    return 15.5

async def get_provider_capacity(db: AsyncSession, provider_id: str) -> int:
    """Get provider's available capacity"""
    # Count current jobs
    result = await db.execute(
        select(func.count(ServiceOrder.id))
        .where(and_(
            ServiceOrder.provider_id == provider_id,
            ServiceOrder.status.in_([JobStatus.ACCEPTED, JobStatus.IN_PROGRESS])
        ))
    )
    current_jobs = result.scalar() or 0
    
    # Get provider max capacity
    provider_result = await db.execute(
        select(Provider.max_concurrent_jobs)
        .where(Provider.id == provider_id)
    )
    max_capacity = provider_result.scalar() or 5
    
    return max(0, max_capacity - current_jobs)

def calculate_match_score(
    provider: Provider,
    quote: Quote,
    distance: float,
    capacity: int
) -> float:
    """
    Calculate provider match score based on multiple factors
    Higher score = better match
    """
    score = 0.0
    
    # Rating factor (0-5 scale, weighted 30%)
    rating_score = (provider.rating / 5.0) * 0.3
    score += rating_score
    
    # Distance factor (closer is better, weighted 25%)
    distance_score = max(0, (50 - distance) / 50) * 0.25
    score += distance_score
    
    # Response time factor (faster is better, weighted 20%)
    response_score = max(0, (120 - provider.response_time_minutes) / 120) * 0.2
    score += response_score
    
    # Capacity factor (more available slots is better, weighted 15%)
    capacity_score = min(1.0, capacity / 5.0) * 0.15
    score += capacity_score
    
    # Experience factor (more completed jobs is better, weighted 10%)
    experience_score = min(1.0, provider.completed_jobs / 100.0) * 0.1
    score += experience_score
    
    return round(score, 3)

async def notify_providers(
    providers: List[ProviderMatch],
    service_order: ServiceOrder,
    dispatch_id: str
):
    """
    Send notifications to providers (background task)
    """
    # This would integrate with your notification system
    # For now, just log the notification
    print(f"Notifying {len(providers)} providers for job {service_order.id}")
    
    for provider in providers:
        # Send email/push notification
        await send_job_notification(provider, service_order)

async def send_job_notification(provider_match: ProviderMatch, service_order: ServiceOrder):
    """Send notification to individual provider"""
    # Placeholder for actual notification logic
    notification_data = {
        "provider_id": provider_match.provider_id,
        "job_id": service_order.id,
        "service_type": service_order.quote.service_type,
        "estimated_value": service_order.customer_price * 0.7,  # Provider gets ~70%
        "priority": "rush" if service_order.priority == 2 else "normal"
    }
    
    print(f"Sending notification to provider {provider_match.business_name}: {notification_data}")

@router.post("/jobs/{job_id}/accept")
async def accept_job(
    job_id: str,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Provider accepts a dispatched job (first come, first served)
    """
    # Get provider info
    provider_result = await db.execute(
        select(Provider).where(Provider.user_id == current_user.id)
    )
    provider = provider_result.scalar_one_or_none()
    
    if not provider:
        raise HTTPException(status_code=403, detail="Provider account required")
    
    # Get service order
    result = await db.execute(
        select(ServiceOrder).where(ServiceOrder.id == job_id)
    )
    service_order = result.scalar_one_or_none()
    
    if not service_order:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if service_order.status != JobStatus.DISPATCHED:
        raise HTTPException(status_code=400, detail="Job is no longer available")
    
    # Check if provider was notified
    dispatch_result = await db.execute(
        select(JobDispatch).where(and_(
            JobDispatch.service_order_id == job_id,
            JobDispatch.provider_id == provider.id
        ))
    )
    dispatch_record = dispatch_result.scalar_one_or_none()
    
    if not dispatch_record:
        raise HTTPException(status_code=403, detail="You were not notified for this job")
    
    # Assign job to provider
    await db.execute(
        update(ServiceOrder)
        .where(ServiceOrder.id == job_id)
        .values(
            status=JobStatus.ACCEPTED,
            provider_id=provider.id,
            accepted_at=datetime.utcnow()
        )
    )
    
    # Update dispatch record
    await db.execute(
        update(JobDispatch)
        .where(JobDispatch.id == dispatch_record.id)
        .values(
            responded_at=datetime.utcnow(),
            response="accepted"
        )
    )
    
    # Reserve materials from inventory
    await reserve_materials(db, provider.id, service_order)
    
    await db.commit()
    
    return {"message": "Job accepted successfully", "job_id": job_id}

async def reserve_materials(
    db: AsyncSession,
    provider_id: str,
    service_order: ServiceOrder
):
    """Reserve materials from provider inventory"""
    quote = service_order.quote
    required_material = quote.material
    
    # Calculate material needed (rough estimation)
    if quote.service_type == "printing" and quote.estimated_weight_g:
        material_needed = quote.estimated_weight_g / 1000  # Convert to kg
    elif quote.service_type == "engraving" and quote.estimated_area_cm2:
        material_needed = quote.estimated_area_cm2 / 10000  # Convert to m²
    else:
        material_needed = 0.1  # Default small amount
    
    # Find and reserve inventory
    inventory_result = await db.execute(
        select(ProviderInventory)
        .where(and_(
            ProviderInventory.provider_id == provider_id,
            ProviderInventory.material_type == required_material,
            ProviderInventory.current_stock - ProviderInventory.reserved_stock >= material_needed
        ))
        .limit(1)
    )
    inventory_item = inventory_result.scalar_one_or_none()
    
    if inventory_item:
        await db.execute(
            update(ProviderInventory)
            .where(ProviderInventory.id == inventory_item.id)
            .values(reserved_stock=inventory_item.reserved_stock + material_needed)
        )

@router.get("/jobs/available")
async def get_available_jobs(
    service_type: Optional[str] = None,
    radius_km: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get available jobs for the current provider
    """
    # Get provider info
    provider_result = await db.execute(
        select(Provider).where(Provider.user_id == current_user.id)
    )
    provider = provider_result.scalar_one_or_none()
    
    if not provider:
        raise HTTPException(status_code=403, detail="Provider account required")
    
    # Get dispatched jobs for this provider
    query = select(ServiceOrder).join(JobDispatch).where(and_(
        JobDispatch.provider_id == provider.id,
        ServiceOrder.status == JobStatus.DISPATCHED,
        JobDispatch.response.is_(None)  # Not yet responded
    )).options(selectinload(ServiceOrder.quote))
    
    result = await db.execute(query)
    jobs = result.scalars().all()
    
    # Format response
    available_jobs = []
    for job in jobs:
        available_jobs.append({
            "id": job.id,
            "service_type": job.quote.service_type,
            "material": job.quote.material,
            "quantity": job.quote.quantity,
            "estimated_value": job.customer_price * 0.7,  # Provider share
            "priority": "rush" if job.priority == 2 else "normal",
            "dispatched_at": job.dispatched_at.isoformat(),
            "customer_notes": job.customer_notes
        })
    
    return {"available_jobs": available_jobs, "total": len(available_jobs)}