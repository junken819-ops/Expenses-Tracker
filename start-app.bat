@echo off
title Pocket Winnie Server
cd /d "%~dp0"
echo ==========================================
echo   Starting Pocket Winnie Server...
echo ==========================================
start http://localhost:3000
node server.js
pause
