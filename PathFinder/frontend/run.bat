@echo off
REM PathFinder Frontend — Windows Command Prompt runner
REM Double-click this file or run it from cmd

echo PathFinder Frontend

if not exist node_modules (
    echo Installing npm packages...
    npm install
)

echo Starting frontend at http://localhost:5173
npm run dev
