import pandas as pd
import numpy as np
from typing import List, Optional
from ..models import Finding, FindingType, Severity, Trend, Anomaly, SegmentComparison, KPI
from .data_profiler import DataProfiler
from .evidence_engine import EvidenceEngine
import uuid


class FindingEngine:
    def __init__(self, df: pd.DataFrame, profiler: DataProfiler, evidence_engine: EvidenceEngine):
        self.df = df.copy()
        self.profiler = profiler
        self.evidence_engine = evidence_engine

    def generate_findings(
        self,
        trends: List[Trend],
        anomalies: List[Anomaly],
        segment_comparisons: List[SegmentComparison],
        kpis: List[KPI]
    ) -> List[Finding]:
        findings = []

        # Generate trend findings
        for trend in trends:
            finding = self._generate_trend_finding(trend)
            if finding:
                findings.append(finding)

        # Generate anomaly findings
        for anomaly in anomalies:
            finding = self._generate_anomaly_finding(anomaly)
            if finding:
                findings.append(finding)

        # Generate segment comparison findings
        for comparison in segment_comparisons:
            finding = self._generate_segment_finding(comparison)
            if finding:
                findings.append(finding)

        # Generate margin signal findings
        margin_findings = self._generate_margin_findings(kpis)
        findings.extend(margin_findings)

        # Generate growth signal findings
        growth_findings = self._generate_growth_findings(kpis)
        findings.extend(growth_findings)

        # Generate data quality findings
        quality_findings = self._generate_data_quality_findings()
        findings.extend(quality_findings)

        return findings[:30]  # Limit to top 30 findings

    def _generate_trend_finding(self, trend: Trend) -> Optional[Finding]:
        finding_id = str(uuid.uuid4())

        # Create evidence
        evidence = self.evidence_engine.create_trend_evidence(
            finding_id=finding_id,
            metric=trend.metric,
            period_type=trend.period_type,
            values={
                "direction": trend.direction,
                "strength": trend.strength,
                "recent_change": trend.recent_change,
                "volatility": trend.volatility
            }
        )

        # Determine severity based on strength and direction
        if trend.strength > 0.7:
            severity = Severity.HIGH if trend.direction == "down" else Severity.MEDIUM
        elif trend.strength > 0.4:
            severity = Severity.MEDIUM
        else:
            severity = Severity.LOW

        # Determine impact
        if trend.direction == "down" and trend.strength > 0.5:
            impact = "negative"
        elif trend.direction == "up" and trend.strength > 0.5:
            impact = "positive"
        else:
            impact = "neutral"

        title = f"{trend.metric} is trending {trend.direction}"
        description = f"{trend.metric} shows a {trend.direction} trend with {trend.strength:.1%} strength. Recent change: {trend.recent_change:.2f}%, volatility: {trend.volatility:.2f}%."

        confidence = min(trend.strength, 0.95)

        return Finding(
            id=finding_id,
            title=title,
            type=FindingType.TREND,
            severity=severity,
            impact=impact,
            metric=trend.metric,
            description=description,
            evidence_ids=[evidence.evidence_id],
            confidence=round(confidence, 2),
            limitations=["Trend based on historical data, may not predict future"]
        )

    def _generate_anomaly_finding(self, anomaly: Anomaly) -> Optional[Finding]:
        finding_id = str(uuid.uuid4())

        # Create evidence
        evidence = self.evidence_engine.create_anomaly_evidence(
            finding_id=finding_id,
            metric=anomaly.metric,
            method=anomaly.method,
            observed_value=anomaly.observed_value,
            expected_value=anomaly.expected_value or 0,
            deviation=anomaly.deviation
        )

        title = f"Anomaly detected in {anomaly.metric}"
        description = f"Unusual value in {anomaly.metric}: {anomaly.observed_value:.2f} (expected: {anomaly.expected_value or 0:.2f}, deviation: {anomaly.deviation:.2%}). Detected using {anomaly.method}."

        confidence = min(0.9, anomaly.deviation / 5)

        return Finding(
            id=finding_id,
            title=title,
            type=FindingType.ANOMALY,
            severity=anomaly.severity,
            impact="negative" if anomaly.severity in [Severity.HIGH, Severity.CRITICAL] else "neutral",
            metric=anomaly.metric,
            description=description,
            evidence_ids=[evidence.evidence_id],
            confidence=round(confidence, 2),
            limitations=anomaly.limitations
        )

    def _generate_segment_finding(self, comparison: SegmentComparison) -> Optional[Finding]:
        finding_id = str(uuid.uuid4())

        # Create evidence
        evidence = self.evidence_engine.create_segment_evidence(
            finding_id=finding_id,
            dimension=comparison.dimension,
            metric=comparison.metric,
            best_segment=comparison.best_segment,
            worst_segment=comparison.worst_segment,
            difference=comparison.difference
        )

        title = f"Performance gap in {comparison.dimension}"
        description = f"{comparison.best_segment} outperforms {comparison.worst_segment} in {comparison.metric} by {comparison.difference:.2f} ({comparison.difference_percentage:.2f}%). Sample sizes: {comparison.best_sample_size} vs {comparison.worst_sample_size}."

        # Calculate confidence based on sample sizes
        min_sample_size = min(comparison.best_sample_size, comparison.worst_sample_size)
        confidence = min(0.95, min_sample_size / 100)

        severity = Severity.MEDIUM if comparison.difference_percentage > 50 else Severity.LOW

        return Finding(
            id=finding_id,
            title=title,
            type=FindingType.SEGMENT_DIFFERENCE,
            severity=severity,
            impact="positive" if comparison.metric in ['revenue', 'profit', 'margin'] else "neutral",
            metric=comparison.metric,
            description=description,
            evidence_ids=[evidence.evidence_id],
            confidence=round(confidence, 2),
            limitations=["Comparison based on group means only"]
        )

    def _generate_margin_findings(self, kpis: List[KPI]) -> List[Finding]:
        findings = []

        margin_kpi = next((kpi for kpi in kpis if kpi.id == "kpi_gross_margin"), None)
        if margin_kpi:
            finding_id = str(uuid.uuid4())

            evidence = self.evidence_engine.create_kpi_evidence(
                finding_id=finding_id,
                kpi_name=margin_kpi.name,
                calculation=margin_kpi.calculation,
                source_columns=margin_kpi.source_columns,
                value=margin_kpi.value,
                coverage=margin_kpi.coverage
            )

            # Determine if margin is concerning
            if margin_kpi.value < 20:
                severity = Severity.HIGH
                impact = "negative"
                title = "Low gross margin detected"
            elif margin_kpi.value < 40:
                severity = Severity.MEDIUM
                impact = "neutral"
                title = "Moderate gross margin"
            else:
                severity = Severity.LOW
                impact = "positive"
                title = "Healthy gross margin"

            description = f"Gross margin is {margin_kpi.formatted_value}. This is calculated as (revenue - cost) / revenue."

            findings.append(Finding(
                id=finding_id,
                title=title,
                type=FindingType.MARGIN_SIGNAL,
                severity=severity,
                impact=impact,
                metric="gross_margin",
                description=description,
                evidence_ids=[evidence.evidence_id],
                confidence=round(margin_kpi.coverage / 100, 2),
                limitations=margin_kpi.warnings
            ))

        return findings

    def _generate_growth_findings(self, kpis: List[KPI]) -> List[Finding]:
        findings = []

        growth_kpi = next((kpi for kpi in kpis if kpi.id == "kpi_growth"), None)
        if growth_kpi:
            finding_id = str(uuid.uuid4())

            evidence = self.evidence_engine.create_kpi_evidence(
                finding_id=finding_id,
                kpi_name=growth_kpi.name,
                calculation=growth_kpi.calculation,
                source_columns=growth_kpi.source_columns,
                value=growth_kpi.value,
                coverage=growth_kpi.coverage
            )

            if growth_kpi.value < -10:
                severity = Severity.HIGH
                impact = "negative"
                title = "Negative revenue growth"
            elif growth_kpi.value < 0:
                severity = Severity.MEDIUM
                impact = "negative"
                title = "Declining revenue"
            elif growth_kpi.value > 20:
                severity = Severity.LOW
                impact = "positive"
                title = "Strong revenue growth"
            else:
                severity = Severity.LOW
                impact = "neutral"
                title = "Moderate revenue growth"

            description = f"Revenue growth is {growth_kpi.formatted_value} over the analyzed period."

            findings.append(Finding(
                id=finding_id,
                title=title,
                type=FindingType.GROWTH_SIGNAL,
                severity=severity,
                impact=impact,
                metric="growth",
                description=description,
                evidence_ids=[evidence.evidence_id],
                confidence=round(growth_kpi.coverage / 100, 2),
                limitations=growth_kpi.warnings
            ))

        return findings

    def _generate_data_quality_findings(self) -> List[Finding]:
        findings = []
        data_quality = self.profiler.calculate_data_quality()

        if data_quality.score < 70:
            finding_id = str(uuid.uuid4())

            title = "Data quality concerns detected"
            description = f"Data quality score is {data_quality.score:.1f}/100. Issues: {', '.join(data_quality.reasons)}."

            findings.append(Finding(
                id=finding_id,
                title=title,
                type=FindingType.DATA_QUALITY_RISK,
                severity=Severity.MEDIUM,
                impact="negative",
                metric="data_quality",
                description=description,
                evidence_ids=[],
                confidence=1.0,
                limitations=["Quality score based on heuristics"]
            ))

        return findings
