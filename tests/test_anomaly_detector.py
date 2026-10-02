import pytest
import pandas as pd
import numpy as np
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.services.anomaly_detector import AnomalyDetector
from app.services.data_profiler import DataProfiler
from app.models import Severity


def test_iqr_anomaly_detection():
    """Test IQR-based anomaly detection"""
    df = pd.DataFrame({
        'revenue': [100, 110, 105, 108, 102, 1000, 107, 103, 109, 106]  # 1000 is an outlier
    })

    profiler = DataProfiler(df)
    detector = AnomalyDetector(df, profiler)
    anomalies = detector.detect_anomalies()

    assert len(anomalies) > 0
    assert anomalies[0].metric == 'revenue'
    assert anomalies[0].method == "IQR (3x)"


def test_no_anomalies():
    """Test with no anomalies"""
    df = pd.DataFrame({
        'revenue': [100, 101, 102, 103, 104, 105, 106, 107, 108, 109]
    })

    profiler = DataProfiler(df)
    detector = AnomalyDetector(df, profiler)
    anomalies = detector.detect_anomalies()

    # Should have few or no anomalies
    assert len(anomalies) == 0


def test_severity_calculation():
    """Test severity calculation based on deviation"""
    df = pd.DataFrame({
        'revenue': [100, 100, 100, 100, 100, 10000]  # Extreme outlier
    })

    profiler = DataProfiler(df)
    detector = AnomalyDetector(df, profiler)
    anomalies = detector.detect_anomalies()

    assert len(anomalies) > 0
    # High deviation should result in high or critical severity
    assert anomalies[0].severity in [Severity.HIGH, Severity.CRITICAL]


def test_multiple_anomalies():
    """Test detection of multiple anomalies"""
    df = pd.DataFrame({
        'revenue': [100, 200, 300, 400, 5000, 6000, 700, 800, 900, 10000]
    })

    profiler = DataProfiler(df)
    detector = AnomalyDetector(df, profiler)
    anomalies = detector.detect_anomalies()

    assert len(anomalies) > 1


def test_small_dataset():
    """Test anomaly detection with small dataset"""
    df = pd.DataFrame({
        'revenue': [100, 200, 300]
    })

    profiler = DataProfiler(df)
    detector = AnomalyDetector(df, profiler)
    anomalies = detector.detect_anomalies()

    # Should not detect anomalies on very small datasets
    assert len(anomalies) == 0


def test_negative_values():
    """Test anomaly detection with negative values"""
    df = pd.DataFrame({
        'revenue': [100, 200, 300, -1000, 400, 500]
    })

    profiler = DataProfiler(df)
    detector = AnomalyDetector(df, profiler)
    anomalies = detector.detect_anomalies()

    assert len(anomalies) > 0
