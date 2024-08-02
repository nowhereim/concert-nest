import { Injectable } from '@nestjs/common';
import { QueueServiceV2 } from 'src/domain/queue/queue.service.v2';

@Injectable()
export class ResetLastOffsetUseCase {
  constructor(private readonly queueServiceV2: QueueServiceV2) {}

  async execute(offset: string): Promise<void> {
    await this.queueServiceV2.resetLastOffset({ offset });
  }
}
