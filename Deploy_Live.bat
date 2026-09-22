@echo off
setlocal enabledelayedexpansion

echo ====================================================
echo       AMERIGAM.COM 1-CLICK LIVE DEPLOYER
echo ====================================================
echo.

:: 1. Push latest code to GitHub first
echo [1/3] Pushing latest changes to GitHub...
git add .
git commit -m "deploy: update live site to latest build" --allow-empty
git push origin main
echo.

:: 2. Check if SSH key auth already works or if password is required
echo [2/3] Checking connection to amerigam.com (168.144.126.4)...
node scripts\deploy-live.js
if %errorlevel% equ 0 (
    echo.
    echo ====================================================
    echo   DEPLOYMENT SUCCESSFUL! Visit https://amerigam.com
    echo ====================================================
    pause
    exit /b 0
)

:: 3. If password was required:
echo.
echo SSH key not registered yet on VPS.
set /p VPS_PASS="Enter your VPS root password: "
if "%VPS_PASS%"=="" (
    echo No password entered. Aborted.
    pause
    exit /b 1
)

echo.
echo [3/3] Deploying with password and configuring permanent passwordless key...
node scripts\deploy-live.js "%VPS_PASS%"

if %errorlevel% equ 0 (
    echo.
    echo ====================================================
    echo   DEPLOYMENT SUCCESSFUL!
    echo   SSH Key has been saved to your server.
    echo   Next time, it will deploy 100%% automatically!
    echo ====================================================
) else (
    echo.
    echo [ERROR] Deployment encountered an issue. Check the logs above.
)

pause
