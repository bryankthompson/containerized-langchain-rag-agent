@echo off
echo LangChain Retrieval Agent Test Runner
echo ====================================

if "%1"=="" (
  echo Running all tests...
  node tests/run-tests.js
) else (
  echo Running tests for category: %1
  node tests/run-tests.js %1
)

echo.
echo Test execution complete.
