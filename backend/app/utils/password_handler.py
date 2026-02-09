# app/utils/password_handler.py
from passlib.context import CryptContext
import re

# Use PBKDF2-SHA256 to avoid bcrypt backend issues and 72-byte limit
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def validate_password(password: str) -> tuple[bool, str]:
    """
    Validate password strength.
    Requirements:
    - Minimum 8 characters
    - At least 1 uppercase letter
    - At least 1 number
    
    Returns:
        tuple[bool, str]: (is_valid, error_message)
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    
    if not re.search(r'[0-9]', password):
        return False, "Password must contain at least one number"
    
    return True, ""

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
