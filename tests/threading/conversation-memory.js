/**
 * Tests for conversation memory and threading capabilities
 * Tests if the agent can maintain context across multiple questions
 */

import apiClient from '../utils/api-client.js';
import config from '../utils/test-config.js';

/**
 * Run the tests
 * @returns {Object} Test results
 */
async function run() {
  console.log('Running conversation memory tests...');
  
  const results = {
    passed: 0,
    failed: 0,
    skipped: 0,
    tests: []
  };
  
  // Test 1: Basic follow-up question handling
  try {
    console.log('  Testing basic follow-up question handling...');
    
    // First question about Notre Dame
    const initialQuery = config.sampleQueries.followUp[0]; // "What is the University of Notre Dame known for?"
    const followUpQuery = config.sampleQueries.followUp[1]; // "When was it established?"
    
    console.log(`  Initial query: "${initialQuery}"`);
    const initialResponse = await apiClient.query(initialQuery);
    
    if (!initialResponse || !initialResponse.data || !initialResponse.data.output) {
      throw new Error('Invalid or missing initial response');
    }
    
    console.log(`  Initial response received (${initialResponse.data.output.length} chars)`);
    console.log(`  Follow-up query: "${followUpQuery}"`);
    
    // Now send the follow-up question
    // The current implementation doesn't support conversation context by default
    // But we'll test it to document this limitation and provide a path forward
    const followUpResponse = await apiClient.query(followUpQuery);
    
    if (!followUpResponse || !followUpResponse.data || !followUpResponse.data.output) {
      throw new Error('Invalid or missing follow-up response');
    }
    
    console.log(`  Follow-up response received (${followUpResponse.data.output.length} chars)`);
    
    // Check if the follow-up response contains words like "established", "founded", or "year" 
    // which would indicate it's answering the question about when Notre Dame was established
    const relevantWords = ['established', 'founded', 'year', 'creation', 'inception', 'began'];
    const containsRelevantWords = relevantWords.some(word => 
      followUpResponse.data.output.toLowerCase().includes(word)
    );
    
    // Note: We expect this test to probably fail with the current implementation
    // since there's no conversation memory, but we document this limitation
    if (containsRelevantWords) {
      console.log('  ✓ Follow-up response appears to maintain context from initial query');
      results.passed++;
      results.tests.push({
        name: 'Basic follow-up question handling',
        passed: true
      });
    } else {
      console.log('  ⚠ Follow-up response does not appear to maintain context from initial query');
      console.log('  This is expected behavior with the current implementation, which lacks conversation memory');
      console.log('  Marking as failed, but this highlights an area for improvement');
      
      results.failed++;
      results.tests.push({
        name: 'Basic follow-up question handling',
        passed: false,
        error: 'No conversation context maintained between queries'
      });
    }
  } catch (error) {
    console.error(`  ✗ Error testing follow-up question handling: ${error.message}`);
    results.failed++;
    results.tests.push({
      name: 'Basic follow-up question handling',
      passed: false,
      error: error.message
    });
  }
  
  // Test 2: Pronouns in follow-up questions
  try {
    console.log('  Testing pronoun resolution in follow-up questions...');
    
    // First question about Notre Dame colleges
    const initialQuery = "Tell me about the colleges at the University of Notre Dame";
    const followUpQuery = "How many students are in them?";
    
    console.log(`  Initial query: "${initialQuery}"`);
    const initialResponse = await apiClient.query(initialQuery);
    
    if (!initialResponse || !initialResponse.data || !initialResponse.data.output) {
      throw new Error('Invalid or missing initial response');
    }
    
    console.log(`  Initial response received (${initialResponse.data.output.length} chars)`);
    console.log(`  Follow-up query with pronoun: "${followUpQuery}"`);
    
    // Now send the follow-up question with a pronoun "them" referring to the colleges
    const followUpResponse = await apiClient.query(followUpQuery);
    
    if (!followUpResponse || !followUpResponse.data || !followUpResponse.data.output) {
      throw new Error('Invalid or missing follow-up response');
    }
    
    console.log(`  Follow-up response received (${followUpResponse.data.output.length} chars)`);
    
    // Check if the follow-up response contains words that would indicate it understood
    // "them" refers to "colleges" from the previous query
    const relevantWords = ['college', 'colleges', 'students', 'enrollment', 'attend', 'undergraduate', 'graduate'];
    const containsRelevantWords = relevantWords.some(word => 
      followUpResponse.data.output.toLowerCase().includes(word)
    );
    
    // Note: We expect this test to probably fail with the current implementation
    if (containsRelevantWords) {
      console.log('  ✓ Follow-up response appears to resolve pronouns correctly');
      results.passed++;
      results.tests.push({
        name: 'Pronoun resolution in follow-up questions',
        passed: true
      });
    } else {
      console.log('  ⚠ Follow-up response does not appear to resolve pronouns correctly');
      console.log('  This is expected behavior with the current implementation, which lacks conversation memory');
      
      results.failed++;
      results.tests.push({
        name: 'Pronoun resolution in follow-up questions',
        passed: false,
        error: 'No pronoun resolution between queries'
      });
    }
  } catch (error) {
    console.error(`  ✗ Error testing pronoun resolution: ${error.message}`);
    results.failed++;
    results.tests.push({
      name: 'Pronoun resolution in follow-up questions',
      passed: false,
      error: error.message
    });
  }
  
  // Test 3: Document how to implement conversation memory
  try {
    console.log('  Documenting conversation memory implementation options...');
    
    // This isn't really a test, but provides documentation on how to add conversation memory
    console.log('  Options for implementing conversation memory:');
    console.log('  1. Use LangChain ConversationChain instead of a simple VectorDBQAChain');
    console.log('  2. Maintain conversation history on the client side and send it with each request');
    console.log('  3. Store conversation history in a database indexed by user/session ID');
    console.log('  4. Modify the API to accept an optional conversationId parameter');
    console.log('\n  Example implementation with ConversationChain:');
    console.log(`
    // In server.ts:
    import { ConversationChain } from "langchain/chains";
    import { BufferMemory } from "langchain/memory";
    
    // Create a memory instance to store conversation history
    const memory = new BufferMemory();
    
    // Create a conversation chain with the memory
    const conversationChain = new ConversationChain({
      llm: model,
      memory: memory
    });
    
    // In the API endpoint:
    app.post('/api/query', async (req, res) => {
      try {
        const { input, conversationId } = req.body;
        
        // Use the conversation chain to get a response that maintains context
        const result = await conversationChain.call({ input });
        
        return res.json({
          output: result.response,
          processed_at: new Date().toISOString(),
          trace_id: uuidv4()
        });
      } catch (error) {
        // Error handling
      }
    });
    `);
    
    results.passed++;
    results.tests.push({
      name: 'Conversation memory implementation documentation',
      passed: true
    });
  } catch (error) {
    console.error(`  ✗ Error in conversation memory documentation: ${error.message}`);
    results.failed++;
    results.tests.push({
      name: 'Conversation memory implementation documentation',
      passed: false,
      error: error.message
    });
  }
  
  return results;
}

export { run };
