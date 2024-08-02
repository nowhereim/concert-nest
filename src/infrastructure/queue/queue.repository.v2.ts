import { Injectable } from '@nestjs/common';
import { RedisQueueRepositoryImplV2 } from 'src/infrastructure/redis/redis-queue.repository.v2';
import { KafkaQueueRepositoryImpl } from 'src/infrastructure/kafka/kafka-queue.repository';
import { RecordMetadata } from 'kafkajs';
import { IQueueRepositoryV2 } from 'src/domain/queue/repositories/i.queue.repository.v2';

@Injectable()
export class QueueRepositoryImplV2 implements IQueueRepositoryV2 {
  constructor(
    private readonly redisQueueRepository: RedisQueueRepositoryImplV2,
    private readonly kafkaQueueRepository: KafkaQueueRepositoryImpl,
  ) {}

  async setActive(userId: string, ttl: number): Promise<string> {
    return await this.redisQueueRepository.setActive(userId, ttl);
  }

  async resetLastOffset(lastOffset: string): Promise<void> {
    return await this.redisQueueRepository.resetLastOffset(lastOffset);
  }

  async getLastOffset(): Promise<string> {
    return await this.redisQueueRepository.getLastOffset();
  }

  async findByQueueIdExistActiveToken(queueId: string): Promise<number> {
    return await this.redisQueueRepository.findByQueueIdExistActiveToken(
      queueId,
    );
  }

  async clearActiveQueue(queueId: string): Promise<void> {
    return await this.redisQueueRepository.clearActiveQueue(queueId);
  }

  async sendMessageToActiveToken(uuid: string): Promise<RecordMetadata[]> {
    return await this.kafkaQueueRepository.sendMessageToActiveToken(uuid);
  }
}
