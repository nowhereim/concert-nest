import { Injectable } from '@nestjs/common';
import { Queue } from 'src/domain/queue/queue';
import { QueueService } from 'src/domain/queue/queue.service';

@Injectable()
export class QueueFacadeApp {
  constructor(private readonly queueService: QueueService) {}

  async createQueue(args: { userId: number }): Promise<Queue> {
    return await this.queueService.createQueue(args);
  }

  async findByQueueId(args: { queueId: number }): Promise<Queue> {
    return await this.queueService.findByQueueId(args);
  }

  async validQueue(args: {
    queueId: number;
    needActive: boolean;
  }): Promise<Queue> {
    return await this.queueService.validQueue(args);
  }

  async expireQueue(): Promise<Queue[]> {
    return await this.queueService.clearExpiredActiveRecords();
  }

  async activeQueue(): Promise<Queue[]> {
    return await this.queueService.activateWaitingRecords();
  }
}
