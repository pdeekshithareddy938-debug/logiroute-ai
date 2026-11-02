@echo off
echo Starting LogiRoute AI Frontend (Vite + React)...
cd /d "%~dp0frontend"
set PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%
call npm run dev -- --host
pause
