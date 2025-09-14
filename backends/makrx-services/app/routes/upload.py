"""
File Upload API Routes
Handles file uploads for service orders
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
import os
import uuid
import magic
from pathlib import Path

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.config import get_settings
from app.models.users import User

router = APIRouter()
settings = get_settings()

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    orderType: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload file for service order"""
    try:
        # Validate file type
        file_extension = Path(file.filename).suffix.lower()
        if file_extension not in settings.ALLOWED_FILE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File type {file_extension} not allowed. Allowed types: {', '.join(settings.ALLOWED_FILE_TYPES)}"
            )
        
        # Validate file size
        if file.size and file.size > settings.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File size too large. Maximum size: {settings.MAX_FILE_SIZE / 1024 / 1024:.1f}MB"
            )
        
        # Create upload directory
        upload_subdir = "stl" if orderType == "printing" else "svg"
        upload_dir = Path(settings.UPLOAD_DIR) / upload_subdir
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate unique filename
        file_id = str(uuid.uuid4())
        filename = f"{file_id}_{file.filename}"
        file_path = upload_dir / filename
        
        # Save file
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)
        
        # Create preview (mock - in production would generate real previews)
        preview_dir = Path(settings.UPLOAD_DIR) / "previews"
        preview_dir.mkdir(parents=True, exist_ok=True)
        preview_filename = f"{file_id}_preview.png"
        
        # Mock preview URL
        file_url = f"/uploads/{upload_subdir}/{filename}"
        preview_url = f"/uploads/previews/{preview_filename}"
        
        return {
            "url": file_url,
            "previewUrl": preview_url,
            "filename": file.filename,
            "size": len(content),
            "type": file.content_type
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}"
        )