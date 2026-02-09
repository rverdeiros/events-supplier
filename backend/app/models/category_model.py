# app/models/category_model.py
from sqlalchemy import Column, Integer, String, Boolean
from app.database import Base

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False, unique=True)
    origin = Column(String(20), default="fixed")  # fixed | manual
    active = Column(Boolean, default=True)
