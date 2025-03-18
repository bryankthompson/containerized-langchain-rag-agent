# LangChain Retrieval Agent Test Suite

This test suite provides comprehensive testing of the LangChain Retrieval Agent across multiple dimensions, including response format, model switching, conversation threading, chat completions API integration, and advanced prompt chaining patterns.

## Test Categories

The tests are organized into the following categories:

1. **Response Tests** (`tests/response/`)
   - Tests the format, structure, and content of responses
   - Includes edge case testing for empty queries, very long queries, and malformed queries

2. **Model Switching Tests** (`tests/models/`)
   - Demonstrates how to switch between different LLM models
   - Documents model configuration options and their effects

3. **Threading Tests** (`tests/threading/`)
   - Tests conversation memory capabilities
   - Documents how to implement conversation context maintenance

4. **Chat Completions API Tests** (`tests/chat-completions/`)
   - Documents how to transition from the legacy completions API to the newer chat completions API
   - Demonstrates the use of system messages and conversation history

5. **Prompt Chaining Tests** (`tests/prompt-chaining/`)
   - Demonstrates advanced prompt chaining patterns: sequential chains, router chains, and map-reduce chains
   - Documents ReAct (Reasoning + Acting) patterns for agent implementation

## Running the Tests

### Prerequisites

1. Ensure the LangChain Retrieval Agent server is running:
   ```
   run.bat
   ```

2. Verify the server is running by checking the `/health` endpoint:
   ```
   curl http://localhost:8000/health
   ```

### Running All Tests

To run all tests:

```
node tests/run-tests.js
```

### Running Specific Test Categories

To run tests for a specific category:

```
node tests/run-tests.js response
node tests/run-tests.js models
node tests/run-tests.js threading
node tests/run-tests.js chat-completions
node tests/run-tests.js prompt-chaining
```

## Test Results

The test runner will display results in the console, including:
- Number of tests passed, failed, and skipped
- Timing information for each test category
- Details about any test failures

## Notes

- Some tests are primarily instructional, demonstrating how to implement features that aren't currently present in the codebase
- The model switching and chat completions tests provide documentation but don't modify the actual server code, as they would require server restarts
- Threading tests may fail with the current implementation, which lacks conversation memory - this is expected and documents an area for improvement

## Extending the Tests

To add new tests:

1. Create a new test file in the appropriate category directory
2. Implement the `run()` function that returns a results object with the structure:
   ```javascript
   {
     passed: 0,
     failed: 0,
     skipped: 0,
     tests: [
       { name: 'Test name', passed: true/false, error: 'Error message if applicable' }
     ]
   }
   ```
3. Export the `run()` function from the module

The test runner will automatically find and execute your new test.
