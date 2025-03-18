/**
 * Tests for advanced prompt chaining patterns in LangChain
 * Demonstrates how to implement and test different types of chains for complex tasks
 */

import apiClient from '../utils/api-client.js';
import config from '../utils/test-config.js';

/**
 * Run the tests
 * @returns {Object} Test results
 */
async function run() {
  console.log('Running prompt chaining pattern tests...');
  
  const results = {
    passed: 0,
    failed: 0,
    skipped: 0,
    tests: []
  };
  
  // These tests are primarily instructional, demonstrating how to implement
  // different prompt chaining patterns rather than testing their actual implementation
  
  // Test 1: Document sequential chains
  try {
    console.log('  Documenting sequential chain patterns...');
    
    const sequentialChainDoc = `
    // SEQUENTIAL CHAIN PATTERNS
    
    // Sequential chains pass the output of one model as input to another model
    // They're useful for breaking complex tasks into smaller, more manageable steps
    
    // Example 1: Basic Sequential Chain
    // This example demonstrates a two-step process:
    // 1. Extract relevant entities from a query
    // 2. Generate a response based on those entities
    
    import { OpenAI } from "langchain/llms/openai";
    import { PromptTemplate } from "langchain/prompts";
    import { SequentialChain, LLMChain } from "langchain/chains";
    
    // Create the model
    const model = new OpenAI({ temperature: 0 });
    
    // Create the extraction prompt
    const extractionPrompt = new PromptTemplate({
      template: "Extract the main entities from this query: {query}\\n\\nEntities:",
      inputVariables: ["query"]
    });
    
    // Create the response prompt
    const responsePrompt = new PromptTemplate({
      template: "Provide information about the University of Notre Dame related to: {entities}\\n\\nResponse:",
      inputVariables: ["entities"]
    });
    
    // Create the extraction chain
    const extractionChain = new LLMChain({
      llm: model,
      prompt: extractionPrompt,
      outputKey: "entities" // This output will be passed as input to the next chain
    });
    
    // Create the response chain
    const responseChain = new LLMChain({
      llm: model,
      prompt: responsePrompt,
      outputKey: "response"
    });
    
    // Combine the chains
    const sequentialChain = new SequentialChain({
      chains: [extractionChain, responseChain],
      inputVariables: ["query"],
      outputVariables: ["entities", "response"]
    });
    
    // Use the chain
    const result = await sequentialChain.call({
      query: "Tell me about the engineering programs and research at Notre Dame"
    });
    
    console.log(result);
    // Example output:
    // {
    //   query: "Tell me about the engineering programs and research at Notre Dame",
    //   entities: "engineering programs, research, Notre Dame",
    //   response: "The University of Notre Dame offers several engineering programs..."
    // }
    
    // Example 2: Refinement Chain
    // This pattern takes an initial response and refines it through additional steps
    
    // Create refinement prompt
    const refinementPrompt = new PromptTemplate({
      template: "Refine the following response to make it more concise and focused on the most important information:\\n\\nOriginal response: {response}\\n\\nRefined response:",
      inputVariables: ["response"]
    });
    
    // Create the refinement chain
    const refinementChain = new LLMChain({
      llm: model,
      prompt: refinementPrompt,
      outputKey: "refined_response"
    });
    
    // Create a new sequential chain that includes refinement
    const refinedSequentialChain = new SequentialChain({
      chains: [extractionChain, responseChain, refinementChain],
      inputVariables: ["query"],
      outputVariables: ["entities", "response", "refined_response"]
    });
    `;
    
    console.log('  Sequential chain patterns documented');
    
    results.passed++;
    results.tests.push({
      name: 'Sequential chain patterns documentation',
      passed: true
    });
  } catch (error) {
    console.error(`  ✗ Error in sequential chain documentation: ${error.message}`);
    results.failed++;
    results.tests.push({
      name: 'Sequential chain patterns documentation',
      passed: false,
      error: error.message
    });
  }
  
  // Test 2: Document router chains
  try {
    console.log('  Documenting router chain patterns...');
    
    const routerChainDoc = `
    // ROUTER CHAIN PATTERNS
    
    // Router chains direct inputs to specialized chains based on the input content
    // They're useful for handling different types of queries that require different approaches
    
    import { OpenAI } from "langchain/llms/openai";
    import { PromptTemplate } from "langchain/prompts";
    import { LLMChain, RouterChain } from "langchain/chains";
    
    // Create the model
    const model = new OpenAI({ temperature: 0 });
    
    // Create a router prompt that decides which chain to use
    const routerPrompt = new PromptTemplate({
      template: "Given the following query, select the most appropriate category from: 'academics', 'history', 'athletics', 'campus'.\\n\\nQuery: {query}\\n\\nCategory:",
      inputVariables: ["query"]
    });
    
    // Create the router chain
    const routerChain = new LLMChain({
      llm: model,
      prompt: routerPrompt,
      outputKey: "category"
    });
    
    // Create specialized prompts for each category
    const academicsPrompt = new PromptTemplate({
      template: "Provide information about the academic programs at the University of Notre Dame, focusing on: {query}\\n\\nResponse:",
      inputVariables: ["query"]
    });
    
    const historyPrompt = new PromptTemplate({
      template: "Provide historical information about the University of Notre Dame, focusing on: {query}\\n\\nResponse:",
      inputVariables: ["query"]
    });
    
    const athleticsPrompt = new PromptTemplate({
      template: "Provide information about athletics at the University of Notre Dame, focusing on: {query}\\n\\nResponse:",
      inputVariables: ["query"]
    });
    
    const campusPrompt = new PromptTemplate({
      template: "Provide information about the campus of the University of Notre Dame, focusing on: {query}\\n\\nResponse:",
      inputVariables: ["query"]
    });
    
    // Create specialized chains for each category
    const academicsChain = new LLMChain({
      llm: model,
      prompt: academicsPrompt,
      outputKey: "response"
    });
    
    const historyChain = new LLMChain({
      llm: model,
      prompt: historyPrompt,
      outputKey: "response"
    });
    
    const athleticsChain = new LLMChain({
      llm: model,
      prompt: athleticsPrompt,
      outputKey: "response"
    });
    
    const campusChain = new LLMChain({
      llm: model,
      prompt: campusPrompt,
      outputKey: "response"
    });
    
    // Create a mapping of categories to chains
    const destinationChains = {
      academics: academicsChain,
      history: historyChain,
      athletics: athleticsChain,
      campus: campusChain
    };
    
    // Create a default chain for queries that don't fit into any category
    const defaultChain = new LLMChain({
      llm: model,
      prompt: new PromptTemplate({
        template: "Provide general information about the University of Notre Dame in response to: {query}\\n\\nResponse:",
        inputVariables: ["query"]
      }),
      outputKey: "response"
    });
    
    // Create the full router chain
    import { MultiRouteChain } from "langchain/chains";
    
    const fullRouterChain = MultiRouteChain.fromLLMAndPrompts({
      llm: model,
      routerPrompt,
      destinations: destinationChains,
      defaultChain,
      routerOutputKey: "category"
    });
    
    // Use the router chain
    const result = await fullRouterChain.call({
      query: "Tell me about the football tradition at Notre Dame"
    });
    
    console.log(result);
    // Example output might select 'athletics' category and route to that specialized chain
    `;
    
    console.log('  Router chain patterns documented');
    
    results.passed++;
    results.tests.push({
      name: 'Router chain patterns documentation',
      passed: true
    });
  } catch (error) {
    console.error(`  ✗ Error in router chain documentation: ${error.message}`);
    results.failed++;
    results.tests.push({
      name: 'Router chain patterns documentation',
      passed: false,
      error: error.message
    });
  }
  
  // Test 3: Document map-reduce chains
  try {
    console.log('  Documenting map-reduce chain patterns...');
    
    const mapReduceChainDoc = `
    // MAP-REDUCE CHAIN PATTERNS
    
    // Map-reduce chains process multiple inputs in parallel and then combine the results
    // They're useful for tasks that involve analyzing or processing multiple pieces of information
    
    import { OpenAI } from "langchain/llms/openai";
    import { PromptTemplate } from "langchain/prompts";
    import { LLMChain } from "langchain/chains";
    
    // Create the model
    const model = new OpenAI({ temperature: 0 });
    
    // EXAMPLE: Analyzing multiple documents about Notre Dame
    
    // Sample documents
    const documents = [
      "The University of Notre Dame was founded in 1842 by Edward Sorin, a priest of the Congregation of Holy Cross.",
      "Notre Dame's College of Engineering was established in 1920, though early courses in civil and mechanical engineering were part of the College of Science since the 1870s.",
      "The Notre Dame football team has won 11 national championships and is known for its iconic golden helmets.",
      "Notre Dame's campus is known for landmarks such as the Golden Dome, the Basilica of the Sacred Heart, and the Grotto of Our Lady of Lourdes."
    ];
    
    // Create a map prompt to analyze each document
    const mapPrompt = new PromptTemplate({
      template: "Extract the key facts from this document about Notre Dame:\\n\\nDocument: {document}\\n\\nKey facts:",
      inputVariables: ["document"]
    });
    
    // Create a reduce prompt to combine the extracted facts
    const reducePrompt = new PromptTemplate({
      template: "Combine these extracted facts about Notre Dame into a coherent summary:\\n\\nFacts:\\n{facts}\\n\\nSummary:",
      inputVariables: ["facts"]
    });
    
    // Create the map chain
    const mapChain = new LLMChain({
      llm: model,
      prompt: mapPrompt
    });
    
    // Create the reduce chain
    const reduceChain = new LLMChain({
      llm: model,
      prompt: reducePrompt
    });
    
    // Implement the map-reduce pattern
    async function mapReduceChain(documents) {
      // Map: Process each document in parallel
      const mapResults = await Promise.all(
        documents.map(doc => mapChain.call({ document: doc }))
      );
      
      // Extract the results
      const extractedFacts = mapResults
        .map(result => result.text)
        .join("\\n\\n");
      
      // Reduce: Combine the results
      const reducedResult = await reduceChain.call({ facts: extractedFacts });
      
      return reducedResult.text;
    }
    
    // Use the map-reduce chain
    const result = await mapReduceChain(documents);
    
    console.log(result);
    // Example output:
    // "The University of Notre Dame, founded in 1842 by Edward Sorin of the Congregation of Holy Cross, is known for its strong academic programs, including its College of Engineering established in 1920..."
    
    // ALTERNATIVE: Using LangChain's built-in MapReduceDocumentsChain
    import { MapReduceDocumentsChain, StuffDocumentsChain } from "langchain/chains";
    import { Document } from "langchain/document";
    
    // Convert texts to Document objects
    const docs = documents.map(
      text => new Document({ pageContent: text })
    );
    
    // Create the map-reduce chain
    const mapReduceChain = new MapReduceDocumentsChain({
      llmChain: mapChain,
      combineDocumentsChain: new StuffDocumentsChain({
        llmChain: reduceChain
      }),
      documentVariableName: "document",
      returnIntermediateSteps: true
    });
    
    // Use the chain
    const result = await mapReduceChain.call({
      input_documents: docs
    });
    `;
    
    console.log('  Map-reduce chain patterns documented');
    
    results.passed++;
    results.tests.push({
      name: 'Map-reduce chain patterns documentation',
      passed: true
    });
  } catch (error) {
    console.error(`  ✗ Error in map-reduce chain documentation: ${error.message}`);
    results.failed++;
    results.tests.push({
      name: 'Map-reduce chain patterns documentation',
      passed: false,
      error: error.message
    });
  }
  
  // Test 4: Run a basic query with the current model to ensure it still works
  try {
    console.log('  Testing basic query with current implementation...');
    
    const query = config.sampleQueries.basic[0];
    const response = await apiClient.query(query);
    
    if (response && response.data && response.data.output) {
      console.log('  ✓ Basic query successful');
      console.log(`  Response: "${response.data.output.substring(0, 100)}..."`);
      results.passed++;
      results.tests.push({
        name: 'Basic query with current implementation',
        passed: true
      });
    } else {
      console.error('  ✗ Basic query failed');
      results.failed++;
      results.tests.push({
        name: 'Basic query with current implementation',
        passed: false,
        error: 'Invalid or missing response'
      });
    }
  } catch (error) {
    console.error(`  ✗ Error testing basic query: ${error.message}`);
    results.failed++;
    results.tests.push({
      name: 'Basic query with current implementation',
      passed: false,
      error: error.message
    });
  }
  
  // Test 5: Document implementing ReAct pattern
  try {
    console.log('  Documenting ReAct pattern implementation...');
    
    const reactPatternDoc = `
    // REACT PATTERN IMPLEMENTATION
    
    // The ReAct pattern (Reasoning + Acting) combines reasoning steps with action steps
    // It's particularly useful for agents that need to reason about information and take actions
    
    // The LangChain agent you're already using implements a form of the ReAct pattern
    // with its "zero-shot-react-description" agent type
    
    // Here's a breakdown of how it works:
    
    // 1. The agent receives a query
    // 2. It REASONS about what tool(s) to use (Knowledge Base, web search, etc.)
    // 3. It ACTS by calling the selected tool
    // 4. It observes the result of the action
    // 5. It REASONS again based on the new information
    // 6. It may ACT again with a different tool, or provide a final answer
    
    // Example of the thought process:
    /*
    Query: When was the College of Engineering at Notre Dame established and how has it evolved?
    
    Thought: I need to find information about the College of Engineering at Notre Dame.
    I should use the Knowledge Base tool to search for this information.
    
    Action: Knowledge Base
    Action Input: College of Engineering University of Notre Dame history establishment
    
    Observation: The College of Engineering was established in 1920, however, early courses in civil and mechanical engineering were a part of the College of Science since the 1870s. Today the college, housed in the Fitzpatrick, Cushing, and Stinson-Remick Halls of Engineering, includes five departments of study...
    
    Thought: Now I have information about when the College of Engineering was established and some information about its current state. I should use this to formulate a complete answer.
    
    Final Answer: The College of Engineering at the University of Notre Dame was formally established in 1920, although engineering courses (civil and mechanical) were already being taught as part of the College of Science since the 1870s. Over time, the college has evolved to include five departments: aerospace and mechanical engineering, chemical and biomolecular engineering, civil engineering and geological sciences, computer science and engineering, and electrical engineering. Currently, the college is housed in the Fitzpatrick, Cushing, and Stinson-Remick Halls of Engineering.
    */
    
    // To enhance this pattern in your agent, you could:
    
    // 1. Add more specialized tools for different types of queries
    // 2. Implement a more sophisticated routing mechanism to select the best tool
    // 3. Add a reflection step where the agent evaluates the quality of its answer
    // 4. Implement a multi-step reasoning process for complex queries
    
    // Example of implementing a new tool for the agent:
    
    import { Tool } from "langchain/tools";
    
    class NotreDameHistoryTool extends Tool {
      name = "Notre Dame History";
      description = "Useful for answering questions about the history of the University of Notre Dame";
      
      async _call(query) {
        // This could call a specialized database or API for historical information
        return "The University of Notre Dame was founded in 1842 by Father Edward Sorin...";
      }
    }
    
    // Then add this tool to your agent:
    
    const historyTool = new NotreDameHistoryTool();
    
    const executor = await initializeAgentExecutorWithOptions(
      [kbTool, crawlerTool, historyTool],
      model,
      {
        agentType: "zero-shot-react-description",
        verbose: true,
      }
    );
    `;
    
    console.log('  ReAct pattern implementation documented');
    
    results.passed++;
    results.tests.push({
      name: 'ReAct pattern implementation documentation',
      passed: true
    });
  } catch (error) {
    console.error(`  ✗ Error in ReAct pattern documentation: ${error.message}`);
    results.failed++;
    results.tests.push({
      name: 'ReAct pattern implementation documentation',
      passed: false,
      error: error.message
    });
  }
  
  return results;
}

export { run };
