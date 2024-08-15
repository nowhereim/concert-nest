import { Injectable } from '@nestjs/common';
import { Queue } from 'src/domain/queue/models/queue';
import { IQueueRepository } from 'src/domain/queue/repositories/queue.repository.interface';
import { RedisQueueRepositoryImpl } from 'src/infrastructure/redis/redis-queue.repository-impl';

@Injectable()
export class QueueRepositoryImpl implements IQueueRepository {
  constructor(
    private readonly redisQueueRepositoryImpl: RedisQueueRepositoryImpl,
  ) {}

  async registerWaitingQueue(userId: number): Promise<Queue | null> {
    return await this.redisQueueRepositoryImpl.registerWaitingQueue(userId);
  }

  async findByUserIdWatingPosition(userId: number): Promise<number> {
    return await this.redisQueueRepositoryImpl.findByUserIdWatingPosition(
      userId,
    );
  }

  async findByUserIdExistActiveToken(userId: number): Promise<number> {
    return await this.redisQueueRepositoryImpl.findByUserIdExistActiveQueue(
      userId,
    );
  }

  async moveToActiveToken(limit: number, ttl: number): Promise<void> {
    return await this.redisQueueRepositoryImpl.moveToActiveQueue(limit, ttl);
  }

  async getUserStatus(userId: number): Promise<string> {
    return await this.redisQueueRepositoryImpl.getUserStatus(userId);
  }

  async clearActiveToken(userId: number): Promise<void> {
    return await this.redisQueueRepositoryImpl.clearActiveQueue(userId);
  }
}
