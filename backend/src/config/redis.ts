import Redis from 'ioredis';
import { env } from './env';

class RedisCache {
  private client: Redis | null = null;
  private memoryStore = new Map<string, { value: string; expiresAt?: number }>();
  public isConnected = false;

  constructor() {
    if (env.REDIS_URL) {
      try {
        this.client = new Redis(env.REDIS_URL, {
          lazyConnect: true,
          maxRetriesPerRequest: 1,
          retryStrategy(times) {
            if (times > 3) return null; // Stop retrying after 3 attempts
            return Math.min(times * 100, 2000);
          },
        });

        this.client.on('connect', () => {
          this.isConnected = true;
          console.log('Redis connected successfully.');
        });

        this.client.on('error', (err) => {
          if (this.isConnected) {
            console.warn('Redis error:', err.message);
          }
          this.isConnected = false;
        });
      } catch (err) {
        console.warn('Redis initialization skipped, using in-memory cache fallback.');
      }
    }
  }

  async connect(): Promise<void> {
    if (this.client && !this.isConnected) {
      try {
        await this.client.connect();
      } catch (err) {
        console.warn('Could not connect to Redis, operating in fallback memory mode.');
        this.isConnected = false;
      }
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.isConnected && this.client) {
      try {
        return await this.client.get(key);
      } catch (err) {
        // fallback
      }
    }
    const cached = this.memoryStore.get(key);
    if (!cached) return null;
    if (cached.expiresAt && Date.now() > cached.expiresAt) {
      this.memoryStore.delete(key);
      return null;
    }
    return cached.value;
  }

  async set(key: string, value: string, ttlSeconds = 300): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        await this.client.set(key, value, 'EX', ttlSeconds);
        return;
      } catch (err) {
        // fallback
      }
    }
    this.memoryStore.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined,
    });
  }

  async del(key: string): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        await this.client.del(key);
      } catch (err) {
        // fallback
      }
    }
    this.memoryStore.delete(key);
  }

  async flush(): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        await this.client.flushdb();
      } catch (err) {
        // fallback
      }
    }
    this.memoryStore.clear();
  }
}

export const redisCache = new RedisCache();
