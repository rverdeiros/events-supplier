# app/services/review_service.py
"""
Business logic for review operations.
"""
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.review_model import Review


def calculate_average_rating(supplier_id: int, db: Session) -> float | None:
    """
    Calculate average rating for a supplier based on approved reviews only.
    
    Args:
        supplier_id: ID of the supplier
        db: Database session
        
    Returns:
        float: Average rating rounded to 1 decimal place, or None if no approved reviews
    """
    result = (
        db.query(func.avg(Review.rating))
        .filter(
            Review.supplier_id == supplier_id,
            Review.status == "approved"
        )
        .scalar()
    )
    
    if result is None:
        return None
    
    # Round to 1 decimal place
    return round(float(result), 1)
