import pandas as pd
import numpy as np
from typing import List, Optional
from ..models import Anomaly, Severity, ColumnRole
from .data_profiler import DataProfiler
import uuid


class AnomalyDetector:
    def __init__(self, df: pd.DataFrame, profiler: DataProfiler):
        self.df = df.copy()
        self.profiler = profiler
        self.columns = profiler.detect_columns()

    def detect_anomalies(self) -> List[Anomaly]:
        anomalies = []

        # Detect anomalies in revenue
        revenue_cols = [col for col in self.columns if col.role == ColumnRole.REVENUE]
        if revenue_cols:
            anomalies.extend(self._detect_metric_anomalies(revenue_cols[0].name))

        # Detect anomalies in cost
        cost_cols = [col for col in self.columns if col.role == ColumnRole.COST]
        if cost_cols:
            anomalies.extend(self._detect_metric_anomalies(cost_cols[0].name))

        # Detect anomalies in profit/margin
        profit_cols = [col for col in self.columns if col.role == ColumnRole.PROFIT]
        if profit_cols:
            anomalies.extend(self._detect_metric_anomalies(profit_cols[0].name))

        # Detect anomalies in discount
        discount_cols = [col for col in self.columns if col.role == ColumnRole.DISCOUNT]
        if discount_cols:
            anomalies.extend(self._detect_metric_anomalies(discount_cols[0].name))

        # Fallback: detect anomalies in all numeric columns if no business columns found
        if not anomalies:
            numeric_cols = [col for col in self.columns if pd.api.types.is_numeric_dtype(self.df[col.name])]
            for col in numeric_cols[:2]:  # Limit to first 2 numeric columns
                anomalies.extend(self._detect_metric_anomalies(col.name))

        return anomalies[:20]  # Limit to top 20 anomalies

    def _detect_metric_anomalies(self, metric_col: str) -> List[Anomaly]:
        anomalies = []
        series = self.df[metric_col].dropna()

        if len(series) < 5:
            return anomalies

        # Method 1: IQR (Interquartile Range)
        q1 = series.quantile(0.25)
        q3 = series.quantile(0.75)
        iqr = q3 - q1
        lower_bound = q1 - 3 * iqr
        upper_bound = q3 + 3 * iqr

        iqr_anomalies = series[(series < lower_bound) | (series > upper_bound)]

        for idx, value in iqr_anomalies.head(5).items():
            expected = (q1 + q3) / 2
            if expected != 0:
                deviation = abs(value - expected) / expected
            else:
                # When expected is 0, use absolute deviation from median
                deviation = abs(value - series.median()) / (series.std() if series.std() > 0 else 1)

            severity = self._calculate_severity(deviation)

            anomalies.append(Anomaly(
                id=str(uuid.uuid4()),
                metric=metric_col,
                dimension=None,
                observed_value=float(value),
                expected_value=float(expected),
                deviation=round(float(deviation), 3),
                severity=severity,
                method="IQR (3x)",
                evidence_id=f"anomaly_iqr_{metric_col}_{idx}",
                limitations=["Based on IQR method, assumes roughly symmetric distribution"]
            ))

        # Method 2: Z-score (robust using median)
        median = series.median()
        mad = np.median(np.abs(series - median))
        if mad > 0:
            z_scores = 0.6745 * (series - median) / mad
            extreme_z = z_scores[np.abs(z_scores) > 3]

            for idx, z_score in extreme_z.head(5).items():
                value = series[idx]
                deviation = abs(z_score)

                severity = self._calculate_severity(deviation)

                anomalies.append(Anomaly(
                    id=str(uuid.uuid4()),
                    metric=metric_col,
                    dimension=None,
                    observed_value=float(value),
                    expected_value=float(median),
                    deviation=round(float(deviation), 3),
                    severity=severity,
                    method="Robust Z-score",
                    evidence_id=f"anomaly_zscore_{metric_col}_{idx}",
                    limitations=["Based on robust z-score, uses median and MAD"]
                ))

        return anomalies

    def _calculate_severity(self, deviation: float) -> Severity:
        if deviation >= 5:
            return Severity.CRITICAL
        elif deviation >= 3:
            return Severity.HIGH
        elif deviation >= 2:
            return Severity.MEDIUM
        else:
            return Severity.LOW
