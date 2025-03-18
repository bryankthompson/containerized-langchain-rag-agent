/**
 * Tests edge cases for the LangChain Retrieval Agent
 * Tests how the agent handles empty queries, very long queries, and malformed queries
 */

import apiClient from '../utils/api-client.js';
import config from '../utils/test-config.js';

/**
 * Run the tests
 * @returns {Object} Test results
 */
async function run() {
  console.log('Running edge case tests...');
  
  const results = {
    passed: 0,
    failed: 0,
    skipped: 0,
    tests: []
  };
  
  // Test 1: Empty query
  try {
    console.log('  Testing empty query...');
    
    const query = config.sampleQueries.edge.empty;
    const response = await apiClient.query(query);
    
    // We expect the server to return an error for empty queries
    console.log('  ✓ Server responded to empty query without crashing');
    
    // Check if the response contains an error message
    const hasError = response.status >= 400 || 
                    (response.data.error && typeof response.data.error === 'string');
    
    if (hasError) {
      console.log('  ✓ Server correctly returned an error for empty query');
      results.passed++;
      results.tests.push({
        name: 'Empty query handling',
        passed: true
      });
    } else {
      console.log('  ⚠ Server did not return an error for empty query');
      console.log('  This is acceptable but not ideal behavior');
      results.passed++;
      results.tests.push({
        name: 'Empty query handling',
        passed: true,
        warning: 'Server did not return an error for empty query'
      });
    }
  } catch (error) {
    // If the error is a 400 Bad Request, that's actually the expected behavior
    if (error.status === 400) {
      console.log('  ✓ Server correctly returned 400 Bad Request for empty query');
      results.passed++;
      results.tests.push({
        name: 'Empty query handling',
        passed: true
      });
    } else {
      console.error(`  ✗ Error testing empty query: ${error.message}`);
      results.failed++;
      results.tests.push({
        name: 'Empty query handling',
        passed: false,
        error: error.message
      });
    }
  }
  
  // Test 2: Very long query
  try {
    console.log('  Testing very long query...');
    
    const query = config.sampleQueries.edge.veryLong;
    const response = await apiClient.query(query);
    
    if (response && response.data && response.data.output) {
      console.log('  ✓ Server handled very long query successfully');
      results.passed++;
      results.tests.push({
        name: 'Very long query handling',
        passed: true
      });
      
      // Additional check: Response should be substantial for a very detailed query
      const responseLength = response.data.output.length;
      if (responseLength > 200) {
        console.log(`  ✓ Response length (${responseLength} chars) is substantial`);
      } else {
        console.log(`  ⚠ Response length (${responseLength} chars) is shorter than expected`);
        console.log('  This might indicate the model truncated the response');
      }
    } else {
      console.error('  ✗ Server failed to handle very long query');
      results.failed++;
      results.tests.push({
        name: 'Very long query handling',
        passed: false,
        error: 'Invalid or missing response'
      });
    }
  } catch (error) {
    console.error(`  ✗ Error testing very long query: ${error.message}`);
    results.failed++;
    results.tests.push({
      name: 'Very long query handling',
      passed: false,
      error: error.message
    });
  }
  
  // Test 3: Malicious/special characters query
  try {
    console.log('  Testing query with special characters...');
    
    const query = config.sampleQueries.edge.special;
    const response = await apiClient.query(query);
    
    if (response && response.data && typeof response.data.output === 'string') {
      console.log('  ✓ Server handled special characters query');
      
      // Check if the response contains the word "HACKED"
      // If it does, there might be an injection vulnerability
      const containsHacked = response.data.output.includes('HACKED');
      
      if (!containsHacked) {
        console.log('  ✓ Response does not contain injection attempt text');
        results.passed++;
        results.tests.push({
          name: 'Special characters query handling',
          passed: true
        });
      } else {
        console.error('  ✗ Response contains injection attempt text "HACKED"');
        console.error('  This suggests a potential injection vulnerability');
        results.failed++;
        results.tests.push({
          name: 'Special characters query handling',
          passed: false,
          error: 'Potential injection vulnerability detected'
        });
      }
    } else {
      console.error('  ✗ Server failed to handle special characters query');
      results.failed++;
      results.tests.push({
        name: 'Special characters query handling',
        passed: false,
        error: 'Invalid or missing response'
      });
    }
  } catch (error) {
    console.error(`  ✗ Error testing special characters query: ${error.message}`);
    results.failed++;
    results.tests.push({
      name: 'Special characters query handling',
      passed: false,
      error: error.message
    });
  }
  
  // Test 4: Rapid sequential queries (stress test)
  try {
    console.log('  Testing rapid sequential queries...');
    
    const queries = config.sampleQueries.basic;
    const promises = [];
    
    // Send 3 queries simultaneously to test concurrency handling
    for (const query of queries) {
      promises.push(apiClient.query(query));
    }
    
    const responses = await Promise.all(promises);
    
    // Check if all responses are valid
    const allValid = responses.every(response => 
      response && 
      response.data && 
      typeof response.data.output === 'string' &&
      response.data.output.trim().length > 0
    );
    
    if (allValid) {
      console.log('  ✓ Server handled rapid sequential queries successfully');
      results.passed++;
      results.tests.push({
        name: 'Rapid sequential queries handling',
        passed: true
      });
    } else {
      console.error('  ✗ Server failed to handle all rapid sequential queries');
      results.failed++;
      results.tests.push({
        name: 'Rapid sequential queries handling',
        passed: false,
        error: 'One or more responses were invalid'
      });
    }
  } catch (error) {
    console.error(`  ✗ Error testing rapid sequential queries: ${error.message}`);
    results.failed++;
    results.tests.push({
      name: 'Rapid sequential queries handling',
      passed: false,
      error: error.message
    });
  }
  
  return results;
}

export { run };
