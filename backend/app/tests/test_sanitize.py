# app/tests/test_sanitize.py
"""
Tests for HTML sanitization.
"""
import pytest
from app.utils.sanitize import sanitize_html, sanitize_dict


def test_sanitize_html_script_tag():
    """Test that script tags are escaped."""
    input_text = "<script>alert('XSS')</script>"
    result = sanitize_html(input_text)
    assert "<script>" not in result
    assert "&lt;script&gt;" in result


def test_sanitize_html_normal_text():
    """Test that normal text is not modified."""
    input_text = "This is normal text"
    result = sanitize_html(input_text)
    assert result == input_text


def test_sanitize_html_html_tags():
    """Test that HTML tags are escaped."""
    input_text = "<div>Hello</div>"
    result = sanitize_html(input_text)
    assert "<div>" not in result
    assert "&lt;div&gt;" in result


def test_sanitize_dict():
    """Test that dictionary values are sanitized."""
    input_dict = {
        "name": "John",
        "description": "<script>alert('XSS')</script>",
        "comment": "Normal text"
    }
    result = sanitize_dict(input_dict)
    assert result["name"] == "John"
    assert "<script>" not in result["description"]
    assert "&lt;script&gt;" in result["description"]
    assert result["comment"] == "Normal text"


def test_sanitize_dict_nested():
    """Test that nested dictionaries are sanitized."""
    input_dict = {
        "user": {
            "name": "John",
            "bio": "<script>alert('XSS')</script>"
        }
    }
    result = sanitize_dict(input_dict)
    assert result["user"]["name"] == "John"
    assert "<script>" not in result["user"]["bio"]
