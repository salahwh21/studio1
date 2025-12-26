import { Pool } from 'pg';
import Redis from 'ioredis';

// PostgreSQL Connection Pool
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Redis Connection
const redis = new Redis(process.env.REDIS_URL!, {
  retryDelayOnCloseConnection: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
});

// Database Helper Functions
export class DatabaseService {
  // Execute a query with parameters
  static async query(text: string, params?: any[]) {
    const client = await pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  // Execute a transaction
  static async transaction(callback: (client: any) => Promise<any>) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Cache helpers using Redis
  static async getCache(key: string) {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  static async setCache(key: string, value: any, ttl: number = 3600) {
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  static async deleteCache(key: string) {
    try {
      await redis.del(key);
    } catch (error) {
      console.error('Redis delete error:', error);
    }
  }

  // Clear cache by pattern
  static async clearCachePattern(pattern: string) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error('Redis clear pattern error:', error);
    }
  }
}

// Connection health check
export async function checkDatabaseHealth() {
  try {
    // Check PostgreSQL
    const pgResult = await DatabaseService.query('SELECT 1 as health');
    const pgHealthy = pgResult.rows[0]?.health === 1;

    // Check Redis
    const redisResult = await redis.ping();
    const redisHealthy = redisResult === 'PONG';

    return {
      postgresql: pgHealthy,
      redis: redisHealthy,
      overall: pgHealthy && redisHealthy
    };
  } catch (error) {
    console.error('Database health check failed:', error);
    return {
      postgresql: false,
      redis: false,
      overall: false
    };
  }
}

// Graceful shutdown
export async function closeDatabaseConnections() {
  try {
    await pool.end();
    await redis.quit();
    console.log('Database connections closed gracefully');
  } catch (error) {
    console.error('Error closing database connections:', error);
  }
}

// Export instances for direct use
export { pool, redis };