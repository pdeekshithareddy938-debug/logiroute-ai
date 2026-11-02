Write-Host "Starting LogiRoute AI Frontend..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot\frontend"
$env:PATH = "$env:LOCALAPPDATA\Programs\nodejs;$env:PATH"
npm run dev -- --host
