from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uuid

from ..database import get_db
from ..dependencies import get_current_user
from models.equipment import (
    EquipmentStatus,
    EquipmentCategory,
    Equipment,
    EquipmentReservation,
)
from schemas.equipment import (
    EquipmentResponse,
    EquipmentCreate,
    EquipmentUpdate,
    EquipmentReservationCreate,
    EquipmentReservationResponse,
    EquipmentRatingCreate,
    EquipmentRatingResponse,
)
from crud.equipment import get_equipment_crud

router = APIRouter()
security = HTTPBearer()


@router.get("/", response_model=List[EquipmentResponse])
async def get_equipment(
    makerspace_id: str = Query(...),
    category: Optional[EquipmentCategory] = Query(None),
    status: Optional[EquipmentStatus] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get equipment list with optional filtering"""
    try:
        equipment_crud = get_equipment_crud(db)
        equipment_list = equipment_crud.get_equipment_list(
            makerspace_id=makerspace_id,
            category=category,
            status=status,
            skip=skip,
            limit=limit,
        )
        return equipment_list
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve equipment: {str(e)}",
        )


@router.get("/{equipment_id}")
async def get_equipment_details(
    equipment_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get detailed equipment information"""
    equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()

    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Equipment not found"
        )

    return {
        "id": equipment.id,
        "equipment_id": equipment.equipment_id,
        "name": equipment.name,
        "category": equipment.category.value,
        "sub_category": equipment.sub_category,
        "status": equipment.status.value,
        "location": equipment.location,
        "description": equipment.description,
        "specifications": equipment.specifications,
        "manufacturer": equipment.manufacturer,
        "model": equipment.model,
        "hourly_rate": equipment.hourly_rate,
        "requires_certification": equipment.requires_certification,
        "certification_required": equipment.certification_required,
        "average_rating": equipment.average_rating,
        "total_ratings": equipment.total_ratings,
        "manual_url": equipment.manual_url,
        "image_url": equipment.image_url,
        "created_at": equipment.created_at,
        "updated_at": equipment.updated_at,
    }


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_equipment(
    equipment_data: dict,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create new equipment"""
    try:
        # Generate equipment ID
        equipment_id = f"EQ-{str(uuid.uuid4())[:8].upper()}"

        new_equipment = Equipment(
            equipment_id=equipment_id,
            name=equipment_data["name"],
            category=EquipmentCategory(equipment_data["category"]),
            location=equipment_data["location"],
            linked_makerspace_id=equipment_data["makerspace_id"],
            description=equipment_data.get("description"),
            hourly_rate=equipment_data.get("hourly_rate"),
            requires_certification=equipment_data.get("requires_certification", False),
            created_by=current_user.user_id,
        )

        db.add(new_equipment)
        db.commit()
        db.refresh(new_equipment)

        return {
            "message": "Equipment created successfully",
            "equipment_id": new_equipment.id,
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create equipment: {str(e)}",
        )


@router.post("/{equipment_id}/reserve")
async def reserve_equipment(
    equipment_id: str,
    reservation_data: dict,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Reserve equipment"""
    try:
        # Check if equipment exists and is available
        equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()
        if not equipment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Equipment not found",
            )

        if equipment.status != EquipmentStatus.AVAILABLE:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Equipment is not available for reservation",
            )

        # Create reservation
        reservation = EquipmentReservation(
            equipment_id=equipment_id,
            member_id=current_user.user_id,
            start_time=datetime.fromisoformat(reservation_data["start_time"]),
            end_time=datetime.fromisoformat(reservation_data["end_time"]),
            purpose=reservation_data.get("purpose"),
            notes=reservation_data.get("notes"),
        )

        db.add(reservation)
        db.commit()

        return {
            "message": "Equipment reserved successfully",
            "reservation_id": reservation.id,
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reserve equipment: {str(e)}",
        )


@router.get("/{equipment_id}/reservations")
async def get_equipment_reservations(
    equipment_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get equipment reservations"""
    reservations = (
        db.query(EquipmentReservation)
        .filter(EquipmentReservation.equipment_id == equipment_id)
        .all()
    )

    return [
        {
            "id": res.id,
            "member_id": res.member_id,
            "start_time": res.start_time,
            "end_time": res.end_time,
            "status": res.status.value,
            "purpose": res.purpose,
            "created_at": res.created_at,
        }
        for res in reservations
    ]


# Ratings endpoints used by frontend
@router.get("/{equipment_id}/ratings", response_model=List[EquipmentRatingResponse])
async def list_equipment_ratings(
    equipment_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List ratings for a specific equipment item"""
    equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Equipment not found"
        )
    ratings = [r for r in (equipment.ratings or []) if r.is_approved]
    return ratings


@router.post(
    "/{equipment_id}/rating",
    response_model=EquipmentRatingResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_equipment_rating(
    equipment_id: str,
    rating: EquipmentRatingCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a rating for equipment. Prevent duplicate ratings per user."""
    # Ensure equipment exists
    exists = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Equipment not found"
        )
    # Ensure path/body alignment
    rating.equipment_id = equipment_id
    try:
        equipment_crud = get_equipment_crud(db)
        new_rating = equipment_crud.create_rating(
            db,
            rating,
            user_id=current_user.user_id,
            user_name=current_user.get("name", "Anonymous"),
        )
        return new_rating
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create rating: {str(e)}",
        )
