# app/utils/sanitize.py
"""
HTML sanitization utilities to prevent XSS attacks.
"""
import html


def sanitize_html(text: str) -> str:
    """
    Escape HTML special characters to prevent XSS attacks.
    
    Args:
        text: Input string that may contain HTML
        
    Returns:
        Escaped string safe for HTML display
    """
    if not text:
        return text
    return html.escape(str(text))


def sanitize_dict(data: dict) -> dict:
    """
    Recursively sanitize all string values in a dictionary.
    
    Args:
        data: Dictionary with potentially unsafe string values
        
    Returns:
        Dictionary with sanitized string values
    """
    if not isinstance(data, dict):
        return data
    
    sanitized = {}
    for key, value in data.items():
        if isinstance(value, str):
            sanitized[key] = sanitize_html(value)
        elif isinstance(value, dict):
            sanitized[key] = sanitize_dict(value)
        elif isinstance(value, list):
            sanitized[key] = [sanitize_dict(item) if isinstance(item, dict) else sanitize_html(item) if isinstance(item, str) else item for item in value]
        else:
            sanitized[key] = value
    return sanitized
