@echo off
title LTT Platform - Quick Restart After Power Outage
color 0E

echo ============================================
echo   LTT Platform - Power Outage Recovery
echo ============================================
echo   This script restarts all services after
echo   an unexpected power outage.
echo ============================================
echo.

:: ---------------------------
:: 1. تشغيل PostgreSQL
:: ---------------------------
echo [1/4] Starting PostgreSQL...
net start postgresql-x64-16 >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo    [OK] PostgreSQL started
) else (
    echo    [WARN] PostgreSQL may already be running
)

:: انتظار PostgreSQL
timeout /t 3 /nobreak >nul

:: ---------------------------
:: 2. التأكد من PostgreSQL يعمل
:: ---------------------------
echo [2/4] Verifying database connection...
psql -h 127.0.0.1 -U ltt_admin -d ltt_platform -c "SELECT NOW();" >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo    [OK] Database is responding
) else (
    echo    [WARN] Database check failed. Continuing anyway...
)

:: ---------------------------
:: 3. استعادة PM2
:: ---------------------------
echo [3/4] Restoring PM2 processes...

where pm2 >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo    [ERROR] PM2 not found! Installing...
    npm install -g pm2
)

pm2 resurrect >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo    [OK] PM2 processes restored
) else (
    echo    [INFO] No saved process list found. Starting fresh...
    pm2 start ecosystem.config.js --env production
    pm2 save
)

:: ---------------------------
:: 4. التحقق النهائي
:: ---------------------------
echo [4/4] Final verification...
timeout /t 3 /nobreak >nul
pm2 status

echo.
echo ============================================
echo   RECOVERY COMPLETE
echo ============================================
echo.
echo   Test your services:
echo     http://192.168.1.50:20147
echo     http://192.168.1.50:5173
echo     http://192.168.1.50:8080/api/health
echo.
echo   If services are not running, try:
echo     cd /d C:\Users\m.adel\Desktop\Agent-Management-Platform
echo     start-production.bat
echo.

pause
