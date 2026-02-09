# app/utils/phone_validator.py
"""
Phone number validation utilities.
"""
import re


def validate_phone(phone: str) -> tuple[bool, str]:
    """
    Validate phone number format.
    Requirements:
    - Must contain 10-15 digits
    - Can include common formatting characters: +, -, spaces, parentheses
    
    Args:
        phone: Phone number string
        
    Returns:
        tuple[bool, str]: (is_valid, error_message)
    """
    if not phone:
        return False, "Phone number is required"
    
    # Remove common formatting characters to count digits
    digits_only = re.sub(r'[^\d]', '', phone)
    
    if len(digits_only) < 10:
        return False, "Phone number must contain at least 10 digits"
    
    if len(digits_only) > 15:
        return False, "Phone number must contain at most 15 digits"
    
    # Check if contains only valid characters (digits and formatting)
    if not re.match(r'^[\d\s\+\-\(\)]+$', phone):
        return False, "Phone number contains invalid characters"
    
    return True, ""
