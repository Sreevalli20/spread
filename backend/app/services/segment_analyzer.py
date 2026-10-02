import pandas as pd
import numpy as np
from typing import List, Optional
from ..models import SegmentComparison, ColumnRole
from .data_profiler import DataProfiler
import uuid


class SegmentAnalyzer:
    def __init__(self, df: pd.DataFrame, profiler: DataProfiler):
        self.df = df.copy()
        self.profiler = profiler
        self.columns = profiler.detect_columns()

    def compare_segments(self) -> List[SegmentComparison]:
        comparisons = []

        # Get dimensions for segmentation
        dimension_cols = self._get_segment_dimensions()

        # Get metrics to compare
        metric_cols = self._get_metric_columns()

        if not dimension_cols or not metric_cols:
            return comparisons

        # For each dimension, compare segments
        for dim_col in dimension_cols[:3]:  # Limit to top 3 dimensions
            for metric_col in metric_cols[:3]:  # Limit to top 3 metrics
                comparison = self._compare_dimension_metric(dim_col, metric_col)
                if comparison:
                    comparisons.append(comparison)

        return comparisons[:15]  # Limit to top 15 comparisons

    def _get_segment_dimensions(self) -> List[str]:
        dimensions = []

        categorical_roles = [
            ColumnRole.REGION,
            ColumnRole.STATE,
            ColumnRole.CITY,
            ColumnRole.CATEGORY,
            ColumnRole.PRODUCT,
            ColumnRole.SEGMENT,
            ColumnRole.CHANNEL,
            ColumnRole.EMPLOYEE,
            ColumnRole.CUSTOMER
        ]

        for col in self.columns:
            if col.role in categorical_roles and col.unique_count >= 2 and col.unique_count <= 50:
                dimensions.append(col.name)

        return dimensions

    def _get_metric_columns(self) -> List[str]:
        metrics = []

        metric_roles = [
            ColumnRole.REVENUE,
            ColumnRole.SALES,
            ColumnRole.COST,
            ColumnRole.PROFIT,
            ColumnRole.MARGIN,
            ColumnRole.DISCOUNT,
            ColumnRole.QUANTITY,
            ColumnRole.UNITS
        ]

        for col in self.columns:
            if col.role in metric_roles:
                metrics.append(col.name)

        return metrics

    def _compare_dimension_metric(self, dimension: str, metric: str) -> Optional[SegmentComparison]:
        # Group by dimension and calculate metric
        grouped = self.df.groupby(dimension)[metric].agg(['mean', 'count'])

        # Filter segments with sufficient sample size (min 10 records)
        grouped = grouped[grouped['count'] >= 10]

        if len(grouped) < 2:
            return None

        # Find best and worst segments
        best_segment = grouped['mean'].idxmax()
        worst_segment = grouped['mean'].idxmin()

        best_value = grouped.loc[best_segment, 'mean']
        worst_value = grouped.loc[worst_segment, 'mean']

        difference = best_value - worst_value
        difference_percentage = (difference / worst_value) * 100 if worst_value != 0 else 0

        best_sample_size = int(grouped.loc[best_segment, 'count'])
        worst_sample_size = int(grouped.loc[worst_segment, 'count'])

        evidence_id = f"segment_{dimension}_{metric}"

        return SegmentComparison(
            dimension=dimension,
            metric=metric,
            best_segment=str(best_segment),
            worst_segment=str(worst_segment),
            difference=float(difference),
            difference_percentage=round(float(difference_percentage), 2),
            best_sample_size=best_sample_size,
            worst_sample_size=worst_sample_size,
            evidence_id=evidence_id
        )
