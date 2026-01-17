# ShadowLens - Frontend & API Integration Guide

This guide explains how to run the integrated Frontend and Backend system.

## Architecture

- **Backend**: FastAPI server (`app.py`) running TLS MITM anomaly detection
- **Frontend**: React + Vite application that consumes the API
- **Integration**: The Frontend automatically fetches predictions from the API and displays results

## Prerequisites

- Python 3.8+ (for backend)
- Node.js 16+ (for frontend)
- pip (Python package manager)
- npm or yarn (JavaScript package manager)

## Backend Setup

### 1. Install Backend Dependencies

Navigate to the backend directory and create a virtual environment:

```bash
cd d:\VS code\React\ShadowLens\Mitm_Model
python -m venv venv
```

Activate the virtual environment:

```bash
# On Windows
venv\Scripts\activate
```

Install FastAPI and dependencies:

```bash
pip install fastapi uvicorn pydantic numpy joblib
```

### 2. Start the API Server

With the virtual environment activated:

```bash
uvicorn venv.app:app --reload --host 0.0.0.0 --port 8000
```

The API should now be running at `http://localhost:8000`

**Health Check**: Visit `http://localhost:8000/health` in your browser to verify the API is running.

**API Documentation**: Visit `http://localhost:8000/docs` to see the interactive API documentation.

## Frontend Setup

### 1. Install Frontend Dependencies

Navigate to the Frontend directory:

```bash
cd Frontend
npm install
# or
yarn install
```

### 2. Configure API Endpoint

The Frontend looks for the API at `http://localhost:8000` by default.

If you need to change the API endpoint:

Edit `Frontend/.env.local`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

### 3. Start the Frontend Development Server

```bash
npm run dev
# or
yarn dev
```

The frontend should now be available at `http://localhost:5173`

## How It Works

1. **Frontend Initialization**: When the React app loads, it calls `useEffect` in `App.tsx`
2. **API Call**: The app sends a POST request to `/predict` with default TLS parameters
3. **Processing**: The backend analyzes the TLS data using the Isolation Forest model
4. **Response**: Returns a prediction (MITM_ATTACK or NORMAL) with confidence scores
5. **Transformation**: The frontend transforms the raw API response into a UI-friendly format
6. **Display**: All components are populated with the real API data

## API Endpoints

### POST `/predict`

Analyzes TLS connection parameters for anomalies.

**Request Body**:

```json
{
  "handshake_time_ms": 45,
  "ja4_client_stability": 0.85,
  "ja4_server_stability": 0.9,
  "cert_reuse_score": 0.3,
  "ca_rarity_score": 0.2
}
```

**Response**:

```json
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

### GET `/health`

Health check endpoint.

**Response**:

```json
{
  "status": "ok"
}
```

## Frontend Services

### API Service (`src/services/api.ts`)

Contains:

- `getPrediction()`: Calls the API and returns raw prediction
- `transformPredictionToUIData()`: Converts API response to component-friendly format
- `checkHealth()`: Verifies API is running
- Type definitions for API communication

### Config (`src/services/config.ts`)

Contains:

- `defaultTLSInput`: Normal connection parameters
- `suspiciousTLSInput`: Example MITM-like parameters (for testing)

## Testing Different Scenarios

The Frontend currently uses `defaultTLSInput`. To test with different parameters:

Edit `Frontend/src/app/App.tsx`:

```tsx
// Change from:
const prediction = await getPrediction(defaultTLSInput);

// To test suspicious activity:
const prediction = await getPrediction(suspiciousTLSInput);
```

Or import and use different config values from `src/services/config.ts`.

## Troubleshooting

### Frontend shows "API Error" message

1. Check if the API server is running: `http://localhost:8000/health`
2. Verify CORS is enabled in `app.py` (already included)
3. Check the browser console (F12) for specific error messages
4. Ensure `VITE_API_BASE_URL` in `.env.local` matches your API server address

### API server won't start

1. Ensure virtual environment is activated
2. Check that all dependencies are installed: `pip list | grep fastapi`
3. Verify port 8000 is not in use: `netstat -ano | findstr :8000`
4. Check that the model files exist at the paths specified in `app.py`

### Models not found error

Update the paths in `app.py` to match your actual model file locations:

```python
iforest = joblib.load(r"path\to\tls_iforest.pkl")
scaler = joblib.load(r"path\to\tls_scaler.pkl")
```

## File Structure

```
Frontend/
├── src/
│   ├── app/
│   │   ├── App.tsx (Main component - now with API integration)
│   │   └── components/ (UI components)
│   ├── services/
│   │   ├── api.ts (API integration & data transformation)
│   │   └── config.ts (Default test parameters)
│   └── styles/
├── .env.local (API endpoint configuration)
├── vite.config.ts (Updated with proxy config)
└── package.json

venv/
└── app.py (Backend API - now with CORS enabled)
```

## Next Steps

1. **Custom Input Form**: Add a form to let users submit custom TLS parameters
2. **Real Data Integration**: Connect to actual TLS monitoring/capture tools
3. **WebSocket**: For real-time monitoring of connections
4. **Database**: Store historical predictions and analysis
5. **Authentication**: Add user authentication and role-based access
6. **Advanced Analytics**: Add charts, trends, and pattern detection

## Environment Variables Reference

`VITE_API_BASE_URL`: URL where the FastAPI server is running

- Development: `http://localhost:8000`
- Production: Your deployed API server URL

## Additional Resources

- FastAPI Docs: https://fastapi.tiangolo.com/
- React Docs: https://react.dev/
- Vite Docs: https://vitejs.dev/
