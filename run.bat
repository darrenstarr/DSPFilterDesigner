@echo off
REM DSP Filter Design Tool - Startup Script for Windows

echo.
echo ========================================
echo DSP Filter Design Learning Tool Startup
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from python.org
    pause
    exit /b 1
)

echo [1/3] Checking Python version...
python --version

REM Create virtual environment if it doesn't exist
if not exist "web_app\venv" (
    echo.
    echo [2/3] Creating virtual environment...
    cd web_app
    python -m venv venv
    call venv\Scripts\activate.bat
    cd ..
) else (
    echo [2/3] Virtual environment already exists
    call web_app\venv\Scripts\activate.bat
)

REM Install requirements
echo.
echo [3/3] Installing dependencies...
pip install -r web_app\requirements.txt

echo.
echo ========================================
echo Starting Flask development server...
echo ========================================
echo.
echo The application will be available at:
echo http://localhost:5000
echo.
echo Press Ctrl+C to stop the server.
echo.

cd web_app
python app.py

pause
