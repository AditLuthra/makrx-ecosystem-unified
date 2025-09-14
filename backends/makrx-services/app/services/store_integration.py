"""
Store Integration Service
Handles synchronization between services.makrx.store and main makrx.store
"""

import asyncio
import logging
from datetime import datetime
from typing import Dict, Any, Optional
import httpx
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import SessionLocal
from app.models.orders import ServiceOrder
from app.models.providers import Provider

logger = logging.getLogger(__name__)
settings = get_settings()

class StoreIntegrationService:
    """Service for integrating with main MakrX Store"""
    
    def __init__(self):
        self.store_api_url = settings.STORE_API_URL or "http://localhost:8004/api"
        self.timeout = 30.0
        
    async def create_store_order(self, service_order: ServiceOrder) -> Optional[str]:
        """Create corresponding order in main store"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                order_payload = self._create_store_order_payload(service_order)
                
                response = await client.post(
                    f"{self.store_api_url}/orders",
                    json=order_payload,
                    headers={"Content-Type": "application/json"}
                )
                
                if response.status_code == 201:
                    store_order = response.json()
                    logger.info(f"Created store order {store_order['id']} for service order {service_order.id}")
                    return store_order["id"]
                else:
                    logger.error(f"Failed to create store order: {response.status_code} - {response.text}")
                    return None
                    
        except Exception as e:
            logger.error(f"Error creating store order for {service_order.id}: {e}")
            return None
    
    async def update_store_order(self, store_order_id: str, updates: Dict[str, Any]) -> bool:
        """Update order in main store"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.patch(
                    f"{self.store_api_url}/orders/{store_order_id}",
                    json=updates,
                    headers={"Content-Type": "application/json"}
                )
                
                if response.status_code == 200:
                    logger.info(f"Updated store order {store_order_id}")
                    return True
                else:
                    logger.error(f"Failed to update store order {store_order_id}: {response.status_code}")
                    return False
                    
        except Exception as e:
            logger.error(f"Error updating store order {store_order_id}: {e}")
            return False
    
    async def sync_order_status(self, service_order: ServiceOrder) -> bool:
        """Sync service order status with store"""
        if not service_order.store_order_id:
            logger.warning(f"Service order {service_order.id} has no store order ID")
            return False
            
        updates = {
            "status": self._map_service_status_to_store_status(service_order.status),
            "updated_at": datetime.utcnow().isoformat(),
            "tracking": {
                "service_order_id": service_order.id,
                "provider_id": service_order.provider_id,
                "provider_name": service_order.provider.business_name if service_order.provider else None,
                "estimated_completion": service_order.estimated_completion.isoformat() if service_order.estimated_completion else None,
                "status_updates": [
                    {
                        "timestamp": update.timestamp.isoformat(),
                        "status": update.status,
                        "message": update.message,
                        "user_type": update.user_type
                    }
                    for update in service_order.status_updates[-5:]  # Last 5 updates
                ]
            }
        }
        
        return await self.update_store_order(service_order.store_order_id, updates)
    
    async def notify_store_order_completion(self, service_order: ServiceOrder) -> bool:
        """Notify main store when service order is completed"""
        if not service_order.store_order_id:
            return False
            
        updates = {
            "status": "completed",
            "completed_at": datetime.utcnow().isoformat(),
            "tracking": {
                "completion_notes": "Service completed successfully",
                "provider_rating": service_order.provider.average_rating if service_order.provider else None,
                "delivery_method": service_order.delivery_method,
                "final_price": float(service_order.total_price)
            }
        }
        
        return await self.update_store_order(service_order.store_order_id, updates)
    
    def _create_store_order_payload(self, service_order: ServiceOrder) -> Dict[str, Any]:
        """Create order payload for main store"""
        return {
            "id": f"service_{service_order.id}",
            "user_id": service_order.user_id,
            "type": "service",
            "service_type": service_order.service_type,
            "status": self._map_service_status_to_store_status(service_order.status),
            "items": [{
                "id": service_order.id,
                "name": f"{service_order.service_type.title()} Service - {service_order.material}",
                "description": f"Custom {service_order.service_type} service",
                "quantity": service_order.quantity,
                "price": float(service_order.total_price),
                "image": service_order.preview_url,
                "service_order_id": service_order.id,
                "specifications": {
                    "material": service_order.material,
                    "color_finish": service_order.color_finish,
                    "dimensions": {
                        "x": service_order.dimensions_x,
                        "y": service_order.dimensions_y, 
                        "z": service_order.dimensions_z
                    } if all([service_order.dimensions_x, service_order.dimensions_y, service_order.dimensions_z]) else None,
                    "file_name": service_order.file_name,
                    "priority": service_order.priority
                }
            }],
            "total": float(service_order.total_price),
            "currency": "INR",
            "created_at": service_order.created_at.isoformat(),
            "updated_at": service_order.updated_at.isoformat(),
            "metadata": {
                "source": "services.makrx.store",
                "service_order_id": service_order.id,
                "provider_dispatch": True
            }
        }
    
    def _map_service_status_to_store_status(self, service_status: str) -> str:
        """Map service order status to store order status"""
        status_map = {
            "pending": "pending",
            "quoted": "processing", 
            "confirmed": "confirmed",
            "dispatched": "processing",
            "accepted": "processing",
            "in_progress": "processing",
            "completed": "ready",
            "delivered": "completed"
        }
        
        return status_map.get(service_status, "pending")

# Global service instance
store_integration = StoreIntegrationService()

# Convenience functions
async def sync_order_with_store(order_id: str, user_id: str) -> bool:
    """Sync service order with main store"""
    db = SessionLocal()
    try:
        service_order = db.query(ServiceOrder).filter(
            ServiceOrder.id == order_id,
            ServiceOrder.user_id == user_id
        ).first()
        
        if not service_order:
            logger.error(f"Service order {order_id} not found for user {user_id}")
            return False
        
        # Create store order if it doesn't exist
        if not service_order.store_order_id:
            store_order_id = await store_integration.create_store_order(service_order)
            if store_order_id:
                service_order.store_order_id = store_order_id
                service_order.sync_status = "synced"
                db.commit()
            else:
                service_order.sync_status = "error"
                db.commit()
                return False
        
        # Sync status
        success = await store_integration.sync_order_status(service_order)
        if success:
            service_order.sync_status = "synced"
        else:
            service_order.sync_status = "error"
        
        db.commit()
        return success
        
    except Exception as e:
        logger.error(f"Error syncing order {order_id}: {e}")
        db.rollback()
        return False
    finally:
        db.close()

async def notify_order_completion(order_id: str) -> bool:
    """Notify main store of service order completion"""
    db = SessionLocal()
    try:
        service_order = db.query(ServiceOrder).filter(ServiceOrder.id == order_id).first()
        
        if not service_order:
            return False
        
        return await store_integration.notify_store_order_completion(service_order)
        
    except Exception as e:
        logger.error(f"Error notifying completion for order {order_id}: {e}")
        return False
    finally:
        db.close()

# Background sync task
async def background_sync_orders():
    """Background task to sync orders that failed initial sync"""
    db = SessionLocal()
    try:
        # Find orders with sync errors or pending sync
        orders_to_sync = db.query(ServiceOrder).filter(
            ServiceOrder.sync_status.in_(["pending", "error"])
        ).limit(10).all()
        
        for order in orders_to_sync:
            try:
                await sync_order_with_store(order.id, order.user_id)
                await asyncio.sleep(1)  # Rate limiting
            except Exception as e:
                logger.error(f"Background sync failed for order {order.id}: {e}")
                
    except Exception as e:
        logger.error(f"Background sync task error: {e}")
    finally:
        db.close()

# Start background sync task
async def start_background_sync():
    """Start the background sync task"""
    while True:
        try:
            await background_sync_orders()
        except Exception as e:
            logger.error(f"Background sync error: {e}")
        
        # Run every 5 minutes
        await asyncio.sleep(300)