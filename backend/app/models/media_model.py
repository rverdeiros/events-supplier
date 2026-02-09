# app/models/media_model.py
from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Media(Base):
    __tablename__ = "media_items"
    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    type = Column(String(50), nullable=False)  # image|video|document
    url = Column(String(255), nullable=False)
    upload_date = Column(DateTime(timezone=True), server_default=func.now())

    supplier = relationship("Supplier", backref="media_items")