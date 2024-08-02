import { Injectable } from '@nestjs/common';
import { QueueServiceV2 } from 'src/domain/queue/queue.service.v2';

@Injectable()
export class ExpireQueueUseCase {
  constructor(private readonly queueService: QueueServiceV2) {}

  async execute(args: { queueId: string }): Promise<void> {
    await this.queueService.expireToken(args);
  }
}
