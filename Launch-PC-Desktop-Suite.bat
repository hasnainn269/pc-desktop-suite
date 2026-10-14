@echo off
:: ====================================================================
:: PC Desktop Suite - Windows Native Desktop App Launcher
:: ====================================================================
title PC Desktop Suite - Windows App
color 0b
cls

echo ====================================================================
echo      PC DESKTOP SUITE - WINDOWS LAPTOP & WORKSTATION EDITION
echo ====================================================================
echo.
echo Starting PC Desktop Suite on your Windows system...
echo.

:: Set App Port and Target URL
set PORT=3000
set APP_URL=http://localhost:%PORT%

:: Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found on your system!
    echo Please download and install Node.js from https://nodejs.org
    echo Then run this launcher again.
    echo.
    pause
    exit /b 1
)

:: Check if node_modules exists, if not run npm install
if not exist "node_modules\" (
    echo [1/3] First-time setup detected: Installing packages...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install packages. Please check your internet connection.
        pause
        exit /b 1
    )
    echo Packages installed successfully!
    echo.
)

:: Check if server is already running on port 3000
netstat -ano | findstr ":%PORT%" | findstr "LISTENING" >nul 2>&1
if %errorlevel% neq 0 (
    echo [2/3] Starting local background server...
    start /b cmd /c "npm run dev" >nul 2>&1
    timeout /t 3 /nobreak >nul
) else (
    echo [2/3] Local server is already running!
)

echo [3/3] Launching dedicated Windows App window...

:: Method A: Try Microsoft Edge in dedicated App Mode (Default on Windows 10 & 11)
where msedge >nul 2>&1
if %errorlevel% equ 0 (
    start msedge --app="%APP_URL%" --window-size=1280,820 --start-maximized
    echo Launched with Microsoft Edge App Mode.
    goto finished
)

:: Method B: Try Google Chrome in dedicated App Mode
where chrome >nul 2>&1
if %errorlevel% equ 0 (
    start chrome --app="%APP_URL%" --window-size=1280,820 --start-maximized
    echo Launched with Google Chrome App Mode.
    goto finished
)

:: Method C: Fallback to default Windows web browser
start "" "%APP_URL%"

:finished
echo.
echo ====================================================================
echo PC Desktop Suite is running. Press any key or close this window.
echo ====================================================================
exit
