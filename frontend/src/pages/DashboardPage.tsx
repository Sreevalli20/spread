import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, AlertTriangle, BarChart3, MessageSquare, FileText, CheckCircle2, XCircle, Loader2 as LucideLoader2 } from "lucide-react";
import type { AnalysisResponse } from "@/types";

export default function DashboardPage() {
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "signals" | "evidence" | "recommendations" | "quality">("overview");
  const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("analysisResult");
    if (stored) {
      setAnalysisData(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LucideLoader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>No Analysis Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                No analysis data found. Please upload a dataset and run an analysis first.
              </p>
              <Link to="/analyze">
                <Button>Upload Dataset</Button>
              </Link>
            </CardContent>
          </Card>
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <header className="border-b bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/analyze">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold">Dashboard</h1>
              <p className="text-sm text-muted-foreground">{dataset_name}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/ask">
              <Button variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                Ask DecisionLens
              </Button>
            </Link>
            <Link to="/report">
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <nav className="flex gap-1 overflow-x-auto">
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "signals", label: "Signals", icon: TrendingUp },
              { id: "evidence", label: "Evidence", icon: CheckCircle2 },
              { id: "recommendations", label: "Recommendations", icon: MessageSquare },
              { id: "quality", label: "Data Quality", icon: AlertTriangle },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Key Performance Indicators</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi) => (
                  <Card key={kpi.id}>
                    <CardHeader className="pb-2">
                      <CardDescription>{kpi.name}</CardDescription>
                      <CardTitle className="text-2xl">{kpi.value.toLocaleString()}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm">
                        {kpi.change !== undefined && (
                          <>
                            {kpi.change >= 0 ? (
                              <TrendingUp className="w-4 h-4 text-green-600" />
                            ) : (
                              <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />
                            )}
                            <span className={kpi.change >= 0 ? "text-green-600" : "text-red-600"}>
                              {kpi.change >= 0 ? "+" : ""}{kpi.change.toFixed(1)}%
                            </span>
                          </>
                        )}
                        <span className="text-muted-foreground">vs {kpi.comparison_period}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Executive Summary */}
            {ai_insight && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Executive Summary</h2>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground">{ai_insight.executive_summary}</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Findings */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Key Findings</h2>
              <div className="space-y-4">
                {findings.map((finding) => (
                  <Card key={finding.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getImpactIcon(finding.impact)}
                            <CardTitle className="text-lg">{finding.title}</CardTitle>
                          </div>
                          <CardDescription>{finding.description}</CardDescription>
                        </div>
                        <Badge>{finding.severity}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedEvidence(finding.evidence_id);
                          setActiveTab("evidence");
                        }}
                      >
                        View Evidence
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "signals" && (
          <div className="space-y-6">
            {/* Trends */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Trends</h2>
              <div className="space-y-4">
                {trends.map((trend) => (
                  <Card key={trend.evidence_id}>
                    <CardHeader>
                      <CardTitle>{trend.metric}</CardTitle>
                      <CardDescription>Direction: {trend.direction}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Slope</span>
                          <span className="font-medium">{trend.slope.toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">R²</span>
                          <span className="font-medium">{trend.r_squared.toFixed(3)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Volatility</span>
                          <span className="font-medium">{trend.volatility.toFixed(3)}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            setSelectedEvidence(trend.evidence_id);
                            setActiveTab("evidence");
                          }}
                        >
                          View Evidence
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Anomalies */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Anomalies</h2>
              <div className="space-y-4">
                {anomalies.map((anomaly) => (
                  <Card key={anomaly.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <CardTitle>{anomaly.metric}</CardTitle>
                          <CardDescription>Method: {anomaly.method}</CardDescription>
                        </div>
                        <Badge className={getSeverityColor(anomaly.severity)}>
                          {anomaly.severity}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Observed</span>
                          <span className="font-medium">{anomaly.observed_value.toFixed(2)}</span>
                        </div>
                        {anomaly.expected_value && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Expected</span>
                            <span className="font-medium">{anomaly.expected_value.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Deviation</span>
                          <span className="font-medium text-red-600">
                            {(anomaly.deviation * 100).toFixed(1)}%
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            setSelectedEvidence(anomaly.evidence_id);
                            setActiveTab("evidence");
                          }}
                        >
                          View Evidence
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Segment Comparisons */}
            {segment_comparisons.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Segment Comparisons</h2>
                <div className="space-y-3">
                  {segment_comparisons.map((comparison) => (
                    <Card key={comparison.evidence_id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold mb-2">
                              {comparison.dimension} • {comparison.metric}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              <span className="text-green-600 font-medium">{comparison.best_segment}</span> vs{" "}
                              <span className="text-red-600 font-medium">{comparison.worst_segment}</span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Difference: {comparison.difference.toFixed(2)} ({comparison.difference_percentage.toFixed(1)}%)
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Sample sizes: {comparison.best_sample_size} vs {comparison.worst_sample_size}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedEvidence(comparison.evidence_id);
                              setActiveTab("evidence");
                            }}
                          >
                            View Evidence
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "evidence" && (
          <div className="space-y-6">
            {selectedEvidence ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Evidence Details</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedEvidence(null)}>
                      Close
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {evidence[selectedEvidence] ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Claim</h4>
                        <p className="text-sm text-muted-foreground">{evidence[selectedEvidence].claim}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Source Columns</h4>
                        <div className="flex flex-wrap gap-2">
                          {evidence[selectedEvidence].source_columns.map((col) => (
                            <Badge key={col} variant="outline">
                              {col}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Sample Size</h4>
                        <p className="text-sm text-muted-foreground">{evidence[selectedEvidence].sample_size} records</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Calculation</h4>
                        <p className="text-sm text-muted-foreground font-mono bg-slate-50 dark:bg-slate-800 p-2 rounded">
                          {evidence[selectedEvidence].calculation}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Values</h4>
                        <pre className="text-sm text-muted-foreground bg-slate-50 dark:bg-slate-800 p-2 rounded overflow-x-auto">
                          {JSON.stringify(evidence[selectedEvidence].values, null, 2)}
                        </pre>
                      </div>
                      {evidence[selectedEvidence].limitations.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Limitations</h4>
                          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            {evidence[selectedEvidence].limitations.map((limit, idx) => (
                              <li key={idx}>{limit}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Evidence not found</p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div>
                <h2 className="text-2xl font-bold mb-4">All Evidence</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(evidence).map(([id, ev]) => (
                    <Card key={id} className="cursor-pointer hover:border-blue-500 transition-colors" onClick={() => setSelectedEvidence(id)}>
                      <CardHeader>
                        <CardTitle className="text-base">{ev.claim.slice(0, 50)}...</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">Sample size: {ev.sample_size}</p>
                        <p className="text-xs text-muted-foreground mt-1">Click to view details</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "recommendations" && (
          <div className="space-y-6">
            {ai_insight ? (
              <>
                <div>
                  <h2 className="text-2xl font-bold mb-4">Recommendations</h2>
                  <div className="space-y-4">
                    {ai_insight.recommendations.map((rec, idx) => (
                      <Card key={idx}>
                        <CardHeader>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge>{rec.priority}</Badge>
                              </div>
                              <CardTitle className="text-lg">{rec.recommendation}</CardTitle>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Supported by evidence:</p>
                            <div className="flex flex-wrap gap-2">
                              {rec.evidence_ids.map((eid) => (
                                <Badge key={eid} variant="outline" className="cursor-pointer" onClick={() => setSelectedEvidence(eid)}>
                                  {eid.slice(0, 8)}...
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">Key Insights</h2>
                  <div className="space-y-4">
                    {ai_insight.insights.map((insight, idx) => (
                      <Card key={idx}>
                        <CardContent className="pt-6">
                          <p className="text-muted-foreground">{insight.insight}</p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {insight.evidence_ids.map((eid) => (
                              <Badge key={eid} variant="outline" className="cursor-pointer" onClick={() => setSelectedEvidence(eid)}>
                                {eid.slice(0, 8)}...
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {ai_insight.limitations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Limitations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        {ai_insight.limitations.map((limit, idx) => (
                          <li key={idx}>{limit}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground text-center">
                    AI recommendations are not available. The deterministic analysis is still available in other tabs.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === "quality" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Quality Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-2">{data_quality.score.toFixed(1)}/100</div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${data_quality.score}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Dataset Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rows</span>
                      <span className="font-medium">{data_quality.row_count.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Columns</span>
                      <span className="font-medium">{data_quality.column_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Missing Cells</span>
                      <span className="font-medium">{data_quality.missing_cells.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duplicate Rows</span>
                      <span className="font-medium">{data_quality.duplicate_rows.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Column Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date Columns</span>
                      <span className="font-medium">{data_quality.date_columns}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Numeric Columns</span>
                      <span className="font-medium">{data_quality.numeric_columns}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Categorical Columns</span>
                      <span className="font-medium">{data_quality.categorical_columns}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Constant Columns</span>
                      <span className="font-medium">{data_quality.constant_columns}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quality Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  {data_quality.reasons.map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}


