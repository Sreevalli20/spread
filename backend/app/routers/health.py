from fastapi import APIRouter
from ..models import AnalysisResponse

router = APIRouter()


@router.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "decisionlens-api",
        "version": "1.0.0"
    }
