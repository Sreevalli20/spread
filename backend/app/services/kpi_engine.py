import pandas as pd
import numpy as np
from typing import List, Optional
from ..models import KPI, ColumnRole
from .data_profiler import DataProfiler


class KPIEngine:
    def __init__(self, df: pd.DataFrame, profiler: DataProfiler):
        self.df = df.copy()
        self.profiler = profiler
        self.columns = profiler.detect_columns()
        self._column_map = {col.name: col for col in self.columns}

    def calculate_kpis(self) -> List[KPI]:
        kpis = []

        # Revenue KPI
        revenue_kpi = self._calculate_revenue()
        if revenue_kpi:
            kpis.append(revenue_kpi)

        # Cost KPI
        cost_kpi = self._calculate_cost()
        if cost_kpi:
            kpis.append(cost_kpi)

        # Profit KPI
        profit_kpi = self._calculate_profit()
        if profit_kpi:
            kpis.append(profit_kpi)

        # Gross Margin KPI
        margin_kpi = self._calculate_gross_margin()
        if margin_kpi:
            kpis.append(margin_kpi)

        # Orders KPI
        orders_kpi = self._calculate_orders()
        if orders_kpi:
            kpis.append(orders_kpi)

        # Units KPI
        units_kpi = self._calculate_units()
        if units_kpi:
            kpis.append(units_kpi)

        # Average Order Value KPI
        aov_kpi = self._calculate_average_order_value()
        if aov_kpi:
            kpis.append(aov_kpi)

        # Average Price KPI
        avg_price_kpi = self._calculate_average_price()
        if avg_price_kpi:
            kpis.append(avg_price_kpi)

        # Discount Rate KPI
        discount_rate_kpi = self._calculate_discount_rate()
        if discount_rate_kpi:
            kpis.append(discount_rate_kpi)

        # Growth KPI (if date column exists)
        growth_kpi = self._calculate_growth()
        if growth_kpi:
            kpis.append(growth_kpi)

        return kpis

    def _get_columns_by_role(self, role: ColumnRole) -> List[str]:
        return [col.name for col in self.columns if col.role == role]

    def _calculate_revenue(self) -> Optional[KPI]:
        revenue_cols = self._get_columns_by_role(ColumnRole.REVENUE)
        if not revenue_cols:
            return None

        col = revenue_cols[0]
        series = self.df[col].dropna()

        if len(series) == 0:
            return None

        total_revenue = series.sum()
        valid_count = len(series)
        coverage = (valid_count / len(self.df)) * 100

        warnings = []
        if coverage < 80:
            warnings.append(f"Only {coverage:.1f}% of rows have revenue data")

        return KPI(
            id="kpi_revenue",
            name="Total Revenue",
            value=float(total_revenue),
            formatted_value=self._format_currency(total_revenue),
            unit="currency",
            calculation=f"sum({col})",
            source_columns=[col],
            coverage=round(coverage, 2),
            warnings=warnings
        )

    def _calculate_cost(self) -> Optional[KPI]:
        cost_cols = self._get_columns_by_role(ColumnRole.COST)
        if not cost_cols:
            return None

        col = cost_cols[0]
        series = self.df[col].dropna()

        if len(series) == 0:
            return None

        total_cost = series.sum()
        valid_count = len(series)
        coverage = (valid_count / len(self.df)) * 100

        warnings = []
        if coverage < 80:
            warnings.append(f"Only {coverage:.1f}% of rows have cost data")

        return KPI(
            id="kpi_cost",
            name="Total Cost",
            value=float(total_cost),
            formatted_value=self._format_currency(total_cost),
            unit="currency",
            calculation=f"sum({col})",
            source_columns=[col],
            coverage=round(coverage, 2),
            warnings=warnings
        )

    def _calculate_profit(self) -> Optional[KPI]:
        profit_cols = self._get_columns_by_role(ColumnRole.PROFIT)
        if profit_cols:
            col = profit_cols[0]
            series = self.df[col].dropna()
            if len(series) == 0:
                return None
            total_profit = series.sum()
            valid_count = len(series)
            coverage = (valid_count / len(self.df)) * 100
            warnings = []
            if coverage < 80:
                warnings.append(f"Only {coverage:.1f}% of rows have profit data")
            return KPI(
                id="kpi_profit",
                name="Total Profit",
                value=float(total_profit),
                formatted_value=self._format_currency(total_profit),
                unit="currency",
                calculation=f"sum({col})",
                source_columns=[col],
                coverage=round(coverage, 2),
                warnings=warnings
            )

        # Calculate profit from revenue and cost
        revenue_cols = self._get_columns_by_role(ColumnRole.REVENUE)
        cost_cols = self._get_columns_by_role(ColumnRole.COST)

        if not revenue_cols or not cost_cols:
            return None

        revenue_col = revenue_cols[0]
        cost_col = cost_cols[0]

        profit = self.df[revenue_col] - self.df[cost_col]
        profit = profit.dropna()

        if len(profit) == 0:
            return None

        total_profit = profit.sum()
        valid_count = len(profit)
        coverage = (valid_count / len(self.df)) * 100

        warnings = []
        if coverage < 80:
            warnings.append(f"Only {coverage:.1f}% of rows have calculable profit")

        return KPI(
            id="kpi_profit",
            name="Total Profit",
            value=float(total_profit),
            formatted_value=self._format_currency(total_profit),
            unit="currency",
            calculation=f"sum({revenue_col} - {cost_col})",
            source_columns=[revenue_col, cost_col],
            coverage=round(coverage, 2),
            warnings=warnings
        )

    def _calculate_gross_margin(self) -> Optional[KPI]:
        revenue_cols = self._get_columns_by_role(ColumnRole.REVENUE)
        cost_cols = self._get_columns_by_role(ColumnRole.COST)

        if not revenue_cols or not cost_cols:
            return None

        revenue_col = revenue_cols[0]
        cost_col = cost_cols[0]

        revenue = self.df[revenue_col]
        cost = self.df[cost_col]

        # Filter valid data
        valid_mask = (revenue.notna()) & (cost.notna()) & (revenue != 0) & (np.isfinite(revenue)) & (np.isfinite(cost))
        valid_revenue = revenue[valid_mask]
        valid_cost = cost[valid_mask]

        if len(valid_revenue) == 0:
            return None

        total_revenue = valid_revenue.sum()
        total_cost = valid_cost.sum()

        if total_revenue == 0 or not np.isfinite(total_revenue):
            return None

        gross_margin = ((total_revenue - total_cost) / total_revenue) * 100

        # Handle NaN/inf results
        if not np.isfinite(gross_margin):
            return None

        valid_count = len(valid_revenue)
        coverage = (valid_count / len(self.df)) * 100

        warnings = []
        if coverage < 80:
            warnings.append(f"Only {coverage:.1f}% of rows have calculable margin")

        return KPI(
            id="kpi_gross_margin",
            name="Gross Margin",
            value=float(gross_margin),
            formatted_value=f"{gross_margin:.2f}%",
            unit="percentage",
            calculation=f"(sum({revenue_col}) - sum({cost_col})) / sum({revenue_col}) * 100",
            source_columns=[revenue_col, cost_col],
            coverage=round(coverage, 2),
            warnings=warnings
        )

    def _calculate_orders(self) -> Optional[KPI]:
        order_cols = self._get_columns_by_role(ColumnRole.ORDER_ID)
        if order_cols:
            col = order_cols[0]
            unique_orders = self.df[col].nunique()
            return KPI(
                id="kpi_orders",
                name="Total Orders",
                value=float(unique_orders),
                formatted_value=str(unique_orders),
                unit="count",
                calculation=f"count_distinct({col})",
                source_columns=[col],
                coverage=100.0,
                warnings=[]
            )

        # Fallback: count rows
        return KPI(
            id="kpi_orders",
            name="Total Records",
            value=float(len(self.df)),
            formatted_value=str(len(self.df)),
            unit="count",
            calculation="count(*)",
            source_columns=[],
            coverage=100.0,
            warnings=[]
        )

    def _calculate_units(self) -> Optional[KPI]:
        quantity_cols = self._get_columns_by_role(ColumnRole.QUANTITY)
        units_cols = self._get_columns_by_role(ColumnRole.UNITS)

        col = (quantity_cols + units_cols)[0] if (quantity_cols + units_cols) else None

        if not col:
            return None

        series = self.df[col].dropna()

        if len(series) == 0:
            return None

        total_units = series.sum()
        valid_count = len(series)
        coverage = (valid_count / len(self.df)) * 100

        warnings = []
        if coverage < 80:
            warnings.append(f"Only {coverage:.1f}% of rows have quantity data")

        return KPI(
            id="kpi_units",
            name="Total Units",
            value=float(total_units),
            formatted_value=f"{total_units:,.0f}",
            unit="count",
            calculation=f"sum({col})",
            source_columns=[col],
            coverage=round(coverage, 2),
            warnings=warnings
        )

    def _calculate_average_order_value(self) -> Optional[KPI]:
        revenue_cols = self._get_columns_by_role(ColumnRole.REVENUE)
        order_cols = self._get_columns_by_role(ColumnRole.ORDER_ID)

        if not revenue_cols:
            return None

        revenue_col = revenue_cols[0]

        if order_cols:
            # Calculate AOV as total revenue / unique orders
            order_col = order_cols[0]
            total_revenue = self.df[revenue_col].sum()
            unique_orders = self.df[order_col].nunique()

            if unique_orders == 0:
                return None

            aov = total_revenue / unique_orders
            return KPI(
                id="kpi_aov",
                name="Average Order Value",
                value=float(aov),
                formatted_value=self._format_currency(aov),
                unit="currency",
                calculation=f"sum({revenue_col}) / count_distinct({order_col})",
                source_columns=[revenue_col, order_col],
                coverage=100.0,
                warnings=[]
            )
        else:
            # Calculate AOV as total revenue / total records
            total_revenue = self.df[revenue_col].sum()
            aov = total_revenue / len(self.df)

            return KPI(
                id="kpi_aov",
                name="Average per Record",
                value=float(aov),
                formatted_value=self._format_currency(aov),
                unit="currency",
                calculation=f"sum({revenue_col}) / count(*)",
                source_columns=[revenue_col],
                coverage=100.0,
                warnings=[]
            )

    def _calculate_average_price(self) -> Optional[KPI]:
        price_cols = self._get_columns_by_role(ColumnRole.PRICE)

        if price_cols:
            col = price_cols[0]
            series = self.df[col].dropna()

            if len(series) == 0:
                return None

            avg_price = series.mean()

            # Handle NaN/inf
            if not np.isfinite(avg_price):
                return None

            valid_count = len(series)
            coverage = (valid_count / len(self.df)) * 100

            warnings = []
            if coverage < 80:
                warnings.append(f"Only {coverage:.1f}% of rows have price data")

            return KPI(
                id="kpi_avg_price",
                name="Average Price",
                value=float(avg_price),
                formatted_value=self._format_currency(avg_price),
                unit="currency",
                calculation=f"avg({col})",
                source_columns=[col],
                coverage=round(coverage, 2),
                warnings=warnings
            )

        # Calculate from revenue and units
        revenue_cols = self._get_columns_by_role(ColumnRole.REVENUE)
        quantity_cols = self._get_columns_by_role(ColumnRole.QUANTITY)
        units_cols = self._get_columns_by_role(ColumnRole.UNITS)

        if not revenue_cols or not (quantity_cols + units_cols):
            return None

        revenue_col = revenue_cols[0]
        qty_col = (quantity_cols + units_cols)[0]

        valid_mask = (self.df[revenue_col].notna()) & (self.df[qty_col].notna()) & (self.df[qty_col] != 0) & (np.isfinite(self.df[revenue_col])) & (np.isfinite(self.df[qty_col]))
        valid_revenue = self.df[revenue_col][valid_mask]
        valid_qty = self.df[qty_col][valid_mask]

        if len(valid_revenue) == 0:
            return None

        avg_price = (valid_revenue / valid_qty).mean()

        # Handle NaN/inf
        if not np.isfinite(avg_price):
            return None

        valid_count = len(valid_revenue)
        coverage = (valid_count / len(self.df)) * 100

        warnings = []
        if coverage < 80:
            warnings.append(f"Only {coverage:.1f}% of rows have calculable price")

        return KPI(
            id="kpi_avg_price",
            name="Average Price",
            value=float(avg_price),
            formatted_value=self._format_currency(avg_price),
            unit="currency",
            calculation=f"avg({revenue_col} / {qty_col})",
            source_columns=[revenue_col, qty_col],
            coverage=round(coverage, 2),
            warnings=warnings
        )

    def _calculate_discount_rate(self) -> Optional[KPI]:
        discount_cols = self._get_columns_by_role(ColumnRole.DISCOUNT)

        if not discount_cols:
            return None

        col = discount_cols[0]
        series = self.df[col].dropna()

        if len(series) == 0:
            return None

        avg_discount = series.mean()
        valid_count = len(series)
        coverage = (valid_count / len(self.df)) * 100

        warnings = []
        if coverage < 80:
            warnings.append(f"Only {coverage:.1f}% of rows have discount data")

        return KPI(
            id="kpi_discount_rate",
            name="Average Discount Rate",
            value=float(avg_discount),
            formatted_value=f"{avg_discount:.2f}%",
            unit="percentage",
            calculation=f"avg({col})",
            source_columns=[col],
            coverage=round(coverage, 2),
            warnings=warnings
        )

    def _calculate_growth(self) -> Optional[KPI]:
        date_cols = self._get_columns_by_role(ColumnRole.DATE)

        if not date_cols:
            return None

        date_col = date_cols[0]
        revenue_cols = self._get_columns_by_role(ColumnRole.REVENUE)

        if not revenue_cols:
            return None

        revenue_col = revenue_cols[0]

        # Parse dates
        dates = pd.to_datetime(self.df[date_col], errors='coerce')
        valid_mask = dates.notna() & self.df[revenue_col].notna()
        valid_dates = dates[valid_mask]
        valid_revenue = self.df[revenue_col][valid_mask]

        if len(valid_dates) < 2:
            return None

        # Create temporary dataframe for aggregation
        temp_df = pd.DataFrame({
            'date': valid_dates,
            'revenue': valid_revenue
        })

        # Group by month
        temp_df['month'] = temp_df['date'].dt.to_period('M')
        monthly_revenue = temp_df.groupby('month')['revenue'].sum()

        if len(monthly_revenue) < 2:
            return None

        # Calculate growth between first and last month
        first_month = monthly_revenue.iloc[0]
        last_month = monthly_revenue.iloc[-1]

        if first_month == 0:
            return None

        growth = ((last_month - first_month) / first_month) * 100

        return KPI(
            id="kpi_growth",
            name="Revenue Growth",
            value=float(growth),
            formatted_value=f"{growth:.2f}%",
            unit="percentage",
            calculation=f"(last_month_revenue - first_month_revenue) / first_month_revenue * 100",
            source_columns=[date_col, revenue_col],
            coverage=100.0,
            warnings=["Growth calculated from first to last month period"]
        )

    def _format_currency(self, value: float) -> str:
        if abs(value) >= 1_000_000:
            return f"${value/1_000_000:.2f}M"
        elif abs(value) >= 1_000:
            return f"${value/1_000:.2f}K"
        else:
            return f"${value:.2f}"
