import { HttpException, Inject, Injectable } from '@nestjs/common';
import { IQueueClient } from './queue.client.interface';

@Injectable()
export class QueueFacadeApp {
  constructor(
    @Inject('IQueueClient')
    private readonly queueClient: IQueueClient,
  ) {}
  async registerQueue(args: { userId: number }) {
    try {
      return await this.queueClient.registerQueue(args);
    } catch (e) {
      throw new HttpException(e.response.data.error, e.response.status);
    }
  }

  async validToken(args: { queueId: number }) {
    try {
      return await this.queueClient.validToken(args);
    } catch (e) {
      throw new HttpException(e.response.data.error, e.response.status);
    }
  }
}
