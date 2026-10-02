from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from .routers import analyze, health, ask
from .services.data_profiler import DataProfiler
from .services.kpi_engine import KPIEngine
from .services.trend_analyzer import TrendAnalyzer
from .services.anomaly_detector import AnomalyDetector
from .services.segment_analyzer import SegmentAnalyzer
from .services.evidence_engine import EvidenceEngine
from .services.finding_engine import FindingEngine
from .services.ai_explainer import AIExplainer


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(
    title="DecisionLens API",
    description="AI Decision Engine for Business Data",
    version="1.0.0",
    lifespan=lifespan
)

frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(analyze.router, prefix="/api", tags=["analyze"])
app.include_router(ask.router, prefix="/api", tags=["ask"])
