# PathFinder Frontend — Windows PowerShell runner
# Run this from the frontend folder: powershell -ExecutionPolicy Bypass -File run.ps1

Write-Host "PathFinder Frontend" -ForegroundColor Cyan

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing npm packages..." -ForegroundColor Yellow
    npm install
}

Write-Host "Starting frontend at http://localhost:5173" -ForegroundColor Green
npm run dev
