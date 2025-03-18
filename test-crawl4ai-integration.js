#!/usr/bin/env node

/**
 * Test script for the Crawl4ai integration with the LangChain Retrieval Agent.
 * 
 * This script sends test queries to the agent to demonstrate both knowledge base
 * and web crawling capabilities.
 * 
 * Usage:
 *   node test-crawl4ai-integration.js
 */

import fetch from 'node-fetch';

// Configuration
const API_URL = 'http://localhost:8000/api/query';
const TEST_QUERIES = [
  {
    name: 'Knowledge Base Query',
    input: 'What is machine learning?',
    expectation: 'Should use the Knowledge Base tool to answer'
  },
  {
    name: 'Direct Crawl Query',
    input: 'Use the web_crawler tool to check what is on https://example.com',
    expectation: 'Should use the Web Crawler tool to fetch and analyze the page'
  },
  {
    name: 'Mixed Query with URL',
    input: 'Compare machine learning with the information about AI on https://example.com',
    expectation: 'Should use both Knowledge Base and Web Crawler tools'
  },
  {
    name: 'Time-sensitive Query',
    input: 'What are the latest developments in quantum computing?',
    expectation: 'Might use Web Crawler for current information'
  }
];

/**
 * Send a query to the agent and log the response
 */
async function testQuery(query) {
  console.log(`\n-----------------------------------------------`);
  console.log(`TEST: ${query.name}`);
  console.log(`QUERY: "${query.input}"`);
  console.log(`EXPECTATION: ${query.expectation}`);
  console.log(`-----------------------------------------------`);

  try {
    const startTime = Date.now();
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input: query.input }),
    });

    const result = await response.json();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(`STATUS: ${response.status}`);
    console.log(`TIME: ${duration} seconds`);
    
    if (response.ok) {
      console.log(`\nRESPONSE:`);
      console.log(result.output);
      console.log(`\nPROCESSED AT: ${result.processed_at}`);
      console.log(`TRACE ID: ${result.trace_id}`);
    } else {
      console.error(`ERROR: ${result.error}`);
      console.error(`DETAILS: ${result.details || 'No details provided'}`);
    }
  } catch (error) {
    console.error(`FAILED TO CONNECT: ${error.message}`);
    console.error('Make sure the agent server is running at http://localhost:8000');
  }
}

/**
 * Run all test queries in sequence
 */
async function runTests() {
  console.log('=======================================================');
  console.log('   TESTING CRAWL4AI INTEGRATION WITH RETRIEVAL AGENT   ');
  console.log('=======================================================');
  console.log(`Server URL: ${API_URL}`);
  console.log('Running tests...\n');

  // First test the health endpoint
  try {
    const healthResponse = await fetch('http://localhost:8000/health');
    const healthStatus = await healthResponse.json();
    console.log(`Health check: ${healthResponse.ok ? 'PASSED ✅' : 'FAILED ❌'}`);
    console.log(`Status: ${JSON.stringify(healthStatus)}\n`);
  } catch (error) {
    console.error(`Health check: FAILED ❌`);
    console.error(`Error: ${error.message}`);
    console.error('Make sure the agent server is running before testing.');
    process.exit(1);
  }

  // Run each test query in sequence
  for (const query of TEST_QUERIES) {
    await testQuery(query);
  }

  console.log('\n=======================================================');
  console.log('                      TESTS COMPLETE                    ');
  console.log('=======================================================');
}

// Run the tests
runTests().catch(console.error);
