# app/routes/auth_routes.py
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user_model import User
from app.schemas.user_schema import UserRegister, UserLogin, UserResponse
from app.utils.password_handler import hash_password, verify_password
from app.utils.jwt_handler import create_access_token
from app.utils.auth_dependency import get_current_user
from app.core.middleware import login_rate_limit

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=dict)
def register(data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user."""
    # Password validation is handled by Pydantic schema
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    user = User(
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        type=data.type or "client"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {
        "success": True,
        "message": "User registered successfully",
        "data": UserResponse.model_validate(user)
    }

@router.post("/login")
@login_rate_limit
def login(data: UserLogin, request: Request, db: Session = Depends(get_db)):
    """Login and get access token. Rate limited: 5 attempts per 15 minutes per IP."""
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    token = create_access_token({"sub": str(user.id), "type": user.type})
    return {
        "success": True,
        "access_token": token,
        "token_type": "bearer"
    }

@router.get("/me", response_model=dict)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current authenticated user information."""
    return {
        "success": True,
        "data": UserResponse.model_validate(current_user)
    }

@router.get("/users", response_model=dict)
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all users (admin only)."""
    if current_user.type != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    users = db.query(User).order_by(User.created_at.desc()).all()
    return {
        "success": True,
        "data": [UserResponse.model_validate(u) for u in users]
    }

@router.delete("/users/{id}")
def delete_user(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a user (admin only)."""
    if current_user.type != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    user = db.get(User, id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    db.delete(user)
    db.commit()
    return {
        "success": True,
        "message": "User deleted successfully"
    }

@router.get("/stats", response_model=dict)
def get_platform_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get platform statistics (admin only)."""
    if current_user.type != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    
    from sqlalchemy import func
    from app.models.supplier_model import Supplier
    from app.models.review_model import Review
    from app.models.category_model import Category
    from app.models.contact_form_model import ContactFormSubmission
    
    # Count users by type
    total_users = db.query(func.count(User.id)).scalar()
    users_by_type = (
        db.query(User.type, func.count(User.id))
        .group_by(User.type)
        .all()
    )
    users_by_type_dict = {t: c for t, c in users_by_type}
    
    # Count suppliers
    total_suppliers = db.query(func.count(Supplier.id)).scalar()
    active_suppliers = db.query(func.count(Supplier.id)).filter(Supplier.status == "active").scalar()
    
    # Count reviews
    total_reviews = db.query(func.count(Review.id)).scalar()
    pending_reviews = db.query(func.count(Review.id)).filter(Review.status == "pending").scalar()
    approved_reviews = db.query(func.count(Review.id)).filter(Review.status == "approved").scalar()
    
    # Count categories
    total_categories = db.query(func.count(Category.id)).scalar()
    active_categories = db.query(func.count(Category.id)).filter(Category.active == True).scalar()
    
    # Count submissions
    total_submissions = db.query(func.count(ContactFormSubmission.id)).scalar()
    unread_submissions = db.query(func.count(ContactFormSubmission.id)).filter(
        ContactFormSubmission.read == False
    ).scalar()
    
    return {
        "success": True,
        "data": {
            "users": {
                "total": total_users or 0,
                "by_type": {
                    "client": users_by_type_dict.get("client", 0),
                    "supplier": users_by_type_dict.get("supplier", 0),
                    "admin": users_by_type_dict.get("admin", 0),
                }
            },
            "suppliers": {
                "total": total_suppliers or 0,
                "active": active_suppliers or 0,
            },
            "reviews": {
                "total": total_reviews or 0,
                "pending": pending_reviews or 0,
                "approved": approved_reviews or 0,
            },
            "categories": {
                "total": total_categories or 0,
                "active": active_categories or 0,
            },
            "submissions": {
                "total": total_submissions or 0,
                "unread": unread_submissions or 0,
            }
        }
    }
