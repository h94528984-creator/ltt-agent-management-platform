@echo off
title LTT Platform - Archive Old Logs
color 0D

:: ============================================================
::  LTT Platform - Log Archival Script
::  ينقل السجلات الأقدم من 7 أيام إلى مجلد مؤرشف
:: ============================================================

set LOG_DIR=C:\Users\m.adel\Desktop\Agent-Management-Platform\deployment\production\logs
set ARCHIVE_DIR=%LOG_DIR%\archive

echo ============================================
echo   Archiving old PM2 logs (> 7 days)
echo ============================================
echo.

if not exist "%ARCHIVE_DIR%" (
    mkdir "%ARCHIVE_DIR%"
    echo    [OK] Created archive directory
)

:: ضغط السجلات القديمة
powershell -Command "& {
    $logDir = '%LOG_DIR%';
    $archiveDir = '%ARCHIVE_DIR%';
    $cutoff = (Get-Date).AddDays(-7);
    Get-ChildItem $logDir -File | Where-Object { $_.LastWriteTime -lt $cutoff } | ForEach-Object {
        $zipName = Join-Path $archiveDir ('logs_' + $_.BaseName + '_' + $_.LastWriteTime.ToString('yyyyMMdd') + '.zip');
        Compress-Archive -Path $_.FullName -DestinationPath $zipName -Force;
        Write-Host ('    Archived: ' + $_.Name + ' -> ' + (Split-Path $zipName -Leaf));
        Remove-Item $_.FullName;
    }
}"

echo.
echo    [OK] Archival complete. Old logs moved to: %ARCHIVE_DIR%
echo.

:: حذف المؤرشفات الأقدم من 90 يوماً
echo Cleaning archives older than 90 days...
forfiles /p "%ARCHIVE_DIR%" /m *.zip /d -90 /c "cmd /c del @path" >nul 2>&1

echo.
echo ============================================
echo   DONE
echo ============================================
echo.
pause
