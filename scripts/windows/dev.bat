@echo off
echo Starting MakrX Ecosystem development environment...

:: Start infrastructure services
echo Starting infrastructure services with Docker...
docker-compose up -d postgres redis keycloak minio

:: Wait a moment for services to start
timeout /t 10 /nobreak > nul

:: Start all development servers
echo Starting development servers...
start "Gateway Frontend" cmd /k "cd apps\gateway-frontend && npm run dev"
start "Gateway Hacker" cmd /k "cd apps\gateway-frontend-hacker && npm run dev"
start "MakrCave Frontend" cmd /k "cd apps\makrcave && npm run dev"
start "MakrX Store" cmd /k "cd apps\makrx-store && npm run dev"
start "MakrX Events" cmd /k "cd apps\makrx-events && npm run dev"

echo.
echo ✅ Development environment started!
echo    - Infrastructure services running in Docker
echo    - Frontend apps starting in separate windows
echo    - Check each window for startup status
