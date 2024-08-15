import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { Queue, QueueStatusEnum } from 'src/domain/queue/models/queue';

@Injectable()
export class RedisQueueRepositoryImpl {
  private readonly WAITING_QUEUE = '{waiting_queue}';

  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  async registerWaitingQueue(userId): Promise<Queue | null> {
    const userIdString = userId.toString();
    const setKey = await this.redisClient.zadd(
      this.WAITING_QUEUE,
      Date.now(),
      userIdString,
    );
    return setKey
      ? new Queue({ id: userId, status: QueueStatusEnum.WAITING })
      : null;
  }

  async findByUserIdWatingPosition(userId: number): Promise<number> {
    const userIdString = userId.toString();
    const rank = await this.redisClient.zrank(this.WAITING_QUEUE, userIdString);
    return rank;
  }

  async findByUserIdExistActiveQueue(userId: number): Promise<number> {
    const excute = await this.redisClient.exists(`{active}:${userId}`);
    return excute;
  }

  async moveToActiveQueue(limit: number, ttl: number): Promise<void> {
    const start = 0;
    const list = await this.redisClient.zrange(
      this.WAITING_QUEUE,
      start,
      limit - 1,
    );
    const pipeline = this.redisClient.pipeline();

    list.forEach((userId) => {
      pipeline.setex(`{active}:${userId}`, ttl, userId);
    });

    pipeline.zremrangebyrank(this.WAITING_QUEUE, start, limit - 1);

    await pipeline.exec();
  }

  async getUserStatus(userId: number): Promise<string> {
    const status = await this.redisClient.get(`{active}:${userId}`);
    return status;
  }

  async clearActiveQueue(userId: number): Promise<void> {
    await this.redisClient.del(`{active}:${userId}`);
  }
}
