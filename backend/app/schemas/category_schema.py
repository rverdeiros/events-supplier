# app/schemas/category_schema.py
"""
Pydantic schemas for Category validation.
"""
from pydantic import BaseModel
from typing import Optional


class CategoryBase(BaseModel):
    """Base schema with common category fields."""
    name: str
    active: bool = True


class CategoryCreate(CategoryBase):
    """Schema for creating a new category."""
    origin: Optional[str] = "manual"  # Admin-created categories are "manual"


class CategoryUpdate(BaseModel):
    """Schema for updating category (all fields optional)."""
    name: Optional[str] = None
    active: Optional[bool] = None
    origin: Optional[str] = None


class CategoryResponse(CategoryBase):
    """Schema for category response."""
    id: int
    origin: str
    supplier_count: Optional[int] = 0  # Number of active suppliers in this category
    
    class Config:
        from_attributes = True
