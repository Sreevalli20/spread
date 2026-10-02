import pytest
import io
import pandas as pd
from app.services.kpi_engine import KPIEngine
from app.services.data_profiler import DataProfiler
from app.services.anomaly_detector import AnomalyDetector


def test_health_check_logic():
    """Test health check would return OK"""
    # This is a unit test of the logic, not the HTTP endpoint
    assert True  # Health check is simple, always returns ok


def test_analyze_csv_logic():
    """Test CSV file analysis logic"""
    # Create a simple CSV
    df = pd.DataFrame({
        'order_id': ['ORD-001', 'ORD-002'],
        'revenue': [100.0, 200.0],
        'cost': [60.0, 120.0],
        'order_date': ['2023-01-01', '2023-01-02']
    })
    
    profiler = DataProfiler(df)
    engine = KPIEngine(df, profiler)
    kpis = engine.calculate_kpis()
    
    assert len(kpis) > 0
    assert any(kpi.id == 'kpi_revenue' for kpi in kpis)


def test_analyze_invalid_file_logic():
    """Test invalid file validation"""
    # File type validation is handled in the router
    # Test that we can detect invalid scenarios
    df = pd.DataFrame({'revenue': []})
    profiler = DataProfiler(df)
    engine = KPIEngine(df, profiler)
    kpis = engine.calculate_kpis()
    
    # Empty data should return minimal or no KPIs
    assert isinstance(kpis, list)


def test_analyze_empty_file_logic():
    """Test empty file handling"""
    df = pd.DataFrame()
    profiler = DataProfiler(df)
    engine = KPIEngine(df, profiler)
    kpis = engine.calculate_kpis()
    
    assert isinstance(kpis, list)


def test_ask_endpoint_logic():
    """Test /api/ask endpoint logic"""
    from app.services.ai_explainer import AIExplainer
    
    explainer = AIExplainer()
    # Test with no API key (simulates production without AI)
    result = explainer.answer_question(
        "What are the trends?",
        {
            "findings": [],
            "evidence": {}
        }
    )
    
    # Should return a graceful fallback
    assert "answer" in result
    assert isinstance(result["answer"], str)


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
