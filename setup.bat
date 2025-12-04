@echo off
:: Art Fare Quick Setup Script for Windows
:: This script automates the installation and setup process

echo ========================================
echo Art Fare - Quick Setup (Windows)
echo ========================================
echo.

:: Check Node.js
echo Checking prerequisites...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)
echo [OK] Node.js installed:
node -v

:: Check npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed.
    pause
    exit /b 1
)
echo [OK] npm installed

:: Check MySQL
where mysql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] MySQL is not installed or not in PATH.
    echo Please install MySQL 8+ first.
    pause
    exit /b 1
)
echo [OK] MySQL installed
echo.

:: Database setup
echo Setting up database...
set /p MYSQL_PASSWORD="Enter MySQL root password: "

:: Create database
echo Creating database 'art_fare'...
mysql -u root -p%MYSQL_PASSWORD% -e "CREATE DATABASE IF NOT EXISTS art_fare CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to create database. Please check your MySQL password.
    pause
    exit /b 1
)
echo [OK] Database created

:: Import schema
if exist "database\schema.sql" (
    echo Importing database schema...
    mysql -u root -p%MYSQL_PASSWORD% art_fare < database\schema.sql 2>nul
    echo [OK] Schema imported
)

:: Import seed data (optional)
if exist "database\seed.sql" (
    set /p IMPORT_SEED="Import sample data? (y/n): "
    if /i "%IMPORT_SEED%"=="y" (
        echo Importing sample data...
        mysql -u root -p%MYSQL_PASSWORD% art_fare < database\seed.sql 2>nul
        echo [OK] Sample data imported
    )
)
echo.

:: Backend setup
echo Setting up backend...
cd backend

echo Installing backend dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install backend dependencies
    pause
    exit /b 1
)
echo [OK] Backend dependencies installed

:: Create .env file
if not exist ".env" (
    copy .env.example .env >nul
    echo [OK] Backend .env file created
    echo [WARNING] Please update JWT secrets in backend/.env for production!
) else (
    echo [WARNING] backend/.env already exists, skipping...
)

cd ..
echo.

:: Frontend setup
echo Setting up frontend...
cd frontend

echo Installing frontend dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install frontend dependencies
    pause
    exit /b 1
)
echo [OK] Frontend dependencies installed

:: Create .env file
if not exist ".env" (
    copy .env.example .env >nul
    echo [OK] Frontend .env file created
) else (
    echo [WARNING] frontend/.env already exists, skipping...
)

cd ..
echo.

:: Success message
echo ========================================
echo Setup completed successfully!
echo ========================================
echo.
echo To start the application:
echo.
echo 1. Start the backend (in one terminal):
echo    cd backend
echo    npm run dev
echo.
echo 2. Start the frontend (in another terminal):
echo    cd frontend
echo    npm run dev
echo.
echo 3. Open your browser to:
echo    http://localhost:5173
echo.

if exist "database\seed.sql" (
    echo Test accounts (if you imported seed data):
    echo   Admin:    admin@artfare.com / Admin@123
    echo   Artist:   artist@artfare.com / Artist@123
    echo   Customer: customer@artfare.com / Customer@123
    echo.
)

echo Happy coding!
echo.
pause
