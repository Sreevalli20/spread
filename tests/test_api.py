import pytest
import pandas as pd
import numpy as np
import sys
import os
import io

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)


def test_health_endpoint():
    """Test health check endpoint"""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "decisionlens-api"
    assert "version" in data


def test_analyze_csv():
    """Test CSV file analysis"""
    # Create a test CSV
    df = pd.DataFrame({
        'date': pd.date_range('2023-01-01', periods=100),
        'revenue': np.random.uniform(100, 1000, 100),
        'cost': np.random.uniform(50, 500, 100),
        'region': ['North', 'South', 'East', 'West'] * 25,
        'product': ['A', 'B', 'C'] * 33 + ['A']
    })

    csv_buffer = io.BytesIO()
    df.to_csv(csv_buffer, index=False)
    csv_buffer.seek(0)

    files = {"file": ("test.csv", csv_buffer, "text/csv")}
    response = client.post("/api/analyze", files=files)

    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    assert "kpis" in data
    assert "findings" in data
    assert "evidence" in data


def test_analyze_empty_file():
    """Test analysis of empty file"""
    csv_buffer = io.BytesIO(b"")
    files = {"file": ("empty.csv", csv_buffer, "text/csv")}
    response = client.post("/api/analyze", files=files)

    assert response.status_code == 400


def test_analyze_invalid_file_type():
    """Test analysis of invalid file type"""
    files = {"file": ("test.txt", io.BytesIO(b"not a csv"), "text/plain")}
    response = client.post("/api/analyze", files=files)

    assert response.status_code == 400


def test_analyze_large_file():
    """Test file size validation"""
    # Create a large file (over 10 MB)
    large_data = "x" * (11 * 1024 * 1024)
    files = {"file": ("large.csv", io.BytesIO(large_data.encode()), "text/csv")}
    response = client.post("/api/analyze", files=files)

    assert response.status_code == 400


def test_analyze_malformed_csv():
    """Test analysis of malformed CSV"""
    malformed_csv = "header1,header2\nvalue1\nvalue2,value3,value4"  # Inconsistent columns
    files = {"file": ("malformed.csv", io.BytesIO(malformed_csv.encode()), "text/csv")}
    response = client.post("/api/analyze", files=files)

    # Should either succeed with parsing or fail gracefully
    assert response.status_code in [200, 400]


def test_analyze_missing_columns():
    """Test analysis with missing columns"""
    df = pd.DataFrame({
        'date': pd.date_range('2023-01-01', periods=100),
        'revenue': np.random.uniform(100, 1000, 100)
    })

    csv_buffer = io.BytesIO()
    df.to_csv(csv_buffer, index=False)
    csv_buffer.seek(0)

    files = {"file": ("test.csv", csv_buffer, "text/csv")}
    response = client.post("/api/analyze", files=files)

    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
