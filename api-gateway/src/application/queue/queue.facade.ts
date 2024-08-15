import { Inject, Injectable } from '@nestjs/common';
import { IQueueClient } from './queue.client.interface';

@Injectable()
export class QueueFacadeApp {
  constructor(
    @Inject('IQueueClient')
    private readonly queueClient: IQueueClient,
  ) {}
  async registerQueue(args: { userId: number }) {
    return await this.queueClient.registerQueue(args);
  }

  async validToken(args: { queueId: number }) {
    return await this.queueClient.validToken(args);
  }
}
