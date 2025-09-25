import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session

from backends.utils import error_detail

from ..crud.equipment import get_equipment_crud
from ..database import get_db
from ..dependencies import (
    CurrentUser,
    check_permission,
    get_current_user,
)
from ..models.equipment import (
    Equipment,
    EquipmentCategory,
    EquipmentReservation,
    EquipmentStatus,
)
from ..schemas.equipment import (
    EquipmentCreate,
    EquipmentRatingCreate,
    EquipmentRatingResponse,
    EquipmentReservationCreate,
    EquipmentReservationResponse,
    EquipmentResponse,
    EquipmentFilter,
)
from ..schemas.skill import EquipmentSkillRequirements

router = APIRouter()
security = HTTPBearer()


logger = logging.getLogger(__name__)


def _user_makerspace_id(user: CurrentUser) -> str:
    return user.get("makerspace_id", "default_makerspace")


def _fetch_equipment(
    *, db: Session, equipment_id: str, current_user: CurrentUser
) -> Equipment:
    try:
        equipment = (
            db.query(Equipment).filter(Equipment.id == equipment_id).first()
        )
    except Exception as exc:
        logger.exception(
            "Unexpected error while retrieving equipment %s", equipment_id
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_detail(
                "INTERNAL_ERROR",
                "An unexpected error occurred while retrieving the equipment.",
            ),
        ) from exc

    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=error_detail("EQUIPMENT_NOT_FOUND", "Equipment not found"),
        )

    makerspace_id = _user_makerspace_id(current_user)
    if (
        equipment.linked_makerspace_id != makerspace_id
        and current_user.role != "super_admin"
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=error_detail("ACCESS_DENIED", "Access denied"),
        )

    return equipment


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
            makerspace_id = _user_makerspace_id(current_user)

        # Super admins can view equipment from any makerspace, others are restricted
        if (
            current_user.role != "super_admin"
            and makerspace_id != _user_makerspace_id(current_user)
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=error_detail(
                    "PERMISSION_DENIED",
                    "Insufficient permissions to view equipment from another makerspace",
                ),
            )

        equipment_crud = get_equipment_crud(db)
        filters = EquipmentFilter(
            category=category,
            status=status,
            skip=skip,
            limit=limit,
        )
        equipment_list = equipment_crud.get_equipment_list(
            db=db,
            makerspace_id=makerspace_id or "",
            filters=filters,
            user_role=getattr(current_user, "role", "user"),
        )
        return equipment_list
    except ValueError as exc:
        logger.warning(
            "Invalid equipment filter parameters for makerspace %s",
            makerspace_id,
            extra={"error": str(exc)},
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_detail("INVALID_INPUT", str(exc)),
        ) from exc
    except Exception as exc:
        logger.exception(
            "Unexpected error while retrieving equipment for makerspace %s",
            makerspace_id,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_detail(
                "INTERNAL_ERROR",
                "An unexpected error occurred while retrieving equipment.",
            ),
        ) from exc


@router.get("/{equipment_id}", response_model=EquipmentResponse)
async def get_equipment_details(
    equipment_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get detailed equipment information"""
    equipment = _fetch_equipment(
        db=db, equipment_id=equipment_id, current_user=current_user
    )

    return EquipmentResponse.model_validate(equipment, from_attributes=True)


@router.get("/skill-requirements", response_model=list[EquipmentSkillRequirements])
async def get_equipment_skill_requirements_compat(
    makerspace_id: Optional[str] = Query(None),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Compatibility alias for older frontend call:
    GET /api/v1/equipment/skill-requirements → /api/v1/skills/equipment-requirements

    Mirrors the implementation in skills router to avoid breaking older clients.
    """
    # Resolve makerspace scope (default to user's makerspace when not provided)
    ms_id = makerspace_id or (
        getattr(current_user, "makerspace_id", None)
        if hasattr(current_user, "makerspace_id")
        else None
    )

    try:
        equipment_crud = get_equipment_crud(db)
        filters = EquipmentFilter(
            makerspace_id=ms_id,
            skip=0,
            limit=1000,
        )
        equipment_list = equipment_crud.get_equipment_list(
            db=db,
            makerspace_id=ms_id or "",
            filters=filters,
            user_role=getattr(current_user, "role", "user"),
        )
    except ValueError as exc:
        logger.warning(
            "Invalid skill requirements filter for makerspace %s",
            ms_id,
            extra={"error": str(exc)},
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_detail("INVALID_INPUT", str(exc)),
        ) from exc
    except Exception as exc:
        logger.exception(
            "Unexpected error while retrieving equipment skill requirements for makerspace %s",
            ms_id,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_detail(
                "INTERNAL_ERROR",
                "An unexpected error occurred while fetching equipment skill requirements.",
            ),
        ) from exc

    result: list[EquipmentSkillRequirements] = []
    for eq in equipment_list:
        if hasattr(eq, "required_skills") and eq.required_skills:
            skill_requirements = []
            for skill in eq.required_skills:
                skill_requirements.append(
                    {
                        "skill_id": skill.id,
                        "skill_name": skill.name,
                        "skill_level": skill.level,
                        "required_level": skill.level,
                        "category": skill.category,
                        "is_required": True,
                    }
                )
            result.append(
                EquipmentSkillRequirements(
                    equipment_id=eq.id,
                    equipment_name=eq.name,
                    required_skills=skill_requirements,
                )
            )

    return result


@router.post("/", response_model=EquipmentResponse, status_code=status.HTTP_201_CREATED)
async def create_equipment(
    equipment_data: EquipmentCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create new equipment"""
    if not check_permission(current_user.role, "add_edit_equipment"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=error_detail(
                "PERMISSION_DENIED", "Insufficient permissions to add equipment"
            ),
        )

    try:
        makerspace_id = _user_makerspace_id(current_user)
        equipment_crud = get_equipment_crud(db)
        new_equipment = equipment_crud.create_equipment(
            makerspace_id=makerspace_id,
            equipment_data=equipment_data,
            created_by_user_id=current_user.user_id,
            created_by_user_name=current_user.name,
        )
        return new_equipment
    except ValueError as exc:
        logger.warning(
            "Invalid equipment payload for makerspace %s",
            makerspace_id,
            extra={"error": str(exc)},
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_detail("INVALID_INPUT", str(exc)),
        ) from exc
    except Exception as exc:
        logger.exception(
            "Unexpected error while creating equipment for makerspace %s",
            makerspace_id,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_detail(
                "INTERNAL_ERROR",
                "An unexpected error occurred while creating equipment.",
            ),
        ) from exc


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
            status_code=status.HTTP_403_FORBIDDEN,
            detail=error_detail(
                "PERMISSION_DENIED", "Insufficient permissions to reserve equipment"
            ),
        )

    equipment = _fetch_equipment(
        db=db, equipment_id=equipment_id, current_user=current_user
    )

    try:
        if equipment.status != EquipmentStatus.AVAILABLE:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=error_detail(
                    "EQUIPMENT_UNAVAILABLE",
                    "Equipment is not available for reservation",
                ),
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

        return EquipmentReservationResponse.model_validate(
            reservation, from_attributes=True
        )
    except ValueError as exc:
        logger.warning(
            "Invalid reservation for equipment %s",
            equipment_id,
            extra={"error": str(exc)},
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_detail("INVALID_INPUT", str(exc)),
        ) from exc
    except Exception as exc:
        db.rollback()
        logger.exception(
            "Unexpected error while reserving equipment %s", equipment_id
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_detail(
                "INTERNAL_ERROR",
                "An unexpected error occurred while reserving equipment.",
            ),
        ) from exc


@router.get(
    "/{equipment_id}/reservations", response_model=List[EquipmentReservationResponse]
)
async def get_equipment_reservations(
    equipment_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get equipment reservations"""
    _fetch_equipment(db=db, equipment_id=equipment_id, current_user=current_user)

    reservations = (
        db.query(EquipmentReservation)
        .filter(EquipmentReservation.equipment_id == equipment_id)
        .all()
    )

    return [
        EquipmentReservationResponse.model_validate(res, from_attributes=True)
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
    equipment = _fetch_equipment(
        db=db, equipment_id=equipment_id, current_user=current_user
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
    # Ensure equipment exists and user has access
    _fetch_equipment(db=db, equipment_id=equipment_id, current_user=current_user)

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
    except ValueError as exc:
        logger.warning(
            "Invalid rating request for equipment %s",
            equipment_id,
            extra={"error": str(exc)},
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_detail("INVALID_INPUT", str(exc)),
        ) from exc
    except Exception as exc:
        logger.exception(
            "Unexpected error while creating rating for equipment %s",
            equipment_id,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_detail(
                "INTERNAL_ERROR",
                "An unexpected error occurred while creating the equipment rating.",
            ),
        ) from exc


# Helper functions
