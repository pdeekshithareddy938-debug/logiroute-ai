@echo off
set "PATH=C:\Users\lahar\AppData\Local\Microsoft\WinGet\Packages\Git.MinGit_Microsoft.Winget.Source_8wekyb3d8bbwe\cmd;C:\Users\lahar\AppData\Local\Programs\Git Credential Manager;%PATH%"
cd /d "C:\Users\lahar\OneDrive\Desktop\delivery planning"
echo ======================================================================
echo LogiRoute AI - Pushing to GitHub
echo Remote: https://github.com/pdeekshithareddy938-debug/logiroute-ai.git
echo ======================================================================
git push -u origin main
echo ======================================================================
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Code pushed successfully to GitHub!
) else (
    echo [FAILED] Push failed. If authentication was requested, check the browser window.
)
pause
