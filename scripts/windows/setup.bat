@echo off
echo Setting up MakrX Ecosystem on Windows...

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed. Please install Node.js from https://nodejs.org/
    exit /b 1
)

:: Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Warning: Docker is not installed. Some features may not work.
    echo Install Docker Desktop from https://www.docker.com/products/docker-desktop
)

:: Install dependencies
echo Installing dependencies...
npm ci --legacy-peer-deps

:: Create environment files
if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
)

:: Create app-specific env files
for /d %%i in (apps\*) do (
    if not exist "%%i\.env.local" (
        echo Creating %%i\.env.local...
        echo # Environment variables for %%i > "%%i\.env.local"
        echo NEXT_PUBLIC_API_URL=http://localhost:3000/api >> "%%i\.env.local"
        echo NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8081 >> "%%i\.env.local"
        echo NEXT_PUBLIC_KEYCLOAK_REALM=makrx >> "%%i\.env.local"
    )
)

echo.
echo ✅ Setup complete! Next steps:
echo    1. Configure your .env files
echo    2. Run: npm run dev
echo    3. Or start with Docker: docker-compose up
