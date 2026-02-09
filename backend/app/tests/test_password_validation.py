# app/tests/test_password_validation.py
"""
Tests for password validation.
"""
import pytest
from app.utils.password_handler import validate_password


def test_password_too_short():
    """Test that password with less than 8 characters is rejected."""
    is_valid, error = validate_password("Short1")
    assert not is_valid
    assert "8 characters" in error


def test_password_no_uppercase():
    """Test that password without uppercase letter is rejected."""
    is_valid, error = validate_password("password123")
    assert not is_valid
    assert "uppercase" in error


def test_password_no_number():
    """Test that password without number is rejected."""
    is_valid, error = validate_password("Password")
    assert not is_valid
    assert "number" in error


def test_password_valid():
    """Test that valid password is accepted."""
    is_valid, error = validate_password("Password123")
    assert is_valid
    assert error == ""


def test_password_valid_with_special_chars():
    """Test that password with special characters is accepted."""
    is_valid, error = validate_password("Password123!")
    assert is_valid
    assert error == ""
