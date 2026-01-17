# Troubleshooting Guide

Common issues and their solutions.

## 🔴 Critical Issues

### Issue: "Failed to fetch from API" Error in Browser

**Symptoms:**

- Red error banner on frontend
- Browser console shows network error
- Cannot connect to API

**Solutions:**

1. **Check if API is running:**

   ```bash
   curl http://localhost:8000/health
   ```

   If no response, start the API:

   ```bash
   cd d:\VS code\React\ShadowLens\Mitm_Model
   venv\Scripts\activate
   uvicorn venv.app:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Check port 8000 is available:**

   ```bash
   # Windows PowerShell
   Get-NetTCPConnection -LocalPort 8000 -ErrorAction Ignore
   ```

   If occupied, either:
   - Stop the process using port 8000
   - Change port in startup command to 8001 and update `.env.local`

3. **Verify .env.local configuration:**

   ```bash
   cat Frontend\.env.local
   ```

   Should contain:

   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```

4. **Check CORS is enabled in app.py:**
   Ensure `app.py` contains:

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

---

### Issue: "ModuleNotFoundError: No module named 'fastapi'"

**Symptoms:**

- Backend won't start
- Error: `ModuleNotFoundError`
- Mentions fastapi, uvicorn, pydantic, etc.

**Solutions:**

1. **Ensure virtual environment is activated:**

   ```bash
   # Windows
   venv\Scripts\activate
   ```

   You should see `(venv)` in your terminal prompt.

2. **Install required packages:**

   ```bash
   pip install fastapi uvicorn pydantic numpy joblib
   ```

3. **Verify installation:**

   ```bash
   pip list | findstr fastapi
   ```

4. **If still failing, recreate venv:**
   ```bash
   deactivate
   rmdir /s venv
   python -m venv venv
   venv\Scripts\activate
   pip install fastapi uvicorn pydantic numpy joblib
   ```

---

### Issue: "Module not found: 'tls_iforest.pkl'"

**Symptoms:**

- Backend starts but crashes on first API request
- Error mentions `.pkl` files not found
- FileNotFoundError in logs

**Solutions:**

1. **Check model file paths:**
   In `venv/app.py`, update these lines:

   ```python
   iforest = joblib.load(r"C:\Users\krish\fa1\venv\tls_iforest.pkl")
   scaler = joblib.load(r"C:\Users\krish\fa1\venv\tls_scaler.pkl")
   ```

2. **Find where your models actually are:**

   ```bash
   # Search for .pkl files
   dir /s *.pkl
   ```

3. **Update paths to correct location:**

   ```python
   # Example - adjust path as needed
   iforest = joblib.load(r"D:\path\to\tls_iforest.pkl")
   scaler = joblib.load(r"D:\path\to\tls_scaler.pkl")
   ```

4. **Use absolute paths (recommended):**
   ```python
   import os
   model_dir = r"C:\actual\path\to\models"
   iforest = joblib.load(os.path.join(model_dir, "tls_iforest.pkl"))
   scaler = joblib.load(os.path.join(model_dir, "tls_scaler.pkl"))
   ```

---

## 🟡 Common Issues

### Issue: "Cannot find module 'react'" or npm installation issues

**Symptoms:**

- Frontend won't start
- `npm run dev` shows module errors
- Dependencies missing

**Solutions:**

1. **Reinstall dependencies:**

   ```bash
   cd Frontend
   npm install
   ```

2. **Clear npm cache:**

   ```bash
   npm cache clean --force
   npm install
   ```

3. **Delete node_modules and reinstall:**

   ```bash
   rm -r node_modules
   npm install
   ```

4. **Check Node version:**
   ```bash
   node --version
   npm --version
   ```
   Should be Node 16+ and npm 8+

---

### Issue: "Port 5173 is already in use"

**Symptoms:**

- Frontend won't start
- Error: "Port 5173 already in use"
- Cannot access `http://localhost:5173`

**Solutions:**

1. **Find process using port 5173:**

   ```bash
   # Windows PowerShell
   Get-NetTCPConnection -LocalPort 5173 -ErrorAction Ignore | Get-Process
   ```

2. **Kill the process:**

   ```bash
   # Windows PowerShell
   Stop-Process -Id <PID> -Force
   ```

3. **Or use a different port:**
   In `Frontend/vite.config.ts`, add:

   ```typescript
   server: {
     port: 5174,  // Use different port
     // ... rest of config
   }
   ```

4. **Or restart your machine:**
   ```bash
   shutdown /r /t 0
   ```

---

### Issue: "SyntaxError in App.tsx" or "Unexpected token"

**Symptoms:**

- Frontend build fails
- Error in App.tsx during compilation
- "Unexpected token" or similar

**Solutions:**

1. **Check for syntax errors:**
   Open `Frontend/src/app/App.tsx` and look for:
   - Missing closing braces `}`
   - Unclosed parentheses `()`
   - Missing commas in objects

2. **Verify imports are correct:**

   ```tsx
   import { getPrediction, transformPredictionToUIData } from "@/services/api";
   import { defaultTLSInput } from "@/services/config";
   ```

3. **Check for missing files:**
   - Does `Frontend/src/services/api.ts` exist?
   - Does `Frontend/src/services/config.ts` exist?

4. **Restart dev server:**
   ```bash
   # Ctrl+C to stop
   npm run dev
   ```

---

### Issue: API returns 422 "Unprocessable Entity"

**Symptoms:**

- API request fails with 422 status
- Error message: "Unprocessable Entity"
- Validation error details in response

**Solutions:**

1. **Check request body format:**

   ```bash
   # Correct format
   {
     "handshake_time_ms": 45,
     "ja4_client_stability": 0.85,
     "ja4_server_stability": 0.90,
     "cert_reuse_score": 0.3,
     "ca_rarity_score": 0.2
   }
   ```

2. **Verify all 5 fields present:**
   - `handshake_time_ms` (number)
   - `ja4_client_stability` (0-1)
   - `ja4_server_stability` (0-1)
   - `cert_reuse_score` (0-1)
   - `ca_rarity_score` (0-1)

3. **Check data types:**
   - Numbers should be numeric, not strings
   - No extra fields
   - No null values

4. **View API documentation:**
   Visit `http://localhost:8000/docs` for interactive API docs

---

### Issue: Blank white page or loading forever

**Symptoms:**

- Frontend loads but shows blank page
- Loading state never disappears
- No error messages

**Solutions:**

1. **Check browser console (F12):**
   Look for JavaScript errors

2. **Check if API response is slow:**

   ```bash
   # Test API directly
   curl -X POST http://localhost:8000/predict \
     -H "Content-Type: application/json" \
     -d '{...}' -v
   ```

   Should respond in < 1 second

3. **Check network tab (F12):**
   - Is request being made?
   - What status code?
   - What's in response?

4. **Restart frontend:**
   ```bash
   # Ctrl+C to stop
   npm run dev
   ```

---

## 🟢 Optimization Tips

### Performance Issues

**Frontend is slow:**

```bash
# Clear browser cache
# Clear vite cache
rm -r Frontend/node_modules/.vite

# Rebuild
npm run dev
```

**API responses slow:**

```bash
# Check if models are loaded
# Look for "loaded" messages in API startup logs

# May need more RAM or faster disk
```

---

### Memory Usage

**High memory usage:**

1. Close other applications
2. Restart both services
3. Check for infinite loops in logs

**Frontend memory leak:**

1. Check browser DevTools Memory tab
2. Look for growing heap over time
3. May indicate component not unmounting properly

---

## Testing & Debugging

### Enable Verbose Logging

**Backend:**

```bash
# Add logging to app.py
import logging
logging.basicConfig(level=logging.DEBUG)
```

**Frontend:**
Add to `api.ts`:

```typescript
console.log("Sending request:", input);
console.log("Response:", response);
```

### Test API in Isolation

```bash
# Test with curl
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"handshake_time_ms":45,"ja4_client_stability":0.85,"ja4_server_stability":0.90,"cert_reuse_score":0.3,"ca_rarity_score":0.2}' \
  -v

# Test with PowerShell
$body = @{
    handshake_time_ms = 45
    ja4_client_stability = 0.85
    ja4_server_stability = 0.90
    cert_reuse_score = 0.3
    ca_rarity_score = 0.2
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8000/predict" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

### Debug Frontend in VS Code

Add breakpoint in `App.tsx`:

```typescript
const prediction = await getPrediction(defaultTLSInput);
// Put cursor here and press F5
```

Then use VS Code debugger to step through.

---

## Getting Help

### Information to Provide

If asking for help, include:

1. **OS**: Windows 10/11, specific version
2. **Error message**: Exact text from console/logs
3. **Steps to reproduce**: How to trigger the error
4. **Files involved**: Which files are affected
5. **Log output**: Paste relevant logs
6. **Versions**:
   ```bash
   python --version
   node --version
   npm --version
   ```

### Where to Check for Errors

1. **Backend logs**: Terminal where uvicorn is running
2. **Frontend logs**: Browser console (F12 → Console)
3. **Network errors**: Browser DevTools → Network tab
4. **API docs**: `http://localhost:8000/docs`
5. **Server logs**: Look for `ERROR` or `WARN` messages

---

## Quick Fixes Checklist

Before detailed troubleshooting:

- [ ] Both services running? (Backend port 8000, Frontend port 5173)
- [ ] Virtual environment activated? (`(venv)` in terminal)
- [ ] Dependencies installed? (both backend and frontend)
- [ ] Model files exist? (check paths in `app.py`)
- [ ] `.env.local` configured? (correct API endpoint)
- [ ] Firewall blocking ports? (check Windows firewall)
- [ ] Port conflicts? (check with `netstat` command)
- [ ] Browser cache cleared? (Ctrl+Shift+Delete)
- [ ] Recent code changes? (check Git diff)

---

## Still Having Issues?

1. **Check INTEGRATION_GUIDE.md**: Detailed setup instructions
2. **Check VERIFICATION_CHECKLIST.md**: Run all tests
3. **Check ARCHITECTURE.md**: Understand data flow
4. **Review QUICK_START.md**: Simplified guide

If all else fails:

1. Delete and reinstall dependencies
2. Restart both services
3. Clear all caches (npm, browser)
4. Check file paths are absolute and correct
5. Verify no syntax errors in modified files

---

**Last Resort**: Recreate from scratch

```bash
# Backend
deactivate
rmdir /s venv
python -m venv venv
venv\Scripts\activate
pip install fastapi uvicorn pydantic numpy joblib

# Frontend
rmdir /s node_modules
npm install
rm Frontend\.env.local
copy Frontend\.env.example Frontend\.env.local
```

Then restart both services.

---

If you're still stuck, the error logs will give the best clues!
Check both the API server logs and browser console carefully.
