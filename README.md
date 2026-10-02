# DecisionLens – Evidence-Grounded Decision Intelligence Platform

DecisionLens transforms uploaded CSV/XLSX business data into evidence-backed decision intelligence. By combining deterministic Pandas-based analysis with grounded AI assistance, DecisionLens provides KPI analysis, trend detection, anomaly identification, findings, data-quality assessment, evidence traceability, and AI-powered analytical questioning—all without relying on fabricated or demo business data.

## Problem

Business users often have spreadsheets containing valuable information but need significant manual effort to understand:
- What is happening in their data
- Which KPIs matter most
- What changed over time
- Where anomalies exist
- What should be investigated first
- What evidence supports a conclusion

DecisionLens addresses this by automating the analysis process and providing traceable, evidence-backed insights while ensuring AI assistance is grounded in the actual uploaded dataset rather than generating unsupported conclusions.

## Why We Built DecisionLens

DecisionLens was built to provide trustworthy decision support that reduces spreadsheet analysis effort while maintaining traceability. By separating deterministic data analysis from AI interpretation, we ensure that:
- All metrics are calculated from the actual uploaded data
- Every finding can be traced to supporting evidence
- AI assistance interprets analysis results rather than inventing business metrics
- Decision-makers can understand the basis for recommendations

## Key Features

### Data Upload
- Upload CSV or XLSX files (up to 10 MB, 100,000 rows, 100 columns)
- Files are processed in memory and not permanently stored

### Deterministic Analysis
All analysis is performed using Pandas on the actual uploaded dataset:
- Data profiling and column role detection
- KPI calculation from real data
- Trend analysis using statistical methods
- Anomaly detection using IQR and robust Z-score
- Segment comparisons across categorical dimensions
- Data-quality assessment

### KPI Analysis
Automatically calculates business KPIs when relevant columns are detected:
- Total Revenue, Total Cost, Total Profit
- Gross Margin
- Total Orders, Total Units
- Average Order Value, Average Price
- Revenue Growth (time-based)

### Findings
Generates structured findings from analysis:
- Trend findings (direction, strength, volatility)
- Anomaly findings (severity, deviation, evidence)
- Segment differences (best/worst segments)
- Margin and growth signals
- Concentration risks
- Data quality risks
- Operational signals

Each finding includes confidence scores, severity levels, and evidence references.

### Trends
Analyzes time-series data to identify:
- Trend direction (up/down/neutral)
- Trend strength (R-squared)
- Recent period-over-period change
- Volatility measurements

### Anomaly Detection
Statistical anomaly detection using:
- IQR (Interquartile Range) method
- Robust Z-score (median-based)
- Percentage change detection
- Rolling deviation analysis

### Evidence Traceability
Every finding is backed by evidence objects containing:
- Evidence ID and finding ID
- Claim description
- Source columns used
- Filters applied
- Sample size
- Calculation method
- Actual values and comparisons
- Limitations
- Data quality metrics

Users can click on any finding to view the complete evidence object.

### AI Decision Assistant (Ask DecisionLens)
Ask questions about your analyzed data using natural language. The AI assistant:
- Uses the actual analysis context (KPIs, trends, anomalies, findings, evidence)
- Provides answers grounded in the uploaded dataset
- Returns evidence IDs and finding IDs for material claims
- Explicitly states when evidence is insufficient
- Never invents metrics, numbers, or conclusions unsupported by the analysis

### Insights
View all findings organized by category:
- Trends, Anomalies, Segment Differences
- Margin Signals, Growth Signals
- Concentration, Data Quality Risks, Operational Signals
- Filter by category and severity
- Expand findings to view evidence details

### Reports
Generate a formal executive report including:
- Dataset information and data quality score
- KPI scorecard
- Strategic findings with evidence traceability
- Anomalies and trends
- AI-generated executive summary (when available)
- Recommendations grounded in evidence
- Export to JSON

### Data Quality
Comprehensive data-quality assessment:
- Row and column counts
- Missing cells and percentages
- Duplicate rows
- Constant columns
- Date, numeric, and categorical column detection
- Invalid dates and infinite values
- Overall quality score and reasons

## Architecture

```
User
↓
Spread2 React/Vite Frontend (https://spread2.vercel.app)
↓
FastAPI Backend (https://decisionlens-backend.onrender.com)
↓
Pandas Analysis Engine
↓
├─ Data Profiler
├─ KPI Engine
├─ Trend Analyzer
├─ Anomaly Detector
├─ Segment Analyzer
├─ Evidence Engine
└─ Finding Engine
↓
KPIs / Findings / Trends / Anomalies / Evidence
↓
Groq AI (openai/gpt-oss-20b)
↓
Grounded Decision Support
↓
Dashboard / Insights / Ask / Reports / Data
```

## Technology Stack

### Frontend (Spread2)
- React 19.0.1
- TypeScript 7.0.2
- Vite 8.3.0
- Tailwind CSS 4.3.3
- Lucide React (icons)
- Motion (animations)
- Papaparse (CSV parsing)
- XLSX (Excel parsing)

### Backend (DecisionLens)
- Python 3.14.6
- FastAPI 0.115.0
- Pandas 3.0.5
- Pydantic 2.13.5
- Uvicorn 0.32.0
- openpyxl 3.1.5
- Groq 1.7.0
- NumPy 2.0.0+
- pytest 8.3.3

### AI
- Groq API
- Model: openai/gpt-oss-20b

### Data Formats
- CSV
- XLSX (via openpyxl)

### Deployment
- Frontend: Vercel
- Backend: Render (Free tier)

### Testing
- pytest (backend)

## Project Structure

```
decisionlens/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── main.py            # FastAPI application entry point
│   │   ├── models.py          # Pydantic models
│   │   ├── routers/           # API endpoints
│   │   │   ├── analyze.py     # POST /api/analyze
│   │   │   ├── ask.py         # POST /api/ask
│   │   │   └── health.py      # GET /api/health
│   │   └── services/          # Business logic
│   │       ├── data_profiler.py
│   │       ├── kpi_engine.py
│   │       ├── trend_analyzer.py
│   │       ├── anomaly_detector.py
│   │       ├── segment_analyzer.py
│   │       ├── evidence_engine.py
│   │       ├── finding_engine.py
│   │       └── ai_explainer.py
│   ├── tests/                 # Backend tests
│   │   ├── test_data_profiler.py
│   │   ├── test_kpi_engine.py
│   │   ├── test_anomaly_detector.py
│   │   └── test_api.py
│   ├── requirements.txt       # Python dependencies
│   └── .env.example          # Environment variables template
├── sample-data/              # Sample datasets
│   └── retail_sales.csv
├── render.yaml              # Render deployment configuration
└── README.md

spread2/ (separate repository)
├── src/
│   ├── components/          # React components
│   │   ├── analyze/        # File upload and analysis
│   │   ├── ask/            # Ask DecisionLens chat
│   │   ├── dashboard/      # KPI dashboard
│   │   ├── insights/       # Findings view
│   │   ├── reports/        # Executive report
│   │   ├── data/           # Data quality view
│   │   ├── settings/       # Settings
│   │   ├── layout/         # App shell, sidebar, drawers
│   │   └── common/         # Shared components
│   ├── context/            # React context (AnalyticsContext)
│   ├── lib/                # API client
│   ├── types/              # TypeScript types
│   └── utils/              # Utilities
├── package.json            # Frontend dependencies
├── vercel.json            # Vercel deployment configuration
└── README.md
```

## Setup & Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd decisionlens/backend
```

2. Create a virtual environment:
```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your Groq API key:
```
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-20b
FRONTEND_ORIGIN=http://localhost:5173
```

**Important:** Never expose `GROQ_API_KEY` in frontend code or commit it to Git. The API key must remain backend-side only.

5. Start the backend server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the spread2 directory:
```bash
cd spread2
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
VITE_API_URL=http://localhost:8000
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## How to Run

1. Start the backend (from `decisionlens/backend`):
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

2. Start the frontend (from `spread2`):
```bash
npm run dev
```

3. Open your browser to `http://localhost:3000`

4. Upload a CSV or XLSX file containing business data

5. Wait for analysis to complete (KPIs, trends, anomalies, findings will be generated)

6. Review the Dashboard for KPI overview

7. Navigate to Insights to view detailed findings and evidence

8. Use Ask DecisionLens to ask questions about your data

9. Generate Reports for executive summaries

## Environment Variables

| Variable | Purpose | Required | Where Used |
|----------|---------|----------|------------|
| `GROQ_API_KEY` | Groq API key for AI features | Yes (for AI features) | Backend (ai_explainer.py) |
| `GROQ_MODEL` | Groq model to use | No (defaults to openai/gpt-oss-20b) | Backend (ai_explainer.py) |
| `FRONTEND_ORIGIN` | Allowed CORS origins for frontend | No (defaults to localhost) | Backend (main.py) |
| `VITE_API_URL` | Backend API URL for frontend | No (defaults to production) | Frontend (api.ts) |
| `PORT` | Backend port for Render | No (defaults to 10000) | Render configuration |

**Security Note:** Never expose `GROQ_API_KEY` in frontend code, commits, or public repositories. It must remain backend-side only.

## API

### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "decisionlens-api",
  "version": "1.0.0"
}
```

### POST /api/analyze

Analyze a CSV or XLSX file.

**Request:** `multipart/form-data` with `file` field

**Response:** AnalysisResponse containing:
- `success`: boolean
- `dataset_name`: string
- `columns`: ColumnInfo[] (detected columns and roles)
- `data_quality`: DataQuality (row count, missing values, quality score)
- `kpis`: KPI[] (calculated KPIs)
- `trends`: Trend[] (time-series trends)
- `anomalies`: Anomaly[] (detected anomalies)
- `segment_comparisons`: SegmentComparison[] (segment analysis)
- `findings`: Finding[] (strategic findings)
- `evidence`: Record<string, Evidence> (evidence objects)
- `ai_insight`: AIInsight | null (AI-generated interpretation)
- `processing_time`: number

### POST /api/ask

Ask a question about the analyzed data.

**Request:**
```json
{
  "question": "What is driving revenue?",
  "analysis_data": {
    "kpis": [...],
    "trends": [...],
    "anomalies": [...],
    "findings": [...],
    "evidence": {...}
  }
}
```

**Response:**
```json
{
  "answer": "Revenue is driven by...",
  "evidence_ids": ["ev1", "ev2"],
  "finding_ids": ["f1", "f2"],
  "limitations": ["..."]
}
```

## Data Flow

1. User uploads CSV/XLSX file via Spread2 frontend
2. Backend reads the file using Pandas
3. Dataset is profiled (columns, data types, missing values)
4. KPIs are calculated from actual data
5. Trends are analyzed using statistical methods
6. Anomalies are detected using IQR and robust Z-score
7. Segment comparisons are generated
8. Evidence objects are created for each finding
9. Findings are synthesized from trends, anomalies, and segments
10. Optional AI interpretation uses the analysis context (KPIs, trends, anomalies, findings, evidence)
11. Frontend displays the resulting analysis
12. Ask DecisionLens uses the analysis context to answer questions grounded in the data

## Reliability / Grounding

### Deterministic Analysis
All metrics and statistical analysis are generated deterministically from the uploaded dataset using Pandas:
- KPI calculations are performed on actual data values
- Trend analysis uses linear regression and statistical measurements
- Anomaly detection uses established statistical methods (IQR, Z-score)
- Evidence objects contain exact calculations and sample sizes

### AI Interpretation
AI (Groq) interprets the generated analysis:
- AI responses are validated to reference only available evidence and findings
- Evidence IDs and finding IDs are filtered against actual analysis context
- AI is instructed to use only supplied analysis context
- If AI service is unavailable, deterministic analysis remains fully functional
- AI may occasionally generate incorrect explanations; always verify with provided evidence

## Security

- File size validation (10 MB limit)
- File type validation (CSV, XLSX only)
- Row count limit (100,000)
- Column count limit (100)
- Files processed in memory, not permanently stored
- CORS configuration restricts allowed origins
- Groq API key never exposed to frontend
- Environment variables used for secrets
- No arbitrary code execution
- Safe error responses without stack traces in production

## Testing

### Backend Tests

Run the backend test suite:
```bash
cd decisionlens/backend
pytest ../tests/ -v
```

**Test Coverage:**
- Data profiling (column detection, missing values, duplicates, data quality)
- KPI engine (revenue, cost, profit, margin, units, AOV)
- Anomaly detection (IQR, severity calculation, edge cases)
- API endpoints (health check, analyze, validation)

**Test Results:** 31 tests pass

### Frontend Build

Build the frontend for production:
```bash
cd spread2
npm run build
```

**Build Result:** Successful build generates dist/ directory

## Deployment

### Backend (Render)

The backend is deployed to Render using the configuration in `render.yaml`:
- Service type: Web Service
- Environment: Python
- Plan: Free
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Health check: `/api/health`

**Production Backend:** https://decisionlens-backend.onrender.com

### Frontend (Vercel)

The frontend (Spread2) is deployed to Vercel using the configuration in `vercel.json`:
- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL=https://decisionlens-backend.onrender.com`

**Production Frontend:** https://spread2.vercel.app

### Deployment Relationship

The Spread2 frontend communicates with the DecisionLens backend via:
- CORS configuration on backend allows `https://spread2.vercel.app`
- Frontend uses `VITE_API_URL` environment variable to point to backend
- No secrets are shared between frontend and backend

## Demo Flow

### Recommended Demo

1. Open the deployed application: https://spread2.vercel.app
2. Click "Analyze Data" in the sidebar
3. Upload a real CSV or XLSX dataset (e.g., retail_sales.csv from sample-data)
4. Wait for analysis to complete
5. Review the Dashboard to see KPIs and data quality
6. Navigate to Insights to view findings organized by category
7. Click on a finding to view evidence details
8. Navigate to Ask DecisionLens
9. Ask a question such as "What is driving revenue?" or "Which anomalies matter most?"
10. Review the evidence-grounded response with evidence IDs and finding IDs
11. Navigate to Reports to view the generated executive report
12. Optionally export the report as JSON

## Limitations

- AI responses depend on Groq API availability and model performance
- Analysis quality depends on uploaded data quality and structure
- Supported file formats: CSV, XLSX only
- File size limited to 10 MB
- Row count limited to 100,000
- Column count limited to 100
- Trend analysis assumes linear relationships
- Anomaly detection uses statistical methods that may not capture all business-relevant anomalies
- Segment comparisons are based on group means
- AI may occasionally generate incorrect explanations; verify with provided evidence
- No persistent user accounts or project workspaces
- Data is not permanently stored (stateless architecture)

## Future Improvements

Potential future enhancements:
- Richer data visualization (charts, graphs)
- Additional statistical methods for trend and anomaly detection
- Persistent project workspaces for saving analyses
- Support for larger datasets
- Additional export formats (PDF, Excel)
- More advanced analytical questioning capabilities
- Real-time data streaming support
- Custom KPI definitions
- Scheduled analysis runs

## Production Links

### Live Application
**Frontend:** https://spread2.vercel.app

### Backend API
**Backend:** https://decisionlens-backend.onrender.com

## License

Proprietary. All rights reserved.

---

**DecisionLens — From spreadsheet to evidence to decision.**
