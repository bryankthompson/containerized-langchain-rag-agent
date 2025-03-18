/**
 * API client for the LangChain Retrieval Agent
 * Provides utilities for making requests to the API for testing
 */

import http from 'http';
import https from 'https';
import { URL } from 'url';
import config from './test-config.js';

class ApiClient {
  constructor(baseUrl = config.api.baseUrl, timeout = config.api.timeout) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  /**
   * Make a GET request to the API
   * @param {string} endpoint - API endpoint (e.g., /health)
   * @param {Object} headers - Request headers
   * @returns {Promise<Object>} Response data
   */
  async get(endpoint, headers = {}) {
    return this.request('GET', endpoint, null, headers);
  }

  /**
   * Make a POST request to the API
   * @param {string} endpoint - API endpoint (e.g., /api/query)
   * @param {Object} data - Request data (will be stringified to JSON)
   * @param {Object} headers - Request headers
   * @returns {Promise<Object>} Response data
   */
  async post(endpoint, data, headers = {}) {
    return this.request('POST', endpoint, data, headers);
  }

  /**
   * Make a request to the API
   * @param {string} method - HTTP method (GET, POST, etc.)
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request data (for POST, PUT, etc.)
   * @param {Object} headers - Request headers
   * @returns {Promise<Object>} Response data
   */
  async request(method, endpoint, data = null, headers = {}) {
    const start = Date.now();
    const url = new URL(endpoint, this.baseUrl);
    
    const options = {
      method,
      headers: {
        'Accept': 'application/json',
        ...headers
      },
      timeout: this.timeout
    };

    if (data) {
      const stringifiedData = JSON.stringify(data);
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(stringifiedData);
    }

    // Choose the appropriate client based on the protocol
    const client = url.protocol === 'https:' ? https : http;

    return new Promise((resolve, reject) => {
      const req = client.request(url, options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          const elapsed = Date.now() - start;
          let parsedData;
          
          try {
            parsedData = responseData ? JSON.parse(responseData) : {};
          } catch (e) {
            return reject(new Error(`Failed to parse response: ${e.message}, Raw response: ${responseData}`));
          }
          
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({
              data: parsedData,
              status: res.statusCode,
              headers: res.headers,
              elapsed
            });
          } else {
            reject({
              data: parsedData,
              status: res.statusCode,
              headers: res.headers,
              elapsed,
              message: `Request failed with status ${res.statusCode}`
            });
          }
        });
      });
      
      req.on('error', (error) => {
        reject(new Error(`Request error: ${error.message}`));
      });
      
      req.on('timeout', () => {
        req.abort();
        reject(new Error(`Request timeout after ${this.timeout}ms`));
      });
      
      if (data) {
        req.write(JSON.stringify(data));
      }
      
      req.end();
    });
  }

  /**
   * Check if the API is healthy
   * @returns {Promise<boolean>} True if the API is healthy
   */
  async isHealthy() {
    try {
      const response = await this.get(config.api.endpoints.health);
      return response.data.status === 'ok';
    } catch (error) {
      return false;
    }
  }

  /**
   * Send a query to the API
   * @param {string} input - The query input
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Response data
   */
  async query(input, options = {}) {
    const data = { input, ...options };
    return this.post(config.api.endpoints.query, data);
  }

  /**
   * Send a conversation to the API with multiple messages
   * @param {Array<string>} messages - Array of messages to send in sequence
   * @param {Object} options - Additional options
   * @returns {Promise<Array<Object>>} Array of response data
   */
  async conversation(messages, options = {}) {
    const responses = [];
    
    for (const message of messages) {
      const response = await this.query(message, options);
      responses.push(response);
      
      // Add a short delay between requests to avoid rate limiting
      if (messages.indexOf(message) < messages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    return responses;
  }
}

export default new ApiClient();
