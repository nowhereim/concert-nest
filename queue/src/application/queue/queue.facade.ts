import { Injectable } from '@nestjs/common';
import { Queue } from 'src/domain/queue/models/queue';
import { QueueService } from 'src/domain/queue/queue.service';
@Injectable()
export class QueueFacadeApp {
  constructor(private readonly queueService: QueueService) {}
  async registerQueue(args: { userId: number }): Promise<Queue> {
    return await this.queueService.registerQueue(args);
  }

  async validToken(args: { queueId: number }): Promise<Queue> {
    return await this.queueService.validToken(args);
  }

  async expireToken(args: { userId: number }): Promise<void> {
    await this.queueService.expireToken(args);
  }

  async activateWaitingRecords(): Promise<void> {
    await this.queueService.activateWaitingRecords();
  }
}
