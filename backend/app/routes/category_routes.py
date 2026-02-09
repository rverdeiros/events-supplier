from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.category_model import Category
from app.models.supplier_model import Supplier
from app.schemas.category_schema import CategoryCreate, CategoryUpdate, CategoryResponse
from app.utils.auth_dependency import get_current_user
from app.models.user_model import User

router = APIRouter(prefix="/categorias", tags=["categories"])

@router.get("")
def list_categories(
    db: Session = Depends(get_db),
    active: bool | None = Query(None),
    page: int = 1,
    page_size: int = 50,
):
    query = db.query(Category)
    if active is not None:
        query = query.filter(Category.active == active)

    total = query.count()
    items = (
        query.order_by(Category.name.asc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    # Count active suppliers for each category
    data = []
    for c in items:
        supplier_count = db.query(Supplier).filter(
            Supplier.category_id == c.id,
            Supplier.status == "active"
        ).count()
        
        data.append({
            "id": c.id,
            "name": c.name,
            "origin": c.origin,
            "active": c.active,
            "supplier_count": supplier_count,
        })

    return {
        "success": True,
        "data": data,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if page_size > 0 else 0,
    }


@router.post("", response_model=dict)
def create_category(
    category_data: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new category (admin only)."""
    if current_user.type != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    # Check if category name already exists
    existing = db.query(Category).filter(Category.name == category_data.name).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category name already exists")

    new_category = Category(**category_data.model_dump())
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return {
        "success": True,
        "message": "Category created successfully",
        "data": CategoryResponse.model_validate(new_category)
    }


@router.put("/{id}", response_model=dict)
def update_category(
    id: int,
    category_data: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a category (admin only)."""
    if current_user.type != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    category = db.get(Category, id)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    # Check if new name conflicts with existing category
    update_data = category_data.model_dump(exclude_unset=True)
    if "name" in update_data:
        existing = db.query(Category).filter(Category.name == update_data["name"], Category.id != id).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category name already exists")

    for field, value in update_data.items():
        setattr(category, field, value)

    db.commit()
    db.refresh(category)
    return {
        "success": True,
        "message": "Category updated successfully",
        "data": CategoryResponse.model_validate(category)
    }


@router.delete("/{id}")
def delete_category(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a category (admin only)."""
    if current_user.type != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    category = db.get(Category, id)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    # Check if any suppliers are using this category
    suppliers_count = db.query(Supplier).filter(Supplier.category_id == id).count()
    if suppliers_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete category: {suppliers_count} supplier(s) are using this category"
        )

    db.delete(category)
    db.commit()
    return {
        "success": True,
        "message": "Category deleted successfully"
    }