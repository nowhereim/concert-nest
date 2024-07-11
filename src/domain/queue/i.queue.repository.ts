import { EntityManager } from 'typeorm';
import { Queue } from './queue';

export interface IQueueRepository {
  save(args: Queue, transactionalEntityManager?: EntityManager): Promise<Queue>;
  findByQueueId(args: { queueId: number }): Promise<Queue>;
  findByUserId(args: { userId: number }): Promise<Queue>;

  findExpiredActiveRecords(): Promise<Queue[]>;
  findActiveRecordsCount(): Promise<number>;
  findWaitingRecords(args: { limit: number }): Promise<Queue[]>;

  saveAll(args: Queue[]): Promise<Queue[]>;
}
