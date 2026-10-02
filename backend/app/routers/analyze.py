from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
import io
import time
from ..models import AnalysisResponse, AIInsight
from ..services.data_profiler import DataProfiler
from ..services.kpi_engine import KPIEngine
from ..services.trend_analyzer import TrendAnalyzer
from ..services.anomaly_detector import AnomalyDetector
from ..services.segment_analyzer import SegmentAnalyzer
from ..services.evidence_engine import EvidenceEngine
from ..services.finding_engine import FindingEngine
from ..services.ai_explainer import AIExplainer

router = APIRouter()

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
MAX_ROWS = 100000
MAX_COLUMNS = 100


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_dataset(file: UploadFile = File(...)):
    start_time = time.time()

    # Validate file type
    if not file.filename.lower().endswith(('.csv', '.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Only CSV and XLSX files are supported")

    # Read file content
    content = await file.read()

    # Validate file size
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds 10 MB limit")

    # Parse the file
    try:
        if file.filename.lower().endswith('.csv'):
            df = pd.read_csv(io.BytesIO(content))
        else:
            df = pd.read_excel(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(e)}")

    # Validate dimensions
    if len(df) > MAX_ROWS:
        raise HTTPException(status_code=400, detail=f"Dataset exceeds {MAX_ROWS} row limit")
    if len(df.columns) > MAX_COLUMNS:
        raise HTTPException(status_code=400, detail=f"Dataset exceeds {MAX_COLUMNS} column limit")

    if len(df) == 0:
        raise HTTPException(status_code=400, detail="Dataset is empty")

    # Initialize services
    profiler = DataProfiler(df)
    kpi_engine = KPIEngine(df, profiler)
    trend_analyzer = TrendAnalyzer(df, profiler)
    anomaly_detector = AnomalyDetector(df, profiler)
    segment_analyzer = SegmentAnalyzer(df, profiler)
    evidence_engine = EvidenceEngine(df, profiler)
    finding_engine = FindingEngine(df, profiler, evidence_engine)
    ai_explainer = AIExplainer()

    # Run analysis pipeline
    columns = profiler.detect_columns()
    data_quality = profiler.calculate_data_quality()
    kpis = kpi_engine.calculate_kpis()
    trends = trend_analyzer.analyze_trends()
    anomalies = anomaly_detector.detect_anomalies()
    segment_comparisons = segment_analyzer.compare_segments()
    findings = finding_engine.generate_findings(trends, anomalies, segment_comparisons, kpis)
    evidence = evidence_engine.get_all_evidence()

    # Generate AI insight (optional, fail gracefully)
    ai_insight = None
    try:
        analysis_summary = {
            "kpis": [kpi.model_dump() for kpi in kpis],
            "trends": [trend.model_dump() for trend in trends],
            "anomalies": [anomaly.model_dump() for anomaly in anomalies],
            "segment_comparisons": [sc.model_dump() for sc in segment_comparisons],
            "findings": [finding.model_dump() for finding in findings],
            "evidence": {eid: ev.model_dump() for eid, ev in evidence.items()}
        }
        ai_insight_dict = ai_explainer.generate_insight(analysis_summary)
        if ai_insight_dict:
            ai_insight = ai_insight_dict
    except Exception as e:
        # AI failure should not break the entire analysis
        print(f"AI explanation failed: {str(e)}")

    processing_time = time.time() - start_time

    return AnalysisResponse(
        success=True,
        dataset_name=file.filename,
        columns=columns,
        data_quality=data_quality,
        kpis=kpis,
        trends=trends,
        anomalies=anomalies,
        segment_comparisons=segment_comparisons,
        findings=findings,
        evidence=evidence,
        ai_insight=ai_insight,
        processing_time=processing_time
    )
