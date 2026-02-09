# app/models/supplier_model.py
from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Supplier(Base):
    __tablename__ = "suppliers"
    __table_args__ = (
        Index('idx_suppliers_city', 'city'),
        Index('idx_suppliers_state', 'state'),
        Index('idx_suppliers_category', 'category_id'),
        Index('idx_suppliers_status', 'status'),
        Index('idx_suppliers_city_state', 'city', 'state'),  # Composite index for common filter combination
    )
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    supplier_type = Column(String(20), default="individual")  # individual|company (PF|PJ)
    fantasy_name = Column(String(150), nullable=False)
    legal_name = Column(String(150), nullable=True)  # Razão Social (apenas PJ)
    cnpj = Column(String(18), nullable=True)  # CNPJ (apenas PJ)
    description = Column(Text)
    category_id = Column(Integer, ForeignKey("categories.id"))
    address = Column(String(255), nullable=True)  # Endereço completo
    zip_code = Column(String(10), nullable=True)  # CEP
    city = Column(String(100), nullable=False) 
    state = Column(String(100), nullable=False)
    price_range = Column(String(100), nullable=True)
    phone = Column(String(50),nullable=False)
    email = Column(String(120), nullable=False)
    instagram_url = Column(String(255))
    whatsapp_url = Column(String(255))
    site_url = Column(String(255))
    status = Column(String(20), default="active")  # active|pending|blocked
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="supplier")
    category = relationship("Category")
