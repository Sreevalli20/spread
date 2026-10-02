import pandas as pd
import numpy as np
from typing import List, Dict, Any
from ..models import ColumnInfo, DataQuality, ColumnRole


class DataProfiler:
    def __init__(self, df: pd.DataFrame):
        self.df = df.copy()

    def detect_columns(self) -> List[ColumnInfo]:
        columns = []
        for col in self.df.columns:
            col_info = self._analyze_column(col)
            columns.append(col_info)
        return columns

    def _analyze_column(self, col_name: str) -> ColumnInfo:
        series = self.df[col_name]
        dtype = str(series.dtype)

        # Detect role
        role = self._detect_column_role(col_name, series)

        # Missing values
        missing_count = series.isna().sum()
        missing_percentage = (missing_count / len(series)) * 100

        # Unique values
        unique_count = series.nunique()

        # Constant column
        is_constant = unique_count == 1

        # Sample values
        sample_values = series.dropna().head(5).astype(str).tolist()

        return ColumnInfo(
            name=col_name,
            dtype=dtype,
            role=role,
            missing_count=int(missing_count),
            missing_percentage=round(missing_percentage, 2),
            unique_count=int(unique_count),
            is_constant=is_constant,
            sample_values=sample_values
        )

    def _detect_column_role(self, col_name: str, series: pd.Series) -> ColumnRole:
        col_lower = col_name.lower()

        # Check for date columns first - but prioritize column name hints
        date_hints = ['date', 'time', 'timestamp', 'created', 'updated', 'year', 'month', 'day']
        is_date_hint = any(x in col_lower for x in date_hints)

        if is_date_hint and self._is_date_column(series):
            return ColumnRole.DATE

        # Check for numeric columns
        if pd.api.types.is_numeric_dtype(series):
            # Check for specific numeric roles
            if any(x in col_lower for x in ['revenue', 'sales', 'amount', 'income']):
                return ColumnRole.REVENUE
            elif any(x in col_lower for x in ['cost', 'expense']):
                return ColumnRole.COST
            elif any(x in col_lower for x in ['profit', 'net']):
                return ColumnRole.PROFIT
            elif any(x in col_lower for x in ['margin', 'rate']):
                return ColumnRole.MARGIN
            elif any(x in col_lower for x in ['quantity', 'units', 'qty', 'count']):
                return ColumnRole.QUANTITY
            elif any(x in col_lower for x in ['discount']):
                return ColumnRole.DISCOUNT
            elif any(x in col_lower for x in ['price']):
                return ColumnRole.PRICE
            elif any(x in col_lower for x in ['target']):
                return ColumnRole.TARGET
            elif any(x in col_lower for x in ['actual']):
                return ColumnRole.ACTUAL
            elif any(x in col_lower for x in ['duration', 'time', 'days']):
                return ColumnRole.DURATION

        # Check for categorical columns
        if any(x in col_lower for x in ['customer', 'client', 'user']):
            return ColumnRole.CUSTOMER
        elif any(x in col_lower for x in ['product', 'item', 'sku']):
            return ColumnRole.PRODUCT
        elif any(x in col_lower for x in ['category', 'type', 'class']):
            return ColumnRole.CATEGORY
        elif any(x in col_lower for x in ['region', 'area', 'territory']):
            return ColumnRole.REGION
        elif any(x in col_lower for x in ['state', 'province']):
            return ColumnRole.STATE
        elif any(x in col_lower for x in ['city', 'location']):
            return ColumnRole.CITY
        elif any(x in col_lower for x in ['segment', 'group']):
            return ColumnRole.SEGMENT
        elif any(x in col_lower for x in ['channel', 'source']):
            return ColumnRole.CHANNEL
        elif any(x in col_lower for x in ['order', 'transaction', 'invoice']):
            return ColumnRole.ORDER_ID
        elif any(x in col_lower for x in ['employee', 'staff', 'salesperson', 'rep']):
            return ColumnRole.EMPLOYEE
        elif any(x in col_lower for x in ['status', 'state']):
            return ColumnRole.STATUS

        # Fallback: check if it could be a date column without a name hint
        if self._is_date_column(series):
            return ColumnRole.DATE

        return ColumnRole.UNKNOWN

    def _is_date_column(self, series: pd.Series) -> bool:
        try:
            # Try to parse as datetime
            pd.to_datetime(series, errors='coerce')
            # If more than 50% successfully parsed, consider it a date column
            parsed = pd.to_datetime(series, errors='coerce')
            non_null_pct = parsed.notna().sum() / len(series)
            return non_null_pct > 0.5
        except:
            return False

    def calculate_data_quality(self) -> DataQuality:
        row_count = len(self.df)
        column_count = len(self.df.columns)

        # Missing cells
        missing_cells = self.df.isna().sum().sum()
        missing_percentage = (missing_cells / (row_count * column_count)) * 100

        # Duplicate rows
        duplicate_rows = self.df.duplicated().sum()
        duplicate_percentage = (duplicate_rows / row_count) * 100

        # Constant columns
        constant_columns = sum(1 for col in self.df.columns if self.df[col].nunique() == 1)

        # Column type counts
        date_columns = 0
        numeric_columns = 0
        categorical_columns = 0
        mixed_type_columns = 0

        for col in self.df.columns:
            if self._is_date_column(self.df[col]):
                date_columns += 1
            elif pd.api.types.is_numeric_dtype(self.df[col]):
                numeric_columns += 1
            else:
                categorical_columns += 1

        # Invalid dates
        invalid_dates = 0
        for col in self.df.columns:
            if self._is_date_column(self.df[col]):
                parsed = pd.to_datetime(self.df[col], errors='coerce')
                invalid_dates += parsed.isna().sum()

        # Infinite values
        infinite_values = 0
        for col in self.df.columns:
            if pd.api.types.is_numeric_dtype(self.df[col]):
                infinite_values += np.isinf(self.df[col]).sum()

        # Suspicious values (extreme outliers beyond 10 standard deviations)
        suspicious_values = 0
        for col in self.df.columns:
            if pd.api.types.is_numeric_dtype(self.df[col]):
                series = self.df[col].dropna()
                if len(series) > 0 and series.std() > 0:
                    z_scores = np.abs((series - series.mean()) / series.std())
                    suspicious_values += (z_scores > 10).sum()

        # Calculate quality score
        score = self._calculate_quality_score(
            missing_percentage,
            duplicate_percentage,
            constant_columns,
            column_count,
            invalid_dates,
            infinite_values,
            suspicious_values,
            row_count
        )

        # Generate reasons
        reasons = self._generate_quality_reasons(
            missing_percentage,
            duplicate_percentage,
            constant_columns,
            invalid_dates,
            infinite_values,
            suspicious_values
        )

        return DataQuality(
            row_count=row_count,
            column_count=column_count,
            missing_cells=int(missing_cells),
            missing_percentage=round(missing_percentage, 2),
            duplicate_rows=int(duplicate_rows),
            duplicate_percentage=round(duplicate_percentage, 2),
            constant_columns=constant_columns,
            date_columns=date_columns,
            numeric_columns=numeric_columns,
            categorical_columns=categorical_columns,
            mixed_type_columns=mixed_type_columns,
            invalid_dates=int(invalid_dates),
            infinite_values=int(infinite_values),
            suspicious_values=int(suspicious_values),
            score=round(score, 2),
            reasons=reasons
        )

    def _calculate_quality_score(
        self,
        missing_pct: float,
        duplicate_pct: float,
        constant_cols: int,
        total_cols: int,
        invalid_dates: int,
        infinite_values: int,
        suspicious_values: int,
        row_count: int
    ) -> float:
        score = 100.0

        # Deduct for missing values
        score -= min(missing_pct * 2, 30)

        # Deduct for duplicates
        score -= min(duplicate_pct * 3, 20)

        # Deduct for constant columns
        score -= min((constant_cols / total_cols) * 10, 10)

        # Deduct for invalid dates
        score -= min((invalid_dates / row_count) * 5, 10)

        # Deduct for infinite values
        score -= min((infinite_values / row_count) * 5, 10)

        # Deduct for suspicious values
        score -= min((suspicious_values / row_count) * 2, 10)

        return max(score, 0.0)

    def _generate_quality_reasons(
        self,
        missing_pct: float,
        duplicate_pct: float,
        constant_cols: int,
        invalid_dates: int,
        infinite_values: int,
        suspicious_values: int
    ) -> List[str]:
        reasons = []

        if missing_pct > 0:
            reasons.append(f"{missing_pct:.1f}% of cells are missing")
        if duplicate_pct > 0:
            reasons.append(f"{duplicate_pct:.1f}% of rows are duplicates")
        if constant_cols > 0:
            reasons.append(f"{constant_cols} constant columns detected")
        if invalid_dates > 0:
            reasons.append(f"{invalid_dates} invalid date values")
        if infinite_values > 0:
            reasons.append(f"{infinite_values} infinite values")
        if suspicious_values > 0:
            reasons.append(f"{suspicious_values} extreme outlier values")

        if not reasons:
            reasons.append("No significant data quality issues detected")

        return reasons
