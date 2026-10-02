import os
from typing import Dict, List, Any, Optional
from groq import Groq
from pydantic import BaseModel, Field, field_validator
import json
from ..models import AIInsight


class AIExplainer:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        self.model = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")
        self.client = None

        if self.api_key:
            try:
                self.client = Groq(api_key=self.api_key)
            except Exception as e:
                print(f"Failed to initialize Groq client: {e}")

    def generate_insight(self, analysis_summary: Dict[str, Any]) -> Optional[Dict[str, Any]]:
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
            system_prompt = """You are DecisionLens, an analytical assistant.

Answer using ONLY the supplied uploaded-dataset analysis context.
The context contains KPIs, findings, trends, anomalies, evidence, and data-quality information.

Use actual numeric values from the context.
Never invent metrics, numbers, findings, trends, anomalies, products, companies, or conclusions.
If the answer can be calculated from supplied values, calculate it.
For why/how questions, connect the explanation to relevant findings and evidence.
For change-over-time questions, use supplied trends and comparisons.
For KPI questions, use the corresponding KPI/evidence.
For recommendations, ground every recommendation in supplied evidence or findings.
Return valid evidence_ids and finding_ids for material claims.
Only state that evidence is insufficient when the supplied context genuinely contains no relevant information.

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

            # Validate evidence and finding IDs - filter out invalid IDs
            valid_evidence_ids = set(evidence.keys())
            valid_finding_ids = {f['id'] for f in findings}

            # Filter insights to only include valid IDs
            for insight in parsed.get('insights', []):
                insight['evidence_ids'] = [eid for eid in insight.get('evidence_ids', []) if eid in valid_evidence_ids]
                insight['finding_ids'] = [fid for fid in insight.get('finding_ids', []) if fid in valid_finding_ids]

            # Filter recommendations to only include valid IDs
            for rec in parsed.get('recommendations', []):
                rec['evidence_ids'] = [eid for eid in rec.get('evidence_ids', []) if eid in valid_evidence_ids]

            # Validate with Pydantic using the canonical AIInsight model
            validated = AIInsight(**parsed)

            # Return as dict for Pydantic to validate in response model
            return validated.model_dump()

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
            kpis = analysis_data.get('kpis', [])
            findings = analysis_data.get('findings', [])
            trends = analysis_data.get('trends', [])
            anomalies = analysis_data.get('anomalies', [])
            evidence = analysis_data.get('evidence', {})

            # Create compact analytical package with KPIs, trends, and anomalies
            analytical_package = {
                "kpis": [
                    {
                        "id": k["id"],
                        "name": k["name"],
                        "value": k["value"],
                        "unit": k["unit"],
                        "calculation": k["calculation"]
                    }
                    for k in kpis
                ],
                "trends": [
                    {
                        "metric": t["metric"],
                        "direction": t["direction"],
                        "strength": t["strength"],
                        "recent_change": t["recent_change"],
                        "evidence_id": t["evidence_id"]
                    }
                    for t in trends
                ],
                "anomalies": [
                    {
                        "id": a["id"],
                        "metric": a["metric"],
                        "observed_value": a["observed_value"],
                        "expected_value": a["expected_value"],
                        "deviation": a["deviation"],
                        "severity": a["severity"],
                        "evidence_id": a["evidence_id"]
                    }
                    for a in anomalies
                ],
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

            system_prompt = """You are DecisionLens, an analytical assistant.

Answer using ONLY the supplied uploaded-dataset analysis context.
The context contains KPIs, findings, trends, anomalies, evidence, and data-quality information.

Use actual numeric values from the context.
Never invent metrics, numbers, findings, trends, anomalies, products, companies, or conclusions.
If the answer can be calculated from supplied values, calculate it.
For why/how questions, connect the explanation to relevant findings and evidence.
For change-over-time questions, use supplied trends and comparisons.
For KPI questions, use the corresponding KPI/evidence.
For recommendations, ground every recommendation in supplied evidence or findings.
Return valid evidence_ids and finding_ids for material claims.
Only state that evidence is insufficient when the supplied context genuinely contains no relevant information.

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

            # Validate IDs - filter out invalid IDs
            valid_evidence_ids = set(evidence.keys())
            valid_finding_ids = {f['id'] for f in findings}

            parsed['evidence_ids'] = [eid for eid in parsed.get('evidence_ids', []) if eid in valid_evidence_ids]
            parsed['finding_ids'] = [fid for fid in parsed.get('finding_ids', []) if fid in valid_finding_ids]

            return parsed

        except Exception as e:
            print(f"AI question answering failed: {e}")
            return {
                "answer": f"I encountered an error processing your question: {str(e)}",
                "evidence_ids": [],
                "finding_ids": [],
                "limitations": ["AI service error"]
            }
