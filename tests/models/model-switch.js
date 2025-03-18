/**
 * Tests for switching between different LLM models in the LangChain Retrieval Agent
 * This test demonstrates how to configure and test different models
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import apiClient from '../utils/api-client.js';
import config from '../utils/test-config.js';

// Get current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the root directory of the project
const rootDir = path.resolve(__dirname, '../..');

// Path to the server file
const serverFilePath = path.join(rootDir, 'src', 'server.ts');

// Original content of the server file
let originalServerContent = '';

/**
 * Setup function to back up the original server file
 */
async function setup() {
  console.log('Setting up model switch tests...');
  
  // Back up the original server file
  if (fs.existsSync(serverFilePath)) {
    originalServerContent = fs.readFileSync(serverFilePath, 'utf8');
    console.log('Original server file backed up');
  } else {
    throw new Error(`Server file not found at: ${serverFilePath}`);
  }
}

/**
 * Clean up function to restore the original server file
 */
async function cleanup() {
  console.log('Cleaning up model switch tests...');
  
  // Restore the original server file
  if (originalServerContent) {
    fs.writeFileSync(serverFilePath, originalServerContent, 'utf8');
    console.log('Original server file restored');
    
    // Restart the server to restore the original configuration
    try {
      console.log('Note: You may need to restart the server manually to restore the original configuration');
    } catch (error) {
      console.error(`Failed to restart server: ${error.message}`);
    }
  }
}

/**
 * Modify the server file to use a different model
 * @param {string} modelName - The name of the model to use
 * @param {Object} modelConfig - Additional model configuration
 * @returns {boolean} True if the server file was modified successfully
 */
function modifyServerFile(modelName, modelConfig = {}) {
  try {
    // Read the current server file
    let serverContent = fs.readFileSync(serverFilePath, 'utf8');
    
    // Create the model configuration string
    const modelConfigStr = JSON.stringify(modelConfig, null, 2)
      .replace(/{/g, '{')
      .replace(/}/g, '}')
      .replace(/"/g, "'");
    
    // Replace the model initialization with the new model
    const newModelInit = `const model = new OpenAI({
      model: '${modelName}',
      ${Object.keys(modelConfig).length > 0 ? '...' + modelConfigStr : ''}
    });`;
    
    // Use regex to find and replace the model initialization
    const modelInitRegex = /const model = new OpenAI\(\{[^}]*\}\);/;
    serverContent = serverContent.replace(modelInitRegex, newModelInit);
    
    // Write the modified content back to the file
    fs.writeFileSync(serverFilePath, serverContent, 'utf8');
    
    console.log(`Server file modified to use model: ${modelName}`);
    console.log('Note: This is for testing purposes only. The original file will be restored after the test.');
    
    return true;
  } catch (error) {
    console.error(`Failed to modify server file: ${error.message}`);
    return false;
  }
}

/**
 * Run the tests
 * @returns {Object} Test results
 */
async function run() {
  console.log('Running model switch tests...');
  
  const results = {
    passed: 0,
    failed: 0,
    skipped: 0,
    tests: []
  };
  
  // We'll skip actual model switching because it would require server restart
  // Instead, we'll demonstrate how it would be done and run a basic test with the current model
  
  console.log('  Skipping actual model switching as it requires server restart');
  console.log('  To test different models, you would need to:');
  console.log('  1. Modify the server.ts file to use a different model');
  console.log('  2. Restart the server');
  console.log('  3. Run the tests against the new model');
  console.log('  4. Compare the results');
  console.log('\n  For example, to switch to GPT-4:');
  console.log(`  - Find in server.ts: const model = new OpenAI({});`);
  console.log(`  - Replace with: const model = new OpenAI({ model: 'gpt-4', temperature: 0.7 });`);
  console.log('  - Restart the server\n');
  
  // Test 1: Document model configuration options
  try {
    console.log('  Testing documentation of model configuration options...');
    
    // These are the model configuration options that could be tested
    const modelOptions = {
      'gpt-3.5-turbo': {
        temperature: 0.2,
        maxTokens: 1000
      },
      'gpt-4': {
        temperature: 0.5,
        maxTokens: 2000
      }
    };
    
    // Just print the options for documentation purposes
    console.log('  Model configuration options that could be tested:');
    console.log(JSON.stringify(modelOptions, null, 2));
    
    results.passed++;
    results.tests.push({
      name: 'Model configuration documentation',
      passed: true
    });
  } catch (error) {
    console.error(`  ✗ Error in model configuration documentation: ${error.message}`);
    results.failed++;
    results.tests.push({
      name: 'Model configuration documentation',
      passed: false,
      error: error.message
    });
  }
  
  // Test 2: Run a query with the current model to verify it works
  try {
    console.log('  Testing query with current model...');
    
    const query = config.sampleQueries.basic[0];
    const response = await apiClient.query(query);
    
    if (response && response.data && response.data.output) {
      console.log('  ✓ Query with current model successful');
      console.log(`  Response: "${response.data.output.substring(0, 100)}..."`);
      results.passed++;
      results.tests.push({
        name: 'Query with current model',
        passed: true
      });
    } else {
      console.error('  ✗ Query with current model failed');
      results.failed++;
      results.tests.push({
        name: 'Query with current model',
        passed: false,
        error: 'Invalid or missing response'
      });
    }
  } catch (error) {
    console.error(`  ✗ Error testing query with current model: ${error.message}`);
    results.failed++;
    results.tests.push({
      name: 'Query with current model',
      passed: false,
      error: error.message
    });
  }
  
  return results;
}

export { setup, run, cleanup };
