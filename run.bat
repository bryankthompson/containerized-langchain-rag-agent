@echo off
echo LangChain Retrieval Agent - Docker Build and Run Script
echo ----------------------------------------------------

REM Check for Docker
where docker >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Docker is not installed or not in your PATH.
  echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop/
  exit /b 1
)

if "%1"=="" goto help
if "%1"=="build" goto build
if "%1"=="rebuild" goto rebuild
if "%1"=="run" goto run
if "%1"=="stop" goto stop
if "%1"=="clean" goto clean
if "%1"=="logs" goto logs
if "%1"=="test" goto test
if "%1"=="help" goto help

:build
  echo Building Docker image...
  docker-compose build
  echo.
  echo Build complete. Run with: run.bat run
  goto end

:rebuild
  echo Stopping any running containers...
  docker-compose down
  echo Rebuilding Docker image from scratch...
  docker-compose build --no-cache
  echo.
  echo Rebuild complete. Run with: run.bat run
  goto end

:run
  echo Starting container in detached mode...
  docker-compose up -d
  echo.
  echo Container is now running!
  echo Access the API at: http://localhost:8000
  echo Health check: http://localhost:8000/health
  echo.
  echo View logs with: run.bat logs
  echo Test API with: run.bat test "What is Notre Dame known for?"
  echo Stop with: run.bat stop
  goto end

:stop
  echo Stopping container...
  docker-compose down
  echo Container stopped.
  goto end

:clean
  echo Stopping container and removing volumes...
  docker-compose down --volumes --remove-orphans
  echo Removing unused Docker images and systems...
  docker system prune -f
  echo Removed all containers, volumes, and unused Docker resources.
  goto end

:logs
  echo Showing logs (Ctrl+C to exit)...
  docker-compose logs -f
  goto end

:test
  if "%2"=="" (
    echo Testing API with default query...
    node test-api.js
  ) else (
    echo Testing API with custom query: "%~2"
    node test-api.js "%~2"
  )
  goto end

:help
  echo.
  echo Usage:
  echo   run.bat build    - Build the Docker image
  echo   run.bat rebuild  - Rebuild Docker image from scratch (with --no-cache)
  echo   run.bat run      - Start the container
  echo   run.bat stop     - Stop the container
  echo   run.bat logs     - View container logs
  echo   run.bat test     - Test the API with default query
  echo   run.bat test "Your query here" - Test API with custom query
  echo   run.bat clean    - Stop and clean up all Docker resources
  echo   run.bat help     - Show this help message
  echo.
  echo Workflow:
  echo   1. run.bat build    - First time setup
  echo   2. run.bat run      - Start the API server
  echo   3. run.bat test     - Test if it's working
  echo   4. run.bat logs     - View logs for debugging
  echo   5. run.bat stop     - Stop when finished
  echo.
  echo If you make changes to the code:
  echo   run.bat rebuild     - Rebuild the container 
  echo   run.bat run         - Start it again
  goto end

:end
