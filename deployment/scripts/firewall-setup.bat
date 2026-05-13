@echo off
title LTT Platform - Firewall Configuration
color 0C

:: ============================================================
::  LTT Platform - Windows Firewall Setup Script
::  يفتح المنافذ المطلوبة في جدار الحماية
::  يجب تشغيله كـ Administrator
:: ============================================================

echo ============================================
echo   LTT Platform - Firewall Configuration
echo ============================================
echo   This script will open the following ports:
echo     - 8080  (API Server)
echo     - 20147 (Management Platform)
echo     - 5173  (Agent Inspection Form)
echo     - 5432  (PostgreSQL - للشبكة الداخلية فقط)
echo.
echo   IMPORTANT: Run this script as Administrator!
echo ============================================
echo.

:: التحقق من صلاحية المسؤول
net session >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] This script must be run as Administrator!
    echo         Right-click and select "Run as Administrator"
    pause
    exit /b 1
)

echo [1/5] Creating firewall rules for API Server (Port 8080)...
netsh advfirewall firewall add rule ^
    name="LTT-API-Server" ^
    protocol=TCP ^
    dir=in ^
    localport=8080 ^
    action=allow ^
    description="LTT Platform - Express API Server (Port 8080)" ^
    enable=yes
if %ERRORLEVEL% equ 0 (echo    [OK]) else (echo    [WARN] May already exist)

echo [2/5] Creating firewall rules for Management Platform (Port 20147)...
netsh advfirewall firewall add rule ^
    name="LTT-Management-Platform" ^
    protocol=TCP ^
    dir=in ^
    localport=20147 ^
    action=allow ^
    description="LTT Platform - React Management Dashboard (Port 20147)" ^
    enable=yes
if %ERRORLEVEL% equ 0 (echo    [OK]) else (echo    [WARN] May already exist)

echo [3/5] Creating firewall rules for Agent Form (Port 5173)...
netsh advfirewall firewall add rule ^
    name="LTT-Agent-Form" ^
    protocol=TCP ^
    dir=in ^
    localport=5173 ^
    action=allow ^
    description="LTT Platform - Agent Inspection Form (Port 5173)" ^
    enable=yes
if %ERRORLEVEL% equ 0 (echo    [OK]) else (echo    [WARN] May already exist)

echo [4/5] Creating firewall rules for PostgreSQL (Port 5432 - Internal only)...
netsh advfirewall firewall add rule ^
    name="LTT-PostgreSQL-Internal" ^
    protocol=TCP ^
    dir=in ^
    localport=5432 ^
    action=allow ^
    remoteip=192.168.1.0/24 ^
    description="LTT Platform - PostgreSQL (Internal LAN only)" ^
    enable=yes
if %ERRORLEVEL% equ 0 (echo    [OK]) else (echo    [WARN] May already exist)

echo [5/5] Verifying rules...
netsh advfirewall firewall show rule name="LTT-API-Server" >nul 2>&1
netsh advfirewall firewall show rule name="LTT-Management-Platform" >nul 2>&1
netsh advfirewall firewall show rule name="LTT-Agent-Form" >nul 2>&1
netsh advfirewall firewall show rule name="LTT-PostgreSQL-Internal" >nul 2>&1

echo.
echo ============================================
echo   Firewall configuration complete!
echo ============================================
echo.
echo   Active rules:
netsh advfirewall firewall show rule name="LTT-*" | findstr /i "Rule Name"
echo.
echo   To remove rules later, run:
echo     netsh advfirewall firewall delete rule name="LTT-API-Server"
echo     netsh advfirewall firewall delete rule name="LTT-Management-Platform"
echo     netsh advfirewall firewall delete rule name="LTT-Agent-Form"
echo     netsh advfirewall firewall delete rule name="LTT-PostgreSQL-Internal"
echo.

pause
