import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
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

  if (!analysisData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <header className="border-b bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold">Ask DecisionLens</h1>
              <p className="text-sm text-muted-foreground">{analysisData.dataset_name}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Question Input */}
          <Card>
            <CardHeader>
              <CardTitle>Ask a Question</CardTitle>
              <CardDescription>
                Ask DecisionLens about your data analysis. The AI will provide grounded answers based on the evidence and findings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="e.g., What are the main revenue trends? Which segments are performing best?"
                    className="w-full min-h-[120px] p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700"
                    disabled={loading}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    Based on {analysisData.findings.length} findings and {Object.keys(analysisData.evidence).length} evidence objects
                  </p>
                  <Button type="submit" disabled={loading || !question.trim()}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Thinking...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
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
            <Card className="border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900 dark:text-red-300 mb-1">Error</h3>
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                    <p className="text-xs text-red-600 dark:text-red-500 mt-2">
                      The AI service may be temporarily unavailable. Your deterministic analysis is still available in the Dashboard.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Answer Display */}
          {answer && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <CardTitle>Answer</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-muted-foreground whitespace-pre-wrap">{answer.answer}</p>
                </div>

                {/* Evidence References */}
                {answer.evidence_ids.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Supported by Evidence</h4>
                    <div className="flex flex-wrap gap-2">
                      {answer.evidence_ids.map((eid) => (
                        <Badge key={eid} variant="outline" className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                          {eid.slice(0, 12)}...
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Finding References */}
                {answer.finding_ids.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Related Findings</h4>
                    <div className="flex flex-wrap gap-2">
                      {answer.finding_ids.map((fid) => (
                        <Badge key={fid} variant="outline" className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                          {fid.slice(0, 12)}...
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Limitations */}
                {answer.limitations.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Limitations</h4>
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

          {/* Quick Questions */}
          {!answer && !loading && (
            <Card>
              <CardHeader>
                <CardTitle>Suggested Questions</CardTitle>
                <CardDescription>Click to ask about common topics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    "What are the main revenue trends?",
                    "Which segments are performing best?",
                    "What anomalies were detected?",
                    "What are the key risks?",
                    "How is profitability trending?",
                    "What are the data quality issues?",
                  ].map((suggested) => (
                    <Button
                      key={suggested}
                      variant="outline"
                      className="text-left justify-start h-auto py-3 px-4"
                      onClick={() => setQuestion(suggested)}
                    >
                      {suggested}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
