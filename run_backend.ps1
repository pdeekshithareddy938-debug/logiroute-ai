Write-Host "Starting LogiRoute AI Backend..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot\backend"
$env:PYTHONPATH = "."
$env:DISABLE_SQLALCHEMY_CEXT = "1"
$py = "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe"
if (-not (Test-Path $py)) {
    $py = "python"
}
& $py -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
