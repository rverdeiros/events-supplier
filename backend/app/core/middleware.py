# app/core/middleware.py
"""
Rate limiting middleware using slowapi.
"""
from slowapi import Limiter
from slowapi.util import get_remote_address
from fastapi import Request

# Create limiter instance
limiter = Limiter(key_func=get_remote_address)

def get_user_id(request: Request) -> str:
    """Get user ID from request for user-based rate limiting."""
    # Try to get user from request state (set by auth dependency)
    # The auth dependency sets current_user in the dependency, not in request.state
    # For rate limiting by user, we'll use a different approach
    # Check if Authorization header exists and extract user from token if needed
    # For now, fallback to IP-based limiting for user-specific endpoints
    # This will be improved when we have better token extraction
    return get_remote_address(request)

# Rate limit decorators for specific endpoints
# Login: 5 attempts per 15 minutes per IP
login_rate_limit = limiter.limit("5/15minutes", key_func=get_remote_address)

# Reviews: 10 per hour per IP (will be improved to per-user when token extraction is available)
review_rate_limit = limiter.limit("10/hour", key_func=get_remote_address)

# Contact forms: 3 per hour per IP
contact_form_rate_limit = limiter.limit("3/hour", key_func=get_remote_address)
