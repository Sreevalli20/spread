import pytest
import pandas as pd
import numpy as np
from app.services.anomaly_detector import AnomalyDetector
from app.services.data_profiler import DataProfiler


def test_anomaly_detector_basic():
    """Test basic anomaly detection"""
    df = pd.DataFrame({
        'revenue': [100.0, 105.0, 102.0, 1000.0, 103.0],  # One outlier
    })
    
    profiler = DataProfiler(df)
    detector = AnomalyDetector(df, profiler)
    anomalies = detector.detect_anomalies()
    
    assert isinstance(anomalies, list)
    # Should detect the outlier
    assert len(anomalies) > 0


def test_anomaly_detector_no_anomalies():
    """Test with no anomalies"""
    df = pd.DataFrame({
        'revenue': [100.0, 101.0, 102.0, 103.0, 104.0],
    })
    
    profiler = DataProfiler(df)
    detector = AnomalyDetector(df, profiler)
    anomalies = detector.detect_anomalies()
    
    # May return empty or minimal anomalies
    assert isinstance(anomalies, list)


def test_anomaly_detector_empty():
    """Test with empty dataframe"""
    df = pd.DataFrame({'revenue': []})
    
    profiler = DataProfiler(df)
    detector = AnomalyDetector(df, profiler)
    anomalies = detector.detect_anomalies()
    
    assert isinstance(anomalies, list)
    assert len(anomalies) == 0


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
