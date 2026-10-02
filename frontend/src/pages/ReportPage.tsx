import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Printer, CheckCircle2, XCircle, Loader2, FileText, Calendar, Database, TrendingUp, AlertTriangle } from "lucide-react";
import type { AnalysisResponse } from "@/types";

export default function ReportPage() {
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem("analysisResult");
    if (stored) {
      setAnalysisData(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading report...</p>
        </div>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full border">
          <CardHeader>
            <CardTitle>No Analysis Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              No analysis data found. Please upload a dataset and run an analysis first.
            </p>
            <Link to="/analyze">
              <Button className="w-full">Upload Dataset</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { dataset_name, data_quality, kpis, trends, anomalies, segment_comparisons, findings, evidence, ai_insight } = analysisData;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "high":
        return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20";
      case "low":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case "positive":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "negative":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background print:bg-white print:text-black">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 print:hidden">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-xl font-semibold">DecisionLens Report</h1>
            </div>
            <Button onClick={handlePrint} variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print / Export
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl print:max-w-none print:px-8 print:py-12">
        {/* Report Header */}
        <div className="mb-12 text-center print:mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
              <FileText className="h-7 w-7 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2 tracking-tight">DecisionLens Analysis Report</h1>
          <p className="text-xl text-muted-foreground mb-4">Evidence-Based Decision Intelligence</p>
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span>Dataset: {dataset_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <section className="mb-8 print:mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Executive Summary</h2>
          </div>
          {ai_insight ? (
            <Card className="border print:border print:shadow-none">
              <CardContent className="p-6">
                <p className="text-muted-foreground leading-relaxed">{ai_insight.executive_summary}</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-900 print:border-yellow-300 print:bg-yellow-50">
              <CardContent className="p-6">
                <p className="text-muted-foreground">
                  AI-generated executive summary is not available. The deterministic analysis below provides all KPIs, trends, anomalies, and findings based on your data.
                </p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Dataset Overview */}
        <section className="mb-8 print:mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Database className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Dataset Overview</h2>
          </div>
          <Card className="border print:border print:shadow-none">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Rows</p>
                  <p className="text-2xl font-bold">{data_quality.row_count.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Columns</p>
                  <p className="text-2xl font-bold">{data_quality.column_count}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Quality Score</p>
                  <p className="text-2xl font-bold">{data_quality.score.toFixed(1)}/100</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Processing Time</p>
                  <p className="text-2xl font-bold">{analysisData.processing_time.toFixed(2)}s</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Data Quality */}
        <section className="mb-8 print:mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Data Quality</h2>
          </div>
          <Card className="border print:border print:shadow-none">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Missing Cells</p>
                  <p className="text-lg font-semibold">
                    {data_quality.missing_cells.toLocaleString()} ({data_quality.missing_percentage.toFixed(1)}%)
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Duplicate Rows</p>
                  <p className="text-lg font-semibold">
                    {data_quality.duplicate_rows.toLocaleString()} ({data_quality.duplicate_percentage.toFixed(1)}%)
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Invalid Dates</p>
                  <p className="text-lg font-semibold">{data_quality.invalid_dates.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Infinite Values</p>
                  <p className="text-lg font-semibold">{data_quality.infinite_values.toLocaleString()}</p>
                </div>
              </div>
              {data_quality.reasons.length > 0 && (
                <div className="pt-4 border-t">
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
        </section>

        {/* Key KPIs */}
        <section className="mb-8 print:mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Key Performance Indicators</h2>
          </div>
          <Card className="border print:border print:shadow-none">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {kpis.map((kpi) => (
                  <div key={kpi.id} className="border rounded-lg p-4 print:border">
                    <p className="text-sm text-muted-foreground mb-1">{kpi.name}</p>
                    <p className="text-2xl font-bold">{kpi.formatted_value}</p>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">{kpi.calculation}</p>
                    {kpi.warnings.length > 0 && (
                      <p className="text-xs text-orange-600 mt-1">{kpi.warnings[0]}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Decision Signals */}
        <section className="mb-8 print:mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Decision Signals</h2>
          </div>
          <Card className="border print:border print:shadow-none">
            <CardContent className="p-6">
              <div className="space-y-4">
                {findings.map((finding) => (
                  <div key={finding.id} className="border rounded-lg p-4 print:border">
                    <div className="flex items-center gap-2 mb-2">
                      {getImpactIcon(finding.impact)}
                      <h3 className="font-semibold">{finding.title}</h3>
                      <Badge className={getSeverityColor(finding.severity)} variant="outline">
                        {finding.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{finding.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Confidence: {(finding.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Evidence Summary */}
        <section className="mb-8 print:mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Evidence Summary</h2>
          </div>
          <Card className="border print:border print:shadow-none">
            <CardContent className="p-6">
              <p className="text-muted-foreground mb-6">
                This analysis is based on {Object.keys(evidence).length} evidence objects. Each finding is traceable to specific data calculations.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="border rounded-lg p-4 print:border">
                  <p className="text-sm text-muted-foreground mb-1">Trends Detected</p>
                  <p className="text-2xl font-bold">{trends.length}</p>
                </div>
                <div className="border rounded-lg p-4 print:border">
                  <p className="text-sm text-muted-foreground mb-1">Anomalies Detected</p>
                  <p className="text-2xl font-bold">{anomalies.length}</p>
                </div>
                <div className="border rounded-lg p-4 print:border">
                  <p className="text-sm text-muted-foreground mb-1">Segment Comparisons</p>
                  <p className="text-2xl font-bold">{segment_comparisons.length}</p>
                </div>
                <div className="border rounded-lg p-4 print:border">
                  <p className="text-sm text-muted-foreground mb-1">Total Evidence Objects</p>
                  <p className="text-2xl font-bold">{Object.keys(evidence).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Recommendations */}
        <section className="mb-8 print:mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Recommendations</h2>
          </div>
          {ai_insight ? (
            ai_insight.recommendations.length > 0 ? (
              <Card className="border print:border print:shadow-none">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {ai_insight.recommendations.map((rec, idx) => (
                      <div key={idx} className="border rounded-lg p-4 print:border">
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
            ) : (
              <Card className="border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-900 print:border-yellow-300 print:bg-yellow-50">
                <CardContent className="p-6">
                  <p className="text-muted-foreground">
                    AI-generated recommendations are not available. Review the Decision Signals and Evidence sections below for actionable insights from your data.
                  </p>
                </CardContent>
              </Card>
            )
          ) : (
            <Card className="border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-900 print:border-yellow-300 print:bg-yellow-50">
              <CardContent className="p-6">
                <p className="text-muted-foreground">
                  AI-generated recommendations are not available. Review the Decision Signals and Evidence sections below for actionable insights from your data.
                </p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Limitations */}
        <section className="mb-8 print:mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Limitations</h2>
          </div>
          <Card className="border print:border print:shadow-none">
            <CardContent className="p-6">
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
        </section>

        {/* Methodology */}
        <section className="mb-8 print:mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Database className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Methodology</h2>
          </div>
          <Card className="border print:border print:shadow-none">
            <CardContent className="p-6">
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
        </section>

        {/* AI Disclosure */}
        <section className="mb-8 print:mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">AI Disclosure</h2>
          </div>
          <Card className="border print:border print:shadow-none">
            <CardContent className="p-6">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>This analysis uses AI (Groq) for explanation and recommendation generation only.</p>
                <p>All KPIs, trends, anomalies, and findings are calculated deterministically using Pandas.</p>
                <p>AI responses are validated to ensure they reference only verified evidence and findings.</p>
                <p>If the AI service is unavailable, the deterministic analysis remains fully functional.</p>
                <p>AI may occasionally generate incorrect explanations. Always verify with the evidence provided.</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pt-8 border-t print:pt-6 print:border-t">
          <p className="font-medium mb-1">DecisionLens — From spreadsheet to evidence to decision.</p>
          <p className="text-xs">This report was generated automatically. Verify all findings before making business decisions.</p>
        </div>
      </main>
    </div>
  );
}
