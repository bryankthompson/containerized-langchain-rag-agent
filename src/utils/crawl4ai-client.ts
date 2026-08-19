import axios from 'axios';
import { getEnv } from './util.js';

// Note: Add axios to package.json if not already present:
// "axios": "^1.6.0"

/**
 * Client for interacting with the crawl4ai service
 */
export class Crawl4aiClient {
  private baseUrl: string;
  
  constructor() {
    // No defaults. These used to fall back to a literal private-network address on the author's
    // own LAN, which told every reader of this public repository the internal addressing of a
    // machine they cannot reach — no use to them, and a small piece of a network map.
    const host = getEnv('CRAWL4AI_HOST');
    const port = getEnv('CRAWL4AI_PORT');
    if (!host || !port) {
      throw new Error('CRAWL4AI_HOST and CRAWL4AI_PORT must be set; see .env.example.');
    }
    this.baseUrl = `http://${host}:${port}`;
  }

  /**
   * Crawl a specific URL and return the content
   * 
   * @param url The URL to crawl
   * @param options Optional parameters for the crawl
   * @returns The crawled content in markdown format
   */
  async crawlUrl(url: string, options: CrawlOptions = {}): Promise<CrawlResult> {
    try {
      // Log the crawl request
      console.log(`Crawling URL: ${url}`);
      
      // Make the request to the crawl4ai service
      const response = await axios.post(`${this.baseUrl}/crawl`, {
        urls: url,
        priority: options.priority || 10,
        ...options,
      });
      
      // Get the task ID
      const taskId = response.data.task_id;
      console.log(`Crawl task submitted with ID: ${taskId}`);
      
      // Poll for the result
      return await this.waitForTaskCompletion(taskId, options.timeoutMs || 30000);
    } catch (error: any) {
      console.error('Error crawling URL:', error.message);
      throw new Error(`Failed to crawl URL: ${url} - ${error.message}`);
    }
  }
  
  /**
   * Wait for a task to complete by polling
   * 
   * @param taskId The ID of the task to wait for
   * @param timeoutMs Maximum time to wait in milliseconds
   * @returns The result of the task
   */
  private async waitForTaskCompletion(taskId: string, timeoutMs: number): Promise<CrawlResult> {
    const startTime = Date.now();
    const pollIntervalMs = 1000; // Poll every second
    
    while (Date.now() - startTime < timeoutMs) {
      try {
        const response = await axios.get(`${this.baseUrl}/task/${taskId}`);
        const status = response.data.status;
        
        if (status === "completed") {
          // Task completed successfully
          console.log(`Crawl task ${taskId} completed`);
          return {
            markdown: response.data.result.markdown || '',
            rawHtml: response.data.result.html || '',
            links: response.data.result.links || [],
            metadata: response.data.result.metadata || {},
            success: true,
            taskId
          };
        } else if (status === "failed") {
          // Task failed
          throw new Error(`Crawl task failed: ${response.data.error || 'Unknown error'}`);
        }
        
        // Task still in progress, wait before polling again
        await this.sleep(pollIntervalMs);
      } catch (error: any) {
        console.error(`Error polling task ${taskId}:`, error.message);
        throw error;
      }
    }
    
    // Timeout reached
    throw new Error(`Timeout reached while waiting for crawl task ${taskId}`);
  }
  
  /**
   * Sleep for a specified duration
   * 
   * @param ms Milliseconds to sleep
   * @returns Promise that resolves after the specified duration
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Options for crawling a URL
 */
export interface CrawlOptions {
  priority?: number;       // Priority of the crawl (higher = more important)
  maxDepth?: number;       // Maximum depth to crawl
  timeoutMs?: number;      // Maximum time to wait for crawl result
  userQuery?: string;      // User's query to optimize content extraction
  deepCrawl?: boolean;     // Whether to enable deep crawling
  crawlStrategy?: string;  // Strategy to use (e.g. 'playwright', 'http')
}

/**
 * Result of a crawl operation
 */
export interface CrawlResult {
  markdown: string;        // Markdown content extracted from the URL
  rawHtml?: string;        // Raw HTML content of the URL (if available)
  links?: string[];        // Links found on the page
  metadata?: any;          // Additional metadata from the crawl
  success: boolean;        // Whether the crawl was successful
  taskId: string;          // ID of the crawl task
}
