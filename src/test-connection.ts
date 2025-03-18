/**
 * Test script to verify connections to Pinecone and OpenAI
 * Run with: npm run ts-node src/test-connection.ts
 */

import dotenv from 'dotenv';
import { getPineconeClient } from './utils/pinecone.js';
import { getEnv } from './utils/util.js';
import { OpenAI } from 'langchain/llms/openai';

// Load environment variables
dotenv.config();

async function testConnections() {
  console.log('Testing connections to external services...');
  
  // Test OpenAI connection
  try {
    console.log('Testing OpenAI connection...');
    const openai = new OpenAI({
      openAIApiKey: getEnv('OPENAI_API_KEY'),
      temperature: 0,
    });
    
    const response = await openai.call('Hello, world!');
    console.log('✅ OpenAI connection successful');
    console.log(`Response: "${response.trim()}"`);
  } catch (error) {
    console.error('❌ OpenAI connection failed:', error.message);
  }
  
  // Test Pinecone connection
  try {
    console.log('\nTesting Pinecone connection...');
    const indexName = getEnv('PINECONE_INDEX');
    console.log(`Using Pinecone index: ${indexName}`);
    
    const pineconeClient = await getPineconeClient();
    const indexes = await pineconeClient.listIndexes() as any;
    
    console.log('✅ Pinecone connection successful');
    // Handle potential array format variations
    const indexList = Array.isArray(indexes) 
      ? indexes 
      : (indexes.indexes || []);
    console.log(`Available indexes: ${indexList.map(idx => idx.name || idx).join(', ') || 'None'}`);
    
    // Test specific index
    try {
      const index = pineconeClient.Index(indexName) as any;
      const stats = await index.describeIndexStats();
      console.log(`Index ${indexName} stats:`, stats);
    } catch (e) {
      console.error(`❌ Could not access index ${indexName}:`, e.message);
    }
  } catch (error) {
    console.error('❌ Pinecone connection failed:', error.message);
  }
}

// Run the tests
testConnections().catch(console.error);
