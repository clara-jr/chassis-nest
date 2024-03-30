import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export default class CacheService implements OnApplicationShutdown {
  private redis: Redis;
  private readonly TTL = 60 * 60; // 1 h (60 * 60 s)

  constructor(redis: Redis) {
    this.redis = redis;
  }

  static async bootstrap(config: { uri: string }): Promise<CacheService> {
    const { uri: redis_uri } = config;
    let ready = false;

    const redis = new Redis(redis_uri);

    redis.on('ready', () => {
      ready = true;
    });

    redis.on('error', (error) => {
      console.error(error);
    });

    const _sleep = (ms: number) => {
      return new Promise((resolve) => setTimeout(resolve, ms));
    };

    // Wait until redis is ready so the connection is not used before it is established
    let wait = 30;
    while (!ready) {
      await _sleep(1000);
      if (--wait < 1) {
        throw new Error('Redis is not connecting (waited for 30 seconds)');
      }
    }

    return new CacheService(redis);
  }

  async get(key: string) {
    return this.redis.get(key);
  }

  async del(key: string) {
    return this.redis.del(key);
  }

  async setex(key: string, value: object | string, ttl: number = this.TTL) {
    return this.redis.setex(key, ttl, JSON.stringify(value));
  }

  async disconnect() {
    await this.redis.disconnect();
    console.info('👋 Redis disconnected.');
  }

  async onApplicationShutdown() {
    await this.disconnect();
  }
}
