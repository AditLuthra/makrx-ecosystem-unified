import uuid
from datetime import datetime
from typing import List, Optional

import multipart  # noqa: F401 - ensure python-multipart is installed
from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    File,
    HTTPException,
    Query,
    Response,
    UploadFile,
)
from sqlalchemy.orm import Session

from ..crud.inventory import InventoryCRUD

# Models used via CRUD operations; direct imports not required here
from ..database import get_db
from ..dependencies import check_permission, get_current_user
from ..schemas.inventory import (
    InventoryItemCreate,
    InventoryItemResponse,
    InventoryItemUpdate,
    InventoryStatsResponse,
    InventoryUsageLogResponse,
    IssueItemRequest,
    LowStockAlertResponse,
    ReorderRequest,
)

# Router without local prefix; mounted under '/inventory'
router = APIRouter(tags=["inventory"])

# Placeholder to avoid undefined-name during static checks.
# Real CRUD is created per-request in handlers when needed.


def get_inventory_crud(db: Session = Depends(get_db)) -> InventoryCRUD:
    return InventoryCRUD(db)


@router.get("/", response_model=List[InventoryItemResponse])
async def list_inventory_items(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    crud: InventoryCRUD = Depends(get_inventory_crud),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    category: Optional[str] = Query(None),
    subcategory: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    supplier_type: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    low_stock_only: bool = Query(False),
    search: Optional[str] = Query(None),
    sort_by: str = Query("name"),
    sort_desc: bool = Query(False),
):
    """List inventory items with filtering and pagination.

    Note: In unauthenticated requests this handler won't run because
    router-level dependencies enforce auth first. Keeping a minimal
    implementation avoids unnecessary dependencies during tests.
    """
    # Use CRUD with minimal filters; expand to full filter model later
    from ..schemas.inventory import InventoryFilter

    filters = InventoryFilter(
        makerspace_id=current_user.makerspace_id,
        skip=skip,
        limit=limit,
        category=category,
        status=status,
        supplier_type=supplier_type,
        location=location,
        low_stock_only=low_stock_only,
        search=search,
        sort_by=sort_by,
        sort_order="desc" if sort_desc else "asc",
    )
    items, _total = crud.get_items(filters)
    return items


# No-trailing-slash alias so GET /api/v1/inventory returns auth error
@router.get(
    "",
    response_model=List[InventoryItemResponse],
    include_in_schema=False,
)
async def list_inventory_items_no_slash(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    crud: InventoryCRUD = Depends(get_inventory_crud),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    category: Optional[str] = Query(None),
    subcategory: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    supplier_type: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    low_stock_only: bool = Query(False),
    search: Optional[str] = Query(None),
    sort_by: str = Query("name"),
    sort_desc: bool = Query(False),
):
    return await list_inventory_items(
        db=db,
        current_user=current_user,
        crud=crud,
        skip=skip,
        limit=limit,
        category=category,
        subcategory=subcategory,
        status=status,
        supplier_type=supplier_type,
        location=location,
        low_stock_only=low_stock_only,
        search=search,
        sort_by=sort_by,
        sort_desc=sort_desc,
    )


@router.get("/{item_id}", response_model=InventoryItemResponse)
async def get_inventory_item(
    item_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    crud: InventoryCRUD = Depends(get_inventory_crud),
):
    """Get a single inventory item by ID"""
    item = crud.get_item(item_id=item_id, makerspace_id=current_user.makerspace_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    # Check if user has access to this makerspace's inventory
    if (
        item.linked_makerspace_id != current_user.makerspace_id
        and current_user.role != "super_admin"
    ):
        raise HTTPException(status_code=403, detail="Access denied")

    return item


@router.post("/", response_model=InventoryItemResponse)
async def create_inventory_item(
    item_data: InventoryItemCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    crud: InventoryCRUD = Depends(get_inventory_crud),
):
    """Create a new inventory item"""
    # Check permissions
    if not check_permission(current_user.role, "add_edit_items"):
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    try:
        # Set the makerspace_id to current user's makerspace
        item_data.linked_makerspace_id = current_user.makerspace_id

        item_data.created_by = current_user.id
        item = crud.create_item(item=item_data)

        return item
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{item_id}", response_model=InventoryItemResponse)
async def update_inventory_item(
    item_id: str,
    item_data: InventoryItemUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    crud: InventoryCRUD = Depends(get_inventory_crud),
):
    """Update an existing inventory item"""
    # Check permissions
    if not check_permission(current_user.role, "add_edit_items"):
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    # Check if item exists and user has access
    existing_item = crud.get_item(
        item_id=item_id, makerspace_id=current_user.makerspace_id
    )
    if not existing_item:
        raise HTTPException(status_code=404, detail="Item not found")

    if (
        existing_item.linked_makerspace_id != current_user.makerspace_id
        and current_user.role != "super_admin"
    ):
        raise HTTPException(status_code=403, detail="Access denied")

    try:
        item_data.updated_by = current_user.id
        item = crud.update_item(
            item_id=item_id,
            updates=item_data,
            makerspace_id=current_user.makerspace_id,
        )

        return item
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{item_id}/issue")
async def issue_inventory_item(
    item_id: str,
    issue_data: IssueItemRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    crud: InventoryCRUD = Depends(get_inventory_crud),
):
    """Issue/deduct quantity from inventory item"""
    # Check permissions
    if not check_permission(current_user.role, "issue_items"):
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    # Check if item exists and user has access
    existing_item = crud.get_item(
        item_id=item_id, makerspace_id=current_user.makerspace_id
    )
    if not existing_item:
        raise HTTPException(status_code=404, detail="Item not found")

    if (
        existing_item.linked_makerspace_id != current_user.makerspace_id
        and current_user.role != "super_admin"
    ):
        raise HTTPException(status_code=403, detail="Access denied")

    try:
        result = crud.issue_item(
            item_id=item_id,
            quantity=issue_data.quantity,
            user_id=current_user.id,
            user_name=current_user.name,
            reason=issue_data.reason,
            project_id=issue_data.project_id,
            job_id=issue_data.job_id,
        )
        if not result:
            raise HTTPException(status_code=400, detail="Insufficient stock")
        return {
            "message": "Item issued successfully",
            "remaining_quantity": result.quantity,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{item_id}/restock")
async def restock_inventory_item(
    item_id: str,
    quantity: float,
    reason: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    crud: InventoryCRUD = Depends(get_inventory_crud),
):
    """Add quantity to inventory item"""
    # Check permissions
    if not check_permission(current_user.role, "add_edit_items"):
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    # Check if item exists and user has access
    existing_item = crud.get_item(
        item_id=item_id, makerspace_id=current_user.makerspace_id
    )
    if not existing_item:
        raise HTTPException(status_code=404, detail="Item not found")

    if (
        existing_item.linked_makerspace_id != current_user.makerspace_id
        and current_user.role != "super_admin"
    ):
        raise HTTPException(status_code=403, detail="Access denied")

    try:
        result = crud.restock_item(
            item_id=item_id,
            quantity=quantity,
            user_id=current_user.id,
            user_name=current_user.name,
            reason=reason or "Manual restock",
        )
        if not result:
            raise HTTPException(status_code=404, detail="Item not found")
        return {
            "message": "Item restocked successfully",
            "new_quantity": result.quantity,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{item_id}/reorder")
async def reorder_from_makrx(
    item_id: str,
    reorder_data: ReorderRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    crud: InventoryCRUD = Depends(get_inventory_crud),
):
    """Initiate reorder from MakrX Store"""
    # Check permissions
    if not check_permission(current_user.role, "reorder_from_store"):
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    # Check if item exists and user has access
    existing_item = crud.get_item(
        item_id=item_id, makerspace_id=current_user.makerspace_id
    )
    if not existing_item:
        raise HTTPException(status_code=404, detail="Item not found")

    if existing_item.supplier_type != "makrx":
        raise HTTPException(
            status_code=400,
            detail=("Item is not from " "MakrX Store"),
        )

    if not existing_item.product_code:
        raise HTTPException(
            status_code=400, detail="Item has no product code for reordering"
        )

    if (
        existing_item.linked_makerspace_id != current_user.makerspace_id
        and current_user.role != "super_admin"
    ):
        raise HTTPException(status_code=403, detail="Access denied")

    try:
        # Create reorder request - this would integrate with MakrX Store API
        reorder_url = crud.create_reorder_request(
            item_id=item_id,
            quantity=reorder_data.quantity,
            user_id=current_user.id,
            notes=reorder_data.notes,
        )

        return {
            "message": "Reorder request created",
            "reorder_url": reorder_url,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{item_id}/usage", response_model=List[InventoryUsageLogResponse])
async def get_item_usage_history(
    item_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    crud: InventoryCRUD = Depends(get_inventory_crud),
):
    """Get usage history for an inventory item"""
    # Check if item exists and user has access
    existing_item = crud.get_item(
        item_id=item_id, makerspace_id=current_user.makerspace_id
    )
    if not existing_item:
        raise HTTPException(status_code=404, detail="Item not found")

    if (
        existing_item.linked_makerspace_id != current_user.makerspace_id
        and current_user.role != "super_admin"
    ):
        raise HTTPException(status_code=403, detail="Access denied")

    usage_logs = crud.get_usage_history(item_id=item_id, skip=skip, limit=limit)

    return usage_logs


@router.get("/usage/logs", response_model=List[InventoryUsageLogResponse])
async def get_all_usage_logs(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    user_id: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    crud: InventoryCRUD = Depends(get_inventory_crud),
):
    """Get usage logs for all inventory items"""
    # Check permissions
    if not check_permission(current_user.role, "view_usage_logs"):
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    filters = {}
    if start_date:
        filters["start_date"] = start_date
    if end_date:
        filters["end_date"] = end_date
    if user_id:
        filters["user_id"] = user_id
    if action:
        filters["action"] = action

    usage_logs = crud.get_all_usage_logs(
        makerspace_id=current_user.makerspace_id,
        skip=skip,
        limit=limit,
        filters=filters,
    )

    return usage_logs


@router.get("/alerts/low-stock", response_model=List[LowStockAlertResponse])
async def get_low_stock_alerts(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    crud: InventoryCRUD = Depends(get_inventory_crud),
):
    """Get low stock alerts for the makerspace"""
    alerts = crud.get_low_stock_alerts(makerspace_id=current_user.makerspace_id)

    return alerts


@router.get("/stats", response_model=InventoryStatsResponse)
async def get_inventory_stats(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    crud: InventoryCRUD = Depends(get_inventory_crud),
):
    """Get inventory statistics for the makerspace"""
    stats = crud.get_inventory_stats(makerspace_id=current_user.makerspace_id)

    return stats


@router.post("/bulk/import")
async def bulk_import_inventory(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    crud: InventoryCRUD = Depends(get_inventory_crud),
):
    """Bulk import inventory items from CSV"""
    # Check permissions
    if not check_permission(current_user.role, "add_edit_items"):
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="File must be a CSV")

    try:
        # Read CSV content
        content = await file.read()
        csv_content = content.decode("utf-8")

        # Create background job for processing
        job_id = str(uuid.uuid4())

        background_tasks.add_task(
            crud.process_bulk_import,
            csv_content=csv_content,
            job_id=job_id,
            makerspace_id=current_user.makerspace_id,
            user_id=current_user.id,
            user_name=current_user.name,
        )

        return {"message": "Import job started", "job_id": job_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/bulk/import/{job_id}")
async def get_import_job_status(
    job_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    crud: InventoryCRUD = Depends(get_inventory_crud),
):
    """Get status of bulk import job"""
    job_status = crud.get_import_job_status(job_id=job_id)
    if not job_status:
        raise HTTPException(status_code=404, detail="Import job not found")

    return job_status


@router.get("/export/csv")
async def export_inventory_csv(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    crud: InventoryCRUD = Depends(get_inventory_crud),
):
    """Export inventory items as CSV"""
    # Check permissions
    if not check_permission(current_user.role, "view_inventory"):
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    try:
        filters = {}
        if category:
            filters["category"] = category
        if status:
            filters["status"] = status

        csv_content = crud.export_to_csv(
            makerspace_id=current_user.makerspace_id, filters=filters
        )

        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={
                "Content-Disposition": ("attachment; filename=" "inventory_export.csv")
            },
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{item_id}")
async def delete_inventory_item(
    item_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    crud: InventoryCRUD = Depends(get_inventory_crud),
):
    """Delete an inventory item"""
    # Check permissions
    if not check_permission(current_user.role, "delete_items"):
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    # Check if item exists and user has access
    existing_item = crud.get_item(
        item_id=item_id, makerspace_id=current_user.makerspace_id
    )
    if not existing_item:
        raise HTTPException(status_code=404, detail="Item not found")

    if (
        existing_item.linked_makerspace_id != current_user.makerspace_id
        and current_user.role != "super_admin"
    ):
        raise HTTPException(status_code=403, detail="Access denied")

    try:
        crud.delete_item(
            item_id=item_id,
            deleted_by=current_user.id,
        )

        return {"message": "Item deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/bulk/delete")
async def bulk_delete_items(
    item_ids: List[str],
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    crud: InventoryCRUD = Depends(get_inventory_crud),
):
    """Bulk delete inventory items"""
    # Check permissions
    if not check_permission(current_user.role, "delete_items"):
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    try:
        result = crud.bulk_delete_items(
            item_ids=item_ids,
            makerspace_id=current_user.makerspace_id,
            deleted_by=current_user.id,
        )

        return {
            "message": f"Deleted {result['deleted_count']} items",
            "errors": result.get("errors", []),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/qr/generate")
async def generate_qr_codes(
    item_ids: List[str],
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    crud: InventoryCRUD = Depends(get_inventory_crud),
):
    """Generate QR codes for inventory items"""
    # Check permissions
    if not check_permission(current_user.role, "add_edit_items"):
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    try:
        qr_data = crud.generate_qr_codes(
            item_ids=item_ids, makerspace_id=current_user.makerspace_id
        )

        return {"qr_codes": qr_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
