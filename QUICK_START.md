# Quick Reference - ShadowLens Integration

## 🚀 Quick Start

### Option 1: Windows Batch Script (Easiest)

```bash
cd d:\VS code\React\ShadowLens\Mitm_Model
start-services.bat
```

Then open `http://localhost:5173`

### Option 2: Manual Start

**Terminal 1 - Start Backend:**

```bash
cd d:\VS code\React\ShadowLens\Mitm_Model
venv\Scripts\activate
uvicorn venv.app:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Start Frontend:**

```bash
cd d:\VS code\React\ShadowLens\Mitm_Model\Frontend
npm run dev
```

## 🔗 URLs

- **Frontend**: http://localhost:5173
- **API Server**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs (Interactive)
- **Health Check**: http://localhost:8000/health

## 📦 New Files Created

| File                              | Purpose                                 |
| --------------------------------- | --------------------------------------- |
| `Frontend/src/services/api.ts`    | API communication & data transformation |
| `Frontend/src/services/config.ts` | Test parameters & configuration         |
| `Frontend/.env.local`             | Environment variables (API endpoint)    |
| `INTEGRATION_GUIDE.md`            | Full setup & troubleshooting guide      |
| `INTEGRATION_SUMMARY.md`          | Overview of all changes                 |
| `start-services.bat`              | Quick start script for Windows          |

## 🔄 What Changed

**Frontend (App.tsx)**

- Now fetches data from API on load
- Shows loading and error states
- Real prediction results displayed

**Backend (app.py)**

- CORS enabled for Frontend requests
- Ready to receive prediction requests

## 🧪 Testing

1. Check API health:

   ```bash
   curl http://localhost:8000/health
   ```

2. Make test prediction:

   ```bash
   curl -X POST http://localhost:8000/predict \
     -H "Content-Type: application/json" \
     -d '{
       "handshake_time_ms": 45,
       "ja4_client_stability": 0.85,
       "ja4_server_stability": 0.90,
       "cert_reuse_score": 0.3,
       "ca_rarity_score": 0.2
     }'
   ```

3. Visit Frontend: http://localhost:5173
   - App automatically fetches and displays prediction

## ⚙️ Configuration

**Change API Endpoint:**

Edit `Frontend/.env.local`:

```env
VITE_API_BASE_URL=http://your-server:8000
```

**Change Test Parameters:**

Edit line 31 in `Frontend/src/app/App.tsx`:

```tsx
// Normal connection
const prediction = await getPrediction(defaultTLSInput);

// Or test suspicious connection
const prediction = await getPrediction(suspiciousTLSInput);
```

## 🐛 Troubleshooting

| Issue                | Solution                                               |
| -------------------- | ------------------------------------------------------ |
| API connection error | Check if `uvicorn` is running on port 8000             |
| CORS error           | Ensure CORS middleware is in `app.py`                  |
| Models not found     | Update paths in `app.py` to correct `.pkl` files       |
| Port 8000 in use     | Change port in `uvicorn` command or kill other process |
| npm modules missing  | Run `npm install` in Frontend directory                |

## 📊 API Endpoints

### POST /predict

Sends TLS data, gets anomaly prediction

**Request:**

```json
{
  "handshake_time_ms": 45,
  "ja4_client_stability": 0.85,
  "ja4_server_stability": 0.9,
  "cert_reuse_score": 0.3,
  "ca_rarity_score": 0.2
}
```

**Response:**

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

### GET /health

Health check

**Response:** `{"status": "ok"}`

## 📝 Key Code Locations

| What                | Where                                                         |
| ------------------- | ------------------------------------------------------------- |
| API calls           | `Frontend/src/services/api.ts`                                |
| Data transformation | `Frontend/src/services/api.ts::transformPredictionToUIData()` |
| Main component      | `Frontend/src/app/App.tsx`                                    |
| CORS config         | `venv/app.py` (added middleware)                              |

## 🎯 How It Works

1. Frontend loads → calls `useEffect`
2. `getPrediction(defaultTLSInput)` sends POST to `/predict`
3. API processes with Isolation Forest model
4. Returns `anomaly_score` and `prediction`
5. Frontend transforms to UI format
6. Components display results dynamically

## 💡 Next Steps

- [ ] Add input form for custom TLS parameters
- [ ] Implement real-time monitoring
- [ ] Add analysis history/database
- [ ] Create batch analysis feature
- [ ] Add user authentication
- [ ] Deploy to production

---

**Need help?** See `INTEGRATION_GUIDE.md` for detailed instructions.
