@echo off
echo ============================================
echo   not ur regular hr v2 — production build
echo ============================================
echo.

where node >nul 2>&1
if %errorlevel% neq 0 (
  echo [ERROR] Node.js not found. Download from https://nodejs.org
  pause & exit /b 1
)

if not exist node_modules (
  echo [1/3] Installing dependencies...
  npm.cmd install
)

echo [2/3] Building frontend...
npm.cmd run build
if %errorlevel% neq 0 (
  echo Build failed. Check errors above.
  pause & exit /b 1
)

echo [3/3] Starting server...
echo Open http://localhost:3001 in your browser.
echo (or the PORT set in your .env file)
echo Press Ctrl+C to stop.
echo.
set NODE_ENV=production
node server.js
pause
