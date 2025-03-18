import express from 'express';
import { OpenAI } from "langchain/llms/openai";
import { VectorDBQAChain } from "langchain/chains";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { ChainTool } from "langchain/tools";
import { getPineconeClient } from "./utils/pinecone.js";
import { getEnv } from "./utils/util.js";
import { TransformersJSEmbedding } from "./embeddings.js";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { AgentExecutor } from "langchain/agents";
import { getPostgresLogger } from './utils/postgres-logger.js';
import { Crawl4aiTool } from './utils/crawl4ai-tool.js';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const port = process.env.PORT || 8000;
const logger = getPostgresLogger();

// Enable JSON body parsing
app.use(express.json());

// Health check endpoint
app.get('/health', (req: express.Request, res: express.Response) => {
  res.status(200).json({ status: 'ok' });
});

// Initialize agent function
async function initializeAgent(): Promise<AgentExecutor> {
  try {
    console.log("Initializing agent...");
    await logger.info("Initializing retrieval agent");
    
    const indexName = getEnv("PINECONE_INDEX");
    console.log(`Using Pinecone index: ${indexName}`);
    await logger.info(`Using Pinecone index: ${indexName}`);
    
    const pineconeClient = await getPineconeClient();
    const pineconeIndex = pineconeClient.Index(indexName) as any;
    
    const vectorStore = await PineconeStore.fromExistingIndex(
      new TransformersJSEmbedding({
        modelName: "Xenova/all-MiniLM-L6-v2"
      }),
      { pineconeIndex, namespace: "default", textKey: "context" },
    );
    
    const model = new OpenAI({});
    
    const chain = VectorDBQAChain.fromLLM(model, vectorStore);
    
    const kbTool = new ChainTool({
      name: "Knowledge Base",
      description:
        "use this tool when answering general knowledge queries to get more information from your knowledge base",
      chain,
    });
    
    const crawlerTool = new Crawl4aiTool();
    
    const executor = await initializeAgentExecutorWithOptions([kbTool, crawlerTool], model, {
      agentType: "zero-shot-react-description",
      verbose: true,
    });
    
    console.log("Agent initialized successfully");
    await logger.info("Agent initialized successfully");
    return executor;
  } catch (error) {
    console.error("Error initializing agent:", error);
    await logger.error("Failed to initialize agent", { error: error.message });
    throw error;
  }
}

// Create a global executor that will be initialized when the server starts
let executor: AgentExecutor | null = null;

// Query endpoint
app.post('/api/query', async (req: express.Request, res: express.Response) => {
  const traceId = uuidv4();
  
  try {
    // Ensure agent is initialized
    if (!executor) {
      await logger.warn("Agent not initialized yet", { traceId });
      return res.status(503).json({ error: 'Agent not initialized yet. Please try again later.' });
    }

    const { input } = req.body;
    
    if (!input) {
      await logger.warn("Missing input in request", { traceId });
      return res.status(400).json({ error: 'Input is required' });
    }
    
    console.log(`Processing query: "${input}"`);
    await logger.info(`Processing query`, { input, traceId });
    
    const result = await executor.call({ input });
    
    console.log(`Response: "${result.output}"`);
    await logger.info(`Query processed successfully`, { traceId });
    
    return res.json({ 
      output: result.output,
      processed_at: new Date().toISOString(),
      trace_id: traceId
    });
  } catch (error: any) {
    console.error('Error processing query:', error);
    await logger.error(`Error processing query`, { error: error.message, traceId });
    return res.status(500).json({ 
      error: 'Error processing query', 
      details: error.message,
      trace_id: traceId
    });
  }
});

// Initialize the agent and start the server
async function startServer() {
  try {
    // Connect to PostgreSQL
    await logger.connect();
    await logger.info("Starting server");

    executor = await initializeAgent();
    
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
      console.log('Available endpoints:');
      console.log('  GET  /health - Health check');
      console.log('  POST /api/query - Submit a query to the agent');
      logger.info(`Server running at http://localhost:${port}`);
    });
  } catch (error: any) {
    console.error('Failed to initialize agent:', error);
    await logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
}

// Handle shutdown gracefully
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await logger.info('SIGTERM received, shutting down gracefully');
  await logger.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await logger.info('SIGINT received, shutting down gracefully');
  await logger.close();
  process.exit(0);
});

// Start the server
startServer();
