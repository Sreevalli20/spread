import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import KPICard from "@/components/KPICard";
import FindingCard from "@/components/FindingCard";
import EvidencePanel from "@/components/EvidencePanel";
import TrendCard from "@/components/TrendCard";
import AnomalyCard from "@/components/AnomalyCard";
import DataQualityPanel from "@/components/DataQualityPanel";
import EmptyState from "@/components/EmptyState";
import { BarChart3, TrendingUp, CheckCircle2, MessageSquare, AlertTriangle, Loader2, X } from "lucide-react";
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
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <EmptyState type="no-analysis" />
      </div>
    );
  }

  const { dataset_name, data_quality, kpis, trends, anomalies, segment_comparisons, findings, evidence, ai_insight } = analysisData;

  const handleViewEvidence = (evidenceId: string) => {
    setSelectedEvidence(evidenceId);
    setActiveTab("evidence");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Dashboard</h1>
              <p className="text-sm text-muted-foreground">{dataset_name}</p>
            </div>
            <div className="flex gap-2">
              <Link to="/ask">
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Ask
                </Button>
              </Link>
              <Link to="/report">
                <Button variant="outline" size="sm">
                  Report
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4">
          <nav className="flex gap-1 overflow-x-auto">
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "signals", label: "Signals", icon: TrendingUp },
              { id: "evidence", label: "Evidence", icon: CheckCircle2 },
              { id: "recommendations", label: "Recommendations", icon: MessageSquare },
              { id: "quality", label: "Data Quality", icon: AlertTriangle },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {activeTab === "overview" && (
          <div className="space-y-8 animate-fade-in">
            {/* KPI Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Key Performance Indicators</h2>
                <Badge variant="outline">{kpis.length} metrics</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.slice(0, 4).map((kpi) => (
                  <KPICard key={kpi.id} kpi={kpi} />
                ))}
              </div>
            </section>

            {/* Executive Summary */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Executive Summary</h2>
              {ai_insight ? (
                <Card className="border">
                  <CardContent className="p-6">
                    <p className="text-muted-foreground leading-relaxed">{ai_insight.executive_summary}</p>
                  </CardContent>
                </Card>
              ) : (
                <EmptyState type="ai-unavailable" />
              )}
            </section>

            {/* Top Findings */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">What Matters</h2>
                <Badge variant="outline">{findings.length} findings</Badge>
              </div>
              {findings.length > 0 ? (
                <div className="space-y-3">
                  {findings.slice(0, 5).map((finding) => (
                    <FindingCard
                      key={finding.id}
                      finding={finding}
                      onViewEvidence={handleViewEvidence}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState type="no-findings" />
              )}
            </section>
          </div>
        )}

        {activeTab === "signals" && (
          <div className="space-y-8 animate-fade-in">
            {/* Trends */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Trends</h2>
                <Badge variant="outline">{trends.length} detected</Badge>
              </div>
              {trends.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trends.map((trend) => (
                    <TrendCard
                      key={trend.evidence_id}
                      trend={trend}
                      onViewEvidence={handleViewEvidence}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState type="no-trends" />
              )}
            </section>

            {/* Anomalies */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Anomalies</h2>
                <Badge variant="outline">{anomalies.length} detected</Badge>
              </div>
              {anomalies.length > 0 ? (
                <div className="space-y-3">
                  {anomalies.map((anomaly) => (
                    <AnomalyCard
                      key={anomaly.id}
                      anomaly={anomaly}
                      onViewEvidence={handleViewEvidence}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState type="no-anomalies" />
              )}
            </section>

            {/* Segment Comparisons */}
            {segment_comparisons.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Segment Comparisons</h2>
                  <Badge variant="outline">{segment_comparisons.length} comparisons</Badge>
                </div>
                <div className="space-y-3">
                  {segment_comparisons.map((comparison) => (
                    <Card key={comparison.evidence_id} className="border hover:shadow-medium transition-shadow">
                      <CardContent className="p-5">
                        <div className="space-y-3">
                          <h3 className="font-semibold">
                            {comparison.dimension} • {comparison.metric}
                          </h3>
                          <div className="flex items-center gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Best: </span>
                              <span className="font-medium text-green-600">{comparison.best_segment}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Worst: </span>
                              <span className="font-medium text-red-600">{comparison.worst_segment}</span>
                            </div>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Difference: </span>
                            <span className="font-medium">{comparison.difference.toFixed(2)}</span>
                            <span className="text-muted-foreground ml-2">
                              ({comparison.difference_percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewEvidence(comparison.evidence_id)}
                            className="mt-2"
                          >
                            View evidence
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {activeTab === "evidence" && (
          <div className="animate-fade-in">
            {selectedEvidence ? (
              <div className="max-w-3xl mx-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedEvidence(null)}
                  className="mb-4"
                >
                  <X className="h-4 w-4 mr-2" />
                  Back to all evidence
                </Button>
                {evidence[selectedEvidence] ? (
                  <EvidencePanel
                    evidence={evidence[selectedEvidence]}
                    onClose={() => setSelectedEvidence(null)}
                  />
                ) : (
                  <EmptyState type="no-findings" description="Evidence not found" />
                )}
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">All Evidence</h2>
                  <Badge variant="outline">{Object.keys(evidence).length} items</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(evidence).map(([id, ev]) => (
                    <Card
                      key={id}
                      className="border cursor-pointer hover:shadow-medium transition-shadow"
                      onClick={() => setSelectedEvidence(id)}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base line-clamp-2">{ev.claim}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Sample size: {ev.sample_size.toLocaleString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "recommendations" && (
          <div className="space-y-8 animate-fade-in">
            {ai_insight ? (
              <>
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">Recommendations</h2>
                    <Badge variant="outline">{ai_insight.recommendations.length} items</Badge>
                  </div>
                  <div className="space-y-4">
                    {ai_insight.recommendations.map((rec, idx) => (
                      <Card key={idx} className="border">
                        <CardContent className="p-5">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <Badge className="mb-2">{rec.priority}</Badge>
                                <p className="font-medium">{rec.recommendation}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>Supported by {rec.evidence_ids.length} evidence object(s)</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">Key Insights</h2>
                    <Badge variant="outline">{ai_insight.insights.length} insights</Badge>
                  </div>
                  <div className="space-y-4">
                    {ai_insight.insights.map((insight, idx) => (
                      <Card key={idx} className="border">
                        <CardContent className="p-5">
                          <p className="text-muted-foreground leading-relaxed">{insight.insight}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>

                {ai_insight.limitations.length > 0 && (
                  <section>
                    <h2 className="text-2xl font-bold mb-4">Limitations</h2>
                    <Card className="border">
                      <CardContent className="p-5">
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                          {ai_insight.limitations.map((limit, idx) => (
                            <li key={idx}>{limit}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </section>
                )}
              </>
            ) : (
              <EmptyState type="ai-unavailable" />
            )}
          </div>
        )}

        {activeTab === "quality" && (
          <div className="max-w-3xl mx-auto animate-fade-in">
            <DataQualityPanel dataQuality={data_quality} />
          </div>
        )}
      </main>
    </div>
  );
}


