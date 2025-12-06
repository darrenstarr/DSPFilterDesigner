#!/usr/bin/env pwsh

# DSP Filter Design Tool - Startup Script for Windows PowerShell

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DSP Filter Design Learning Tool Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    Write-Host "[1/3] Found Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python 3.8+ from python.org" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Create virtual environment if it doesn't exist
$venvPath = "web_app\venv"
if (-not (Test-Path $venvPath)) {
    Write-Host ""
    Write-Host "[2/3] Creating virtual environment..." -ForegroundColor Yellow
    Set-Location web_app
    python -m venv venv
    & .\venv\Scripts\Activate.ps1
    Set-Location ..
} else {
    Write-Host "[2/3] Virtual environment already exists" -ForegroundColor Green
    & .\web_app\venv\Scripts\Activate.ps1
}

# Install requirements
Write-Host ""
Write-Host "[3/3] Installing dependencies..." -ForegroundColor Yellow
pip install -r web_app\requirements.txt

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Flask development server..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "The application will be available at:" -ForegroundColor Green
Write-Host "http://localhost:5000" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server." -ForegroundColor Yellow
Write-Host ""

Set-Location web_app
python app.py

Read-Host "Press Enter to exit"
