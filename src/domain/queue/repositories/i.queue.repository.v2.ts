import { RecordMetadata } from 'kafkajs';

export interface IQueueRepositoryV2 {
  setActive(userId: string, ttl: number): Promise<string>;

  resetLastOffset(lastOffset: string): Promise<void>;

  getLastOffset(): Promise<string>;

  findByQueueIdExistActiveToken(queueId: string): Promise<number>;

  clearActiveQueue(queueId: string): Promise<void>;

  sendMessageToActiveToken(uuid: string): Promise<RecordMetadata[]>;
}
