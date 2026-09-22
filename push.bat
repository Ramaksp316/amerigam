@echo off
set MSG=%~1
if "%MSG%"=="" set MSG=chore: automated update

echo [1/2] Committing and pushing to GitHub...
git add .
git commit -m "%MSG%"
git push origin main

echo.
echo [2/2] Triggering live server deployment (amerigam.com)...
node scripts\deploy-live.js
