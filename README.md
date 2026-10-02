# DecisionLens

Turn business data into decisions you can defend.

DecisionLens is an evidence-first AI decision engine that transforms business spreadsheets into deterministic KPIs, trends, anomalies, and actionable decision briefs. Every recommendation is traceable to the data that supports it.

## Core Philosophy

**PANDAS CALCULATES. EVIDENCE PROVES. GROQ EXPLAINS.**

- **Pandas** performs all deterministic calculations (KPIs, trends, anomalies)
- **Evidence Engine** proves every finding with traceable calculations
- **Groq AI** provides explanations and recommendations based only on verified findings

This is NOT a generic chatbot. This is NOT a generic BI dashboard. This is an evidence-first AI decision engine.

## Features

- **Real Analysis**: No fake data, no mockups. Every insight comes from your actual dataset.
- **Evidence-First**: Every recommendation is traceable to the data that supports it.
- **AI Explained**: Groq AI provides explanations based only on verified findings. Never hallucinates.
- **Deterministic**: KPIs, trends, and anomalies are calculated using Pandas, not AI.
- **Robust**: Works even if Groq is unavailable. The deterministic analysis remains fully functional.
- **Privacy-First**: Uploaded files are processed in memory and never permanently stored.

## Technology Stack

### Frontend
- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- Recharts
- Lucide React

### Backend
- FastAPI
- Python 3.14.6
- Pandas
- OpenPyXL
- Pydantic
- Groq Python SDK

### Hosting
- Render (Free tier)

## Architecture

```
USER
  |
  v
RENDER FRONTEND (React + Vite)
  |
  | HTTPS
  v
RENDER BACKEND (FastAPI)
  |
  +--> Pandas deterministic analysis
  |
  +--> Evidence engine
  |
  +--> Groq AI explanation layer
  |
  v
Verified decision report
  |
  v
Frontend
```

## Project Structure

```
decisionlens/
├── frontend/           # React + Vite frontend
│   ├── src/
│   │   ├── components/ui/    # shadcn/ui components
│   │   ├── lib/              # Utilities and API client
│   │   ├── pages/            # Page components
│   │   ├── types/            # TypeScript types
│   │   └── App.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── backend/            # FastAPI backend
│   ├── app/
│   │   ├── main.py           # FastAPI app
│   │   ├── models.py         # Pydantic models
│   │   ├── routers/          # API routes
│   │   └── services/         # Business logic
│   │       ├── data_profiler.py
│   │       ├── kpi_engine.py
│   │       ├── trend_analyzer.py
│   │       ├── anomaly_detector.py
│   │       ├── segment_analyzer.py
│   │       ├── evidence_engine.py
│   │       ├── finding_engine.py
│   │       └── ai_explainer.py
│   ├── requirements.txt
│   └── .env.example
├── sample-data/        # Sample datasets
│   └── retail_sales.csv
├── tests/              # Automated tests
│   ├── test_data_profiler.py
│   ├── test_kpi_engine.py
│   ├── test_anomaly_detector.py
│   └── test_api.py
├── render.yaml         # Render deployment config
├── README.md
├── .gitignore
└── .python-version
```

## Getting Started

### Prerequisites

- Python 3.14.6
- Node.js 18+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
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
GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile
FRONTEND_ORIGIN=http://localhost:5173
VITE_API_URL=http://localhost:8000
```

5. Start the backend server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_API_URL=http://localhost:8000
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Groq Setup

1. Get a Groq API key from [console.groq.com](https://console.groq.com)
2. Add the API key to your backend `.env` file:
```
GROQ_API_KEY=
```

3. The application uses the `llama-3.3-70b-versatile` model by default, but you can configure this via the `GROQ_MODEL` environment variable.

## Deployment

### Render Deployment

DecisionLens is configured for Render Free tier deployment.

1. Push your code to GitHub
2. Create a new Render account
3. Link your GitHub repository
4. Create a new "Web Service" for the backend
5. Create a new "Static Site" for the frontend
6. Add the following environment variables for the backend:
   - `GROQ_API_KEY`: Your Groq API key
   - `GROQ_MODEL`: `llama-3.3-70b-versatile`
   - `FRONTEND_ORIGIN`: Your frontend URL (e.g., `https://your-app.onrender.com`)
   - `PORT`: `10000`

The `render.yaml` file in the repository root contains the complete deployment configuration.

## API Endpoints

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

**Response:**
```json
{
  "success": true,
  "dataset_name": "data.csv",
  "columns": [...],
  "data_quality": {...},
  "kpis": [...],
  "trends": [...],
  "anomalies": [...],
  "segment_comparisons": [...],
  "findings": [...],
  "evidence": {...},
  "ai_insight": {...},
  "processing_time": 2.5
}
```

### POST /api/ask

Ask a question about the analyzed data.

**Request:**
```json
{
  "question": "Why did margin fall?",
  "analysis_data": {...}
}
```

**Response:**
```json
{
  "answer": "...",
  "evidence_ids": [...],
  "finding_ids": [...],
  "limitations": [...]
}
```

## Analysis Methodology

### Data Profiling

Automatic detection of:
- Row and column counts
- Data types
- Missing values
- Duplicate rows
- Constant columns
- Date columns
- Numeric columns
- Categorical columns
- Invalid dates
- Infinite values
- Suspicious values

### Business Column Detection

Automatic semantic column detection for:
- date, revenue, sales, cost, profit, margin
- quantity, units, discount, price
- customer, product, category
- region, state, city, segment, channel
- order_id, employee, status, duration, target, actual

### KPI Engine

Deterministic calculation of:
- Total Revenue
- Total Cost
- Total Profit
- Gross Margin
- Total Orders
- Total Units
- Average Order Value
- Average Price
- Average Discount Rate
- Revenue Growth

### Trend Analysis

- Time-based aggregation (daily/weekly/monthly)
- Linear regression for trend direction
- Trend strength (R-squared)
- Recent period-over-period change
- Volatility measurement

### Anomaly Detection

Statistical methods:
- IQR (Interquartile Range)
- Robust Z-score (median-based)
- Percentage change detection
- Rolling deviation

### Segment Analysis

- Automatic detection of categorical dimensions
- Group-by comparisons
- Performance gap identification
- Sample size validation

### Evidence Engine

Every finding includes:
- Evidence ID
- Claim description
- Source columns
- Filters applied
- Sample size
- Calculation method
- Actual values
- Comparison data
- Limitations
- Data quality metrics

### Finding Engine

Finding types:
- trend
- anomaly
- segment_difference
- margin_signal
- growth_signal
- concentration
- data_quality_risk
- operational_signal

Each finding includes:
- Confidence score (based on data/statistical support)
- Severity level
- Impact assessment
- Evidence references
- Limitations

## Evidence Methodology

The evidence engine ensures every finding is traceable:

1. **Source Columns**: Which columns were used in the calculation
2. **Filters**: What filters were applied
3. **Sample Size**: How many records were included
4. **Calculation**: The exact calculation performed
5. **Values**: The actual calculated values
6. **Comparison**: Comparison group data
7. **Limitations**: Known limitations of the analysis
8. **Data Quality**: Quality metrics for the data used

Users can click on any finding to view the complete evidence object.

## Testing

Run the automated test suite:

```bash
# Backend tests
cd backend
pytest ../tests/

# Frontend tests (if added)
cd frontend
npm test
```

Test coverage includes:
- CSV parsing
- XLSX parsing
- Empty files
- Malformed files
- Missing columns
- Missing values
- Duplicate rows
- Zero revenue
- Zero cost
- Negative values
- Invalid dates
- Large row counts
- KPI calculations
- Gross margin
- Growth
- Anomaly detection
- Segment comparison
- Evidence generation
- Groq validation
- Unknown evidence ID rejection

## Security

- File size validation (10 MB limit)
- File type validation (CSV, XLSX only)
- Safe temporary file handling
- No arbitrary execution
- CORS configuration
- Safe production error responses
- No stack traces in production
- No secret logging
- Groq API key never exposed to frontend

## Privacy

DecisionLens does not permanently store uploaded business files:

- Files are processed in memory or safe temporary storage
- Data is discarded after analysis
- No user data is persisted
- No database is used
- Stateless architecture

## AI Disclosure

This application uses AI (Groq) for explanation and recommendation generation only:

- All KPIs, trends, anomalies, and findings are calculated deterministically using Pandas
- AI responses are validated to ensure they reference only verified evidence and findings
- If the AI service is unavailable, the deterministic analysis remains fully functional
- AI may occasionally generate incorrect explanations. Always verify with the evidence provided.

## Limitations

- Analysis is based on aggregate calculations, not row-level traceability
- Trend analysis assumes linear relationships unless otherwise specified
- Anomaly detection uses statistical methods that may not capture all business-relevant anomalies
- Segment comparisons are based on group means and may not account for within-group variance
- AI explanations are generated based on available evidence and may not capture all context
- File size limited to 10 MB
- Row count limited to 100,000
- Column count limited to 100

## Performance

Optimized for Render Free (512 MB RAM):

- Efficient DataFrame operations
- Minimal data copying
- Downcast numeric data when safe
- Limited expensive comparisons
- Compact analytical package sent to AI (not raw data)

## Contributing

This is a production-ready application. When making changes:

1. Ensure all tests pass
2. Verify the application works with the sample dataset
3. Test with custom datasets
4. Verify evidence traceability
5. Check AI validation
6. Run the validation checklist

## License

Proprietary. All rights reserved.

## Support

For issues or questions, please contact the development team.

---

**DecisionLens — From spreadsheet to evidence to decision.**
