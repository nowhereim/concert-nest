import { Injectable } from '@nestjs/common';
import { QueueV2 } from 'src/domain/queue/models/queue-v2';
import { QueueServiceV2 } from 'src/domain/queue/queue.service.v2';

@Injectable()
export class RegisterQueueUseCase {
  constructor(private readonly queueServiceV2: QueueServiceV2) {}

  async execute(): Promise<QueueV2> {
    return await this.queueServiceV2.registerQueue();
  }
}
