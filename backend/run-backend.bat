@echo off
echo ========================================
echo    Resolio Backend - Student API
echo ========================================
echo.

cd /d "%~dp0"

echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please download from: https://nodejs.org/
    pause
    exit /b 1
)

echo Checking if port 3001 is available...
netstat -ano | findstr :3001 >nul 2>&1
if not errorlevel 1 (
    echo Port 3001 is in use. Attempting to free it...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
        taskkill /PID %%a /F >nul 2>&1
    )
    timeout /t 2 >nul
)

echo Installing dependencies (if needed)...
if not exist "node_modules" (
    echo Installing npm packages...
    npm install
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies!
        pause
        exit /b 1
    )
)

echo.
echo Starting Resolio Backend Server...
echo API will be available at: http://localhost:3001
echo.
echo Test endpoints:
echo - Health Check: http://localhost:3001/api/health
echo - API Test:     http://localhost:3001/api/test
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev