import pytest
import pandas as pd
import numpy as np
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.services.kpi_engine import KPIEngine
from app.services.data_profiler import DataProfiler


def test_revenue_kpi():
    """Test revenue KPI calculation"""
    df = pd.DataFrame({
        'revenue': [100, 200, 300, 400, 500],
        'cost': [50, 100, 150, 200, 250]
    })

    profiler = DataProfiler(df)
    kpi_engine = KPIEngine(df, profiler)
    kpis = kpi_engine.calculate_kpis()

    revenue_kpi = next((k for k in kpis if k.id == "kpi_revenue"), None)
    assert revenue_kpi is not None
    assert revenue_kpi.value == 1500.0
    assert revenue_kpi.calculation == "sum(revenue)"


def test_cost_kpi():
    """Test cost KPI calculation"""
    df = pd.DataFrame({
        'revenue': [100, 200, 300, 400, 500],
        'cost': [50, 100, 150, 200, 250]
    })

    profiler = DataProfiler(df)
    kpi_engine = KPIEngine(df, profiler)
    kpis = kpi_engine.calculate_kpis()

    cost_kpi = next((k for k in kpis if k.id == "kpi_cost"), None)
    assert cost_kpi is not None
    assert cost_kpi.value == 750.0
    assert cost_kpi.calculation == "sum(cost)"


def test_profit_kpi():
    """Test profit KPI calculation"""
    df = pd.DataFrame({
        'revenue': [100, 200, 300, 400, 500],
        'cost': [50, 100, 150, 200, 250]
    })

    profiler = DataProfiler(df)
    kpi_engine = KPIEngine(df, profiler)
    kpis = kpi_engine.calculate_kpis()

    profit_kpi = next((k for k in kpis if k.id == "kpi_profit"), None)
    assert profit_kpi is not None
    assert profit_kpi.value == 750.0


def test_gross_margin_kpi():
    """Test gross margin KPI calculation"""
    df = pd.DataFrame({
        'revenue': [100, 200, 300, 400, 500],
        'cost': [50, 100, 150, 200, 250]
    })

    profiler = DataProfiler(df)
    kpi_engine = KPIEngine(df, profiler)
    kpis = kpi_engine.calculate_kpis()

    margin_kpi = next((k for k in kpis if k.id == "kpi_gross_margin"), None)
    assert margin_kpi is not None
    assert margin_kpi.value == 50.0  # (1500 - 750) / 1500 * 100


def test_gross_margin_zero_denominator():
    """Test gross margin with zero revenue"""
    df = pd.DataFrame({
        'revenue': [0, 0, 0],
        'cost': [50, 100, 150]
    })

    profiler = DataProfiler(df)
    kpi_engine = KPIEngine(df, profiler)
    kpis = kpi_engine.calculate_kpis()

    margin_kpi = next((k for k in kpis if k.id == "kpi_gross_margin"), None)
    assert margin_kpi is None  # Should not calculate when revenue is zero


def test_units_kpi():
    """Test units KPI calculation"""
    df = pd.DataFrame({
        'quantity': [10, 20, 30, 40, 50],
        'revenue': [100, 200, 300, 400, 500]
    })

    profiler = DataProfiler(df)
    kpi_engine = KPIEngine(df, profiler)
    kpis = kpi_engine.calculate_kpis()

    units_kpi = next((k for k in kpis if k.id == "kpi_units"), None)
    assert units_kpi is not None
    assert units_kpi.value == 150.0


def test_average_order_value():
    """Test average order value calculation"""
    df = pd.DataFrame({
        'order_id': [1, 2, 3, 4, 5],
        'revenue': [100, 200, 300, 400, 500]
    })

    profiler = DataProfiler(df)
    kpi_engine = KPIEngine(df, profiler)
    kpis = kpi_engine.calculate_kpis()

    aov_kpi = next((k for k in kpis if k.id == "kpi_aov"), None)
    assert aov_kpi is not None
    assert aov_kpi.value == 300.0  # 1500 / 5


def test_missing_values_handling():
    """Test KPI calculation with missing values"""
    df = pd.DataFrame({
        'revenue': [100, 200, np.nan, 400, 500],
        'cost': [50, np.nan, 150, 200, 250]
    })

    profiler = DataProfiler(df)
    kpi_engine = KPIEngine(df, profiler)
    kpis = kpi_engine.calculate_kpis()

    revenue_kpi = next((k for k in kpis if k.id == "kpi_revenue"), None)
    assert revenue_kpi is not None
    assert revenue_kpi.value == 1200.0  # Sum of non-null values
    assert revenue_kpi.coverage == 80.0  # 4/5 = 80%


def test_negative_values():
    """Test KPI calculation with negative values"""
    df = pd.DataFrame({
        'revenue': [100, -50, 300, 400, 500],
        'cost': [50, 100, 150, 200, 250]
    })

    profiler = DataProfiler(df)
    kpi_engine = KPIEngine(df, profiler)
    kpis = kpi_engine.calculate_kpis()

    revenue_kpi = next((k for k in kpis if k.id == "kpi_revenue"), None)
    assert revenue_kpi is not None
    assert revenue_kpi.value == 1250.0  # Includes negative value


def test_zero_values():
    """Test KPI calculation with zero values"""
    df = pd.DataFrame({
        'revenue': [100, 0, 300, 400, 500],
        'cost': [50, 100, 150, 200, 250]
    })

    profiler = DataProfiler(df)
    kpi_engine = KPIEngine(df, profiler)
    kpis = kpi_engine.calculate_kpis()

    revenue_kpi = next((k for k in kpis if k.id == "kpi_revenue"), None)
    assert revenue_kpi is not None
    assert revenue_kpi.value == 1300.0
