@echo off
title Starting IMS Petty Cash System...
echo ===================================================
echo     IMS GROUP - PETTY CASH SYSTEM LAUNCHER
echo ===================================================
echo.
cd /d "E:\.gemini\antigravity\scratch\PettyCash"
echo Starting Local Dev Server at http://localhost:3000...
start "" "http://localhost:3000"
cmd /c npm run dev
