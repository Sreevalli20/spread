import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, Loader2, AlertCircle, CheckCircle2, Sparkles, MessageSquare } from "lucide-react";
import { askQuestion } from "@/lib/api";
import type { AnalysisResponse, AskResponse } from "@/types";

export default function AskPage() {
  const navigate = useNavigate();
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<AskResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("analysisResult");
    if (stored) {
      setAnalysisData(JSON.parse(stored));
    } else {
      navigate("/analyze");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !analysisData) return;

    setLoading(true);
    setError(null);
    setAnswer(null);

    try {
      const response = await askQuestion(question, analysisData);
      setAnswer(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get answer");
    } finally {
      setLoading(false);
    }
  };

  const suggestedQuestions = [
    "What is driving the biggest business risk?",
    "Where are the strongest trends?",
    "Which anomalies deserve attention?",
    "Explain the biggest change in profitability.",
  ];

  if (!analysisData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold">Ask DecisionLens</h1>
                <p className="text-sm text-muted-foreground">{analysisData.dataset_name}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6 animate-fade-in">
          {/* Header Description */}
          <div className="text-center mb-8">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Ask about your data</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Ask questions about the dataset and get evidence-grounded answers.
              Every response is based on verified findings from your analysis.
            </p>
          </div>

          {/* Question Input */}
          <Card className="border shadow-elevated">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask about revenue, profitability, anomalies, trends..."
                    className="w-full min-h-[120px] p-4 border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background transition-all"
                    disabled={loading}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    Based on <span className="font-medium">{analysisData.findings.length}</span> findings and{" "}
                    <span className="font-medium">{Object.keys(analysisData.evidence).length}</span> evidence objects
                  </p>
                  <Button
                    type="submit"
                    disabled={loading || !question.trim()}
                    className="h-10 px-6 shadow-subtle"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Thinking...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Ask
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Error State */}
          {error && (
            <Card className="border border-destructive/50 bg-destructive/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-destructive mb-1">Unable to get answer</h3>
                    <p className="text-sm text-muted-foreground mb-2">{error}</p>
                    <p className="text-xs text-muted-foreground">
                      The AI service may be temporarily unavailable. Your deterministic analysis is still available in the Dashboard.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Answer Display */}
          {answer && (
            <Card className="border shadow-elevated">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b">
                  <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <h3 className="font-semibold">Answer</h3>
                </div>

                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {answer.answer}
                  </p>
                </div>

                {/* Evidence References */}
                {answer.evidence_ids.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      Supported by Evidence
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {answer.evidence_ids.map((eid) => (
                        <Badge key={eid} variant="outline" className="text-xs font-mono">
                          {eid.slice(0, 12)}...
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Finding References */}
                {answer.finding_ids.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-3">Related Findings</h4>
                    <div className="flex flex-wrap gap-2">
                      {answer.finding_ids.map((fid) => (
                        <Badge key={fid} variant="outline" className="text-xs font-mono">
                          {fid.slice(0, 12)}...
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Limitations */}
                {answer.limitations.length > 0 && (
                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-semibold mb-3">Limitations</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {answer.limitations.map((limit, idx) => (
                        <li key={idx}>{limit}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Suggested Questions */}
          {!answer && !loading && (
            <div>
              <h3 className="text-sm font-semibold mb-4 text-muted-foreground">
                Suggested questions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {suggestedQuestions.map((suggested) => (
                  <Button
                    key={suggested}
                    variant="outline"
                    className="text-left justify-start h-auto py-3 px-4 text-sm border hover:border-primary/50 transition-colors"
                    onClick={() => setQuestion(suggested)}
                  >
                    {suggested}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
