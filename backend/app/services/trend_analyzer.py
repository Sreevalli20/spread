import pandas as pd
import numpy as np
from typing import List, Optional
from ..models import Trend, ColumnRole
from .data_profiler import DataProfiler


class TrendAnalyzer:
    def __init__(self, df: pd.DataFrame, profiler: DataProfiler):
        self.df = df.copy()
        self.profiler = profiler
        self.columns = profiler.detect_columns()

    def analyze_trends(self) -> List[Trend]:
        trends = []

        date_cols = [col for col in self.columns if col.role == ColumnRole.DATE]
        revenue_cols = [col for col in self.columns if col.role == ColumnRole.REVENUE]

        if not date_cols or not revenue_cols:
            return trends

        date_col = date_cols[0].name
        revenue_col = revenue_cols[0].name

        # Parse dates
        dates = pd.to_datetime(self.df[date_col], errors='coerce')
        valid_mask = dates.notna() & self.df[revenue_col].notna()
        valid_dates = dates[valid_mask]
        valid_revenue = self.df[revenue_col][valid_mask]

        if len(valid_dates) < 2:
            return trends

        # Create temporary dataframe
        temp_df = pd.DataFrame({
            'date': valid_dates,
            'revenue': valid_revenue
        })

        # Determine appropriate aggregation period
        date_range = (valid_dates.max() - valid_dates.min()).days
        if date_range <= 30:
            period_type = "daily"
            temp_df['period'] = temp_df['date'].dt.date
        elif date_range <= 365:
            period_type = "weekly"
            temp_df['period'] = temp_df['date'].dt.to_period('W').dt.start_time
        else:
            period_type = "monthly"
            temp_df['period'] = temp_df['date'].dt.to_period('M').dt.start_time

        # Aggregate by period
        period_revenue = temp_df.groupby('period')['revenue'].sum()

        if len(period_revenue) < 3:
            return trends

        # Calculate trend metrics
        values = period_revenue.values

        # Trend direction using linear regression slope
        x = np.arange(len(values))
        slope, _ = np.polyfit(x, values, 1)
        direction = "up" if slope > 0 else "down"

        # Trend strength (R-squared of linear fit)
        y_pred = slope * x + np.mean(values)
        ss_res = np.sum((values - y_pred) ** 2)
        ss_tot = np.sum((values - np.mean(values)) ** 2)
        strength = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0

        # Recent change (last period vs previous period)
        if len(values) >= 2:
            recent_change = ((values[-1] - values[-2]) / values[-2]) * 100 if values[-2] != 0 else 0
        else:
            recent_change = 0

        # Volatility (coefficient of variation)
        volatility = (values.std() / values.mean()) * 100 if values.mean() != 0 else 0

        # Generate evidence
        evidence_id = f"trend_{revenue_col}_{period_type}"

        trends.append(Trend(
            metric=revenue_col,
            direction=direction,
            strength=round(float(strength), 3),
            recent_change=round(float(recent_change), 2),
            volatility=round(float(volatility), 2),
            period_type=period_type,
            evidence_id=evidence_id
        ))

        return trends
