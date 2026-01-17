# Integration Verification Checklist

Use this checklist to verify that the Frontend-API integration is working correctly.

## Pre-Flight Checks

### Backend Setup

- [ ] Python 3.8+ installed
- [ ] Virtual environment created (`venv` folder exists)
- [ ] FastAPI installed: `pip install fastapi uvicorn`
- [ ] Pydantic, NumPy, joblib installed
- [ ] Model files exist at paths specified in `app.py`
- [ ] Port 8000 is available (not blocked by firewall/other services)

### Frontend Setup

- [ ] Node.js 16+ installed
- [ ] `npm install` completed in Frontend directory
- [ ] `.env.local` file exists with API endpoint
- [ ] Vite dev dependencies installed
- [ ] Port 5173 is available

## Startup Verification

### Step 1: Start Backend

```bash
cd d:\VS code\React\ShadowLens\Mitm_Model
venv\Scripts\activate
uvicorn venv.app:app --reload --host 0.0.0.0 --port 8000
```

Expected output:

```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

**Verify**: Visit `http://localhost:8000/health` in browser

- [ ] Response: `{"status":"ok"}`
- [ ] Status code: 200

### Step 2: Start Frontend

```bash
cd Frontend
npm run dev
```

Expected output:

```
  VITE v... ready in ... ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

**Verify**: Terminal shows no errors

- [ ] Compilation successful
- [ ] Local URL is `http://localhost:5173`

## API Functionality Tests

### Test 1: Health Check

```bash
curl http://localhost:8000/health
```

Expected response:

```json
{ "status": "ok" }
```

- [ ] Returns 200 status
- [ ] Response format is JSON
- [ ] Contains "status": "ok"

### Test 2: Prediction Endpoint (Normal Input)

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

Expected response:

```json
{
  "prediction": "NORMAL",
  "anomaly_score": 0.xxx,
  "threshold": 0.95,
  "explanation": {
    "high_latency": false,
    "low_tls_stability": false,
    "certificate_risk": false
  }
}
```

Verification:

- [ ] Returns 200 status
- [ ] `prediction` is either "NORMAL" or "MITM_ATTACK"
- [ ] `anomaly_score` is between 0 and 1
- [ ] `threshold` is 0.95
- [ ] `explanation` object exists with 3 boolean fields

### Test 3: Prediction Endpoint (Suspicious Input)

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "handshake_time_ms": 247,
    "ja4_client_stability": 0.4,
    "ja4_server_stability": 0.35,
    "cert_reuse_score": 0.85,
    "ca_rarity_score": 0.8
  }'
```

Expected: `prediction` should be "MITM_ATTACK"

Verification:

- [ ] Returns prediction (may differ based on model)
- [ ] Anomaly score is higher than normal input
- [ ] Response structure is valid

### Test 4: Invalid Input (Missing Field)

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "handshake_time_ms": 45,
    "ja4_client_stability": 0.85
  }'
```

Expected: 422 Unprocessable Entity

Verification:

- [ ] Returns 422 status (validation error)
- [ ] Shows field validation error

## Frontend Integration Tests

### Test 5: Open Frontend

Open `http://localhost:5173` in web browser

**Visual Verification:**

- [ ] Page loads without blank screen
- [ ] No JavaScript errors in console (F12)
- [ ] Loading state appears briefly
- [ ] Dashboard displays with data
- [ ] All components render:
  - [ ] Top Navigation Bar
  - [ ] Severity Overview
  - [ ] Summary Bullets
  - [ ] Hypothesis Probability
  - [ ] Evidence Table
  - [ ] Risk Reasoning
  - [ ] Recommended Actions
  - [ ] Limitations Disclaimer
  - [ ] Metadata Footer

### Test 6: Verify Real API Data

Open browser DevTools (F12) → Network tab

- [ ] Request to `http://localhost:8000/predict` appears
- [ ] Request method is POST
- [ ] Request includes TLS parameters
- [ ] Response status is 200
- [ ] Response contains valid JSON

### Test 7: Check Browser Console

Open browser DevTools (F12) → Console tab

- [ ] No red error messages
- [ ] No CORS errors
- [ ] May see: API call confirmation logs
- [ ] May see: Data transformation logs

## Data Transformation Tests

### Test 8: Verify Data Transformation

In browser console, check that:

```javascript
// The following should exist in the page
window.apiData; // (if exposed to window)
```

Or inspect component props (using React DevTools):

- [ ] Summary bullets are generated from API response
- [ ] Hypotheses are probability-weighted
- [ ] Evidence includes all TLS metrics
- [ ] Severity matches prediction (HIGH for MITM, LOW for NORMAL)
- [ ] Confidence score is reasonable (0-100)

### Test 9: Dynamic Content Verification

Check that displayed values match:

- [ ] Anomaly score from API appears somewhere (footer metadata)
- [ ] Prediction result influences severity level
- [ ] Status message changes based on prediction
- [ ] Actions recommended match risk level

## Error Handling Tests

### Test 10: Simulate API Down

1. Stop the FastAPI server (Ctrl+C)
2. Refresh browser

Expected:

- [ ] Error banner appears
- [ ] Message mentions API unavailable
- [ ] Fallback mock data shows (graceful degradation)
- [ ] User can still see interface
- [ ] Console shows error message

### Test 11: Wrong API Endpoint

Edit `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:9999
```

Restart frontend (`npm run dev`)

Expected:

- [ ] Error banner appears
- [ ] Message mentions connection failure
- [ ] Suggests checking API endpoint

Restore: Set back to `http://localhost:8000`

## Configuration Tests

### Test 12: Environment Variables

Check that `.env.local` is being used:

```bash
# In Frontend directory
cat .env.local
```

Verify:

- [ ] `VITE_API_BASE_URL=http://localhost:8000` exists
- [ ] File is not in `.gitignore` (it should be checked in for this project)

### Test 13: Vite Config

Verify that Vite configuration includes proxy:

```bash
# Check vite.config.ts has server.proxy configuration
grep -A 5 "server:" Frontend/vite.config.ts
```

- [ ] `proxy` object exists
- [ ] `/api` route maps to API endpoint

## File Structure Verification

### Test 14: All New Files Exist

- [ ] `Frontend/src/services/api.ts` ✓
- [ ] `Frontend/src/services/config.ts` ✓
- [ ] `Frontend/.env.local` ✓
- [ ] `Frontend/.env.example` ✓
- [ ] `INTEGRATION_GUIDE.md` ✓
- [ ] `INTEGRATION_SUMMARY.md` ✓
- [ ] `QUICK_START.md` ✓
- [ ] `ARCHITECTURE.md` ✓
- [ ] `start-services.bat` ✓

### Test 15: Key Files Modified

- [ ] `Frontend/src/app/App.tsx` (imports API service, uses useEffect)
- [ ] `Frontend/vite.config.ts` (server proxy configured)
- [ ] `venv/app.py` (CORS middleware added)

## Performance Tests

### Test 16: Load Time

From browser DevTools → Network tab:

- [ ] API `/predict` request completes in < 1 second
- [ ] Frontend renders within 2 seconds
- [ ] No requests timeout

### Test 17: Memory Leaks

Keep browser open for 5 minutes:

- [ ] Memory usage stable (not continuously increasing)
- [ ] No console errors
- [ ] Application remains responsive

## Security Tests

### Test 18: CORS Configuration

Check that CORS is properly configured:

Make request from different origin:

```bash
curl -H "Origin: http://example.com" \
  -H "Access-Control-Request-Method: POST" \
  http://localhost:8000
```

- [ ] Response includes `Access-Control-Allow-Origin` header
- [ ] CORS preflight works

### Test 19: Input Validation

Attempt invalid input:

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "handshake_time_ms": "not a number",
    "ja4_client_stability": 2.5,
    "ja4_server_stability": 0.90,
    "cert_reuse_score": 0.3,
    "ca_rarity_score": 0.2
  }'
```

- [ ] Returns 422 Unprocessable Entity
- [ ] Does not process invalid data
- [ ] Error message is clear

## Final Integration Test

### Test 20: Complete User Journey

1. Start backend
2. Start frontend
3. Open browser to http://localhost:5173
4. Page loads and shows data
5. All components display correctly
6. Data matches API response
7. Check different scenarios (normal vs suspicious)
8. Test error handling

**Overall Result:**

- [ ] ✅ All tests passed - Integration is working!
- [ ] ⚠️ Some tests failed - See troubleshooting below

## Troubleshooting

### If Test Fails: "API Connection Error"

```bash
# Check if API is running
curl http://localhost:8000/health

# If not, start it
uvicorn venv.app:app --reload --host 0.0.0.0 --port 8000

# If port error, check what's using 8000
netstat -ano | findstr :8000
```

### If Test Fails: "CORS Error"

Ensure `app.py` has:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### If Test Fails: "Module Not Found"

```bash
# In Frontend directory
npm install

# In Backend
pip install fastapi uvicorn pydantic numpy joblib
```

### If Test Fails: "Model File Not Found"

Update paths in `venv/app.py`:

```python
iforest = joblib.load(r"C:\path\to\tls_iforest.pkl")
scaler = joblib.load(r"C:\path\to\tls_scaler.pkl")
```

---

✅ **Once all tests pass, your integration is complete and ready for use!**
