# Crawl4ai Integration with LangChain Retrieval Agent

This document explains how the LangChain Retrieval Agent has been enhanced with web crawling capabilities through integration with the crawl4ai service.

## Architecture Overview

The integration follows this architecture:

```
┌─────────────┐         ┌──────────────────────┐         ┌───────────────┐
│   Client    │ ─HTTP─> │  LangChain Retrieval │ ─HTTP─> │  crawl4ai     │
│   Request   │         │       Agent          │         │  Service      │
└─────────────┘         └──────────────────────┘         └───────────────┘
                                   │                             │  
                                   │                             │  
                                   ▼                             │  
                         ┌──────────────────┐                    │  
                         │   Pinecone Vector│                    │  
                         │     Database     │                    │  
                         └──────────────────┘                    │  
                                   ▲                             │  
                                   │                             │  
                                   └─────────────────────────────┘  
                                   Vector storage of crawled data
```

## Components

### 1. Crawl4ai Client

The `Crawl4aiClient` class in `src/utils/crawl4ai-client.ts` handles communication with the crawl4ai service. It provides:

- Connection to the crawl4ai service at the configured host/port
- Methods to crawl URLs and retrieve the content as markdown
- Handling of task polling and error conditions
- Configurable options for crawling behavior

### 2. Crawl4ai Tool

The `Crawl4aiTool` class in `src/utils/crawl4ai-tool.ts` implements the LangChain Tool interface to make the crawl4ai service available to the agent. It provides:

- A well-defined description that helps the agent understand when to use web crawling
- Parameter parsing to extract URLs and query contexts from agent inputs
- Content truncation to stay within token limits
- Error handling and reporting

### 3. Server Integration

The server file (`src/server.ts`) integrates the Crawl4ai Tool with the existing agent:

- Imports and instantiates the Crawl4aiTool
- Adds it to the list of tools provided to the LangChain agent
- Configures the agent to use the tool when appropriate
- Logs tool usage for monitoring and debugging

## Decision Making Process

The LangChain agent uses the "zero-shot-react-description" agent type, which:

1. Analyzes the user's query
2. Determines if the query requires:
   - General knowledge (using the knowledge base tool)
   - Up-to-date web information (using the web crawler tool)
   - Or a combination of both
3. Executes the appropriate tool(s)
4. Synthesizes the information into a coherent response

The decision to use the crawler is based on:
- Detection of recent events or time-sensitive information
- Explicit URLs in the query
- Queries about topics not likely to be in the knowledge base
- Requests for the most current information on a topic

## Configuration

The integration uses these environment variables:

- `CRAWL4AI_HOST`: Host address of the crawl4ai service (default: 10.0.0.206)
- `CRAWL4AI_PORT`: Port of the crawl4ai service (default: 6379)

These are defined in the `.env` file and have defaults if not specified.

## Running and Testing

### Starting the Services

1. Ensure the crawl4ai service is running at the specified host and port:
   ```
   # The service should be running at 10.0.0.206:6379
   ```

2. Start the LangChain Retrieval Agent:
   ```bash
   npm run build
   npm run start
   ```
   
   Or with Docker:
   ```bash
   docker-compose up --build
   ```

### Testing the Integration

You can test the agent with queries that might trigger web crawling:

```bash
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{"input": "What is on the homepage of example.com?"}'
```

Or using direct URL format:

```bash
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{"input": "Use the web_crawler tool to find information on https://example.com about their products."}'
```

## Troubleshooting

### Common Issues

1. **Crawl4ai Connection Errors**:
   - Verify the crawl4ai service is running
   - Check network connectivity between containers/services
   - Validate the host and port settings

2. **Timeout Errors**:
   - The default timeout is 60 seconds for crawling
   - Adjust the `timeoutMs` parameter for complex sites

3. **Agent Not Using the Crawler**:
   - Make your query more explicit about needing web information
   - Directly mention URLs for guaranteed crawling

4. **Content Too Large**:
   - Very large pages will be truncated to 8000 characters
   - This may affect comprehensiveness of responses

### Logs to Check

- The agent logs in the console show tool selection decisions
- PostgreSQL logs capture all agent actions and tool usage
- Docker logs may show container-level errors

## Future Enhancements

Possible improvements to this integration:

1. **Caching**: Store crawl results to reduce duplicate crawling
2. **Intelligent URL Extraction**: Auto-detect and suggest URLs based on queries
3. **Image Processing**: Add capability to analyze images from crawled pages
4. **Structured Data Extraction**: Parse specific data types from websites
5. **Vector Storage**: Store crawled content in the vector database for future use
