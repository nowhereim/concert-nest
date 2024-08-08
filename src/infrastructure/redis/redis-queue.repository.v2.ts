import { Injectable, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisQueueRepositoryImplV2 {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  async setActive(userId: string, ttl: number): Promise<string> {
    return await this.redisClient.set(
      `active:${userId}`,
      userId,
      'EX',
      ttl,
      'NX',
    );
  }

  async resetLastOffset(lastOffset: string): Promise<void> {
    await this.redisClient.set('queue_last_offset', lastOffset);
  }

  async getLastOffset(): Promise<string> {
    return await this.redisClient.get('queue_last_offset');
  }

  async findByQueueIdExistActiveToken(queueId: string): Promise<number> {
    const excute = await this.redisClient.exists(`active:${queueId}`);
    return excute;
  }

  async clearActiveQueue(queueId: string): Promise<void> {
    await this.redisClient.del(`active:${queueId}`);
  }
}
