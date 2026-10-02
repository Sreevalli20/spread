import pytest
import pandas as pd
import numpy as np
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.services.data_profiler import DataProfiler
from app.models import ColumnRole


def test_detect_columns():
    """Test column detection with various data types"""
    df = pd.DataFrame({
        'date': pd.date_range('2023-01-01', periods=100),
        'revenue': np.random.uniform(100, 1000, 100),
        'cost': np.random.uniform(50, 500, 100),
        'region': ['North', 'South', 'East', 'West'] * 25,
        'product': ['A', 'B', 'C'] * 33 + ['A'],
        'status': ['completed', 'pending'] * 50
    })

    profiler = DataProfiler(df)
    columns = profiler.detect_columns()

    assert len(columns) == 6

    # Check that roles are detected correctly (order may vary)
    date_col = next((c for c in columns if c.name == 'date'), None)
    revenue_col = next((c for c in columns if c.name == 'revenue'), None)
    cost_col = next((c for c in columns if c.name == 'cost'), None)
    region_col = next((c for c in columns if c.name == 'region'), None)

    assert date_col is not None
    assert date_col.role == ColumnRole.DATE
    assert revenue_col is not None
    assert revenue_col.role == ColumnRole.REVENUE
    assert cost_col is not None
    assert cost_col.role == ColumnRole.COST
    assert region_col is not None
    assert region_col.role == ColumnRole.REGION


def test_missing_values():
    """Test missing value detection"""
    df = pd.DataFrame({
        'revenue': [100, 200, np.nan, 400, 500],
        'cost': [50, np.nan, 150, 200, 250]
    })

    profiler = DataProfiler(df)
    columns = profiler.detect_columns()

    revenue_col = next(c for c in columns if c.name == 'revenue')
    cost_col = next(c for c in columns if c.name == 'cost')

    assert revenue_col.missing_count == 1
    assert revenue_col.missing_percentage == 20.0
    assert cost_col.missing_count == 1
    assert cost_col.missing_percentage == 20.0


def test_constant_columns():
    """Test constant column detection"""
    df = pd.DataFrame({
        'revenue': [100, 200, 300, 400, 500],
        'constant': [10, 10, 10, 10, 10]
    })

    profiler = DataProfiler(df)
    columns = profiler.detect_columns()

    constant_col = next(c for c in columns if c.name == 'constant')
    assert constant_col.is_constant == True


def test_data_quality_score():
    """Test data quality score calculation"""
    df = pd.DataFrame({
        'revenue': [100, 200, 300, 400, 500],
        'cost': [50, 100, 150, 200, 250]
    })

    profiler = DataProfiler(df)
    quality = profiler.calculate_data_quality()

    assert quality.score == 100.0
    assert quality.row_count == 5
    assert quality.column_count == 2
    assert quality.missing_cells == 0


def test_data_quality_with_issues():
    """Test data quality score with issues"""
    df = pd.DataFrame({
        'revenue': [100, 200, np.nan, 400, 500],
        'cost': [50, 100, 150, 200, 250],
        'constant': [10, 10, 10, 10, 10]
    })

    profiler = DataProfiler(df)
    quality = profiler.calculate_data_quality()

    assert quality.score < 100.0
    assert quality.missing_cells == 1
    assert quality.constant_columns == 1
    assert len(quality.reasons) > 0


def test_empty_dataframe():
    """Test handling of empty dataframe"""
    df = pd.DataFrame()

    profiler = DataProfiler(df)
    columns = profiler.detect_columns()

    assert len(columns) == 0


def test_duplicate_rows():
    """Test duplicate row detection"""
    df = pd.DataFrame({
        'revenue': [100, 200, 100, 400, 200],
        'cost': [50, 100, 50, 200, 100]
    })

    profiler = DataProfiler(df)
    quality = profiler.calculate_data_quality()

    assert quality.duplicate_rows == 2


def test_infinite_values():
    """Test infinite value detection"""
    df = pd.DataFrame({
        'revenue': [100, 200, np.inf, 400, -np.inf],
        'cost': [50, 100, 150, 200, 250]
    })

    profiler = DataProfiler(df)
    quality = profiler.calculate_data_quality()

    assert quality.infinite_values == 2
