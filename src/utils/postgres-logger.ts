import pkg from 'pg';
const { Client } = pkg;

/**
 * PostgresLogger - Utility for logging operations to PostgreSQL database.
 * Integrates with Triepod platform logging system.
 */
export class PostgresLogger {
  private client: any; // Temporary type assertion
  private connected: boolean = false;
  private tableName: string;
  private schema: string;

  /**
   * Initialize PostgreSQL logger
   *
   * @param {Object} config - PostgreSQL connection configuration
   * @param {string} config.host - Database host
   * @param {number} config.port - Database port
   * @param {string} config.database - Database name
   * @param {string} config.user - Database user
   * @param {string} config.password - Database password
   * @param {string} schema - Schema name (default: 'vector_logs')
   * @param {string} tableName - Table name for logs (default: 'logs')
   */
  constructor(
    config: {
      host: string;
      port: number;
      database: string;
      user: string;
      password: string;
    },
    schema: string = 'vector_logs',
    tableName: string = 'logs'
  ) {
    this.client = new Client(config) as any;
    this.schema = schema;
    this.tableName = tableName;
  }

  /**
   * Connect to PostgreSQL
   */
  async connect(): Promise<boolean> {
    try {
      if (!this.connected) {
        await this.client.connect();
        this.connected = true;
        console.log('Connected to PostgreSQL for logging');

        // Ensure the schema exists
        await this.ensureSchema();

        // Ensure the logs table exists
        await this.ensureTable();
      }
      return true;
    } catch (error) {
      console.error('Failed to connect to PostgreSQL:', error);
      return false;
    }
  }

  /**
   * Ensure the schema exists
   */
  private async ensureSchema(): Promise<void> {
    try {
      await this.client.query(`CREATE SCHEMA IF NOT EXISTS ${this.schema}`);
    } catch (error) {
      console.error(`Failed to create schema ${this.schema}:`, error);
      throw error;
    }
  }

  /**
   * Ensure the logs table exists
   */
  private async ensureTable(): Promise<void> {
    try {
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS ${this.schema}.${this.tableName} (
          id SERIAL PRIMARY KEY,
          timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          level VARCHAR(10) NOT NULL,
          component_name VARCHAR(255),
          message TEXT NOT NULL,
          metadata JSONB DEFAULT '{}'::JSONB,
          trace_id VARCHAR(255)
        )
      `;
      await this.client.query(createTableQuery);
    } catch (error) {
      console.error(`Failed to create table ${this.schema}.${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Log a message to PostgreSQL
   *
   * @param {string} level - Log level (INFO, WARN, ERROR, etc.)
   * @param {string} message - Log message
   * @param {Object} metadata - Additional metadata
   * @param {string} componentName - Name of the component logging the message
   * @param {string} traceId - Trace ID for request tracking
   */
  async log(
    level: string,
    message: string,
    metadata: Record<string, any> = {},
    componentName: string = 'RetrievalAgent',
    traceId?: string
  ): Promise<boolean> {
    if (!this.connected) {
      await this.connect();
    }

    try {
      const query = `
        INSERT INTO ${this.schema}.${this.tableName}
        (level, component_name, message, metadata, trace_id)
        VALUES ($1, $2, $3, $4, $5)
      `;

      await this.client.query(query, [
        level.toUpperCase(),
        componentName,
        message,
        JSON.stringify(metadata),
        traceId || null
      ]);

      return true;
    } catch (error) {
      console.error('Failed to log to PostgreSQL:', error);
      console.log(`[${level}] ${message}`, metadata);
      return false;
    }
  }

  /**
   * Log an info message
   */
  async info(message: string, metadata: Record<string, any> = {}, componentName?: string, traceId?: string): Promise<boolean> {
    return this.log('INFO', message, metadata, componentName, traceId);
  }

  /**
   * Log a warning message
   */
  async warn(message: string, metadata: Record<string, any> = {}, componentName?: string, traceId?: string): Promise<boolean> {
    return this.log('WARN', message, metadata, componentName, traceId);
  }

  /**
   * Log an error message
   */
  async error(message: string, metadata: Record<string, any> = {}, componentName?: string, traceId?: string): Promise<boolean> {
    return this.log('ERROR', message, metadata, componentName, traceId);
  }

  /**
   * Close the PostgreSQL connection
   */
  async close(): Promise<void> {
    if (this.connected) {
      await this.client.end();
      this.connected = false;
      console.log('Closed PostgreSQL logging connection');
    }
  }
}

// Singleton instance
let loggerInstance: PostgresLogger | null = null;

/**
 * Get a singleton instance of PostgresLogger
 */
export function getPostgresLogger(): PostgresLogger {
  if (!loggerInstance) {
    loggerInstance = new PostgresLogger({
      host: process.env.POSTGRES_HOST || '10.0.0.205',
      port: parseInt(process.env.POSTGRES_PORT || '30808'),
      database: process.env.POSTGRES_DB || 'lodestar-ai',
      user: process.env.POSTGRES_USER || 'lodestar-db',
      password: process.env.POSTGRES_PASSWORD || 'nirvana1'
    });
  }

  return loggerInstance;
}
