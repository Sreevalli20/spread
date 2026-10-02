import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional
from ..models import Evidence, ColumnRole
from .data_profiler import DataProfiler
import uuid


class EvidenceEngine:
    def __init__(self, df: pd.DataFrame, profiler: DataProfiler):
        self.df = df.copy()
        self.profiler = profiler
        self.columns = profiler.detect_columns()
        self._evidence_cache: Dict[str, Evidence] = {}

    def create_evidence(
        self,
        finding_id: str,
        claim: str,
        source_columns: List[str],
        filters: Dict[str, Any],
        calculation: str,
        values: Dict[str, Any],
        comparison: Dict[str, Any],
        limitations: List[str]
    ) -> Evidence:
        evidence_id = str(uuid.uuid4())

        # Calculate sample size
        sample_size = self._calculate_sample_size(filters)

        # Get data quality info
        data_quality = self._get_evidence_data_quality(source_columns, filters)

        evidence = Evidence(
            evidence_id=evidence_id,
            finding_id=finding_id,
            claim=claim,
            source_columns=source_columns,
            filters=filters,
            sample_size=sample_size,
            calculation=calculation,
            values=values,
            comparison=comparison,
            limitations=limitations,
            data_quality=data_quality
        )

        self._evidence_cache[evidence_id] = evidence
        return evidence

    def create_trend_evidence(
        self,
        finding_id: str,
        metric: str,
        period_type: str,
        values: Dict[str, Any]
    ) -> Evidence:
        date_cols = [col for col in self.columns if col.role == ColumnRole.DATE]
        date_col = date_cols[0].name if date_cols else None

        filters = {}
        if date_col:
            filters['date_column'] = date_col

        return self.create_evidence(
            finding_id=finding_id,
            claim=f"Trend analysis for {metric} aggregated by {period_type}",
            source_columns=[metric],
            filters=filters,
            calculation=f"Linear regression slope on {period_type} aggregated {metric}",
            values=values,
            comparison={},
            limitations=[
                "Trend based on linear regression, assumes linear relationship",
                "Does not account for seasonality unless explicitly modeled",
                "Aggregate evidence over matching records, not row-level traceability"
            ]
        )

    def create_anomaly_evidence(
        self,
        finding_id: str,
        metric: str,
        method: str,
        observed_value: float,
        expected_value: float,
        deviation: float
    ) -> Evidence:
        return self.create_evidence(
            finding_id=finding_id,
            claim=f"Anomaly detected in {metric} using {method}",
            source_columns=[metric],
            filters={},
            calculation=f"{method} detection: observed={observed_value}, expected={expected_value}",
            values={
                "observed_value": observed_value,
                "expected_value": expected_value,
                "deviation": deviation
            },
            comparison={},
            limitations=[
                f"Based on {method} method",
                "Assumes underlying distribution characteristics",
                "May not represent true business anomaly",
                "Aggregate evidence over matching records"
            ]
        )

    def create_segment_evidence(
        self,
        finding_id: str,
        dimension: str,
        metric: str,
        best_segment: str,
        worst_segment: str,
        difference: float
    ) -> Evidence:
        # Get sample sizes
        best_count = self.df[self.df[dimension] == best_segment].shape[0]
        worst_count = self.df[self.df[dimension] == worst_segment].shape[0]

        best_mean = self.df[self.df[dimension] == best_segment][metric].mean()
        worst_mean = self.df[self.df[dimension] == worst_segment][metric].mean()

        return self.create_evidence(
            finding_id=finding_id,
            claim=f"Segment comparison: {best_segment} vs {worst_segment} for {metric}",
            source_columns=[dimension, metric],
            filters={
                "best_segment": best_segment,
                "worst_segment": worst_segment
            },
            calculation=f"Group by {dimension}, calculate mean of {metric}",
            values={
                "best_segment": best_segment,
                "worst_segment": worst_segment,
                "best_mean": best_mean,
                "worst_mean": worst_mean,
                "difference": difference
            },
            comparison={
                "best_sample_size": best_count,
                "worst_sample_size": worst_count
            },
            limitations=[
                "Comparison based on group means",
                "Does not account for within-group variance",
                "Aggregate evidence over matching records"
            ]
        )

    def create_kpi_evidence(
        self,
        finding_id: str,
        kpi_name: str,
        calculation: str,
        source_columns: List[str],
        value: float,
        coverage: float
    ) -> Evidence:
        return self.create_evidence(
            finding_id=finding_id,
            claim=f"KPI calculation: {kpi_name}",
            source_columns=source_columns,
            filters={},
            calculation=calculation,
            values={
                "kpi_name": kpi_name,
                "value": value,
                "coverage": coverage
            },
            comparison={},
            limitations=[
                f"Calculated from {coverage:.1f}% of available data",
                "Aggregate evidence over matching records"
            ]
        )

    def _calculate_sample_size(self, filters: Dict[str, Any]) -> int:
        if not filters:
            return len(self.df)

        # Apply filters to calculate sample size
        filtered_df = self.df.copy()
        for key, value in filters.items():
            if key in filtered_df.columns:
                filtered_df = filtered_df[filtered_df[key] == value]

        return len(filtered_df)

    def _get_evidence_data_quality(self, source_columns: List[str], filters: Dict[str, Any]) -> Dict[str, Any]:
        # Get data quality for source columns
        quality_info = {}

        for col in source_columns:
            if col in self.df.columns:
                series = self.df[col]
                quality_info[col] = {
                    "missing_count": int(series.isna().sum()),
                    "missing_percentage": round((series.isna().sum() / len(series)) * 100, 2),
                    "dtype": str(series.dtype)
                }

        return quality_info

    def get_all_evidence(self) -> Dict[str, Evidence]:
        return self._evidence_cache

    def get_evidence(self, evidence_id: str) -> Optional[Evidence]:
        return self._evidence_cache.get(evidence_id)
