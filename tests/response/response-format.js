/**
 * Tests the format and structure of responses from the LangChain Retrieval Agent
 */

import apiClient from '../utils/api-client.js';
import config from '../utils/test-config.js';

/**
 * Check if the response has the expected structure
 * @param {Object} response - API response object
 * @returns {boolean} True if the response has the expected structure
 */
function hasValidStructure(response) {
  return (
    response &&
    response.data &&
    typeof response.data.output === 'string' &&
    typeof response.data.processed_at === 'string' &&
    typeof response.data.trace_id === 'string'
  );
}

/**
 * Run the tests
 * @returns {Object} Test results
 */
async function run() {
  console.log('Running response format tests...');
  
  const results = {
    passed: 0,
    failed: 0,
    skipped: 0,
    tests: []
  };
  
  // Test 1: Basic query response format
  try {
    console.log('  Testing basic query response format...');
    
    const query = config.sampleQueries.basic[0];
    const response = await apiClient.query(query);
    
    const hasValidFormat = hasValidStructure(response);
    
    if (hasValidFormat) {
      console.log('  ✓ Basic query response format is valid');
      results.passed++;
      results.tests.push({
        name: 'Basic query response format',
        passed: true
      });
    } else {
      console.error('  ✗ Basic query response format is invalid');
      console.error(`  Expected structure with output, processed_at, and trace_id but got: ${JSON.stringify(response.data, null, 2)}`);
      results.failed++;
      results.tests.push({
        name: 'Basic query response format',
        passed: false,
        error: 'Invalid response structure'
      });
    }
  } catch (error) {
    console.error(`  ✗ Error testing basic query response format: ${error.message}`);
    results.failed++;
    results.tests.push({
      name: 'Basic query response format',
      passed: false,
      error: error.message
    });
  }
  
  // Test 2: Complex query response format
  try {
    console.log('  Testing complex query response format...');
    
    const query = config.sampleQueries.complex[0];
    const response = await apiClient.query(query);
    
    const hasValidFormat = hasValidStructure(response);
    
    if (hasValidFormat) {
      console.log('  ✓ Complex query response format is valid');
      results.passed++;
      results.tests.push({
        name: 'Complex query response format',
        passed: true
      });
    } else {
      console.error('  ✗ Complex query response format is invalid');
      console.error(`  Expected structure with output, processed_at, and trace_id but got: ${JSON.stringify(response.data, null, 2)}`);
      results.failed++;
      results.tests.push({
        name: 'Complex query response format',
        passed: false,
        error: 'Invalid response structure'
      });
    }
  } catch (error) {
    console.error(`  ✗ Error testing complex query response format: ${error.message}`);
    results.failed++;
    results.tests.push({
      name: 'Complex query response format',
      passed: false,
      error: error.message
    });
  }
  
  // Test 3: Response content type
  try {
    console.log('  Testing response content type...');
    
    const query = config.sampleQueries.basic[1];
    const response = await apiClient.query(query);
    
    const isString = typeof response.data.output === 'string';
    const isNonEmpty = response.data.output.trim().length > 0;
    
    if (isString && isNonEmpty) {
      console.log('  ✓ Response output is a non-empty string');
      results.passed++;
      results.tests.push({
        name: 'Response output content type',
        passed: true
      });
    } else {
      console.error('  ✗ Response output is not a non-empty string');
      console.error(`  Output: ${JSON.stringify(response.data.output)}`);
      results.failed++;
      results.tests.push({
        name: 'Response output content type',
        passed: false,
        error: 'Output is not a non-empty string'
      });
    }
  } catch (error) {
    console.error(`  ✗ Error testing response content type: ${error.message}`);
    results.failed++;
    results.tests.push({
      name: 'Response output content type',
      passed: false,
      error: error.message
    });
  }
  
  // Test 4: Response timestamp format
  try {
    console.log('  Testing response timestamp format...');
    
    const query = config.sampleQueries.basic[2];
    const response = await apiClient.query(query);
    
    // Check if processed_at is a valid ISO datetime string
    const timestamp = response.data.processed_at;
    const isValidDate = !isNaN(Date.parse(timestamp));
    
    if (isValidDate) {
      console.log('  ✓ Response timestamp is a valid ISO datetime string');
      results.passed++;
      results.tests.push({
        name: 'Response timestamp format',
        passed: true
      });
    } else {
      console.error('  ✗ Response timestamp is not a valid ISO datetime string');
      console.error(`  Timestamp: ${timestamp}`);
      results.failed++;
      results.tests.push({
        name: 'Response timestamp format',
        passed: false,
        error: 'Invalid timestamp format'
      });
    }
  } catch (error) {
    console.error(`  ✗ Error testing response timestamp format: ${error.message}`);
    results.failed++;
    results.tests.push({
      name: 'Response timestamp format',
      passed: false,
      error: error.message
    });
  }
  
  // Test 5: Response trace ID format
  try {
    console.log('  Testing response trace ID format...');
    
    const query = config.sampleQueries.basic[0];
    const response = await apiClient.query(query);
    
    // Check if trace_id is a valid UUID
    const traceId = response.data.trace_id;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isValidUuid = uuidRegex.test(traceId);
    
    if (isValidUuid) {
      console.log('  ✓ Response trace ID is a valid UUID');
      results.passed++;
      results.tests.push({
        name: 'Response trace ID format',
        passed: true
      });
    } else {
      console.error('  ✗ Response trace ID is not a valid UUID');
      console.error(`  Trace ID: ${traceId}`);
      results.failed++;
      results.tests.push({
        name: 'Response trace ID format',
        passed: false,
        error: 'Invalid trace ID format'
      });
    }
  } catch (error) {
    console.error(`  ✗ Error testing response trace ID format: ${error.message}`);
    results.failed++;
    results.tests.push({
      name: 'Response trace ID format',
      passed: false,
      error: error.message
    });
  }
  
  return results;
}

export { run };
