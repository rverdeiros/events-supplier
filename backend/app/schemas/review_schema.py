# app/schemas/review_schema.py
"""
Pydantic schemas for Review validation.
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ReviewCreate(BaseModel):
    """Schema for creating a new review."""
    supplier_id: int
    rating: int = Field(..., ge=1, le=5, description="Rating must be between 1 and 5")
    comment: str = Field(..., min_length=10, description="Comment must be at least 10 characters")


class ReviewResponse(BaseModel):
    """Schema for review response."""
    id: int
    user_id: int
    supplier_id: int
    rating: int
    comment: str
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class ReviewUpdate(BaseModel):
    """Schema for updating a review."""
    rating: Optional[int] = Field(None, ge=1, le=5, description="Rating must be between 1 and 5")
    comment: Optional[str] = Field(None, min_length=10, description="Comment must be at least 10 characters")


class ReviewWithUser(BaseModel):
    """Review response with user information (for public listing)."""
    id: int
    rating: int
    comment: str
    created_at: datetime
    user_name: str
    
    class Config:
        from_attributes = True
