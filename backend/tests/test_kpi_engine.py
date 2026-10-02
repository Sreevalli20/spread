import pytest
import pandas as pd
import numpy as np
from app.services.kpi_engine import KPIEngine
from app.services.data_profiler import DataProfiler


def test_kpi_engine_basic():
    """Test basic KPI calculation with sample data"""
    df = pd.DataFrame({
        'order_id': ['ORD-001', 'ORD-002', 'ORD-003'],
        'revenue': [100.0, 200.0, 300.0],
        'cost': [60.0, 120.0, 180.0],
        'units': [1, 2, 3],
        'order_date': pd.date_range('2023-01-01', periods=3)
    })
    
    profiler = DataProfiler(df)
    engine = KPIEngine(df, profiler)
    kpis = engine.calculate_kpis()
    
    assert len(kpis) > 0
    assert any(kpi.id == 'kpi_revenue' for kpi in kpis)
    assert any(kpi.id == 'kpi_cost' for kpi in kpis)
    assert any(kpi.id == 'kpi_profit' for kpi in kpis)
    
    revenue_kpi = next(kpi for kpi in kpis if kpi.id == 'kpi_revenue')
    assert revenue_kpi.value == 600.0


def test_kpi_engine_with_missing_data():
    """Test KPI calculation with missing data"""
    df = pd.DataFrame({
        'revenue': [100.0, None, 300.0],
        'cost': [60.0, 120.0, None]
    })
    
    profiler = DataProfiler(df)
    engine = KPIEngine(df, profiler)
    kpis = engine.calculate_kpis()
    
    # Should still calculate KPIs with warnings
    assert len(kpis) > 0
    revenue_kpi = next((kpi for kpi in kpis if kpi.id == 'kpi_revenue'), None)
    if revenue_kpi:
        assert revenue_kpi.coverage < 100


def test_kpi_engine_empty_dataframe():
    """Test KPI calculation with empty dataframe"""
    df = pd.DataFrame({'revenue': [], 'cost': []})
    
    profiler = DataProfiler(df)
    engine = KPIEngine(df, profiler)
    kpis = engine.calculate_kpis()
    
    # Should return empty or minimal KPIs
    assert isinstance(kpis, list)


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
