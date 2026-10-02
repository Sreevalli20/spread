import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileSpreadsheet, TrendingUp, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold">DecisionLens</span>
          </div>
          <Link to="/analyze">
            <Button>Analyze Your Data</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Turn business data into decisions you can defend
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Upload a business spreadsheet. DecisionLens calculates the signals,
            traces findings back to evidence, and turns verified findings into
            actionable decision briefs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/analyze">
              <Button size="lg" className="text-lg">
                Analyze your data
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg">
              See how evidence works
            </Button>
          </div>
        </div>

        {/* Visual Explanation */}
        <div className="mt-20 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border">
              <FileSpreadsheet className="w-12 h-12 text-blue-600 mb-4 mx-auto" />
              <h3 className="font-semibold text-center mb-2">Spreadsheet</h3>
              <p className="text-sm text-muted-foreground text-center">
                Upload your CSV or XLSX
              </p>
            </div>
            <div className="flex justify-center">
              <ArrowRight className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border">
              <TrendingUp className="w-12 h-12 text-purple-600 mb-4 mx-auto" />
              <h3 className="font-semibold text-center mb-2">Analysis</h3>
              <p className="text-sm text-muted-foreground text-center">
                Deterministic KPIs & trends
              </p>
            </div>
            <div className="flex justify-center">
              <ArrowRight className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border">
              <ShieldCheck className="w-12 h-12 text-green-600 mb-4 mx-auto" />
              <h3 className="font-semibold text-center mb-2">Evidence</h3>
              <p className="text-sm text-muted-foreground text-center">
                Traceable findings
              </p>
            </div>
            <div className="flex justify-center">
              <ArrowRight className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border">
              <TrendingUp className="w-12 h-12 text-orange-600 mb-4 mx-auto" />
              <h3 className="font-semibold text-center mb-2">Decision</h3>
              <p className="text-sm text-muted-foreground text-center">
                Actionable briefs
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FileSpreadsheet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold mb-2">Real Analysis</h3>
            <p className="text-sm text-muted-foreground">
              No fake data, no mockups. Every KPI, trend, and insight comes from
              your actual dataset.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold mb-2">Evidence-First</h3>
            <p className="text-sm text-muted-foreground">
              Every recommendation is traceable to the data that supports it.
              Inspect the evidence behind every finding.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold mb-2">AI Explained</h3>
            <p className="text-sm text-muted-foreground">
              AI provides explanations and recommendations based only on verified
              findings. Never hallucinates.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>DecisionLens — From spreadsheet to evidence to decision.</p>
        </div>
      </footer>
    </div>
  );
}
