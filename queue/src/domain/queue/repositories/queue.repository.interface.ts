import { Queue } from '../models/queue';

export interface IQueueRepository {
  registerWaitingQueue(userId): Promise<Queue | null>;

  findByUserIdWatingPosition(userId: number): Promise<number>;

  findByUserIdExistActiveToken(userId: number): Promise<number>;

  moveToActiveToken(limit: number, ttl: number): Promise<void>;

  getUserStatus(userId: number): Promise<string>;

  clearActiveToken(userId: number): Promise<void>;
}
