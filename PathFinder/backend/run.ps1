# PathFinder Backend — Windows PowerShell runner
# Run this from the backend folder: powershell -ExecutionPolicy Bypass -File run.ps1

Write-Host "PathFinder Backend" -ForegroundColor Cyan

# Create venv if it doesn't exist
if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
& "venv\Scripts\python.exe" -m pip install -r requirements.txt --quiet

# Start server
Write-Host "Starting server at http://localhost:8000" -ForegroundColor Green
& "venv\Scripts\uvicorn.exe" main:app --reload --port 8000
