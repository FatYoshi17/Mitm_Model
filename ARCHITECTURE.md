# ShadowLens Architecture & Data Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER'S WEB BROWSER                          │
│                   (http://localhost:5173)                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│               REACT FRONTEND (Vite Dev Server)                  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  App.tsx                                 │  │
│  │  - Manages API calls via useEffect                      │  │
│  │  - Handles loading & error states                       │  │
│  │  - Passes data to UI components                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          │                                      │
│                          ├──────────────────────┐               │
│                          │                      │               │
│                          ▼                      ▼               │
│  ┌────────────────────┐  ┌────────────────────────────────┐   │
│  │   API Service      │  │    UI Components               │   │
│  │  (api.ts)          │  │  - TopNavBar                   │   │
│  │                    │  │  - SeverityOverview            │   │
│  │ • getPrediction()  │  │  - SummaryBullets              │   │
│  │ • transform*()     │  │  - HypothesisProbability       │   │
│  │ • checkHealth()    │  │  - EvidenceTable               │   │
│  └────────────────────┘  │  - RiskReasoning               │   │
│           │              │  - RecommendedActions          │   │
│           │              │  - Limitations                 │   │
│           │              │  - MetadataFooter              │   │
│           │              └────────────────────────────────┘   │
│  ┌────────────────────┐                                       │
│  │   Config           │                                       │
│  │  (config.ts)       │                                       │
│  │                    │                                       │
│  │ • defaultTLSInput  │                                       │
│  │ • suspiciousTLS... │                                       │
│  └────────────────────┘                                       │
└────────────────────────────┬────────────────────────────────┘
                             │
                    HTTP POST /predict
                    (JSON body)
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              FASTAPI BACKEND (Uvicorn Server)                   │
│              (http://localhost:8000)                            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   CORS Middleware                        │  │
│  │          (Allows Frontend to make requests)             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          │                                      │
│                          ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              POST /predict Endpoint                      │  │
│  │                                                           │  │
│  │  1. Receives TLSInput JSON                              │  │
│  │  2. Validates with Pydantic                             │  │
│  │  3. Calls engineer_features()                           │  │
│  │  4. Scales features                                     │  │
│  │  └─────────────────┐                                    │  │
│  └──────────────────────┼───────────────────────────────────┘  │
│                         │                                      │
│                         ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Isolation Forest Model (iforest)                │  │
│  │                                                           │  │
│  │  Loaded from: tls_iforest.pkl                           │  │
│  │  • Detects anomalies in TLS patterns                    │  │
│  │  • Returns anomaly_score                                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                         │                                      │
│                         ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │        Response Formatting                              │  │
│  │                                                           │  │
│  │  Returns: {                                             │  │
│  │    prediction: "MITM_ATTACK" | "NORMAL"                │  │
│  │    anomaly_score: float                                 │  │
│  │    threshold: float                                     │  │
│  │    explanation: {...}                                  │  │
│  │  }                                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │
                    HTTP Response (JSON)
                             │
                             ▼
                   Frontend receives data
                   ✓ App updates state
                   ✓ Components re-render
                   ✓ User sees results
```

## Data Transformation Pipeline

```
Raw API Response
    │
    ├─ prediction: "MITM_ATTACK" or "NORMAL"
    ├─ anomaly_score: 0.9234
    ├─ threshold: 0.95
    └─ explanation: {...}
    │
    ▼
transformPredictionToUIData() Function
    │
    ├─► generateSummaryBullets()
    │   └─ Creates user-friendly bullet points
    │
    ├─► generateHypotheses()
    │   └─ Creates probability-weighted hypotheses
    │
    ├─► generateEvidence()
    │   └─ Creates detailed evidence table rows
    │
    ├─► generateRiskReasoning()
    │   └─ Explains why high/low risk
    │
    ├─► generateRecommendedActions()
    │   └─ Suggests security actions
    │
    └─► Metadata generation
        └─ Analysis ID, timestamp, etc.
    │
    ▼
Formatted UI Data Object
    │
    ├─ status
    ├─ active_alerts
    ├─ severity
    ├─ confidence
    ├─ summary_bullets[]
    ├─ hypotheses[]
    ├─ evidence[]
    ├─ risk_reasoning
    ├─ recommended_actions[]
    └─ metadata
    │
    ▼
React Components Receive Props
    │
    ├─► TopNavBar
    ├─► SeverityOverview
    ├─► SummaryBullets
    ├─► HypothesisProbability
    ├─► EvidenceTable
    ├─► RiskReasoning
    ├─► RecommendedActions
    ├─► LimitationsDisclaimer
    └─► MetadataFooter
    │
    ▼
Dynamic UI Rendered with Real Data
```

## Request/Response Flow

### Step 1: Frontend sends prediction request

```
POST /predict HTTP/1.1
Host: localhost:8000
Content-Type: application/json

{
  "handshake_time_ms": 45,
  "ja4_client_stability": 0.85,
  "ja4_server_stability": 0.90,
  "cert_reuse_score": 0.3,
  "ca_rarity_score": 0.2
}
```

### Step 2: Backend processes request

```
1. Validates input (Pydantic)
2. Engineers features:
   - log(handshake_time)
   - client_instability = 1 - stability
   - server_instability = 1 - stability
   - cert_risk = 0.6*reuse + 0.4*rarity
   - tls_trust_score
   - latency_trust_ratio

3. Scales features using pre-trained scaler
4. Feeds to Isolation Forest model
5. Gets anomaly score
6. Compares to threshold (0.95)
7. Determines: MITM_ATTACK or NORMAL
```

### Step 3: Backend returns prediction

```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "prediction": "NORMAL",
  "anomaly_score": 0.3421,
  "threshold": 0.95,
  "explanation": {
    "high_latency": false,
    "low_tls_stability": false,
    "certificate_risk": false
  }
}
```

### Step 4: Frontend transforms and displays

```
Frontend:
  ├─ Receives JSON
  ├─ Calls transformPredictionToUIData()
  ├─ Updates React state
  ├─ Components re-render with new data
  └─ User sees analysis results
```

## File Organization

```
Mitm_Model/
│
├── venv/
│   └── app.py
│       ├── FastAPI initialization
│       ├── CORS middleware
│       ├── Model loading
│       ├── /predict endpoint
│       ├── /health endpoint
│       └── Feature engineering
│
├── Frontend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── api.ts (NEW)
│   │   │   │   ├── getPrediction()
│   │   │   │   ├── transformPredictionToUIData()
│   │   │   │   ├── generateSummaryBullets()
│   │   │   │   ├── generateHypotheses()
│   │   │   │   ├── generateEvidence()
│   │   │   │   ├── generateRiskReasoning()
│   │   │   │   ├── generateRecommendedActions()
│   │   │   │   └── checkHealth()
│   │   │   │
│   │   │   └── config.ts (NEW)
│   │   │       ├── defaultTLSInput
│   │   │       └── suspiciousTLSInput
│   │   │
│   │   ├── app/
│   │   │   ├── App.tsx (MODIFIED)
│   │   │   │   ├── useEffect hook
│   │   │   │   ├── API call
│   │   │   │   ├── State management
│   │   │   │   └── Error handling
│   │   │   │
│   │   │   └── components/
│   │   │       ├── TopNavBar.tsx
│   │   │       ├── SeverityOverview.tsx
│   │   │       ├── SummaryBullets.tsx
│   │   │       ├── HypothesisProbability.tsx
│   │   │       ├── EvidenceTable.tsx
│   │   │       ├── RiskReasoning.tsx
│   │   │       ├── RecommendedActions.tsx
│   │   │       ├── LimitationsDisclaimer.tsx
│   │   │       ├── MetadataFooter.tsx
│   │   │       └── ui/
│   │   │           └── (UI component library)
│   │   │
│   │   └── styles/
│   │
│   ├── .env.local (NEW)
│   ├── .env.example (NEW)
│   ├── vite.config.ts (MODIFIED)
│   ├── package.json
│   └── index.html
│
├── INTEGRATION_GUIDE.md (NEW)
├── INTEGRATION_SUMMARY.md (NEW)
├── QUICK_START.md (NEW)
├── ARCHITECTURE.md (THIS FILE)
└── start-services.bat (NEW)
```

## Key Integration Points

### 1. Frontend → API Communication

- **File**: `Frontend/src/services/api.ts`
- **Method**: `fetch()` with POST to `/predict`
- **Header**: `Content-Type: application/json`
- **Port**: 8000 (configurable via .env)

### 2. API Request Validation

- **Tool**: Pydantic BaseModel
- **Location**: `venv/app.py`
- **Validates**: All 5 TLS input parameters

### 3. Machine Learning Processing

- **Model**: Isolation Forest (scikit-learn)
- **Location**: Loaded in `venv/app.py`
- **Input**: 8 engineered features
- **Output**: Anomaly score (0-1)

### 4. Data Transformation

- **Purpose**: Convert technical API response to user-friendly format
- **Location**: `Frontend/src/services/api.ts::transformPredictionToUIData()`
- **Handles**: Business logic for severity, confidence, messaging

### 5. State Management

- **Tool**: React hooks (useState, useEffect)
- **Location**: `Frontend/src/app/App.tsx`
- **Manages**: apiData, loading, error states

## Error Handling & Fallbacks

```
Try to fetch from API
    │
    ├─ Success
    │   └─► Display real data
    │       └─► Show confidence: API says it's X
    │
    └─ Error
        ├─► Display error banner
        ├─► Show fallback mock data
        ├─► Log error to console
        └─► Suggest troubleshooting steps
```

## Performance Considerations

1. **API Call**: Single request on component mount
2. **Data Transformation**: Happens in memory, very fast
3. **Component Re-render**: Only once when data arrives
4. **No polling**: Only fetches once unless manually triggered
5. **Caching**: Each browser session is independent

## Security Considerations

1. **CORS**: Configured to allow all origins (development mode)
   - For production, restrict to specific domains
2. **No Authentication**: Currently public
   - Add JWT/API keys for production
3. **Input Validation**: Pydantic validates all inputs
4. **HTTPS**: Should use HTTPS in production
5. **Rate Limiting**: Consider adding for production

## Deployment Architecture

```
Production Setup:
┌─────────────────────────────────────────┐
│         CDN / Static Host               │
│     (Serve React build files)           │
└────────────────────┬────────────────────┘
                     │
                     │ HTTPS
                     ▼
            ┌────────────────┐
            │  Load Balancer │
            └────────┬───────┘
                     │
         ┌───────────┼───────────┐
         │           │           │
         ▼           ▼           ▼
    ┌────────┐ ┌────────┐ ┌────────┐
    │API Pod │ │API Pod │ │API Pod │
    │ (8000) │ │ (8000) │ │ (8000) │
    └────────┘ └────────┘ └────────┘
         │           │           │
         └───────────┼───────────┘
                     │
            ┌────────────────┐
            │   Database     │
            │  (PostgreSQL)  │
            └────────────────┘
```

---

This architecture enables real-time TLS anomaly detection with a responsive, user-friendly interface!
