from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func, case
from app.database import get_db
from app.models.supplier_model import Supplier
from app.models.category_model import Category
from app.models.review_model import Review
from app.models.contact_form_model import ContactForm
from app.schemas.supplier_schema import SupplierCreate, SupplierUpdate, SupplierResponse
from app.utils.auth_dependency import get_current_user
from app.utils.default_contact_form import get_default_contact_form_questions
from app.models.user_model import User
from app.utils.sanitize import sanitize_html
from app.services.supplier_service import calculate_completeness_score
import random
import json
import json

router = APIRouter(prefix="/fornecedores", tags=["suppliers"])

@router.get("/")
def list_suppliers(
    db: Session = Depends(get_db),
    city: str | None = Query(None, description="Filter by city"),
    state: str | None = Query(None, description="Filter by state"),
    category_id: int | None = Query(None, description="Filter by category ID"),
    price_range: str | None = Query(None, description="Filter by price range"),
    search: str | None = Query(None, description="Search by name, description, or city"),
    order_by: str = Query("created_at", description="Order by: 'created_at' or 'rating'"),
    random: bool = Query(False, description="Return random suppliers"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=50, description="Items per page"),
):
    """
    List suppliers with optional filters and pagination.
    Only returns suppliers with status='active'.
    Ordering options: 'created_at' (default, newest first) or 'rating' (highest rating first).
    """
    # Calculate average rating for each supplier (only approved reviews)
    avg_rating_subquery = (
        db.query(
            Review.supplier_id,
            func.avg(Review.rating).label('avg_rating')
        )
        .filter(Review.status == "approved")
        .group_by(Review.supplier_id)
        .subquery()
    )
    
    # Base query with left join to get average rating
    query = (
        db.query(
            Supplier,
            func.coalesce(avg_rating_subquery.c.avg_rating, 0).label('avg_rating')
        )
        .outerjoin(avg_rating_subquery, Supplier.id == avg_rating_subquery.c.supplier_id)
        .filter(Supplier.status == "active")
    )

    # Apply filters
    if city:
        query = query.filter(Supplier.city.ilike(f"%{city}%"))
    if state:
        query = query.filter(Supplier.state.ilike(f"%{state}%"))
    if category_id is not None:
        query = query.filter(Supplier.category_id == category_id)
    if price_range:
        query = query.filter(Supplier.price_range == price_range)
    
    # Search by name, description, or city
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Supplier.fantasy_name.ilike(search_term),
                Supplier.description.ilike(search_term),
                Supplier.city.ilike(search_term)
            )
        )

    total = query.count()
    
    # Apply ordering
    if random:
        # For random, we'll shuffle after getting results
        results = query.all()
        random.shuffle(results)
        # Apply pagination manually
        start = (page - 1) * page_size
        end = start + page_size
        results = results[start:end]
        suppliers = [r[0] for r in results]  # Extract Supplier from tuple
    else:
        if order_by == "rating":
            # Order by average rating (highest first), then by created_at
            query = query.order_by(
                func.coalesce(avg_rating_subquery.c.avg_rating, 0).desc(),
                Supplier.created_at.desc()
            )
        else:
            # Default: order by created_at (newest first)
            query = query.order_by(Supplier.created_at.desc())
        
        results = (
            query.offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )
        suppliers = [r[0] for r in results]  # Extract Supplier from tuple

    data = [SupplierResponse.model_validate(supplier) for supplier in suppliers]

    return {
        "success": True,
        "data": data,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if page_size > 0 else 0,
    }

@router.get("/me", response_model=dict)
def get_my_supplier(
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
):
	"""Get the current user's supplier profile with metrics (authenticated users only)."""
	supplier = db.query(Supplier).filter(Supplier.user_id == current_user.id).first()
	if not supplier:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier profile not found")
	
	# Calculate metrics
	# Average rating (only approved reviews)
	avg_rating = (
		db.query(func.avg(Review.rating))
		.filter(Review.supplier_id == supplier.id, Review.status == "approved")
		.scalar()
	)
	avg_rating = round(float(avg_rating), 1) if avg_rating else None
	
	# Total reviews count (approved)
	approved_reviews_count = (
		db.query(func.count(Review.id))
		.filter(Review.supplier_id == supplier.id, Review.status == "approved")
		.scalar()
	)
	
	# Total reviews count (all statuses)
	total_reviews_count = (
		db.query(func.count(Review.id))
		.filter(Review.supplier_id == supplier.id)
		.scalar()
	)
	
	# Get contact form to count submissions
	from app.models.contact_form_model import ContactForm, ContactFormSubmission
	contact_form = db.query(ContactForm).filter(ContactForm.supplier_id == supplier.id).first()
	
	total_submissions = 0
	unread_submissions = 0
	if contact_form:
		total_submissions = (
			db.query(func.count(ContactFormSubmission.id))
			.filter(ContactFormSubmission.contact_form_id == contact_form.id)
			.scalar()
		)
		unread_submissions = (
			db.query(func.count(ContactFormSubmission.id))
			.filter(
				ContactFormSubmission.contact_form_id == contact_form.id,
				ContactFormSubmission.read == False
			)
			.scalar()
		)
	
	# Calculate completeness score
	completeness = calculate_completeness_score(supplier)
	
	# Count media by type
	from app.models.media_model import Media
	images_count = db.query(func.count(Media.id)).filter(
		Media.supplier_id == supplier.id,
		Media.type == "image"
	).scalar()
	videos_count = db.query(func.count(Media.id)).filter(
		Media.supplier_id == supplier.id,
		Media.type == "video"
	).scalar()
	documents_count = db.query(func.count(Media.id)).filter(
		Media.supplier_id == supplier.id,
		Media.type == "document"
	).scalar()
	
	return {
		"success": True,
		"data": {
			"supplier": SupplierResponse.model_validate(supplier),
			"metrics": {
				"average_rating": avg_rating,
				"approved_reviews_count": approved_reviews_count or 0,
				"total_reviews_count": total_reviews_count or 0,
				"total_submissions": total_submissions,
				"unread_submissions": unread_submissions,
				"completeness_score": completeness["score"],
				"completeness_is_complete": completeness["is_complete"],
				"media_counts": {
					"images": images_count or 0,
					"videos": videos_count or 0,
					"documents": documents_count or 0,
				}
			}
		}
	}

@router.get("/{id}", response_model=dict)
def get_supplier(id: int, db: Session = Depends(get_db)):
	"""Get a single supplier by ID (public endpoint)."""
	supplier = db.query(Supplier).filter(Supplier.id == id).first()
	if not supplier:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found")
	return {
		"success": True,
		"data": SupplierResponse.model_validate(supplier)
	}

@router.post("/", response_model=dict)
def create_supplier(
	supplier_data: SupplierCreate,
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
):
	"""Create a new supplier (authenticated users only)."""
	# Check if user already has a supplier profile
	existing_supplier = db.query(Supplier).filter(Supplier.user_id == current_user.id).first()
	if existing_supplier:
		raise HTTPException(
			status_code=status.HTTP_400_BAD_REQUEST,
			detail="Você já possui um perfil de fornecedor cadastrado. Use a opção de editar para modificar seus dados."
		)
	
	# Dump using mode="json" so HttpUrl/EmailStr are serialized to strings
	payload = supplier_data.model_dump(mode="json")

	# Sanitize description if provided
	if "description" in payload and payload["description"]:
		payload["description"] = sanitize_html(payload["description"])

	# Validate category if provided (must exist and be active)
	category_id = payload.get("category_id")
	if category_id is not None:
		category = db.get(Category, category_id)
		if category is None:
			raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid category_id")
		if not category.active:
			raise HTTPException(
				status_code=status.HTTP_400_BAD_REQUEST,
				detail="Category is not active. Only active categories can be assigned to suppliers."
			)

	new_supplier = Supplier(**payload)
	new_supplier.user_id = current_user.id
	db.add(new_supplier)
	
	# Update user type to 'supplier' if they are currently a 'client'
	# This allows clients to become suppliers after creating a supplier profile
	if current_user.type == "client":
		current_user.type = "supplier"
		db.add(current_user)
	
	db.commit()
	db.refresh(new_supplier)
	
	# Create default contact form for the supplier automatically
	try:
		default_questions = get_default_contact_form_questions()
		questions_json = json.dumps(default_questions)
		
		default_form = ContactForm(
			supplier_id=new_supplier.id,
			questions_json=questions_json,
			active=True
		)
		db.add(default_form)
		db.commit()
	except Exception as e:
		# Log error but don't fail supplier creation if form creation fails
		# The supplier has already been committed, so we just log the warning
		# This ensures supplier is created even if there's an issue with form creation
		print(f"Warning: Could not create default contact form for supplier {new_supplier.id}: {e}")
		# Rollback only the form creation attempt, supplier is already saved
		db.rollback()
	
	return {
		"success": True,
		"message": "Supplier created successfully",
		"data": SupplierResponse.model_validate(new_supplier)
	}

@router.put("/{id}", response_model=dict)
def update_supplier(
	id: int,
	supplier_data: SupplierUpdate,
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
):
	"""Update a supplier (owner or admin only)."""
	supplier = db.query(Supplier).filter(Supplier.id == id).first()
	if not supplier:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found")

	if supplier.user_id != current_user.id and current_user.type != "admin":
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

	update_data = supplier_data.model_dump(exclude_unset=True, mode="json")

	# Sanitize description if being updated
	if "description" in update_data and update_data["description"]:
		update_data["description"] = sanitize_html(update_data["description"])

	# Validate category if being updated (must exist and be active)
	if "category_id" in update_data and update_data["category_id"] is not None:
		category = db.get(Category, update_data["category_id"])
		if category is None:
			raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid category_id")
		if not category.active:
			raise HTTPException(
				status_code=status.HTTP_400_BAD_REQUEST,
				detail="Category is not active. Only active categories can be assigned to suppliers."
			)

	for field, value in update_data.items():
		setattr(supplier, field, value)

	db.commit()
	db.refresh(supplier)
	return {
		"success": True,
		"message": "Supplier updated successfully",
		"data": SupplierResponse.model_validate(supplier)
	}

@router.delete("/{id}")
def delete_supplier(
	id: int,
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
):
	"""Delete a supplier (owner or admin only)."""
	supplier = db.query(Supplier).filter(Supplier.id == id).first()
	if not supplier:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found")

	if supplier.user_id != current_user.id and current_user.type != "admin":
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

	db.delete(supplier)
	db.commit()
	return {
			"success": True,
			"message": "Supplier deleted successfully"
		}

@router.get("/{id}/completeness", response_model=dict)
def get_supplier_completeness(
	id: int,
	db: Session = Depends(get_db),
):
	"""Get supplier profile completeness score (public endpoint)."""
	supplier = db.query(Supplier).filter(Supplier.id == id).first()
	if not supplier:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found")
	
	completeness = calculate_completeness_score(supplier)
	return {
		"success": True,
		"data": completeness
	}