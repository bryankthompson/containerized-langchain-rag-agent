@echo off
REM This script rebuilds the Docker container for the LangChain Retrieval Agent
REM with all dependency and configuration fixes applied

echo 🚀 Rebuilding the LangChain Retrieval Agent with Crawl4ai Integration
echo =====================================================================

REM Stop any running containers
echo Stopping existing containers...
docker-compose down

REM Clean build files
echo Cleaning any existing build files...
if exist build\ rmdir /s /q build\

REM Build with no cache to ensure all fixes are included
echo Building the Docker container with updated dependencies and configurations...
docker-compose build --no-cache

REM Start the container
echo Starting the container...
docker-compose up -d

REM Display logs to verify successful startup
echo Displaying container logs...
docker-compose logs -f

echo.
echo If you encounter any issues, please check DEPENDENCY_FIX.md for troubleshooting steps.
