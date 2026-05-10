@echo off
echo ============================================
echo   not ur regular hr — setup
echo ============================================
echo.

where node >nul 2>&1
if %errorlevel% neq 0 (
  echo [ERROR] Node.js is not installed.
  echo Please download it from https://nodejs.org and re-run this script.
  pause
  exit /b 1
)

echo [1/3] Node.js found:
node --version

echo.
echo [2/3] Installing dependencies...
npm install

echo.
echo [3/3] Checking for .env file...
if not exist .env (
  copy .env.example .env
  echo .env file created. Open it and add your ANTHROPIC_API_KEY before starting.
) else (
  echo .env already exists.
)

echo.
echo ============================================
echo   Setup complete!
echo   1. Edit .env and add your ANTHROPIC_API_KEY
echo   2. Run start.bat to launch the app
echo ============================================
pause
