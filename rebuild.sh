#!/bin/bash

# This script rebuilds the Docker container for the LangChain Retrieval Agent
# with all dependency and configuration fixes applied

echo "🚀 Rebuilding the LangChain Retrieval Agent with Crawl4ai Integration"
echo "====================================================================="

# Stop any running containers
echo "Stopping existing containers..."
docker-compose down

# Clean build files
echo "Cleaning any existing build files..."
rm -rf build/

# Build with no cache to ensure all fixes are included
echo "Building the Docker container with updated dependencies and configurations..."
docker-compose build --no-cache

# Start the container
echo "Starting the container..."
docker-compose up -d

# Display logs to verify successful startup
echo "Displaying container logs..."
docker-compose logs -f

echo ""
echo "If you encounter any issues, please check DEPENDENCY_FIX.md for troubleshooting steps."
