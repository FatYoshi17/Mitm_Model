@echo off
REM ShadowLens - Quick Start Script
REM This script starts both the backend API and frontend development server

echo.
echo ===============================================
echo   ShadowLens - Backend & Frontend Startup
echo ===============================================
echo.

REM Check if we're in the right directory
if not exist "Frontend" (
    echo Error: Frontend folder not found!
    echo Please run this script from the Mitm_Model directory
    pause
    exit /b 1
)

if not exist "venv" (
    echo Error: Python venv folder not found!
    echo Please ensure venv is set up
    pause
    exit /b 1
)

echo Starting backend API server...
echo.

REM Start the API server in a new window
start "ShadowLens API Server" cmd /k "venv\Scripts\activate && uvicorn venv.app:app --reload --host 0.0.0.0 --port 8000"

REM Wait a moment for the API to start
timeout /t 3 /nobreak

echo.
echo Starting frontend development server...
echo.

REM Start the frontend in a new window
start "ShadowLens Frontend" cmd /k "cd Frontend && npm run dev"

echo.
echo ===============================================
echo   Startup Complete!
echo ===============================================
echo.
echo Backend API:  http://localhost:8000
echo Frontend:     http://localhost:5173
echo API Docs:     http://localhost:8000/docs
echo.
echo Press CTRL+C in either window to stop the respective service
echo.
pause
