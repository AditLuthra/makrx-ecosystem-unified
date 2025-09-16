from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uuid

from ..database import get_db
from ..dependencies import get_current_user, require_roles, check_permission
from ..dependencies import CurrentUser
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
    makerspace_id: Optional[str] = Query(None),
    category: Optional[EquipmentCategory] = Query(None),
    status: Optional[EquipmentStatus] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get equipment list with optional filtering"""
    try:
        # If makerspace_id is not provided, use the user's makerspace_id
        if not makerspace_id:
            makerspace_id = _get_user_makerspace_id(current_user)

        # Super admins can view equipment from any makerspace, others are restricted
        if current_user.role != "super_admin" and makerspace_id != _get_user_makerspace_id(current_user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to view equipment from another makerspace",
            )

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


@router.get("/{equipment_id}", response_model=EquipmentResponse)
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

    # Check if user has access to this makerspace's equipment
    if (
        equipment.linked_makerspace_id != _get_user_makerspace_id(current_user)
        and current_user.role != "super_admin"
    ):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return EquipmentResponse.from_orm(equipment)


@router.post("/", response_model=EquipmentResponse, status_code=status.HTTP_201_CREATED)
async def create_equipment(
    equipment_data: EquipmentCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create new equipment"""
    if not check_permission(current_user.role, "add_edit_equipment"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions"
        )

    try:
        makerspace_id = _get_user_makerspace_id(current_user)
        equipment_crud = get_equipment_crud(db)
        new_equipment = equipment_crud.create_equipment(
            makerspace_id=makerspace_id,
            equipment_data=equipment_data,
            created_by_user_id=current_user.user_id,
            created_by_user_name=current_user.name,
        )
        return new_equipment
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create equipment: {str(e)}",
        )


@router.post("/{equipment_id}/reserve", response_model=EquipmentReservationResponse)
async def reserve_equipment(
    equipment_id: str,
    reservation_data: EquipmentReservationCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Reserve equipment"""
    if not check_permission(current_user.role, "reserve_equipment"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions"
        )

    try:
        # Check if equipment exists and is available
        equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()
        if not equipment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Equipment not found",
            )

        # Check if user has access to this makerspace's equipment
        if (
            equipment.linked_makerspace_id != _get_user_makerspace_id(current_user)
            and current_user.role != "super_admin"
        ):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

        if equipment.status != EquipmentStatus.AVAILABLE:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Equipment is not available for reservation",
            )

        # Create reservation
        reservation = EquipmentReservation(
            equipment_id=equipment_id,
            member_id=current_user.user_id,
            start_time=reservation_data.start_time,
            end_time=reservation_data.end_time,
            purpose=reservation_data.purpose,
            notes=reservation_data.notes,
        )

        db.add(reservation)
        db.commit()
        db.refresh(reservation)

        return EquipmentReservationResponse.from_orm(reservation)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reserve equipment: {str(e)}",
        )


@router.get("/{equipment_id}/reservations", response_model=List[EquipmentReservationResponse])
async def get_equipment_reservations(
    equipment_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get equipment reservations"""
    # Check if equipment exists
    equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Equipment not found"
        )

    # Check if user has access to this makerspace's equipment
    if (
        equipment.linked_makerspace_id != _get_user_makerspace_id(current_user)
        and current_user.role != "super_admin"
    ):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    reservations = (
        db.query(EquipmentReservation)
        .filter(EquipmentReservation.equipment_id == equipment_id)
        .all()
    )

    return [EquipmentReservationResponse.from_orm(res) for res in reservations]


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

    # Check if user has access to this makerspace's equipment
    if (
        equipment.linked_makerspace_id != _get_user_makerspace_id(current_user)
        and current_user.role != "super_admin"
    ):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

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
    equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Equipment not found"
        )

    # Check if user has access to this makerspace's equipment
    if (
        equipment.linked_makerspace_id != _get_user_makerspace_id(current_user)
        and current_user.role != "super_admin"
    ):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

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


# Helper functions
def _get_user_makerspace_id(user: CurrentUser) -> str:
    """Get user's makerspace ID"""
    # This should be implemented based on your user model
    return user.get("makerspace_id", "default_makerspace")
