# app/schemas/supplier_schema.py
"""
Pydantic schemas for Supplier validation and serialization.

Key concepts:
- BaseModel: Pydantic's base class for data validation
- Optional: Fields that can be None
- from_attributes: Allows conversion from SQLAlchemy models to Pydantic
"""
from pydantic import BaseModel, EmailStr, HttpUrl, field_validator
from typing import Optional
from datetime import datetime
from app.utils.phone_validator import validate_phone


class SupplierBase(BaseModel):
    """
    Base schema with common supplier fields.
    This is shared between Create and Update schemas.
    """
    supplier_type: Optional[str] = "individual"  # individual|company (PF|PJ)
    fantasy_name: str  # Required field (matches model's fantasy_name)
    legal_name: Optional[str] = None  # Razão Social (apenas PJ)
    cnpj: Optional[str] = None  # CNPJ (apenas PJ, formato: XX.XXX.XXX/XXXX-XX)
    description: Optional[str] = None  # Optional field (can be None)
    category_id: Optional[int] = None
    address: Optional[str] = None  # Endereço completo
    zip_code: Optional[str] = None  # CEP (formato: XXXXX-XXX)
    city: str  # Required (nullable=False in model)
    state: str  # Required (nullable=False in model)
    price_range: Optional[str] = None  # String, not int (matches model)
    phone: str  # Required (nullable=False in model) - use str, PhoneNumber doesn't exist
    email: EmailStr  # Required (nullable=False in model) - EmailStr already validates!
    instagram_url: Optional[HttpUrl] = None  # HttpUrl already validates!
    whatsapp_url: Optional[HttpUrl] = None
    site_url: Optional[HttpUrl] = None
    
    @field_validator('phone')
    @classmethod
    def validate_phone_format(cls, v: str) -> str:
        """Validate phone number format: 10-15 digits."""
        is_valid, error_message = validate_phone(v)
        if not is_valid:
            raise ValueError(error_message)
        return v
    
    @field_validator('cnpj')
    @classmethod
    def validate_cnpj_format(cls, v: Optional[str]) -> Optional[str]:
        """Validate CNPJ format: XX.XXX.XXX/XXXX-XX or just numbers."""
        if v is None:
            return v
        # Remove formatting
        cnpj_clean = ''.join(filter(str.isdigit, v))
        if len(cnpj_clean) != 14:
            raise ValueError('CNPJ deve ter 14 dígitos')
        return v
    
    @field_validator('zip_code')
    @classmethod
    def validate_zip_code_format(cls, v: Optional[str]) -> Optional[str]:
        """Validate CEP format: XXXXX-XXX or XXXXXXXX."""
        if v is None:
            return v
        # Remove formatting
        zip_clean = ''.join(filter(str.isdigit, v))
        if len(zip_clean) != 8:
            raise ValueError('CEP deve ter 8 dígitos')
        return v


class SupplierCreate(SupplierBase):
    """
    Schema for creating a new supplier (POST /fornecedores).
    Inherits from SupplierBase - all base fields are included.
    Note: user_id is NOT here - we'll set it from the authenticated user!
    """
    pass  # For now, same as base. Add any create-specific fields if needed later.


class SupplierUpdate(BaseModel):
    """
    Schema for updating supplier (PUT /fornecedores/{id}).
    ALL fields are optional - user can update just what they want.
    """
    supplier_type: Optional[str] = None
    fantasy_name: Optional[str] = None
    legal_name: Optional[str] = None
    cnpj: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    address: Optional[str] = None
    zip_code: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    price_range: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    instagram_url: Optional[HttpUrl] = None
    whatsapp_url: Optional[HttpUrl] = None
    site_url: Optional[HttpUrl] = None
    
    @field_validator('phone')
    @classmethod
    def validate_phone_format(cls, v: Optional[str]) -> Optional[str]:
        """Validate phone number format: 10-15 digits."""
        if v is None:
            return v
        is_valid, error_message = validate_phone(v)
        if not is_valid:
            raise ValueError(error_message)
        return v
    
    @field_validator('cnpj')
    @classmethod
    def validate_cnpj_format(cls, v: Optional[str]) -> Optional[str]:
        """Validate CNPJ format: XX.XXX.XXX/XXXX-XX or just numbers."""
        if v is None:
            return v
        cnpj_clean = ''.join(filter(str.isdigit, v))
        if len(cnpj_clean) != 14:
            raise ValueError('CNPJ deve ter 14 dígitos')
        return v
    
    @field_validator('zip_code')
    @classmethod
    def validate_zip_code_format(cls, v: Optional[str]) -> Optional[str]:
        """Validate CEP format: XXXXX-XXX or XXXXXXXX."""
        if v is None:
            return v
        zip_clean = ''.join(filter(str.isdigit, v))
        if len(zip_clean) != 8:
            raise ValueError('CEP deve ter 8 dígitos')
        return v

class SupplierResponse(SupplierBase):
    """
    Schema for supplier response (what we return to frontend).
    Includes fields from base PLUS database-generated fields (id, user_id, status, created_at).
    """
    id: int
    user_id: int
    supplier_type: Optional[str] = "individual"
    legal_name: Optional[str] = None
    cnpj: Optional[str] = None
    address: Optional[str] = None
    zip_code: Optional[str] = None
    status: str
    created_at: datetime
    
    class Config:
        # This allows FastAPI to convert SQLAlchemy models to Pydantic automatically
        from_attributes = True
