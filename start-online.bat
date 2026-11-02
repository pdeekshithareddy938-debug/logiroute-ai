@echo off
title LogiRoute Fast Delivery Platform - Public Online Preview
setlocal enabledelayedexpansion

cd /d "%~dp0"

REM Ensure local nodejs in PATH if needed
if exist "%LOCALAPPDATA%\Programs\nodejs" (
    set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%"
)

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not found in your PATH. Please install Node.js v18+ or add it to PATH.
    pause
    exit /b 1
)

node start-online.js
pause
