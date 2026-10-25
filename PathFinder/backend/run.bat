@echo off
REM PathFinder Backend — Windows Command Prompt runner
REM Double-click this file or run it from cmd

echo PathFinder Backend

if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

echo Installing dependencies...
venv\Scripts\python.exe -m pip install -r requirements.txt --quiet

echo Starting server at http://localhost:8000
venv\Scripts\uvicorn.exe main:app --reload --port 8000
