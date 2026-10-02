import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Printer, CheckCircle2, XCircle } from "lucide-react";
import type { AnalysisResponse } from "@/types";

export default function ReportPage() {
  const navigate = useNavigate();
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("analysisResult");
    if (stored) {
      setAnalysisData(JSON.parse(stored));
    } else {
      navigate("/analyze");
    }
  }, [navigate]);

  const handlePrint = () => {
    window.print();
  };

  if (!analysisData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Loading report...</p>
        </div>
      </div>
    );
  }

  const { dataset_name, data_quality, kpis, trends, anomalies, segment_comparisons, findings, evidence, ai_insight } = analysisData;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "low":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case "positive":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "negative":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 print:bg-white print:text-black">
      <header className="border-b bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm sticky top-0 z-10 print:hidden">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">DecisionLens Report</h1>
          </div>
          <div className="flex gap-2">
            <Button onClick={handlePrint} variant="outline">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Report Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">DecisionLens Report</h1>
          <p className="text-xl text-muted-foreground">Evidence-Based Decision Analysis</p>
          <p className="text-sm text-muted-foreground mt-2">Dataset: {dataset_name}</p>
          <p className="text-xs text-muted-foreground">
            Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </p>
        </div>

        {/* Executive Summary */}
        {ai_insight && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Executive Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{ai_insight.executive_summary}</p>
            </CardContent>
          </Card>
        )}

        {/* Dataset Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Dataset Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Rows</p>
                <p className="text-2xl font-bold">{data_quality.row_count.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Columns</p>
                <p className="text-2xl font-bold">{data_quality.column_count}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quality Score</p>
                <p className="text-2xl font-bold">{data_quality.score.toFixed(1)}/100</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Processing Time</p>
                <p className="text-2xl font-bold">{analysisData.processing_time.toFixed(2)}s</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Quality */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Data Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Missing Cells</span>
                <span className="font-medium">{data_quality.missing_cells.toLocaleString()} ({data_quality.missing_percentage.toFixed(1)}%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duplicate Rows</span>
                <span className="font-medium">{data_quality.duplicate_rows.toLocaleString()} ({data_quality.duplicate_percentage.toFixed(1)}%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invalid Dates</span>
                <span className="font-medium">{data_quality.invalid_dates.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Infinite Values</span>
                <span className="font-medium">{data_quality.infinite_values.toLocaleString()}</span>
              </div>
            </div>
            {data_quality.reasons.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Quality Issues:</p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {data_quality.reasons.map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Key KPIs */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Key Performance Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {kpis.map((kpi) => (
                <div key={kpi.id} className="border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">{kpi.name}</p>
                  <p className="text-2xl font-bold">{kpi.formatted_value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{kpi.calculation}</p>
                  {kpi.warnings.length > 0 && (
                    <p className="text-xs text-orange-600 mt-1">{kpi.warnings[0]}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Decision Signals */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Decision Signals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {findings.map((finding) => (
                <div key={finding.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {getImpactIcon(finding.impact)}
                    <h3 className="font-semibold">{finding.title}</h3>
                    <Badge className={getSeverityColor(finding.severity)}>{finding.severity}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{finding.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">Confidence: {(finding.confidence * 100).toFixed(1)}%</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Evidence Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Evidence Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              This analysis is based on {Object.keys(evidence).length} evidence objects. Each finding is traceable to specific data calculations.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-2">Trends Detected</p>
                <p className="text-2xl font-bold">{trends.length}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Anomalies Detected</p>
                <p className="text-2xl font-bold">{anomalies.length}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Segment Comparisons</p>
                <p className="text-2xl font-bold">{segment_comparisons.length}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Total Evidence Objects</p>
                <p className="text-2xl font-bold">{Object.keys(evidence).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        {ai_insight && ai_insight.recommendations.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ai_insight.recommendations.map((rec, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge>{rec.priority}</Badge>
                    </div>
                    <p className="font-medium">{rec.recommendation}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Supported by {rec.evidence_ids.length} evidence object(s)
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Limitations */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Limitations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Analysis is based on aggregate calculations, not row-level traceability</li>
              <li>Trend analysis assumes linear relationships unless otherwise specified</li>
              <li>Anomaly detection uses statistical methods that may not capture all business-relevant anomalies</li>
              <li>Segment comparisons are based on group means and may not account for within-group variance</li>
              {ai_insight?.limitations.map((limit, idx) => (
                <li key={idx}>{limit}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Methodology */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Methodology</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p><strong>Data Profiling:</strong> Automatic detection of column types, missing values, and data quality metrics.</p>
              <p><strong>KPI Calculation:</strong> Deterministic calculations using Pandas for revenue, cost, profit, margin, and other business metrics.</p>
              <p><strong>Trend Analysis:</strong> Linear regression on time-aggregated data to detect directional trends.</p>
              <p><strong>Anomaly Detection:</strong> Statistical methods including IQR and robust z-score to identify outliers.</p>
              <p><strong>Segment Analysis:</strong> Group-by comparisons to identify performance differences across categorical dimensions.</p>
              <p><strong>Evidence Engine:</strong> Every finding is backed by an evidence object with traceable calculations.</p>
              <p><strong>AI Explanation:</strong> Groq AI provides explanations and recommendations based only on verified findings.</p>
            </div>
          </CardContent>
        </Card>

        {/* AI Disclosure */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>AI Disclosure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>This analysis uses AI (Groq) for explanation and recommendation generation only.</p>
              <p>All KPIs, trends, anomalies, and findings are calculated deterministically using Pandas.</p>
              <p>AI responses are validated to ensure they reference only verified evidence and findings.</p>
              <p>If the AI service is unavailable, the deterministic analysis remains fully functional.</p>
              <p>AI may occasionally generate incorrect explanations. Always verify with the evidence provided.</p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground mt-8 pt-8 border-t">
          <p>DecisionLens — From spreadsheet to evidence to decision.</p>
          <p className="mt-1">This report was generated automatically. Verify all findings before making business decisions.</p>
        </div>
      </main>
    </div>
  );
}
