from fastapi import APIRouter, HTTPException
from ..models import AskRequest, AskResponse
from ..services.ai_explainer import AIExplainer

router = APIRouter()


@router.post("/ask", response_model=AskResponse)
async def ask_question(request: AskRequest):
    try:
        ai_explainer = AIExplainer()
        answer = ai_explainer.answer_question(request.question, request.analysis_data)
        return answer
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process question: {str(e)}")
