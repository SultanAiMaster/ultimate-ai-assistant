import Redis, { Redis as RedisClient } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// Redis connection URL
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Single Redis client instance
let redisClient: RedisClient | null = null;

/**
 * Connect to Redis
 */
export async function connectRedis(): Promise<RedisClient> {
  try {
    if (redisClient && redisClient.status === 'ready') {
      return redisClient;
    }

    console.log('🔄 Connecting to Redis...');

    redisClient = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      retryStrategy: (times) => {
        if (times > 3) {
          console.error('❌ Redis connection failed after 3 retries');
          return null;
        }
        return Math.min(times * 100, 1000);
      }
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis connection error:', err);
    });

    redisClient.on('close', () => {
      console.warn('⚠️  Redis connection closed');
    });

    redisClient.on('reconnecting', () => {
      console.log('🔄 Redis reconnecting...');
    });

    // Wait for connection
    await new Promise<void>((resolve) => {
      if (redisClient!.status === 'ready') {
        resolve();
      } else {
        redisClient!.once('connect', () => resolve());
      }
    });

    console.log(`📍 Redis: ${REDIS_URL}`);

    return redisClient;
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error);
    throw error;
  }
}

/**
 * Disconnect from Redis
 */
export async function disconnectRedis(): Promise<void> {
  try {
    if (redisClient) {
      await redisClient.quit();
      redisClient = null;
      console.log('👋 Redis disconnected');
    }
  } catch (error) {
    console.error('❌ Error disconnecting from Redis:', error);
  }
}

/**
 * Get Redis client instance
 */
export function getRedisClient(): RedisClient | null {
  return redisClient;
}

/**
 * Get Redis connection status
 */
export function getRedisStatus(): { connected: boolean; status: string } {
  if (!redisClient) {
    return { connected: false, status: 'not_initialized' };
  }

  return {
    connected: redisClient.status === 'ready',
    status: redisClient.status
  };
}

/**
 * Check Redis health
 */
export async function checkRedisHealth(): Promise<{ healthy: boolean; latency?: number }> {
  try {
    if (!redisClient || redisClient.status !== 'ready') {
      return { healthy: false };
    }

    const start = Date.now();
    await redisClient.ping();
    const latency = Date.now() - start;

    return { healthy: true, latency };
  } catch (error) {
    return { healthy: false };
  }
}