from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.media_model import Media
from app.models.supplier_model import Supplier
from app.schemas.media_schema import MediaCreate, MediaResponse
from app.utils.auth_dependency import get_current_user
from app.models.user_model import User
import os
import uuid
from pathlib import Path
from typing import Literal

router = APIRouter(prefix="/media", tags=["media"])

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("uploads/media")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Allowed file extensions by type
ALLOWED_EXTENSIONS = {
    "image": [".jpg", ".jpeg", ".png", ".gif", ".webp"],
    "video": [".mp4", ".webm", ".ogg"],
    "document": [".pdf", ".doc", ".docx", ".txt"]
}

def get_file_type(filename: str) -> str | None:
    """Determine file type based on extension."""
    ext = Path(filename).suffix.lower()
    for media_type, extensions in ALLOWED_EXTENSIONS.items():
        if ext in extensions:
            return media_type
    return None

def validate_file_type(file: UploadFile, expected_type: str) -> bool:
    """Validate that the uploaded file matches the expected type."""
    file_type = get_file_type(file.filename or "")
    return file_type == expected_type


@router.post("/upload", response_model=dict)
async def upload_media_file(
    supplier_id: int = Form(...),
    media_type: Literal["image", "video", "document"] = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Upload a media file for a supplier (supplier owner only).
    Limits: 20 images, 5 videos, 10 documents per supplier.
    """
    # Verify supplier exists
    supplier = db.get(Supplier, supplier_id)
    if not supplier:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found")

    # Check if user owns this supplier
    if supplier.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only add media to your own supplier profile"
        )

    # Validate file type matches expected type
    if not validate_file_type(file, media_type):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type does not match expected type '{media_type}'"
        )

    # Check media limits per type
    media_limits = {
        "image": 20,
        "video": 5,
        "document": 10
    }
    
    current_count = db.query(Media).filter(
        Media.supplier_id == supplier_id,
        Media.type == media_type
    ).count()
    
    limit = media_limits.get(media_type, 0)
    if current_count >= limit:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Maximum limit of {limit} {media_type}s reached for this supplier"
        )

    # Generate unique filename
    file_ext = Path(file.filename).suffix
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = UPLOAD_DIR / unique_filename

    # Save file
    try:
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving file: {str(e)}"
        )

    # Generate URL (relative to static files)
    file_url = f"/uploads/media/{unique_filename}"

    # Create media record
    new_media = Media(
        supplier_id=supplier_id,
        type=media_type,
        url=file_url
    )
    db.add(new_media)
    db.commit()
    db.refresh(new_media)
    
    return {
        "success": True,
        "message": "Media uploaded successfully",
        "data": MediaResponse.model_validate(new_media)
    }


@router.post("", response_model=dict)
def create_media(
    media_data: MediaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Upload media for a supplier (supplier owner only).
    Limits: 20 images, 5 videos, 10 documents per supplier.
    """
    # Verify supplier exists
    supplier = db.get(Supplier, media_data.supplier_id)
    if not supplier:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found")

    # Check if user owns this supplier
    if supplier.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only add media to your own supplier profile"
        )

    # Validate media type
    valid_types = ["image", "video", "document"]
    if media_data.type not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid media type. Must be one of: {', '.join(valid_types)}"
        )

    # Check media limits per type
    media_limits = {
        "image": 20,
        "video": 5,
        "document": 10
    }
    
    current_count = db.query(Media).filter(
        Media.supplier_id == media_data.supplier_id,
        Media.type == media_data.type
    ).count()
    
    limit = media_limits.get(media_data.type, 0)
    if current_count >= limit:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Maximum limit of {limit} {media_data.type}s reached for this supplier"
        )

    # Create media with serialized URL
    new_media = Media(
        supplier_id=media_data.supplier_id,
        type=media_data.type,
        url=str(media_data.url)  # Convert HttpUrl to string
    )
    db.add(new_media)
    db.commit()
    db.refresh(new_media)
    return {
        "success": True,
        "message": "Media uploaded successfully",
        "data": MediaResponse.model_validate(new_media)
    }


@router.get("/supplier/{supplier_id}")
def list_supplier_media(
    supplier_id: int,
    db: Session = Depends(get_db),
    type_filter: str | None = Query(None, description="Filter by type: image, video, or document"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
):
    """
    List media for a specific supplier (public endpoint).
    """
    # Verify supplier exists
    supplier = db.get(Supplier, supplier_id)
    if not supplier:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found")

    query = db.query(Media).filter(Media.supplier_id == supplier_id)

    # Apply type filter if provided
    if type_filter:
        if type_filter not in ["image", "video", "document"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid type filter. Must be: image, video, or document"
            )
        query = query.filter(Media.type == type_filter)

    total = query.count()
    media_items = (
        query.order_by(Media.upload_date.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    data = [MediaResponse.model_validate(m) for m in media_items]

    return {
        "success": True,
        "data": data,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if page_size > 0 else 0,
    }


@router.delete("/{id}")
def delete_media(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete media (supplier owner or admin only).
    """
    media = db.get(Media, id)
    if not media:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media not found")

    # Get the supplier to check ownership
    supplier = db.get(Supplier, media.supplier_id)
    if not supplier:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found")

    # Check if user owns the supplier or is admin
    if supplier.user_id != current_user.id and current_user.type != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete media from your own supplier profile"
        )

    db.delete(media)
    db.commit()
    return {
        "success": True,
        "message": "Media deleted successfully"
    }
