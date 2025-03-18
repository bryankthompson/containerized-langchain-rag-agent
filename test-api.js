#!/usr/bin/env node

/**
 * Simple API test script for the LangChain Retrieval Agent
 * 
 * Usage:
 *   node test-api.js [query]
 * 
 * Example:
 *   node test-api.js "What is the University of Notre Dame known for?"
 */

const http = require('http');

// Default query if none provided
const DEFAULT_QUERY = "Tell me about the University of Notre Dame";
const query = process.argv[2] || DEFAULT_QUERY;

console.log("LangChain Retrieval Agent API Test");
console.log("----------------------------------");
console.log(`Testing API with query: "${query}"`);

// Prepare the request data
const data = JSON.stringify({
  input: query
});

// Define the request options
const options = {
  hostname: 'localhost',
  port: 8000,
  path: '/api/query',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

// Function to format elapsed time
function formatElapsedTime(startTime) {
  const elapsed = Date.now() - startTime;
  if (elapsed < 1000) {
    return `${elapsed}ms`;
  } else {
    return `${(elapsed / 1000).toFixed(2)}s`;
  }
}

// Send the request
console.log("\nSending request to http://localhost:8000/api/query...");
const startTime = Date.now();

const req = http.request(options, (res) => {
  const statusCode = res.statusCode;
  console.log(`Status Code: ${statusCode} (${res.statusMessage || ''})`);
  
  // Handle redirects or errors
  if (statusCode >= 300) {
    console.error(`Error: HTTP status code ${statusCode}`);
    process.exit(1);
  }
  
  // Collect the response data
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  // Process the complete response
  res.on('end', () => {
    const elapsed = formatElapsedTime(startTime);
    console.log(`Request completed in ${elapsed}`);
    console.log("\nAPI Response:");
    try {
      const jsonResponse = JSON.parse(responseData);
      
      // Format the output for better readability
      console.log("\n==========================================================");
      console.log(`QUERY: "${query}"`);
      console.log("----------------------------------------------------------");
      console.log(`ANSWER: "${jsonResponse.output}"`);
      console.log("==========================================================");
      console.log("\nFull Response Object:");
      console.log(JSON.stringify(jsonResponse, null, 2));
    } catch (e) {
      console.log("Raw response (not JSON):");
      console.log(responseData);
    }
  });
});

// Handle request errors
req.on('error', (e) => {
  console.error(`\nRequest error: ${e.message}`);
  console.error("Is the server running? Check with 'run.bat logs'");
  process.exit(1);
});

// Send the request data
req.write(data);
req.end();
