@echo off
echo Starting LogiRoute AI Backend (FastAPI + Uvicorn)...
cd /d "%~dp0backend"
set PYTHONPATH=.
set DISABLE_SQLALCHEMY_CEXT=1
"%LOCALAPPDATA%\Programs\Python\Python312\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
pause
