# app/schemas/media_schema.py
"""
Pydantic schemas for Media validation.
"""
from pydantic import BaseModel, HttpUrl, Field
from datetime import datetime
from typing import Literal


class MediaCreate(BaseModel):
    """Schema for creating media."""
    supplier_id: int
    type: Literal["image", "video", "document"] = Field(..., description="Media type: image, video, or document")
    url: HttpUrl = Field(..., description="URL to the media file")


class MediaResponse(BaseModel):
    """Schema for media response."""
    id: int
    supplier_id: int
    type: str
    url: str
    upload_date: datetime
    
    class Config:
        from_attributes = True
