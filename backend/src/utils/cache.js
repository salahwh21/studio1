const Redis = require('ioredis');

// Initialize Redis connection if REDIS_URL is provided in the environment
const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 5) return null; // Stop retrying after 5 attempts
    return Math.min(times * 200, 2000);
  },
  lazyConnect: false,
}) : null;

if (redis) {
  redis.on('connect', () => {
    console.log('✅ Connected to Redis Cache');
  });

  redis.on('error', (err) => {
    console.error('❌ Redis Cache Error:', err.message);
  });
}

/**
 * Get data from cache
 * @param {string} key 
 * @returns {Promise<any>}
 */
async function getCache(key) {
  if (!redis) return null;
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error getting cache for ${key}:`, error.message);
    return null;
  }
}

/**
 * Set data in cache
 * @param {string} key 
 * @param {any} data 
 * @param {number} ttlSeconds Default: 300 seconds (5 minutes)
 */
async function setCache(key, data, ttlSeconds = 300) {
  if (!redis) return;
  try {
    await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
  } catch (error) {
    console.error(`Error setting cache for ${key}:`, error.message);
  }
}

/**
 * Invalidate multiple cache keys matching a pattern
 * @param {string} pattern Example: 'orders:*'
 */
async function invalidateCache(pattern) {
  if (!redis) return;
  try {
    const stream = redis.scanStream({ match: pattern, count: 100 });
    const pipeline = redis.pipeline();
    let keysFound = false;

    stream.on('data', (keys) => {
      if (keys.length > 0) {
        keysFound = true;
        keys.forEach((key) => pipeline.del(key));
      }
    });

    stream.on('end', async () => {
      if (keysFound) {
        await pipeline.exec();
        console.log(`🧹 Cache invalidated for pattern: ${pattern}`);
      }
    });
  } catch (error) {
    console.error(`Error invalidating cache for ${pattern}:`, error.message);
  }
}

module.exports = {
  redis,
  getCache,
  setCache,
  invalidateCache
};
