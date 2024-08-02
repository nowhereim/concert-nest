import { Injectable } from '@nestjs/common';
import { Queue } from 'src/domain/queue/models/queue';
import { QueueService } from 'src/domain/queue/queue.service';

@Injectable()
export class ValidTokenUseCase {
  constructor(private readonly queueService: QueueService) {}

  async execute(args: { queueId: number }): Promise<Queue> {
    return await this.queueService.validToken(args);
  }
}
