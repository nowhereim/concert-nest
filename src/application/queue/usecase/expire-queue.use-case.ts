import { Injectable } from '@nestjs/common';
import { QueueService } from 'src/domain/queue/queue.service';

@Injectable()
export class ExpireQueueUseCase {
  constructor(private readonly queueService: QueueService) {}

  async execute(args: { userId: number }): Promise<void> {
    await this.queueService.expireToken(args);
  }
}
