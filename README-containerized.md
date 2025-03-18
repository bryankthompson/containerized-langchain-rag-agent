# Containerized LangChain Retrieval Agent

This project provides a containerized LangChain Retrieval Agent that combines agent-based decision making with retrieval augmentation to provide intelligent responses based on your vector database content.

## Features

- **Containerized Environment**: Easy to deploy and scale
- **RESTful API**: Simple HTTP interface for integrating with any application
- **PostgreSQL Logging**: Detailed logs stored in PostgreSQL database
- **Health Monitoring**: Built-in health check endpoint for container orchestration
- **Pinecone Vector Database**: Efficient vector storage and similarity search

## Prerequisites

- Docker and Docker Compose
- Pinecone account with an index already set up
- OpenAI API key
- Crawl4AI API key
- PostgreSQL database for logging (optional)

## Configuration

Create a `.env` file based on the provided `.env.example`:

```bash
# Copy the example environment file
cp .env.example .env

# Edit the file with your actual credentials
nano .env
```

Required environment variables:

# OpenAI
OPENAI_API_KEY=YOUR_API_KEY

# Pinecone
PINECONE_API_KEY=YOUR_API_KEY
PINECONE_ENVIRONMENT=YOUR_ENVIRONMENT
PINECONE_INDEX=YOUR_INDEX

# PostgreSQL logging configuration:
POSTGRES_HOST=YOUR_HOST
POSTGRES_PORT=YOUR_PORT
POSTGRES_DB=YOUR_DB
POSTGRES_USER=YOUR_USER
POSTGRES_PASSWORD=YOUR_PASSWORD

# Crawl4AI
CRAWL4AI_HOST=YOUR_HOST
CRAWL4AI_PORT=YOUR_PORT
CRAWL4AI_API_KEY=YOUR_API_KEY

## Building and Running

### Using Docker Compose

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f
```

### Using Docker Directly

```bash
# Build the Docker image
docker build -t langchain-retrieval-agent .

# Run the container
docker run -p 8000:8000 --env-file .env langchain-retrieval-agent
```

## API Endpoints

### Health Check

```
GET /health
```

Response:
```json
{
  "status": "ok"
}
```

### Query Endpoint

```
POST /api/query
```

Request Body:
```json
{
  "input": "your question here"
}
```

Response:
```json
{
  "output": "agent's response here",
  "processed_at": "2025-03-17T22:51:00.000Z",
  "trace_id": "c8d7e6f5-4a3b-2c1d-0e9f-8g7h6i5j4k3l"
}
```

## Example Usage

Using curl:

```bash
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{"input": "What are some facts about the University of Notre Dame?"}'
```

Using Python with requests:

```python
import requests

response = requests.post(
    "http://localhost:8000/api/query",
    json={"input": "What are some facts about the University of Notre Dame?"}
)

print(response.json())
```

## Integration with Triepod

This containerized retrieval agent is designed to work with the Triepod system. It's configured to connect to the Triepod PostgreSQL logging infrastructure at 10.0.0.205 on port 30808.

To integrate with the existing Triepod system, ensure that:

1. The container can reach the PostgreSQL database at 10.0.0.205:30808
2. The container exposes port 8000 for the HTTP interface
3. Your Pinecone index is properly populated with documents

## Troubleshooting

If you encounter issues:

1. Check if the container is running:
   ```
   docker ps | grep retrieval-agent
   ```

2. View container logs:
   ```
   docker logs <container_id>
   ```

3. Verify PostgreSQL connectivity:
   ```
   docker exec -it <container_id> nc -zv 10.0.0.205 30808
   ```

4. Verify Pinecone connectivity:
   ```
   docker exec -it <container_id> curl -I https://api.pinecone.io
   ```

## License

MIT
