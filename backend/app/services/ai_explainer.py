import os
from typing import Dict, List, Any, Optional
from groq import Groq
from pydantic import BaseModel, Field, field_validator
import json


class AIInsightResponse(BaseModel):
    executive_summary: str = Field(..., description="Brief executive summary of the analysis")
    insights: List[Dict[str, Any]] = Field(..., description="List of key insights with evidence references")
    recommendations: List[Dict[str, Any]] = Field(..., description="Actionable recommendations with evidence support")
    limitations: List[str] = Field(..., description="Limitations of the analysis")

    @field_validator('insights')
    @classmethod
    def validate_insights(cls, v):
        for insight in v:
            if 'evidence_ids' not in insight:
                raise ValueError("Each insight must include evidence_ids")
            if 'finding_ids' not in insight:
                raise ValueError("Each insight must include finding_ids")
        return v

    @field_validator('recommendations')
    @classmethod
    def validate_recommendations(cls, v):
        for rec in v:
            if 'evidence_ids' not in rec:
                raise ValueError("Each recommendation must include evidence_ids")
        return v


class AIExplainer:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        self.model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
        self.client = None

        if self.api_key:
            try:
                self.client = Groq(api_key=self.api_key)
            except Exception as e:
                print(f"Failed to initialize Groq client: {e}")

    def generate_insight(self, analysis_summary: Dict[str, Any]) -> Optional[AIInsightResponse]:
        if not self.client:
            return None

        try:
            # Extract only the analytical summary, not raw data
            kpis = analysis_summary.get('kpis', [])
            findings = analysis_summary.get('findings', [])
            evidence = analysis_summary.get('evidence', {})

            # Create a compact analytical package
            analytical_package = {
                "kpis": [{"id": k["id"], "name": k["name"], "value": k["value"], "unit": k["unit"]} for k in kpis],
                "findings": [
                    {
                        "id": f["id"],
                        "title": f["title"],
                        "type": f["type"],
                        "severity": f["severity"],
                        "metric": f["metric"],
                        "description": f["description"],
                        "evidence_ids": f["evidence_ids"],
                        "confidence": f["confidence"]
                    }
                    for f in findings
                ],
                "evidence_ids": list(evidence.keys())
            }

            # Build the prompt
            system_prompt = """You are an explanation layer over verified analytical results from a business data analysis system.

Your role is to:
1. Provide executive summary of the verified findings
2. Generate insights that reference ONLY the supplied finding and evidence IDs
3. Make recommendations ONLY when supported by the supplied evidence
4. Explicitly state limitations and uncertainties

CRITICAL CONSTRAINTS:
- You must NOT invent metrics or calculate new business numbers
- You must NOT introduce facts absent from the supplied analysis
- You must reference only supplied finding and evidence IDs
- You must distinguish association from causation
- If evidence is insufficient, say so explicitly
- If a recommendation cannot be supported by evidence, do not recommend it

Your response must be a valid JSON object with this exact structure:
{
  "executive_summary": "2-3 sentence executive summary",
  "insights": [
    {
      "insight": "Insight description",
      "evidence_ids": ["ev1", "ev2"],
      "finding_ids": ["f1", "f2"]
    }
  ],
  "recommendations": [
    {
      "recommendation": "Actionable recommendation",
      "evidence_ids": ["ev1"],
      "priority": "high/medium/low"
    }
  ],
  "limitations": ["Limitation 1", "Limitation 2"]
}

Ensure all evidence_ids and finding_ids in your response exist in the supplied analysis."""

            user_prompt = f"""Generate an executive summary, insights, and recommendations based on this verified analysis:

{json.dumps(analytical_package, indent=2)}

Available evidence IDs: {list(evidence.keys())}
Available finding IDs: {[f['id'] for f in findings]}

Respond with valid JSON only."""

            # Call Groq API
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,
                response_format={"type": "json_object"}
            )

            # Parse and validate response
            content = response.choices[0].message.content
            parsed = json.loads(content)

            # Validate evidence and finding IDs
            valid_evidence_ids = set(evidence.keys())
            valid_finding_ids = {f['id'] for f in findings}

            # Check insights
            for insight in parsed.get('insights', []):
                for eid in insight.get('evidence_ids', []):
                    if eid not in valid_evidence_ids:
                        raise ValueError(f"Invalid evidence ID in insight: {eid}")
                for fid in insight.get('finding_ids', []):
                    if fid not in valid_finding_ids:
                        raise ValueError(f"Invalid finding ID in insight: {fid}")

            # Check recommendations
            for rec in parsed.get('recommendations', []):
                for eid in rec.get('evidence_ids', []):
                    if eid not in valid_evidence_ids:
                        raise ValueError(f"Invalid evidence ID in recommendation: {eid}")

            # Validate with Pydantic
            validated = AIInsightResponse(**parsed)

            return validated

        except Exception as e:
            print(f"AI insight generation failed: {e}")
            return None

    def answer_question(self, question: str, analysis_data: Dict[str, Any]) -> Dict[str, Any]:
        if not self.client:
            return {
                "answer": "AI service is unavailable. The deterministic analysis is still available.",
                "evidence_ids": [],
                "finding_ids": [],
                "limitations": ["AI service unavailable"]
            }

        try:
            findings = analysis_data.get('findings', [])
            evidence = analysis_data.get('evidence', {})

            # Create compact analytical package
            analytical_package = {
                "findings": [
                    {
                        "id": f["id"],
                        "title": f["title"],
                        "type": f["type"],
                        "metric": f["metric"],
                        "description": f["description"],
                        "evidence_ids": f["evidence_ids"]
                    }
                    for f in findings
                ],
                "evidence_ids": list(evidence.keys())
            }

            system_prompt = """You are an explanation layer over verified analytical results.

Answer the user's question based ONLY on the supplied analysis.

CRITICAL CONSTRAINTS:
- You must NOT invent metrics or calculate new numbers
- You must reference only supplied finding and evidence IDs
- If evidence is insufficient to answer, say so explicitly
- Distinguish association from causation

Your response must be valid JSON with this structure:
{
  "answer": "Your answer",
  "evidence_ids": ["ev1", "ev2"],
  "finding_ids": ["f1", "f2"],
  "limitations": ["Limitation 1"]
}

Ensure all IDs exist in the supplied analysis."""

            user_prompt = f"""Question: {question}

Based on this analysis:
{json.dumps(analytical_package, indent=2)}

Available evidence IDs: {list(evidence.keys())}

Respond with valid JSON only."""

            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,
                response_format={"type": "json_object"}
            )

            content = response.choices[0].message.content
            parsed = json.loads(content)

            # Validate IDs
            valid_evidence_ids = set(evidence.keys())
            valid_finding_ids = {f['id'] for f in findings}

            for eid in parsed.get('evidence_ids', []):
                if eid not in valid_evidence_ids:
                    parsed['evidence_ids'].remove(eid)

            for fid in parsed.get('finding_ids', []):
                if fid not in valid_finding_ids:
                    parsed['finding_ids'].remove(fid)

            return parsed

        except Exception as e:
            print(f"AI question answering failed: {e}")
            return {
                "answer": f"I encountered an error processing your question: {str(e)}",
                "evidence_ids": [],
                "finding_ids": [],
                "limitations": ["AI service error"]
            }
