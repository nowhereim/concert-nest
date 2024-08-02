import { Injectable } from '@nestjs/common';
import { Queue } from 'src/domain/queue/models/queue';
import { QueueService } from 'src/domain/queue/queue.service';

@Injectable()
export class RegisterQueueUseCase {
  constructor(private readonly queueService: QueueService) {}

  async execute(args: { userId: number }): Promise<Queue> {
    return await this.queueService.registerQueue(args);
  }
}
