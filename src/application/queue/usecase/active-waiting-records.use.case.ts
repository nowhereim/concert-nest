import { Injectable } from '@nestjs/common';
import { QueueService } from 'src/domain/queue/queue.service';

@Injectable()
export class ActivateWaitingRecordsUseCase {
  constructor(private readonly queueService: QueueService) {}

  async execute(): Promise<void> {
    await this.queueService.activateWaitingRecords();
  }
}
