@echo off
title Delivery System - Launcher
echo ========================================
echo   Starting Delivery Management System
echo ========================================
echo.

echo [1/2] Starting Backend (port 3001)...
start "Backend - API" cmd /k "cd /d %~dp0backend && npm run dev"

timeout /t 2 /nobreak >nul

echo [2/2] Starting Frontend (port 5000)...
start "Frontend - Next.js" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo ========================================
echo   Both servers are starting...
echo   Backend:  http://localhost:3001
echo   Frontend: http://localhost:5000
echo ========================================
echo.
pause
