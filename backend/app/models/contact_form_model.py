#app/models/contact_form_model.py
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class ContactForm(Base):
    __tablename__ = "contact_forms"
    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False, unique=True)  # One form per supplier
    questions_json = Column(Text, nullable=False)  # Store questions template as JSON string
    active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    supplier = relationship("Supplier", backref="contact_form")


class ContactFormSubmission(Base):
    __tablename__ = "contact_form_submissions"
    id = Column(Integer, primary_key=True, index=True)
    contact_form_id = Column(Integer, ForeignKey("contact_forms.id"), nullable=False)
    answers_json = Column(Text, nullable=False)  # Store answers as JSON string
    submitter_name = Column(String(120))
    submitter_email = Column(String(120))
    submitter_phone = Column(String(50))
    read = Column(Boolean, default=False)  # Track if submission has been read
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    contact_form = relationship("ContactForm", backref="submissions")