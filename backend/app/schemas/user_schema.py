# app/schemas/user_schema.py
"""
Pydantic schemas for User validation.
"""
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime
from app.utils.password_handler import validate_password


class UserRegister(BaseModel):
    """Schema for user registration."""
    name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters with 1 uppercase and 1 number")
    type: Optional[str] = Field("client", pattern="^(client|supplier|admin)$")
    
    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        """Validate password meets requirements: min 8 chars, 1 uppercase, 1 number."""
        is_valid, error_message = validate_password(v)
        if not is_valid:
            raise ValueError(error_message)
        return v


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Schema for user response (without sensitive data)."""
    id: int
    name: str
    email: str
    type: str
    created_at: datetime
    
    class Config:
        from_attributes = True
