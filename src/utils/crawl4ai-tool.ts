import { Tool } from "langchain/tools";
import { Crawl4aiClient, CrawlOptions } from './crawl4ai-client.js';

/**
 * Tool for crawling web pages using the crawl4ai service
 */
export class Crawl4aiTool extends Tool {
  name = "web_crawler";
  description = "Use this tool when you need to fetch information from a specific website or when you need up-to-date information not available in your knowledge base. Input should be a URL or a URL with a specific query separated by a comma. For example: 'https://example.com' or 'https://example.com, what are the latest products?'";
  
  private client: Crawl4aiClient;
  
  constructor() {
    super();
    this.client = new Crawl4aiClient();
  }
  
  /**
   * Run the tool to crawl a website
   * 
   * @param input URL to crawl, optionally with a specific query
   * @returns Markdown content from the crawled page
   */
  async _call(input: string): Promise<string> {
    try {
      console.log(`Crawl4aiTool called with input: ${input}`);
      
      // Parse the input - check if it contains a URL and an optional query
      const [url, userQuery] = this.parseInput(input);
      
      if (!url) {
        return "Invalid input. Please provide a valid URL.";
      }
      
      // Configure crawl options
      const options: CrawlOptions = {
        priority: 10,
        timeoutMs: 60000, // One minute timeout
      };
      
      // Add user query if provided
      if (userQuery) {
        options.userQuery = userQuery;
      }
      
      // Crawl the URL
      console.log(`Crawling URL: ${url} with options:`, options);
      const result = await this.client.crawlUrl(url, options);
      
      // Process the result
      if (!result.success) {
        return `Failed to crawl URL: ${url}`;
      }
      
      // If the markdown is too large, trim it to a reasonable size
      const maxLength = 8000;
      let markdown = result.markdown;
      
      if (markdown.length > maxLength) {
        markdown = markdown.substring(0, maxLength) + "\n\n[Content truncated due to length. This is a summary of the page content.]";
      }
      
      // Add metadata about the crawl
      const metadataInfo = `\nSource: ${url}\nCrawled at: ${new Date().toISOString()}`;
      
      return markdown + metadataInfo;
    } catch (error: any) {
      console.error("Error in Crawl4aiTool:", error);
      return `Error crawling the URL: ${error.message}`;
    }
  }
  
  /**
   * Parse the input to extract URL and optional user query
   * 
   * @param input Input string from the agent
   * @returns Tuple of [url, userQuery]
   */
  private parseInput(input: string): [string, string | undefined] {
    const parts = input.split(',').map(part => part.trim());
    
    // First part should be a URL
    const url = parts[0];
    
    // Check if the URL is valid
    try {
      new URL(url);
    } catch {
      return ["", undefined];
    }
    
    // If there are more parts, treat them as a query
    let userQuery: string | undefined;
    if (parts.length > 1) {
      userQuery = parts.slice(1).join(', ');
    }
    
    return [url, userQuery];
  }
}
