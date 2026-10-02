export type ColumnRole =
  | "date"
  | "revenue"
  | "sales"
  | "cost"
  | "profit"
  | "margin"
  | "quantity"
  | "units"
  | "discount"
  | "price"
  | "customer"
  | "product"
  | "category"
  | "region"
  | "state"
  | "city"
  | "segment"
  | "channel"
  | "order_id"
  | "employee"
  | "status"
  | "duration"
  | "target"
  | "actual"
  | "unknown";

export type FindingType =
  | "trend"
  | "anomaly"
  | "segment_difference"
  | "margin_signal"
  | "growth_signal"
  | "concentration"
  | "data_quality_risk"
  | "operational_signal";

export type Severity = "low" | "medium" | "high" | "critical";

export interface ColumnInfo {
  name: string;
  dtype: string;
  role: ColumnRole;
  missing_count: number;
  missing_percentage: number;
  unique_count: number;
  is_constant: boolean;
  sample_values: string[];
}

export interface DataQuality {
  row_count: number;
  column_count: number;
  missing_cells: number;
  missing_percentage: number;
  duplicate_rows: number;
  duplicate_percentage: number;
  constant_columns: number;
  date_columns: number;
  numeric_columns: number;
  categorical_columns: number;
  mixed_type_columns: number;
  invalid_dates: number;
  infinite_values: number;
  suspicious_values: number;
  score: number;
  reasons: string[];
}

export interface KPI {
  id: string;
  name: string;
  value: number;
  formatted_value: string;
  unit: string | null;
  calculation: string;
  source_columns: string[];
  coverage: number;
  warnings: string[];
}

export interface Trend {
  metric: string;
  direction: string;
  strength: number;
  recent_change: number;
  volatility: number;
  period_type: string;
  evidence_id: string;
}

export interface Anomaly {
  id: string;
  metric: string;
  dimension: string | null;
  observed_value: number;
  expected_value: number | null;
  deviation: number;
  severity: Severity;
  method: string;
  evidence_id: string;
  limitations: string[];
}

export interface SegmentComparison {
  dimension: string;
  metric: string;
  best_segment: string;
  worst_segment: string;
  difference: number;
  difference_percentage: number;
  best_sample_size: number;
  worst_sample_size: number;
  evidence_id: string;
}

export interface Evidence {
  evidence_id: string;
  finding_id: string;
  claim: string;
  source_columns: string[];
  filters: Record<string, any>;
  sample_size: number;
  calculation: string;
  values: Record<string, any>;
  comparison: Record<string, any>;
  limitations: string[];
  data_quality: Record<string, any>;
}

export interface Finding {
  id: string;
  title: string;
  type: FindingType;
  severity: Severity;
  impact: string;
  metric: string;
  description: string;
  evidence_ids: string[];
  confidence: number;
  limitations: string[];
}

export interface AIInsight {
  executive_summary: string;
  insights: Array<{
    insight: string;
    evidence_ids: string[];
    finding_ids: string[];
  }>;
  recommendations: Array<{
    recommendation: string;
    evidence_ids: string[];
    priority: string;
  }>;
  limitations: string[];
}

export interface AnalysisResponse {
  success: boolean;
  dataset_name: string;
  columns: ColumnInfo[];
  data_quality: DataQuality;
  kpis: KPI[];
  trends: Trend[];
  anomalies: Anomaly[];
  segment_comparisons: SegmentComparison[];
  findings: Finding[];
  evidence: Record<string, Evidence>;
  ai_insight: AIInsight | null;
  processing_time: number;
  error: string | null;
}

export interface AskResponse {
  answer: string;
  evidence_ids: string[];
  finding_ids: string[];
  limitations: string[];
}
