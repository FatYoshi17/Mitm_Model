# Frontend & API Integration - Summary of Changes

## Overview

The Frontend has been successfully integrated with the FastAPI backend. The React application now fetches real prediction data from the `/predict` endpoint and displays it dynamically.

## Files Created

### 1. **Frontend API Service** (`Frontend/src/services/api.ts`)

- `getPrediction()`: Calls the FastAPI `/predict` endpoint
- `transformPredictionToUIData()`: Converts raw API responses into component-ready format
- `checkHealth()`: Verifies API server is running
- Type definitions for `TLSInput` and `PredictionResponse`
- Automatic generation of summary bullets, hypotheses, evidence, and recommendations based on API response

### 2. **Frontend Configuration** (`Frontend/src/services/config.ts`)

- `defaultTLSInput`: Normal TLS connection parameters for testing
- `suspiciousTLSInput`: Example MITM-like parameters (for testing suspicious connections)

### 3. **Environment Configuration**

- `Frontend/.env.local`: Contains `VITE_API_BASE_URL=http://localhost:8000`
- `Frontend/.env.example`: Template for environment setup

### 4. **Integration Guide** (`INTEGRATION_GUIDE.md`)

- Complete setup instructions for both backend and frontend
- API endpoint documentation
- Troubleshooting guide
- Architecture overview

### 5. **Quick Start Script** (`start-services.bat`)

- Windows batch script to start both API server and frontend dev server
- Opens both services in separate terminal windows

## Files Modified

### 1. **App.tsx** (`Frontend/src/app/App.tsx`)

**Changes:**

- Added React hooks: `useEffect`, `useState`
- Imported API service and config
- Added state management for `apiData`, `loading`, and `error`
- API call in `useEffect` hook on component mount
- Error and loading state UI banners
- All component props now use real API data instead of mock data

**Key Features:**

- Automatic API call on page load
- Error handling with user-friendly messages
- Loading state indication
- Fallback to mock data if API fails
- Real-time data transformation

### 2. **FastAPI Backend** (`venv/app.py`)

**Changes:**

- Added `CORSMiddleware` import
- Registered CORS middleware with app
- Allows requests from any origin (suitable for development)

**Benefits:**

- Frontend can make requests without CORS errors
- Enables seamless Frontend-Backend communication

### 3. **Vite Configuration** (`Frontend/vite.config.ts`)

**Changes:**

- Added development server proxy configuration
- Routes `/api` requests to the FastAPI server
- Prevents CORS issues during development

## Data Flow

```
User Opens App
    ↓
React App Mounts (App.tsx)
    ↓
useEffect Hook Triggered
    ↓
getPrediction(defaultTLSInput) Called
    ↓
API Request: POST /predict
    ↓
FastAPI Processes (Isolation Forest Model)
    ↓
API Response with Prediction & Anomaly Score
    ↓
transformPredictionToUIData() Processes Response
    ↓
UI Components Receive Formatted Data
    ↓
Dynamic Display of Results
```

## Key Features

✅ **Real API Integration**

- Fetches actual predictions from the Isolation Forest model
- No hardcoded mock data

✅ **Intelligent Data Transformation**

- Raw API predictions are converted to detailed UI format
- Automatically generates:
  - Summary bullets
  - Risk hypotheses
  - Evidence table entries
  - Recommended actions
  - Risk reasoning

✅ **Error Handling**

- User-friendly error messages if API is unavailable
- Fallback to mock data for offline demonstration
- Detailed error logging in browser console

✅ **Loading States**

- Visual feedback while API is processing
- Better user experience

✅ **Easy Configuration**

- API endpoint configurable via `.env.local`
- Supports different deployment environments

## How to Use

### Quick Start (Windows)

```bash
cd d:\VS code\React\ShadowLens\Mitm_Model
start-services.bat
```

This will:

1. Start FastAPI server at `http://localhost:8000`
2. Start React dev server at `http://localhost:5173`

### Manual Setup

```bash
# Terminal 1 - Backend
cd d:\VS code\React\ShadowLens\Mitm_Model
venv\Scripts\activate
uvicorn venv.app:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend
cd Frontend
npm install
npm run dev
```

## Testing the Integration

1. **Open** `http://localhost:5173` in browser
2. **Observe** the app fetching data from the API
3. **Check** browser console for any errors
4. **Verify** API is running at `http://localhost:8000/health`
5. **View** API docs at `http://localhost:8000/docs`

## Customization

### Change TLS Input Parameters

Edit `Frontend/src/app/App.tsx`:

```tsx
// Line 31: change from
const prediction = await getPrediction(defaultTLSInput);
// To
const prediction = await getPrediction(suspiciousTLSInput);
```

### Change API Endpoint

Edit `Frontend/.env.local`:

```env
VITE_API_BASE_URL=http://your-api-server:8000
```

### Modify Transformation Logic

Edit `Frontend/src/services/api.ts` functions:

- `generateSummaryBullets()`
- `generateHypotheses()`
- `generateEvidence()`
- `generateRiskReasoning()`
- `generateRecommendedActions()`

## Technologies Used

**Backend:**

- FastAPI 0.104+
- Pydantic for validation
- NumPy for calculations
- scikit-learn (Isolation Forest)
- joblib for model loading
- CORS middleware

**Frontend:**

- React 18+
- TypeScript
- Vite
- Tailwind CSS
- Radix UI components
- Lucide React icons

## Future Enhancements

1. **Input Form**: Let users submit custom TLS parameters
2. **History**: Store and display past analyses
3. **Real-time Monitoring**: WebSocket connection for live monitoring
4. **Advanced Charts**: Visualize anomaly trends
5. **Authentication**: User login and role-based access
6. **Database Integration**: Persistent storage of predictions
7. **Batch Analysis**: Analyze multiple connections at once

## Support & Troubleshooting

See `INTEGRATION_GUIDE.md` for detailed troubleshooting steps.

Common issues:

- **API not found**: Check if backend is running at correct port
- **CORS errors**: Verify CORS middleware is added to backend
- **Models not found**: Update model file paths in `app.py`
- **Port conflicts**: Change port in startup script if needed

---

**Integration completed successfully!** 🚀
Your Frontend is now connected to the API and will display real predictions.
