# app/models/review_model.py
from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, Index, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Review(Base):
    __tablename__ = "reviews"
    __table_args__ = (
        Index('idx_reviews_supplier', 'supplier_id'),
        Index('idx_reviews_status', 'status'),
        Index('idx_reviews_supplier_status', 'supplier_id', 'status'),  # Composite index for common filter
        UniqueConstraint('user_id', 'supplier_id', name='uq_user_supplier_review'),  # One review per user per supplier
    )
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=False)
    status = Column(String(20), default="pending")  # pending|approved|rejected
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
    supplier = relationship("Supplier")
