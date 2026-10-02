@echo off
title Pocket Winnie Server
cd /d "%~dp0"
echo ==========================================
echo   Building Pocket Winnie App...
echo ==========================================
node build.js
if %ERRORLEVEL% NEQ 0 (
  echo Build failed! Press any key to exit...
  pause
  exit /b %ERRORLEVEL%
)
echo ==========================================
echo   Starting Pocket Winnie Server...
echo ==========================================
start http://localhost:3000
node server.js
pause
