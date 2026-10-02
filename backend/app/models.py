from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
from enum import Enum


class FindingType(str, Enum):
    TREND = "trend"
    ANOMALY = "anomaly"
    SEGMENT_DIFFERENCE = "segment_difference"
    MARGIN_SIGNAL = "margin_signal"
    GROWTH_SIGNAL = "growth_signal"
    CONCENTRATION = "concentration"
    DATA_QUALITY_RISK = "data_quality_risk"
    OPERATIONAL_SIGNAL = "operational_signal"


class Severity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ColumnRole(str, Enum):
    DATE = "date"
    REVENUE = "revenue"
    SALES = "sales"
    COST = "cost"
    PROFIT = "profit"
    MARGIN = "margin"
    QUANTITY = "quantity"
    UNITS = "units"
    DISCOUNT = "discount"
    PRICE = "price"
    CUSTOMER = "customer"
    PRODUCT = "product"
    CATEGORY = "category"
    REGION = "region"
    STATE = "state"
    CITY = "city"
    SEGMENT = "segment"
    CHANNEL = "channel"
    ORDER_ID = "order_id"
    EMPLOYEE = "employee"
    STATUS = "status"
    DURATION = "duration"
    TARGET = "target"
    ACTUAL = "actual"
    UNKNOWN = "unknown"


class ColumnInfo(BaseModel):
    name: str
    dtype: str
    role: ColumnRole
    missing_count: int
    missing_percentage: float
    unique_count: int
    is_constant: bool
    sample_values: List[str]


class DataQuality(BaseModel):
    row_count: int
    column_count: int
    missing_cells: int
    missing_percentage: float
    duplicate_rows: int
    duplicate_percentage: float
    constant_columns: int
    date_columns: int
    numeric_columns: int
    categorical_columns: int
    mixed_type_columns: int
    invalid_dates: int
    infinite_values: int
    suspicious_values: int
    score: float
    reasons: List[str]


class KPI(BaseModel):
    id: str
    name: str
    value: float
    formatted_value: str
    unit: Optional[str]
    calculation: str
    source_columns: List[str]
    coverage: float
    warnings: List[str]


class Trend(BaseModel):
    metric: str
    direction: str
    strength: float
    recent_change: float
    volatility: float
    period_type: str
    evidence_id: str


class Anomaly(BaseModel):
    id: str
    metric: str
    dimension: Optional[str]
    observed_value: float
    expected_value: Optional[float]
    deviation: float
    severity: Severity
    method: str
    evidence_id: str
    limitations: List[str]


class SegmentComparison(BaseModel):
    dimension: str
    metric: str
    best_segment: str
    worst_segment: str
    difference: float
    difference_percentage: float
    best_sample_size: int
    worst_sample_size: int
    evidence_id: str


class Evidence(BaseModel):
    evidence_id: str
    finding_id: str
    claim: str
    source_columns: List[str]
    filters: Dict[str, Any]
    sample_size: int
    calculation: str
    values: Dict[str, Any]
    comparison: Dict[str, Any]
    limitations: List[str]
    data_quality: Dict[str, Any]


class Finding(BaseModel):
    id: str
    title: str
    type: FindingType
    severity: Severity
    impact: str
    metric: str
    description: str
    evidence_ids: List[str]
    confidence: float
    limitations: List[str]


class AIInsight(BaseModel):
    executive_summary: str
    insights: List[Dict[str, Any]]
    recommendations: List[Dict[str, Any]]
    limitations: List[str]


class AnalysisResponse(BaseModel):
    success: bool
    dataset_name: str
    columns: List[ColumnInfo]
    data_quality: DataQuality
    kpis: List[KPI]
    trends: List[Trend]
    anomalies: List[Anomaly]
    segment_comparisons: List[SegmentComparison]
    findings: List[Finding]
    evidence: Dict[str, Evidence]
    ai_insight: Optional[AIInsight] = None
    processing_time: float
    error: Optional[str] = None


class AskRequest(BaseModel):
    question: str
    analysis_data: Dict[str, Any]


class AskResponse(BaseModel):
    answer: str
    evidence_ids: List[str]
    finding_ids: List[str]
    limitations: List[str]
