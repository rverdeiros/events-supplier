from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.contact_form_model import ContactForm, ContactFormSubmission
from app.models.supplier_model import Supplier
from app.schemas.contact_form_schema import (
    ContactFormCreate,
    ContactFormResponse,
    ContactFormSubmissionCreate,
    ContactFormSubmissionResponse
)
from app.utils.auth_dependency import get_current_user
from app.utils.default_contact_form import get_default_contact_form_questions
from app.models.user_model import User
from app.core.middleware import contact_form_rate_limit
from app.utils.sanitize import sanitize_dict
from app.services.contact_form_service import validate_form_submission
import json

router = APIRouter(prefix="/contact-forms", tags=["contact_forms"])


@router.get("/default-template")
def get_default_template():
    """
    Get the default contact form template (public endpoint).
    Suppliers can use this as a starting point and customize it.
    """
    default_questions = get_default_contact_form_questions()
    return {
        "success": True,
        "data": {
            "questions": default_questions,
            "description": "This is the default contact form template. You can customize it when creating your form."
        }
    }


@router.post("", response_model=dict)
def create_contact_form(
    form_data: ContactFormCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a contact form for a supplier (supplier owner only).
    Each supplier can have only one contact form.
    """
    # Check if supplier exists and user owns it
    supplier = db.query(Supplier).filter(Supplier.user_id == current_user.id).first()
    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="You must create a supplier profile first"
        )

    # Check if form already exists
    existing_form = db.query(ContactForm).filter(ContactForm.supplier_id == supplier.id).first()
    if existing_form:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Contact form already exists. Use PUT to update it."
        )

    # Use default template if no questions provided
    if not form_data.questions or len(form_data.questions) == 0:
        questions_data = get_default_contact_form_questions()
    else:
        questions_data = [q.model_dump() for q in form_data.questions]

    # Serialize questions to JSON
    questions_json = json.dumps(questions_data)

    new_form = ContactForm(
        supplier_id=supplier.id,
        questions_json=questions_json,
        active=form_data.active
    )
    db.add(new_form)
    db.commit()
    db.refresh(new_form)

    # Parse questions back for response
    questions = json.loads(new_form.questions_json)

    return {
        "success": True,
        "message": "Contact form created successfully",
        "data": {
            "id": new_form.id,
            "supplier_id": new_form.supplier_id,
            "questions": questions,
            "active": new_form.active,
            "created_at": new_form.created_at,
            "updated_at": new_form.updated_at
        }
    }


@router.get("/supplier/{supplier_id}", response_model=dict)
def get_supplier_contact_form(
    supplier_id: int,
    db: Session = Depends(get_db),
):
    """
    Get active contact form for a supplier (public endpoint).
    """
    supplier = db.get(Supplier, supplier_id)
    if not supplier:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found")

    form = db.query(ContactForm).filter(
        ContactForm.supplier_id == supplier_id,
        ContactForm.active == True
    ).first()

    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active contact form found for this supplier"
        )

    questions = json.loads(form.questions_json)

    return {
        "success": True,
        "data": {
            "id": form.id,
            "supplier_id": form.supplier_id,
            "questions": questions,
            "active": form.active
        }
    }


@router.put("/{id}", response_model=dict)
def update_contact_form(
    id: int,
    form_data: ContactFormCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update a contact form (supplier owner only).
    """
    form = db.get(ContactForm, id)
    if not form:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact form not found")

    # Check ownership
    supplier = db.get(Supplier, form.supplier_id)
    if supplier.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own contact form"
        )

    # Update questions
    questions_json = json.dumps([q.model_dump() for q in form_data.questions])
    form.questions_json = questions_json
    form.active = form_data.active

    db.commit()
    db.refresh(form)

    questions = json.loads(form.questions_json)

    return {
        "success": True,
        "message": "Contact form updated successfully",
        "data": {
            "id": form.id,
            "supplier_id": form.supplier_id,
            "questions": questions,
            "active": form.active,
            "updated_at": form.updated_at
        }
    }


@router.delete("/{id}")
def delete_contact_form(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete a contact form (supplier owner or admin only).
    """
    form = db.get(ContactForm, id)
    if not form:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact form not found")

    # Check ownership or admin
    supplier = db.get(Supplier, form.supplier_id)
    if supplier.user_id != current_user.id and current_user.type != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own contact form"
        )

    db.delete(form)
    db.commit()
    return {
        "success": True,
        "message": "Contact form deleted successfully"
    }


@router.post("/{id}/reset-to-default", response_model=dict)
def reset_form_to_default(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Reset a contact form to the default template (supplier owner only).
    This will replace all questions with the default template.
    """
    form = db.get(ContactForm, id)
    if not form:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact form not found")

    # Check ownership
    supplier = db.get(Supplier, form.supplier_id)
    if supplier.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only reset your own contact form"
        )

    # Reset to default template
    default_questions = get_default_contact_form_questions()
    form.questions_json = json.dumps(default_questions)

    db.commit()
    db.refresh(form)

    questions = json.loads(form.questions_json)

    return {
        "success": True,
        "message": "Contact form reset to default template",
        "data": {
            "id": form.id,
            "supplier_id": form.supplier_id,
            "questions": questions,
            "active": form.active,
            "updated_at": form.updated_at
        }
    }


@router.post("/{id}/submit", response_model=dict)
@contact_form_rate_limit
def submit_contact_form(
    id: int,
    submission_data: ContactFormSubmissionCreate,
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Submit a contact form (public endpoint).
    Rate limited: 3 submissions per hour per IP.
    Note: contact_form_id in body is ignored; uses path parameter instead.
    """
    form = db.get(ContactForm, id)
    if not form:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact form not found")

    if not form.active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This contact form is not active"
        )

    # Validate answers against form questions
    is_valid, error_message = validate_form_submission(form, submission_data.answers)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_message
        )

    # Sanitize answers to prevent XSS
    sanitized_answers = sanitize_dict(submission_data.answers)
    
    # Serialize answers to JSON
    answers_json = json.dumps(sanitized_answers)

    new_submission = ContactFormSubmission(
        contact_form_id=id,  # Use path parameter, not body
        answers_json=answers_json,
        submitter_name=submission_data.submitter_name,
        submitter_email=submission_data.submitter_email,
        submitter_phone=submission_data.submitter_phone
    )
    db.add(new_submission)
    db.commit()
    db.refresh(new_submission)

    answers = json.loads(new_submission.answers_json)

    return {
        "success": True,
        "message": "Form submitted successfully",
        "data": {
            "id": new_submission.id,
            "contact_form_id": new_submission.contact_form_id,
            "answers": answers,
            "submitter_name": new_submission.submitter_name,
            "submitter_email": new_submission.submitter_email,
            "submitter_phone": new_submission.submitter_phone,
            "created_at": new_submission.created_at
        }
    }


@router.get("/{id}/submissions")
def list_form_submissions(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    read: bool | None = Query(None, description="Filter by read status"),
):
    """
    List submissions for a contact form (supplier owner or admin only).
    Can filter by read status.
    """
    form = db.get(ContactForm, id)
    if not form:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact form not found")

    # Check ownership or admin
    supplier = db.get(Supplier, form.supplier_id)
    if supplier.user_id != current_user.id and current_user.type != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view submissions for your own contact form"
        )

    query = db.query(ContactFormSubmission).filter(ContactFormSubmission.contact_form_id == id)
    
    # Filter by read status if provided
    if read is not None:
        query = query.filter(ContactFormSubmission.read == read)

    total = query.count()
    submissions = (
        query.order_by(ContactFormSubmission.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    data = []
    for sub in submissions:
        answers = json.loads(sub.answers_json)
        data.append({
            "id": sub.id,
            "contact_form_id": sub.contact_form_id,
            "answers": answers,
            "submitter_name": sub.submitter_name,
            "submitter_email": sub.submitter_email,
            "submitter_phone": sub.submitter_phone,
            "read": sub.read,
            "created_at": sub.created_at
        })

    # Count unread submissions
    unread_count = db.query(ContactFormSubmission).filter(
        ContactFormSubmission.contact_form_id == id,
        ContactFormSubmission.read == False
    ).count()

    return {
        "success": True,
        "data": data,
        "total": total,
        "unread_count": unread_count,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if page_size > 0 else 0,
    }


@router.put("/{id}/submissions/{submission_id}/mark-read", response_model=dict)
def mark_submission_read(
    id: int,
    submission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Mark a submission as read (supplier owner or admin only).
    """
    form = db.get(ContactForm, id)
    if not form:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact form not found")

    # Check ownership or admin
    supplier = db.get(Supplier, form.supplier_id)
    if supplier.user_id != current_user.id and current_user.type != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only mark submissions for your own contact form"
        )

    submission = db.get(ContactFormSubmission, submission_id)
    if not submission or submission.contact_form_id != id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")

    submission.read = True
    db.commit()
    db.refresh(submission)

    return {
        "success": True,
        "message": "Submission marked as read",
        "data": {
            "id": submission.id,
            "read": submission.read
        }
    }
