from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database import get_db
from app.models.review_model import Review
from app.models.supplier_model import Supplier
from app.schemas.review_schema import ReviewCreate, ReviewResponse, ReviewWithUser, ReviewUpdate
from app.utils.auth_dependency import get_current_user
from app.models.user_model import User
from app.core.middleware import review_rate_limit
from app.utils.sanitize import sanitize_html
from app.services.review_service import calculate_average_rating

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.post("", response_model=dict)
@review_rate_limit
def create_review(
    review_data: ReviewCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new review (authenticated users only).
    Reviews start with status="pending" and need admin approval.
    Rate limited: 10 reviews per hour per user.
    """
    # Verify supplier exists
    supplier = db.get(Supplier, review_data.supplier_id)
    if not supplier:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found")

    # Check if user already reviewed this supplier
    existing_review = db.query(Review).filter(
        Review.user_id == current_user.id,
        Review.supplier_id == review_data.supplier_id
    ).first()
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already reviewed this supplier"
        )

    new_review = Review(
        user_id=current_user.id,
        supplier_id=review_data.supplier_id,
        rating=review_data.rating,
        comment=sanitize_html(review_data.comment),  # Sanitize HTML to prevent XSS
        status="pending"
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    return {
        "success": True,
        "message": "Review submitted successfully. Awaiting moderation.",
        "data": ReviewResponse.model_validate(new_review)
    }


@router.get("/supplier/{supplier_id}")
def list_supplier_reviews(
    supplier_id: int,
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
):
    """
    List approved reviews for a specific supplier (public endpoint).
    Only shows reviews with status="approved".
    """
    # Verify supplier exists
    supplier = db.get(Supplier, supplier_id)
    if not supplier:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found")

    # Query only approved reviews
    query = db.query(Review).filter(
        Review.supplier_id == supplier_id,
        Review.status == "approved"
    )

    total = query.count()
    reviews = (
        query.order_by(Review.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    # Build response with user names
    data = [
        {
            "id": r.id,
            "rating": r.rating,
            "comment": r.comment,
            "created_at": r.created_at,
            "user_name": r.user.name
        }
        for r in reviews
    ]

    return {
        "success": True,
        "data": data,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if page_size > 0 else 0,
    }


@router.get("/pending")
def list_pending_reviews(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
):
    """
    List pending reviews awaiting moderation (admin only).
    """
    if current_user.type != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    query = db.query(Review).filter(Review.status == "pending")

    total = query.count()
    reviews = (
        query.order_by(Review.created_at.asc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    data = [
        {
            "id": r.id,
            "user_id": r.user_id,
            "user_name": r.user.name,
            "supplier_id": r.supplier_id,
            "supplier_name": r.supplier.fantasy_name,
            "rating": r.rating,
            "comment": r.comment,
            "status": r.status,
            "created_at": r.created_at,
        }
        for r in reviews
    ]

    return {
        "success": True,
        "data": data,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if page_size > 0 else 0,
    }


@router.get("/all")
def list_all_reviews(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    status_filter: str = Query(None, description="Filter by status: pending, approved, rejected, or all"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
):
    """
    List all reviews with optional status filter (admin only).
    """
    if current_user.type != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    query = db.query(Review)
    
    # Apply status filter if provided
    if status_filter and status_filter.lower() != "all":
        valid_statuses = ["pending", "approved", "rejected"]
        if status_filter.lower() not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status filter. Must be one of: {', '.join(valid_statuses)}, or 'all'"
            )
        query = query.filter(Review.status == status_filter.lower())

    total = query.count()
    reviews = (
        query.order_by(Review.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    data = [
        {
            "id": r.id,
            "user_id": r.user_id,
            "user_name": r.user.name,
            "supplier_id": r.supplier_id,
            "supplier_name": r.supplier.fantasy_name,
            "rating": r.rating,
            "comment": r.comment,
            "status": r.status,
            "created_at": r.created_at,
        }
        for r in reviews
    ]

    return {
        "success": True,
        "data": data,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if page_size > 0 else 0,
    }


@router.put("/{id}/approve", response_model=dict)
def approve_review(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Approve a pending review (admin only)."""
    if current_user.type != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    review = db.get(Review, id)
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")

    if review.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Review is already {review.status}"
        )

    review.status = "approved"
    db.commit()
    db.refresh(review)
    
    # Recalculate average rating for the supplier
    # Note: We calculate dynamically, so no need to store in supplier model for MVP
    # This could be optimized later with a cached field
    
    return {
        "success": True,
        "message": "Review approved successfully",
        "data": ReviewResponse.model_validate(review)
    }


@router.put("/{id}/reject", response_model=dict)
def reject_review(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Reject a pending review (admin only)."""
    if current_user.type != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    review = db.get(Review, id)
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")

    if review.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Review is already {review.status}"
        )

    review.status = "rejected"
    db.commit()
    db.refresh(review)
    
    # Recalculate average rating for the supplier (if it was approved before)
    # Note: We calculate dynamically, so no need to store in supplier model for MVP
    
    return {
        "success": True,
        "message": "Review rejected successfully",
        "data": ReviewResponse.model_validate(review)
    }


@router.put("/{id}", response_model=dict)
def update_review(
    id: int,
    review_data: ReviewUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update a review (user can edit own review within 24h, admin can edit any review).
    After edit, review status returns to "pending" for re-approval.
    """
    review = db.get(Review, id)
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    
    # Check ownership or admin
    if review.user_id != current_user.id and current_user.type != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own reviews"
        )
    
    # Check 24-hour window for non-admin users
    if current_user.type != "admin":
        time_diff = datetime.utcnow() - review.created_at.replace(tzinfo=None)
        if time_diff > timedelta(hours=24):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Review can only be edited within 24 hours of creation"
            )
    
    # Update fields
    update_data = review_data.model_dump(exclude_unset=True)
    if "rating" in update_data:
        review.rating = update_data["rating"]
    if "comment" in update_data:
        review.comment = sanitize_html(update_data["comment"])  # Sanitize HTML
    
    # After edit, status returns to "pending" for re-approval
    review.status = "pending"
    
    db.commit()
    db.refresh(review)
    
    return {
        "success": True,
        "message": "Review updated successfully. It will be reviewed again.",
        "data": ReviewResponse.model_validate(review)
    }


@router.delete("/{id}", response_model=dict)
def delete_review(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete a review (user can delete own review, admin can delete any review).
    After deletion, average rating is recalculated.
    """
    review = db.get(Review, id)
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    
    # Check ownership or admin
    if review.user_id != current_user.id and current_user.type != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own reviews"
        )
    
    supplier_id = review.supplier_id
    db.delete(review)
    db.commit()
    
    # Recalculate average rating for the supplier
    # Note: We calculate dynamically, so no need to store in supplier model for MVP
    
    return {
        "success": True,
        "message": "Review deleted successfully"
    }


@router.get("/approved")
def list_approved_reviews(
    db: Session = Depends(get_db),
    limit: int = Query(10, ge=1, le=50, description="Maximum number of reviews to return"),
):
    """
    List recent approved reviews from all suppliers (public endpoint).
    Useful for homepage carousel.
    """
    reviews = (
        db.query(Review)
        .filter(Review.status == "approved")
        .order_by(Review.created_at.desc())
        .limit(limit)
        .all()
    )

    # Build response with user and supplier names
    data = [
        {
            "id": r.id,
            "rating": r.rating,
            "comment": r.comment,
            "created_at": r.created_at,
            "user_name": r.user.name,
            "supplier_id": r.supplier_id,
            "supplier_name": r.supplier.fantasy_name,
        }
        for r in reviews
    ]

    return {
        "success": True,
        "data": data,
        "total": len(data),
    }