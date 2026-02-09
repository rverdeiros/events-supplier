# app/schemas/contact_form_schema.py
"""
Pydantic schemas for Contact Form validation.
"""
from pydantic import BaseModel, EmailStr, Field, model_validator
from typing import Optional, List, Dict, Any, Literal
from datetime import datetime


class QuestionItem(BaseModel):
    """
    Schema for a single question in the form.
    
    Supported types:
    - text: Single line text input
    - textarea: Multi-line text input
    - email: Email input with validation
    - phone: Phone number input
    - number: Numeric input
    - select: Single select dropdown (requires options)
    - multiselect: Multiple choice dropdown (requires options)
    - radio: Radio buttons for single selection (requires options)
    - checkbox: Checkboxes for multiple selection (requires options)
    - date: Date picker
    - datetime: Date and time picker
    """
    question: str = Field(..., min_length=1, description="The question text")
    type: Literal[
        "text", "textarea", "email", "phone", "number",
        "select", "multiselect", "radio", "checkbox",
        "date", "datetime"
    ] = Field(..., description="Question input type")
    required: bool = Field(False, description="Whether this field is required")
    placeholder: Optional[str] = Field(None, description="Placeholder text for the input")
    options: Optional[List[str]] = Field(
        None,
        description="Options for select/multiselect/radio/checkbox types. Required for these types."
    )
    min_value: Optional[float] = Field(None, description="Minimum value for number type")
    max_value: Optional[float] = Field(None, description="Maximum value for number type")
    min_length: Optional[int] = Field(None, description="Minimum length for text/textarea")
    max_length: Optional[int] = Field(None, description="Maximum length for text/textarea")
    
    @model_validator(mode='after')
    def validate_options(self):
        """Validate that options are provided for types that require them."""
        types_requiring_options = ['select', 'multiselect', 'radio', 'checkbox']
        if self.type in types_requiring_options:
            if not self.options or len(self.options) == 0:
                raise ValueError(f"Type '{self.type}' requires 'options' field with at least one option")
        return self


class ContactFormCreate(BaseModel):
    """Schema for creating/updating contact form."""
    questions: List[QuestionItem] = Field(default_factory=list, max_length=20)  # Max 20 questions
    active: Optional[bool] = True
    
    @model_validator(mode='after')
    def validate_question_limit(self):
        """Validate that form has maximum 20 questions."""
        if len(self.questions) > 20:
            raise ValueError("Contact form can have maximum 20 questions")
        return self


class ContactFormResponse(BaseModel):
    """Schema for contact form response."""
    id: int
    supplier_id: int
    questions: List[Dict[str, Any]]  # Parsed JSON questions
    active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class ContactFormSubmissionCreate(BaseModel):
    """Schema for submitting a contact form.
    Note: contact_form_id comes from URL path, not body.
    """
    answers: Dict[str, Any]  # Key-value pairs: question_id -> answer
    submitter_name: Optional[str] = None
    submitter_email: Optional[EmailStr] = None
    submitter_phone: Optional[str] = None


class ContactFormSubmissionResponse(BaseModel):
    """Schema for submission response."""
    id: int
    contact_form_id: int
    answers: Dict[str, Any]
    submitter_name: Optional[str]
    submitter_email: Optional[str]
    submitter_phone: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True
