# app/services/supplier_service.py
"""
Business logic for supplier operations.
"""
from app.models.supplier_model import Supplier


def calculate_completeness_score(supplier: Supplier) -> dict:
    """
    Calculate supplier profile completeness score.
    
    Scoring:
    - Required fields (20 points each): fantasy_name, city, state, phone, email = 100 points
    - Optional fields: category_id (+20), description min 50 chars (+20) = 40 points
    - Total possible: 140 points
    - Normalized to 0-100%
    
    Args:
        supplier: Supplier model instance
        
    Returns:
        dict: {
            "score": float,  # 0-100
            "max_score": int,  # 140
            "current_score": int,  # 0-140
            "missing_fields": list[str],  # List of missing required fields
            "recommendations": list[str]  # Suggestions to improve score
        }
    """
    score = 0
    max_score = 140
    missing_fields = []
    recommendations = []
    
    # Required fields (20 points each)
    required_fields = {
        "fantasy_name": supplier.fantasy_name,
        "city": supplier.city,
        "state": supplier.state,
        "phone": supplier.phone,
        "email": supplier.email,
    }
    
    for field_name, field_value in required_fields.items():
        if field_value:
            score += 20
        else:
            missing_fields.append(field_name)
    
    # Optional: category_id (+20 points)
    if supplier.category_id:
        score += 20
    else:
        recommendations.append("Adicione uma categoria para aumentar sua visibilidade")
    
    # Optional: description with minimum 50 characters (+20 points)
    if supplier.description and len(supplier.description.strip()) >= 50:
        score += 20
    else:
        recommendations.append("Adicione uma descrição detalhada (mínimo 50 caracteres)")
    
    # Normalize to 0-100%
    normalized_score = round((score / max_score) * 100, 1)
    
    return {
        "score": normalized_score,
        "max_score": max_score,
        "current_score": score,
        "missing_fields": missing_fields,
        "recommendations": recommendations,
        "is_complete": normalized_score == 100.0
    }
