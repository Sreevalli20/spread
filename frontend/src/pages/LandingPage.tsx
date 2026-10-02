import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, FileSpreadsheet, TrendingUp, ShieldCheck, BarChart3, Sparkles, Target, FileText } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <main className="relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
        
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            {/* Logo/Brand */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-elevated">
                <TrendingUp className="h-7 w-7 text-primary-foreground" />
              </div>
              <span className="text-3xl font-bold tracking-tight">DecisionLens</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
              AI-powered decision intelligence from your real business data
            </h1>
            
            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Upload your spreadsheet. Get evidence-backed KPIs, trend detection, 
              anomaly alerts, and AI-grounded recommendations—all traceable to the source data.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/analyze" className="w-full sm:w-auto">
                <Button size="lg" className="text-base h-12 px-8 w-full sm:w-auto shadow-elevated">
                  Analyze your data
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-base h-12 px-8 w-full sm:w-auto">
                Explore capabilities
              </Button>
            </div>
          </div>

          {/* Visual Preview - Abstract UI representation */}
          <div className="mt-20 max-w-5xl mx-auto animate-slide-up">
            <Card className="border shadow-elevated overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-muted/30 border-b p-4">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-muted-foreground/20" />
                    <div className="h-3 w-3 rounded-full bg-muted-foreground/20" />
                    <div className="h-3 w-3 rounded-full bg-muted-foreground/20" />
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {/* Mock KPI row */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-card border rounded-lg p-4">
                      <div className="text-sm text-muted-foreground mb-2">Revenue</div>
                      <div className="text-2xl font-bold">$2.4M</div>
                      <div className="text-xs text-green-600 mt-1">↑ 12.3%</div>
                    </div>
                    <div className="bg-card border rounded-lg p-4">
                      <div className="text-sm text-muted-foreground mb-2">Profit Margin</div>
                      <div className="text-2xl font-bold">23.5%</div>
                      <div className="text-xs text-green-600 mt-1">↑ 2.1%</div>
                    </div>
                    <div className="bg-card border rounded-lg p-4">
                      <div className="text-sm text-muted-foreground mb-2">Orders</div>
                      <div className="text-2xl font-bold">1,847</div>
                      <div className="text-xs text-muted-foreground mt-1">This period</div>
                    </div>
                  </div>
                  {/* Mock finding */}
                  <div className="bg-card border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium mb-1">Strong upward trend in revenue</div>
                        <div className="text-sm text-muted-foreground">
                          Revenue increased 12.3% over the analyzed period with 95% confidence.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <p className="text-center text-xs text-muted-foreground mt-4">
              * Preview interface illustration
            </p>
          </div>
        </div>
      </main>

      {/* Capabilities Section */}
      <section className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Comprehensive Decision Intelligence</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From raw data to actionable insights, DecisionLens provides a complete 
              evidence-based analysis pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: FileSpreadsheet,
                title: "Upload Real Data",
                description: "Support for CSV and XLSX files with automatic column detection and validation.",
              },
              {
                icon: BarChart3,
                title: "Automated KPIs",
                description: "Deterministic calculation of revenue, profit, margin, and other key metrics.",
              },
              {
                icon: TrendingUp,
                title: "Trend Detection",
                description: "Statistical trend analysis with direction, strength, and volatility metrics.",
              },
              {
                icon: ShieldCheck,
                title: "Anomaly Detection",
                description: "Identification of outliers and statistical anomalies with severity scoring.",
              },
              {
                icon: Sparkles,
                title: "Evidence-Backed Findings",
                description: "Every insight includes traceable evidence with calculations and source data.",
              },
              {
                icon: Target,
                title: "AI-Grounded Answers",
                description: "Ask questions and get answers grounded in verified findings, not hallucinations.",
              },
              {
                icon: FileText,
                title: "Executive Reports",
                description: "Generate comprehensive reports with all analysis components and methodology.",
              },
              {
                icon: ArrowRight,
                title: "Actionable Recommendations",
                description: "AI-generated recommendations prioritized by impact and evidence support.",
              },
            ].map((capability, idx) => {
              const Icon = capability.icon;
              return (
                <Card key={idx} className="border hover:shadow-medium transition-shadow">
                  <CardContent className="p-6">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{capability.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {capability.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t">
        <div className="container mx-auto px-4 py-20">
          <Card className="border shadow-elevated max-w-3xl mx-auto">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Ready to make data-driven decisions?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Upload your first dataset and get evidence-backed insights in minutes.
                No signup required.
              </p>
              <Link to="/analyze">
                <Button size="lg" className="h-12 px-8 shadow-elevated">
                  Analyze your data
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>DecisionLens — From spreadsheet to evidence to decision.</p>
        </div>
      </footer>
    </div>
  );
}
