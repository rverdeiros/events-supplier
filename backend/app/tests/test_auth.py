# app/tests/test_auth.py
"""
Tests for authentication endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_register_with_weak_password():
    """Test that registration with weak password is rejected."""
    response = client.post("/auth/register", json={
        "name": "Test User",
        "email": "test@example.com",
        "password": "weak",  # Too short
        "type": "client"
    })
    assert response.status_code == 422  # Validation error


def test_register_with_valid_password():
    """Test that registration with valid password succeeds."""
    response = client.post("/auth/register", json={
        "name": "Test User",
        "email": "test2@example.com",
        "password": "Password123",  # Valid: 8+ chars, uppercase, number
        "type": "client"
    })
    assert response.status_code == 200
    assert response.json()["success"] is True
