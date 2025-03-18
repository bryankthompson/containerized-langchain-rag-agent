#!/usr/bin/env node

/**
 * Test runner for LangChain Retrieval Agent tests
 * 
 * Usage:
 *   node run-tests.js [category]
 * 
 * Examples:
 *   node run-tests.js              # Run all tests
 *   node run-tests.js response     # Run only response tests
 *   node run-tests.js models       # Run only model switching tests
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import apiClient from './utils/api-client.js';
import config from './utils/test-config.js';

// Get current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define test categories and their corresponding directories
const TEST_CATEGORIES = {
  'response': 'response',
  'models': 'models',
  'threading': 'threading',
  'chat-completions': 'chat-completions',
  'prompt-chaining': 'prompt-chaining'
};

// ANSI color codes for output formatting
const COLORS = {
  RESET: '\x1b[0m',
  GREEN: '\x1b[32m',
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  MAGENTA: '\x1b[35m',
  CYAN: '\x1b[36m',
  BOLD: '\x1b[1m'
};

// Test results tracking
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  timings: []
};

/**
 * Run a single test file
 * @param {string} testFile - Path to the test file
 * @returns {Promise<Object>} Test results
 */
async function runTestFile(testFile) {
  console.log(`${COLORS.BLUE}Running test: ${path.basename(testFile)}${COLORS.RESET}`);
  
  try {
    // Use dynamic import instead of require for ES modules
    const testModule = await import(testFile);
    const startTime = Date.now();
    
    // Run test setup if it exists
    if (typeof testModule.setup === 'function') {
      await testModule.setup();
    }
    
    // Run the actual tests
    const testResults = await testModule.run();
    const endTime = Date.now();
    const elapsed = endTime - startTime;
    
    // Run test cleanup if it exists
    if (typeof testModule.cleanup === 'function') {
      await testModule.cleanup();
    }
    
    console.log(`${COLORS.BLUE}Test completed in ${elapsed}ms${COLORS.RESET}`);
    
    return {
      file: path.basename(testFile),
      results: testResults,
      elapsed
    };
  } catch (error) {
    console.error(`${COLORS.RED}Error running test ${path.basename(testFile)}: ${error.message}${COLORS.RESET}`);
    console.error(error.stack);
    
    return {
      file: path.basename(testFile),
      error: error.message,
      elapsed: 0,
      results: {
        passed: 0,
        failed: 1,
        skipped: 0,
        tests: [{
          name: path.basename(testFile),
          passed: false,
          error: error.message
        }]
      }
    };
  }
}

/**
 * Run all tests in a category
 * @param {string} category - Test category
 * @returns {Promise<Array>} Test results
 */
async function runTestCategory(category) {
  const categoryDir = path.join(__dirname, category);
  
  if (!fs.existsSync(categoryDir)) {
    console.error(`${COLORS.RED}Test category directory not found: ${categoryDir}${COLORS.RESET}`);
    return [];
  }
  
  const testFiles = fs.readdirSync(categoryDir)
    .filter(file => file.endsWith('.js'))
    .map(file => path.join(categoryDir, file));
  
  if (testFiles.length === 0) {
    console.warn(`${COLORS.YELLOW}No test files found in category: ${category}${COLORS.RESET}`);
    return [];
  }
  
  console.log(`${COLORS.MAGENTA}${COLORS.BOLD}Running ${testFiles.length} tests in category: ${category}${COLORS.RESET}`);
  
  const testResults = [];
  
  // Run tests sequentially to avoid resource contention
  for (const testFile of testFiles) {
    const result = await runTestFile(testFile);
    testResults.push(result);
    
    // Add a small delay between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return testResults;
}

/**
 * Print test results summary
 * @param {Array} categoryResults - Results from all test categories
 */
function printSummary(categoryResults) {
  console.log('\n');
  console.log(`${COLORS.BOLD}${COLORS.CYAN}=======================================${COLORS.RESET}`);
  console.log(`${COLORS.BOLD}${COLORS.CYAN}      TEST RESULTS SUMMARY           ${COLORS.RESET}`);
  console.log(`${COLORS.BOLD}${COLORS.CYAN}=======================================${COLORS.RESET}`);
  console.log('\n');
  
  // Print category summaries
  for (const category of categoryResults) {
    const totalTests = category.results.reduce((sum, result) => sum + result.results.passed + result.results.failed + result.results.skipped, 0);
    const totalPassed = category.results.reduce((sum, result) => sum + result.results.passed, 0);
    const totalFailed = category.results.reduce((sum, result) => sum + result.results.failed, 0);
    const totalSkipped = category.results.reduce((sum, result) => sum + result.results.skipped, 0);
    const totalTime = category.results.reduce((sum, result) => sum + result.elapsed, 0);
    
    console.log(`${COLORS.BOLD}Category: ${category.name}${COLORS.RESET}`);
    console.log(`  Tests: ${totalTests}`);
    console.log(`  ${COLORS.GREEN}Passed: ${totalPassed}${COLORS.RESET}`);
    console.log(`  ${COLORS.RED}Failed: ${totalFailed}${COLORS.RESET}`);
    console.log(`  ${COLORS.YELLOW}Skipped: ${totalSkipped}${COLORS.RESET}`);
    console.log(`  Time: ${totalTime}ms`);
    console.log('\n');
    
    // Add to overall results
    results.total += totalTests;
    results.passed += totalPassed;
    results.failed += totalFailed;
    results.skipped += totalSkipped;
    results.timings.push({
      category: category.name,
      time: totalTime
    });
  }
  
  // Print overall summary
  console.log(`${COLORS.BOLD}${COLORS.CYAN}=======================================`);
  console.log(`${COLORS.BOLD}${COLORS.CYAN}         OVERALL SUMMARY              `);
  console.log(`${COLORS.BOLD}${COLORS.CYAN}=======================================${COLORS.RESET}`);
  console.log(`Total tests: ${results.total}`);
  console.log(`${COLORS.GREEN}Passed: ${results.passed}${COLORS.RESET}`);
  console.log(`${COLORS.RED}Failed: ${results.failed}${COLORS.RESET}`);
  console.log(`${COLORS.YELLOW}Skipped: ${results.skipped}${COLORS.RESET}`);
  console.log(`Total time: ${results.timings.reduce((sum, timing) => sum + timing.time, 0)}ms`);
  console.log('\n');
  
  // Exit with appropriate code
  if (results.failed > 0) {
    console.log(`${COLORS.RED}${COLORS.BOLD}Tests failed!${COLORS.RESET}`);
    process.exitCode = 1;
  } else {
    console.log(`${COLORS.GREEN}${COLORS.BOLD}All tests passed!${COLORS.RESET}`);
    process.exitCode = 0;
  }
}

/**
 * Check if the API is healthy before running tests
 */
async function checkApiHealth() {
  console.log(`${COLORS.BLUE}Checking API health...${COLORS.RESET}`);
  
  try {
    const isHealthy = await apiClient.isHealthy();
    
    if (isHealthy) {
      console.log(`${COLORS.GREEN}API is healthy${COLORS.RESET}`);
      return true;
    } else {
      console.error(`${COLORS.RED}API is not responding or unhealthy${COLORS.RESET}`);
      console.error(`${COLORS.YELLOW}Make sure the server is running with:${COLORS.RESET}`);
      console.error(`${COLORS.YELLOW}  run.bat${COLORS.RESET}`);
      return false;
    }
  } catch (error) {
    console.error(`${COLORS.RED}Error checking API health: ${error.message}${COLORS.RESET}`);
    console.error(`${COLORS.YELLOW}Make sure the server is running with:${COLORS.RESET}`);
    console.error(`${COLORS.YELLOW}  run.bat${COLORS.RESET}`);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  let categories = Object.keys(TEST_CATEGORIES);
  
  // If a specific category is provided, only run that category
  if (args.length > 0 && categories.includes(args[0])) {
    categories = [args[0]];
  }
  
  // Check if the API is healthy
  const isHealthy = await checkApiHealth();
  
  if (!isHealthy) {
    console.error(`${COLORS.RED}Aborting tests due to API health check failure${COLORS.RESET}`);
    process.exit(1);
  }
  
  // Run tests for each category
  const categoryResults = [];
  
  for (const category of categories) {
    console.log(`\n${COLORS.MAGENTA}${COLORS.BOLD}=== Running tests for category: ${category} ===${COLORS.RESET}\n`);
    
    const results = await runTestCategory(TEST_CATEGORIES[category]);
    
    categoryResults.push({
      name: category,
      results
    });
  }
  
  // Print summary
  printSummary(categoryResults);
}

// Run the main function
main().catch(error => {
  console.error(`${COLORS.RED}Error running tests: ${error.message}${COLORS.RESET}`);
  console.error(error.stack);
  process.exit(1);
});
